#!/usr/bin/env node
/* ==========================================================================
   Fetch placeholder photography into public/media/
   --------------------------------------------------------------------------
   Usage:
     npm run media:fetch                 fill every empty slot
     npm run media:fetch -- --force      re-download slots that already exist
     npm run media:fetch -- hero shop-1  only these slots

   With UNSPLASH_ACCESS_KEY set (free key from unsplash.com/developers) each
   slot is filled with the best match for its own search term. Without a key
   the script falls back to a small curated set of trucking photos, so it still
   works with no setup.

   Local files always win over anything fetched, so replacing a stock shot with
   the client's own photo is just overwriting the file.
   ========================================================================== */

import fs from 'node:fs';
import path from 'node:path';
import { mediaSources } from '../src/data/media-sources.js';

const MEDIA_DIR = path.join(process.cwd(), 'public', 'media');
const KEY = process.env.UNSPLASH_ACCESS_KEY || '';
const WIDTH = 2000;

const args = process.argv.slice(2);
const force = args.includes('--force');
const only = args.filter((arg) => !arg.startsWith('--'));

fs.mkdirSync(MEDIA_DIR, { recursive: true });

const EXTENSIONS = ['.webp', '.avif', '.jpg', '.jpeg', '.png', '.svg', '.mp4'];

/* Generated placeholders are fair game to replace; anything the client put
   there by hand is not. The manifest is written by make-placeholders.mjs. */
const MANIFEST = path.join(MEDIA_DIR, '.generated.json');
const generated = fs.existsSync(MANIFEST)
  ? new Set(JSON.parse(fs.readFileSync(MANIFEST, 'utf8')))
  : new Set();

const suppliedFile = (slot) =>
  EXTENSIONS.map((ext) => slot + ext)
    .find((file) => fs.existsSync(path.join(MEDIA_DIR, file)) && !generated.has(file));

const hasLocal = (slot) => Boolean(suppliedFile(slot));

/* Once a real photo lands, drop the placeholder so nothing stale is shipped. */
function clearPlaceholder(slot) {
  for (const ext of EXTENSIONS) {
    const file = slot + ext;
    if (ext !== '.jpg' && generated.has(file) && fs.existsSync(path.join(MEDIA_DIR, file))) {
      fs.unlinkSync(path.join(MEDIA_DIR, file));
      generated.delete(file);
    }
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function download(url, destination) {
  const response = await fetch(url, {
    redirect: 'follow',
    headers: { 'User-Agent': 'ga-logistics-media-fetch' },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.length < 1024) throw new Error('response too small to be an image');

  fs.writeFileSync(destination, buffer);
  return buffer.length;
}

/* Key path: search for the slot's own term, take the top landscape result. */
async function viaApi(query) {
  const endpoint = new URL('https://api.unsplash.com/search/photos');
  endpoint.searchParams.set('query', query);
  endpoint.searchParams.set('per_page', '1');
  endpoint.searchParams.set('orientation', 'landscape');
  endpoint.searchParams.set('content_filter', 'high');

  const response = await fetch(endpoint, { headers: { Authorization: `Client-ID ${KEY}` } });
  if (!response.ok) throw new Error(`Unsplash API ${response.status}`);

  const data = await response.json();
  const photo = data.results?.[0];
  if (!photo) throw new Error(`no result for "${query}"`);

  const src = new URL(photo.urls.raw);
  src.searchParams.set('w', String(WIDTH));
  src.searchParams.set('q', '80');
  src.searchParams.set('fm', 'jpg');
  src.searchParams.set('fit', 'crop');

  return {
    url: src.href,
    credit: `${photo.user.name} (@${photo.user.username})`,
    link: photo.links.html,
  };
}

/* No-key path: the public download redirect, no authentication required. */
function viaCurated(id) {
  return {
    url: `https://unsplash.com/photos/${id}/download?w=${WIDTH}`,
    credit: 'Unsplash',
    link: `https://unsplash.com/photos/${id}`,
  };
}

const results = { filled: [], skipped: [], kept: [], failed: [] };
const credits = [];

console.log(
  KEY
    ? '\nUnsplash key found — fetching a distinct photo per slot.\n'
    : '\nNo UNSPLASH_ACCESS_KEY — using the curated fallback set.\n' +
      'Set a free key from https://unsplash.com/developers for unique photos per slot.\n'
);

for (const [slot, source] of Object.entries(mediaSources)) {
  if (only.length && !only.includes(slot)) continue;

  if (source.skip) {
    results.skipped.push(`${slot} — ${source.skip}`);
    continue;
  }

  if (!force && hasLocal(slot)) {
    results.kept.push(slot);
    continue;
  }

  try {
    const picked = KEY ? await viaApi(source.query) : viaCurated(source.photo);
    const bytes = await download(picked.url, path.join(MEDIA_DIR, `${slot}.jpg`));
    clearPlaceholder(slot);
    results.filled.push(`${slot} (${Math.round(bytes / 1024)} KB)`);
    credits.push(`- \`${slot}\` — ${picked.credit}, ${picked.link}`);
    await sleep(KEY ? 300 : 150);
  } catch (error) {
    results.failed.push(`${slot} — ${error.message}`);
  }
}

fs.writeFileSync(MANIFEST, JSON.stringify([...generated].sort(), null, 2) + '\n');

if (credits.length) {
  fs.writeFileSync(
    path.join(MEDIA_DIR, 'ATTRIBUTION.md'),
    `# Photo credits\n\nPlaceholder photography from Unsplash, free for commercial use.\nReplace these files with the client's own photography before launch.\n\n${credits.join('\n')}\n`
  );
}

const report = (label, items) => {
  if (!items.length) return;
  console.log(`\n${label} (${items.length})`);
  items.forEach((item) => console.log(`  ${item}`));
};

report('Downloaded', results.filled);
report('Already present, left alone', results.kept);
report('Skipped on purpose', results.skipped);
report('Failed', results.failed);

console.log(
  `\nDone. ${results.filled.length} downloaded, ${results.kept.length} kept, ` +
  `${results.skipped.length} skipped, ${results.failed.length} failed.\n`
);

if (results.failed.length) process.exitCode = 1;
