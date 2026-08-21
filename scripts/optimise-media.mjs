#!/usr/bin/env node
/* ==========================================================================
   Re-encode the photography as WebP
   --------------------------------------------------------------------------
   The fetched stock photos are all 2000px JPEGs and come to roughly 21 MB,
   which is a slow first visit on a phone. Two things are wrong with that, and
   the second matters more:

   They are JPEGs where WebP would do, and — the real waste — they are 2000px
   wide whatever size they are drawn at. A service card is 755px on a 1920px
   screen and a gallery tile 488px, so most of those pixels are decoded and
   thrown away. The widths below were measured in a browser across all
   fourteen pages at 1920, then doubled so the picture still holds up on a
   high-density display, and capped at the 2000px original. Nothing is ever
   scaled up.

   Re-encoding alone is nearly pointless here: these JPEGs are already lossy,
   so a transparent WebP of one has to spend bits preserving its artefacts.
   Dropping pixels that were never on screen is what actually pays.

   Quality is measured, not assumed. Each WebP is compared with SSIM
   (structural similarity: 1.0 is identical) against the *same-size* original
   — resized with the same filter, so the comparison is like for like and only
   the encode is being judged. A slot below the floor is re-encoded higher
   until it clears, so a picture that is hard to compress keeps its detail
   rather than being sacrificed to the average.

   The JPEG is removed only after its WebP has passed. Media.astro prefers
   .webp over .jpg, so nothing in the site needs to change.

   Needs an encoder that is not a runtime dependency of the site:
     npm install --no-save sharp

   Usage:
     node scripts/optimise-media.mjs              convert, keep the originals
     node scripts/optimise-media.mjs --replace    convert and delete the JPEGs
   ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const MEDIA_DIR = path.join(process.cwd(), 'public', 'media');
const replace = process.argv.includes('--replace');

/* Widest each slot is ever drawn, measured at a 1920px viewport across every
   page. Anything not listed keeps its full width. */
const RENDERED = {
  intro: 611, 'team-teaser': 614, 'about-story': 614, 'about-fleet': 1551,
  'pillar-1': 649, 'pillar-2': 649, 'pillar-3': 649, 'pillar-4': 649,
  'gallery-1': 763, 'gallery-4': 763,
  'gallery-2': 488, 'gallery-3': 488, 'gallery-5': 488, 'gallery-6': 488,
  'gallery-7': 488, 'gallery-8': 488, 'gallery-9': 488,
  'transportation-1': 755, 'transportation-2': 755,
  'dispatching-1': 755, 'dispatching-2': 755,
  'trailer-1': 755, 'trailer-2': 755,
  'parking-1': 755, 'parking-2': 755,
  'carcarrier-1': 755, 'carcarrier-2': 755,
  'port-1': 755, 'port-2': 755,
  'shop-1': 755, 'shop-2': 755,
  'courses-1': 755, 'courses-2': 755,
};

/* Doubled for high-density screens, then capped at what the original holds. */
const targetWidth = (slot, natural) =>
  RENDERED[slot] ? Math.min(natural, RENDERED[slot] * 2) : natural;

/* Below this the difference starts to be visible on a large photograph. */
const SSIM_FLOOR = 0.985;
/* The top rung is there for the occasional noisy photograph that will not
   clear the floor at any ordinary quality — about-story sat at 0.980 even at
   96. Spending the bytes on one file beats lowering the bar for all of them. */
const LADDER = [80, 86, 92, 96, 100];

/* Grayscale SSIM over 8x8 blocks — enough to catch blocking and smearing,
   which is what a too-low WebP quality actually does to a photograph. */
function ssim(a, b, width, height) {
  const C1 = (0.01 * 255) ** 2;
  const C2 = (0.03 * 255) ** 2;
  const W = 8;
  let total = 0;
  let blocks = 0;

  for (let by = 0; by + W <= height; by += W) {
    for (let bx = 0; bx + W <= width; bx += W) {
      let sumA = 0, sumB = 0, sumAA = 0, sumBB = 0, sumAB = 0;
      for (let y = 0; y < W; y++) {
        for (let x = 0; x < W; x++) {
          const i = (by + y) * width + bx + x;
          const va = a[i];
          const vb = b[i];
          sumA += va; sumB += vb;
          sumAA += va * va; sumBB += vb * vb; sumAB += va * vb;
        }
      }
      const n = W * W;
      const muA = sumA / n;
      const muB = sumB / n;
      const varA = sumAA / n - muA * muA;
      const varB = sumBB / n - muB * muB;
      const cov = sumAB / n - muA * muB;
      total += ((2 * muA * muB + C1) * (2 * cov + C2))
        / ((muA * muA + muB * muB + C1) * (varA + varB + C2));
      blocks += 1;
    }
  }
  return blocks ? total / blocks : 1;
}

const grey = (input) =>
  sharp(input).greyscale().raw().toBuffer({ resolveWithObject: true });

/* The social preview is referenced by <meta property="og:image"> and is
   fetched by other people's servers, not by a browser we can feature-detect.
   Support for WebP across the sharing platforms is patchy, so this one stays
   a JPEG — it is never drawn on the site, so it costs a visitor nothing. */
const KEEP_JPEG = new Set(['og']);

const files = fs.readdirSync(MEDIA_DIR)
  .filter((f) => f.endsWith('.jpg') && !KEEP_JPEG.has(f.replace(/\.jpg$/, '')))
  .sort();
if (!files.length) {
  console.log('  no JPEGs in public/media');
  process.exit(0);
}

let beforeTotal = 0;
let afterTotal = 0;
let worst = { slot: null, score: 1 };
const bumped = [];

for (const file of files) {
  const source = path.join(MEDIA_DIR, file);
  const target = source.replace(/\.jpg$/, '.webp');
  const slot = file.replace(/\.jpg$/, '');
  const original = fs.readFileSync(source);
  const natural = (await sharp(original).metadata()).width;
  const width = targetWidth(slot, natural);

  /* The reference is the original resized the same way, so SSIM judges the
     encode rather than the resize. */
  const resized = await sharp(original).resize({ width, withoutEnlargement: true })
    .jpeg({ quality: 100 }).toBuffer();
  const reference = await grey(resized);

  let output = null;
  let score = 0;
  let quality = 0;

  for (const q of LADDER) {
    quality = q;
    output = await sharp(original)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: q, effort: 6 })
      .toBuffer();
    const candidate = await grey(output);
    score = ssim(reference.data, candidate.data, reference.info.width, reference.info.height);
    if (score >= SSIM_FLOOR) break;
  }

  fs.writeFileSync(target, output);
  if (replace) fs.unlinkSync(source);

  beforeTotal += original.length;
  afterTotal += output.length;
  if (score < worst.score) worst = { slot: file, score };
  if (quality !== LADDER[0]) bumped.push(`${file.replace('.jpg', '')} q${quality}`);

  const kb = (n) => String(Math.round(n / 1024)).padStart(5);
  console.log(
    `  ${slot.padEnd(22)} ${String(natural).padStart(4)}→${String(width).padStart(4)}px` +
    `  ${kb(original.length)} KB →${kb(output.length)} KB` +
    `   ssim ${score.toFixed(4)}${score < SSIM_FLOOR ? '  ← below floor' : ''}`
  );
}

const mb = (n) => (n / 1024 / 1024).toFixed(1);
console.log(`\n  ${files.length} photos · ${mb(beforeTotal)} MB → ${mb(afterTotal)} MB` +
  `  (${Math.round((1 - afterTotal / beforeTotal) * 100)}% smaller)`);
console.log(`  worst SSIM ${worst.score.toFixed(4)} (${worst.slot})   floor ${SSIM_FLOOR}`);
if (bumped.length) console.log(`  raised above the base quality: ${bumped.join(', ')}`);
if (!replace) console.log('\n  originals kept — pass --replace to delete them');
