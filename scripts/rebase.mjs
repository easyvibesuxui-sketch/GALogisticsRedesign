/**
 * Moves the built site under a sub-path.
 *
 * GitHub Pages serves a project repository from /<repo>/ rather than from the
 * root. The source keeps its root-absolute links — that is what the real
 * domain needs — and this pass rewrites them at the end, so only the Pages
 * build differs and a root deployment stays byte-identical.
 *
 * Two shapes carry a root-absolute path in the output: the href, src and
 * data-fallback attributes, and url(…) inside an inline style — a remote
 * picture holds its local plate as a background that way. The stylesheets in
 * _astro contain no url(/…) and the scripts build no paths, so there is
 * nothing else to move. Protocol-relative URLs (//host/…) are left alone.
 *
 * Usage: node scripts/rebase.mjs /GALogisticsRedesign
 */
import fs from 'node:fs';
import path from 'node:path';

const raw = process.argv[2] || '';
/* An empty base — what Pages reports for a user or organisation site — means
   the site already lives at the root and there is nothing to do. */
const base = raw.replace(/\/+$/, '');

const DIST = path.join(process.cwd(), 'dist');
if (!fs.existsSync(DIST)) {
  console.error('  no dist/ — run the build first');
  process.exit(1);
}

/* Pages runs the output through Jekyll unless told not to, and Jekyll drops
   directories whose name begins with an underscore — which would take
   _astro/, every stylesheet and every script bundle with it. */
fs.writeFileSync(path.join(DIST, '.nojekyll'), '');

if (!base) {
  console.log('  no base path — left at the root');
  process.exit(0);
}

const html = [];
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith('.html')) html.push(full);
  }
})(DIST);

const ATTR = /\b(href|src|data-fallback)="\/(?!\/)/g;
const CSS_URL = /url\((['"]?)\/(?!\/)/g;

let moved = 0;
for (const file of html) {
  const before = fs.readFileSync(file, 'utf8');
  let count = 0;
  const after = before
    .replace(ATTR, (m, attr) => { count += 1; return `${attr}="${base}/`; })
    .replace(CSS_URL, (m, quote) => { count += 1; return `url(${quote}${base}/`; });
  if (count) fs.writeFileSync(file, after);
  moved += count;
}

console.log(`  ${html.length} pages · ${moved} links moved under ${base}/`);
