#!/usr/bin/env node
/* ==========================================================================
   Generate placeholder artwork for every empty media slot.
   --------------------------------------------------------------------------
   Draws a real SVG per slot — brand-tinted plate, category line art, slot
   label — and writes it to public/media/<slot>.svg, where the site picks it up
   like any other asset. No network involved.

   Files written here are listed in public/media/.generated.json so
   `npm run media:fetch` knows it may overwrite them, while never touching a
   file the client supplied.

     npm run media:placeholders            fill empty slots
     npm run media:placeholders -- --force redraw all of them
   ========================================================================== */

import fs from 'node:fs';
import path from 'node:path';
import { mediaSources } from '../src/data/media-sources.js';

const MEDIA_DIR = path.join(process.cwd(), 'public', 'media');
const MANIFEST = path.join(MEDIA_DIR, '.generated.json');
const W = 1600;
const H = 1200;

/* Keep the plates inside the site's own palette: ink ground, brand accent.
   Distinction between slots comes from the line art, not from colour, so a
   page full of placeholders still reads as one design. Mirrors --brand-500. */
const BRAND = '#49ef45';

const force = process.argv.includes('--force');

fs.mkdirSync(MEDIA_DIR, { recursive: true });

const generated = fs.existsSync(MANIFEST)
  ? new Set(JSON.parse(fs.readFileSync(MANIFEST, 'utf8')))
  : new Set();

const EXTENSIONS = ['.webp', '.avif', '.jpg', '.jpeg', '.png', '.svg', '.mp4'];
const clientFile = (slot) =>
  EXTENSIONS.map((ext) => slot + ext)
    .find((file) => fs.existsSync(path.join(MEDIA_DIR, file)) && !generated.has(file));

/* --------------------------------------------------------------------------
   Line art, drawn on a 0 0 240 160 canvas so every glyph shares a baseline.
   -------------------------------------------------------------------------- */

const ART = {
  truck: `
    <path d="M12 104h34l14-46h62l14 46h34" />
    <path d="M46 104h148" />
    <rect x="60" y="34" width="90" height="24" rx="4" />
    <circle cx="76" cy="120" r="14" />
    <circle cx="172" cy="120" r="14" />
    <path d="M150 58h22l18 30h-40z" />`,
  trailer: `
    <rect x="24" y="44" width="164" height="60" rx="6" />
    <path d="M24 74h164" />
    <path d="M188 104h28" />
    <circle cx="72" cy="120" r="14" />
    <circle cx="112" cy="120" r="14" />
    <path d="M24 104h-12" />`,
  container: `
    <rect x="26" y="70" width="86" height="46" rx="4" />
    <rect x="128" y="70" width="86" height="46" rx="4" />
    <rect x="77" y="20" width="86" height="46" rx="4" />
    <path d="M44 70v46M62 70v46M94 70v46" />
    <path d="M146 70v46M164 70v46M196 70v46" />
    <path d="M95 20v46M113 20v46M145 20v46" />`,
  crane: `
    <path d="M20 140h200" />
    <path d="M40 140V40h160v100" />
    <path d="M40 40 60 140M200 40 180 140" />
    <path d="M120 40v34" />
    <rect x="88" y="74" width="64" height="34" rx="4" />
    <path d="M108 74v34M132 74v34" />`,
  wrench: `
    <path d="M158 34a34 34 0 0 0-46 44L44 146l14 14 68-68a34 34 0 0 0 44-46l-24 24-20-20z" />
    <circle cx="62" cy="142" r="6" />`,
  parking: `
    <rect x="30" y="26" width="88" height="108" rx="10" />
    <path d="M58 110V50h22a18 18 0 0 1 0 36H58" />
    <path d="M140 134h74" />
    <path d="M140 108h74" />
    <path d="M140 82h44" />`,
  carcarrier: `
    <path d="M14 118h30l10-30h150" />
    <path d="M44 88V56h120v32" />
    <path d="M70 56V36h64v20" />
    <circle cx="70" cy="130" r="12" />
    <circle cx="168" cy="130" r="12" />
    <path d="M84 88h48" />`,
  route: `
    <path d="M28 138c40 0 30-52 76-52s36-56 108-56" stroke-dasharray="14 10" />
    <circle cx="28" cy="138" r="9" />
    <path d="M212 46a14 14 0 1 0-0.1 0" />
    <path d="M212 46v18" />`,
  person: `
    <circle cx="120" cy="60" r="30" />
    <path d="M56 140a64 64 0 0 1 128 0" />`,
  desk: `
    <rect x="46" y="34" width="148" height="82" rx="6" />
    <path d="M46 96h148" />
    <path d="M96 116v18h48v-18" />
    <path d="M72 140h96" />
    <path d="M74 62h44M74 76h68" />`,
};

/* Which glyph and hue each slot gets. First match wins. */
const RULES = [
  [/^(shop|gallery-4|gallery-8)/, 'wrench'],
  [/^parking/, 'parking'],
  [/^carcarrier/, 'carcarrier'],
  [/^port-hero/, 'crane'],
  [/^port/, 'container'],
  [/^(trailer|gallery-2|gallery-6)/, 'trailer'],
  [/^(dispatching|courses|pillar-2)/, 'desk'],
  [/^(team|about-story)/, 'person'],
  [/^(contact-map|gallery-7)/, 'route'],
  [/^pillar-3/, 'container'],
];

const pick = (slot) => {
  for (const [pattern, art] of RULES) {
    if (pattern.test(slot)) return { art };
  }
  return { art: 'truck' };   // trucking is the default subject
};

const escape = (value) => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;');

function draw(slot, query) {
  const { art } = pick(slot);
  const id = slot.replace(/[^a-z0-9]/gi, '');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${escape(query || slot)}">
  <defs>
    <linearGradient id="bg${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#15181d"/>
      <stop offset="0.55" stop-color="#0d1014"/>
      <stop offset="1" stop-color="#07080a"/>
    </linearGradient>
    <radialGradient id="glow${id}" cx="0.5" cy="0.42" r="0.62">
      <stop offset="0" stop-color="${BRAND}" stop-opacity="0.16"/>
      <stop offset="1" stop-color="${BRAND}" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid${id}" width="80" height="80" patternUnits="userSpaceOnUse">
      <path d="M80 0H0V80" fill="none" stroke="#ffffff" stroke-opacity="0.05" stroke-width="1"/>
    </pattern>
    <pattern id="stripe${id}" width="34" height="34" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width="17" height="34" fill="#ffffff" fill-opacity="0.05"/>
    </pattern>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bg${id})"/>
  <rect width="${W}" height="${H}" fill="url(#grid${id})"/>
  <rect width="${W}" height="${H}" fill="url(#glow${id})"/>

  <!-- hazard band, a nod to the trade -->
  <rect x="0" y="${H - 132}" width="${W}" height="16" fill="url(#stripe${id})"/>

  <!-- centred so a cover-crop to 21:9 or 3:4 still shows the subject -->
  <g transform="translate(${W / 2 - 240}, ${H / 2 - 190}) scale(2)">
    <g fill="none" stroke="${BRAND}" stroke-opacity="0.5"
       stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
      ${ART[art]}
    </g>
  </g>

  <g transform="translate(${W / 2}, ${H / 2 + 210})" text-anchor="middle"
     font-family="ui-monospace, SFMono-Regular, Menlo, monospace">
    <text y="0" fill="#ffffff" fill-opacity="0.62" font-size="30" letter-spacing="7">${escape(slot.toUpperCase())}</text>
    <text y="42" fill="#ffffff" fill-opacity="0.30" font-size="22" letter-spacing="2">${escape(query || 'image slot')}</text>
  </g>
</svg>
`;
}

/* -------------------------------------------------------------------------- */

const written = [];
const kept = [];

for (const [slot, source] of Object.entries(mediaSources)) {
  const supplied = clientFile(slot);
  if (supplied && !force) {
    kept.push(`${slot} → ${supplied}`);
    continue;
  }

  const file = `${slot}.svg`;
  fs.writeFileSync(path.join(MEDIA_DIR, file), draw(slot, source.query || source.skip));
  generated.add(file);
  written.push(slot);
}

fs.writeFileSync(MANIFEST, JSON.stringify([...generated].sort(), null, 2) + '\n');

console.log(`\nPlaceholders written: ${written.length}`);
if (kept.length) {
  console.log(`Left alone (supplied by you): ${kept.length}`);
  kept.forEach((item) => console.log(`  ${item}`));
}
console.log(`\nManifest: public/media/.generated.json`);
console.log(`Replace any of them by dropping your own file in public/media/.\n`);
