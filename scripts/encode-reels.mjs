/**
 * Re-encodes the scroll-driven reels for playback that can be scrubbed.
 *
 * Two things matter for a video whose playhead is tied to scroll position:
 *
 *   Keyframes.  Every seek decodes forward from the nearest keyframe, so a
 *               clip with one keyframe per ten seconds re-decodes almost the
 *               whole file on every scroll tick. These are cut to one every
 *               five frames.
 *   Formats.    WebM/VP8 first, MP4/H.264 behind it. Neither is universal on
 *               its own, and a reel that cannot decode leaves a whole run of
 *               sections standing on an empty backdrop.
 *
 * Runs ffmpeg under WebAssembly so it needs no system ffmpeg — but it is
 * single-threaded and slow, which is why the output is committed rather than
 * built on demand.
 *
 * Needs the encoder, which is not a runtime dependency of the site:
 *   npm install --no-save @ffmpeg/core@0.12.10
 *
 * Usage: node scripts/encode-reels.mjs [name…]      (default: reel reel2)
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

/* The @ffmpeg/ffmpeg wrapper drives the core through a browser Worker and
   refuses to load under Node, so the Emscripten core is driven directly. It
   is built for the browser and reaches for these. */
globalThis.self ??= globalThis;
globalThis.location ??= { href: pathToFileURL(process.cwd() + '/').href };

const MEDIA = path.join(process.cwd(), 'public', 'media');
const CORE = path.join(process.cwd(), 'node_modules/@ffmpeg/core/dist/esm');

const names = process.argv.slice(2).length ? process.argv.slice(2) : ['reel', 'reel2'];

const createCore = (await import(pathToFileURL(path.join(CORE, 'ffmpeg-core.js')).href)).default;

let tail = [];
const note = (message) => {
  tail.push(message);
  if (tail.length > 40) tail.shift();
  if (process.env.VERBOSE) console.log(message);
};

const core = await createCore({
  /* Node's fetch cannot read file:// — hand the bytes over directly. */
  wasmBinary: fs.readFileSync(path.join(CORE, 'ffmpeg-core.wasm')),
  print: note,
  printErr: note,
  locateFile: (file) => path.join(CORE, file),
});

const ffmpeg = {
  writeFile: (name, data) => core.FS.writeFile(name, data),
  readFile: (name) => core.FS.readFile(name),
  exec: (args) => {
    try {
      return core.exec(...args) ?? 0;
    } catch (error) {
      /* Emscripten signals a normal exit by throwing ExitStatus. */
      if (error && typeof error.status === 'number') return error.status;
      note(String(error && error.message ? error.message : error));
      return 1;
    }
  },
};

for (const name of names) {
  const source = path.join(MEDIA, `${name}.mp4`);
  if (!fs.existsSync(source)) {
    console.log(`  ${name}: no ${name}.mp4, skipped`);
    continue;
  }

  ffmpeg.writeFile(`${name}.mp4`, new Uint8Array(fs.readFileSync(source)));

  const code = ffmpeg.exec([
    '-i', `${name}.mp4`,
    '-an',                                  // the reels are silent by design
    '-c:v', 'libvpx',
    '-b:v', '900k', '-crf', '32',
    '-g', '5', '-keyint_min', '5',          // dense keyframes: seeks stay cheap
    '-deadline', 'realtime', '-cpu-used', '8',
    '-vf', 'scale=1280:-2',
    `${name}.webm`,
  ]);

  if (code !== 0) {
    console.error(`  ${name}: ffmpeg exited ${code}\n${tail.join('\n')}`);
    continue;
  }

  const out = ffmpeg.readFile(`${name}.webm`);
  fs.writeFileSync(path.join(MEDIA, `${name}.webm`), Buffer.from(out));
  const kb = (out.length / 1024).toFixed(0);
  const src = (fs.statSync(source).size / 1024).toFixed(0);
  console.log(`  ${name}.webm  ${kb} KB   (from ${src} KB mp4)`);
}

process.exit(0);
