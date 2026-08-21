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

/* Which Unsplash photograph each slot ended up with. Kept so a later run can
   avoid handing the same picture to two slots — several of these queries are
   near neighbours ("semi trucks parked row" and "truck parking lot"), and
   taking the top result for each put one aerial shot of a trailer yard into
   five different places on the site. */
const PHOTO_MANIFEST = path.join(MEDIA_DIR, '.photos.json');
const chosen = fs.existsSync(PHOTO_MANIFEST)
  ? JSON.parse(fs.readFileSync(PHOTO_MANIFEST, 'utf8'))
  : {};
const taken = new Set(Object.values(chosen));
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
  /* A page of candidates rather than one, so a slot whose best match is
     already spoken for can take the next one down instead. */
  endpoint.searchParams.set('per_page', '12');
  endpoint.searchParams.set('orientation', 'landscape');
  endpoint.searchParams.set('content_filter', 'high');

  const response = await fetch(endpoint, { headers: { Authorization: `Client-ID ${KEY}` } });
  if (!response.ok) throw new Error(`Unsplash API ${response.status}`);

  const data = await response.json();
  const results = data.results || [];
  /* Falls back to the best match if every candidate is spoken for — a
     repeat beats an empty slot. */
  const photo = results.find((result) => !taken.has(result.id)) || results[0];
  if (!photo) throw new Error(`no result for "${query}"`);
  taken.add(photo.id);

  const src = new URL(photo.urls.raw);
  src.searchParams.set('w', String(WIDTH));
  src.searchParams.set('q', '80');
  src.searchParams.set('fm', 'jpg');
  src.searchParams.set('fit', 'crop');

  return {
    id: photo.id,
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

  /* An explicit url wins over everything: it is the real asset, just hosted
     somewhere else for now. This is also how the skip-listed portrait slots
     get filled without ever touching stock imagery. */
  if (!source.url && source.skip) {
    results.skipped.push(`${slot} — ${source.skip}`);
    continue;
  }

  if (!force && hasLocal(slot)) {
    results.kept.push(slot);
    continue;
  }

  try {
    const picked = source.url
      ? { url: source.url, credit: 'supplied by the client', link: source.url }
      : KEY
        ? await viaApi(source.query)
        : viaCurated(source.photo);
    const bytes = await download(picked.url, path.join(MEDIA_DIR, `${slot}.jpg`));
    clearPlaceholder(slot);
    if (picked.id) chosen[slot] = picked.id;
    results.filled.push(`${slot} (${Math.round(bytes / 1024)} KB)`);
    if (!source.url) credits.push(`- \`${slot}\` — ${picked.credit}, ${picked.link}`);
    await sleep(KEY ? 300 : 150);
  } catch (error) {
    results.failed.push(`${slot} — ${error.message}`);
  }
}

fs.writeFileSync(MANIFEST, JSON.stringify([...generated].sort(), null, 2) + '\n');
fs.writeFileSync(PHOTO_MANIFEST, JSON.stringify(chosen, null, 2) + '\n');

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
