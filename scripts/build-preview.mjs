#!/usr/bin/env node
/* ==========================================================================
   Pack dist/ into one self-contained HTML preview.
   --------------------------------------------------------------------------
   Produces a single file that can be opened anywhere — no server, no network —
   and still behaves like the real site: every page, every link, every scroll
   effect. Each route is rendered into an iframe as a complete document, so the
   motion engine boots exactly as it does on a real page load.

     npm run preview:file        → preview/ga-logistics-redesign.html
   ========================================================================== */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';

const ROOT = process.cwd();
const DIST = path.join(ROOT, 'dist');
const OUT_DIR = path.join(ROOT, 'preview');
const OUT = path.join(OUT_DIR, 'ga-logistics-redesign.html');

if (!fs.existsSync(DIST)) {
  console.error('No dist/ — run `npm run build` first.');
  process.exit(1);
}

/* --- collect routes ------------------------------------------------------- */

const htmlFiles = [];
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith('.html')) htmlFiles.push(full);
  }
})(DIST);

const routeOf = (file) => {
  const rel = path.relative(DIST, file).split(path.sep).join('/');
  if (rel === '404.html') return '/404';
  return '/' + rel.replace(/index\.html$/, '');
};

/* Menu order mirrors the site's own navigation. */
const ORDER = [
  '/', '/about-us/', '/our-services/',
  '/services/transportation/', '/services/dispatching/',
  '/services/port-to-destination-logistics/', '/services/trailer-rental/',
  '/services/parking/', '/services/car-carrier-dispatch/',
  '/services/shop/', '/services/truck-dispatching-courses/',
  '/our-team/', '/gallery/', '/contact-us/', '/404',
];

/* --- bundle the page scripts --------------------------------------------- */

/* Astro emits ES module chunks that import one another by relative path.
   Inside a srcdoc document there is nothing to resolve those against, so each
   entry is bundled into one self-contained classic script. */
const scripts = {};

async function bundle(entryHref) {
  const key = entryHref.replace('/_astro/', '').replace(/\.js$/, '');
  if (scripts[key]) return key;

  const file = path.join(DIST, entryHref.replace(/^\//, ''));

  /* Astro would emit a dynamic import as a template literal, which esbuild
     does not follow — the chunk would stay external and 404 inside the
     packaged page. Normalise any that appear so the whole graph is inlined. */
  const source = fs
    .readFileSync(file, 'utf8')
    .replace(/import\(`([^`]+)`\)/g, (_, spec) => `import(${JSON.stringify(spec)})`);

  const result = await esbuild.build({
    stdin: { contents: source, resolveDir: path.dirname(file), sourcefile: file, loader: 'js' },
    bundle: true,
    /* ESM, not IIFE: the page scripts use top-level await, and inline module
       scripts keep their own scope so two pages' scripts cannot collide. */
    format: 'esm',
    minify: true,
    write: false,
    target: ['es2022'],
    logLevel: 'silent',
  });

  scripts[key] = result.outputFiles[0].text;
  return key;
}

/* --- assets --------------------------------------------------------------- */

const MIME = {
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif',
  '.mp4': 'video/mp4', '.ico': 'image/x-icon',
};

const assets = {};
function addAsset(href) {
  if (assets[href]) return;
  const file = path.join(DIST, href.replace(/^\//, ''));
  if (!fs.existsSync(file)) return;
  const mime = MIME[path.extname(file).toLowerCase()];
  if (!mime) return;
  assets[href] = `data:${mime};base64,${fs.readFileSync(file).toString('base64')}`;
}

/* --- styles --------------------------------------------------------------- */

const cssDir = path.join(DIST, '_astro');
const css = fs.readdirSync(cssDir)
  .filter((f) => f.endsWith('.css'))
  // Base carries the tokens and reset, so it has to come first.
  .sort((a, b) => (a.startsWith('Base') ? -1 : b.startsWith('Base') ? 1 : a.localeCompare(b)))
  .map((f) => fs.readFileSync(path.join(cssDir, f), 'utf8'))
  .join('\n');

/* --- pages ---------------------------------------------------------------- */

const pages = {};

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8');
  const route = routeOf(file);

  const title = (html.match(/<title>([\s\S]*?)<\/title>/) || [, route])[1];
  /* Astro emits page-level scripts *after* </body></html>, so slice from the
     opening tag to the end of the document and drop the closing tags wherever
     they landed — matching up to </body> would silently lose those scripts. */
  const open = html.match(/<body([^>]*)>/);
  if (!open) continue;

  const bodyAttrs = open[1].trim();
  let body = html.slice(open.index + open[0].length).replace(/<\/body>|<\/html>/gi, '');

  // External module scripts become markers; the bundle is injected at runtime
  // so the shared one is stored once rather than per page.
  const externals = [...body.matchAll(/<script[^>]*src="(\/_astro\/[^"]+\.js)"[^>]*><\/script>/g)];
  for (const [tag, href] of externals) {
    const key = await bundle(href);
    body = body.replace(tag, `<!--SCRIPT:${key}-->`);
  }

  for (const [, href] of body.matchAll(/["'(](\/(?:media|favicon|apple-touch-icon)[^"')\s]*)/g)) {
    addAsset(href);
  }

  pages[route] = { title: title.trim(), bodyAttrs, body };
}

const routes = ORDER.filter((r) => pages[r]).concat(
  Object.keys(pages).filter((r) => !ORDER.includes(r))
);

/* A closing tag inside a script string would end the srcdoc's script early. */
const guard = (text) => text.replace(/<\/script/gi, '<\\/script');
const json = (value) => JSON.stringify(value).replace(/</g, '\\u003c');

/* --- shell ---------------------------------------------------------------- */

const shell = `<title>GA Logistics Redesign</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" media="print" data-font href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800&family=Inter+Tight:wght@400;500;600&display=swap">

<style>
  /* The shell deliberately commits to the previewed site's own dark world
     rather than following the viewer's theme — a light frame around a dark
     site reads as a mistake. Every colour is painted explicitly. */
  :root {
    --ink: #08090b;
    --raised: #101317;
    --line: rgba(255, 255, 255, 0.10);
    --line-strong: rgba(255, 255, 255, 0.22);
    --fg: #f2f3f4;
    --muted: #99a1ab;
    --brand: #49ef45;
    --rail: 52px;
    --ui: 'Archivo', 'Helvetica Neue', Arial, sans-serif;
    --mono: ui-monospace, SFMono-Regular, Menlo, monospace;
  }

  * { box-sizing: border-box; }

  html, body {
    height: 100%;
    margin: 0;
    background: var(--ink);
    color: var(--fg);
    font-family: var(--ui);
  }

  .rail {
    position: fixed;
    inset: 0 0 auto 0;
    height: var(--rail);
    z-index: 10;
    display: flex;
    align-items: center;
    gap: 1rem;
    padding-inline: clamp(0.75rem, 2vw, 1.25rem);
    background: var(--raised);
    border-bottom: 1px solid var(--line);
  }

  .mark {
    display: inline-flex;
    align-items: center;
    gap: 0.55rem;
    font-size: 0.8125rem;
    font-weight: 700;
    letter-spacing: -0.01em;
    flex: none;
  }
  .mark i {
    width: 8px; height: 8px;
    border-radius: 50%;
    background: var(--brand);
    display: block;
  }
  .mark span { font-weight: 500; color: var(--muted); }

  select, .seg button {
    font-family: var(--ui);
    font-size: 0.75rem;
    color: var(--fg);
    background: transparent;
    border: 1px solid var(--line);
    border-radius: 999px;
    padding: 0.45em 0.9em;
    cursor: pointer;
  }
  select { max-width: min(46vw, 320px); }
  select option { background: var(--raised); color: var(--fg); }
  select:hover, .seg button:hover { border-color: var(--line-strong); }

  .seg { display: flex; gap: 0.35rem; margin-left: auto; flex: none; }
  .seg button[aria-pressed="true"] {
    background: var(--fg);
    color: var(--ink);
    border-color: var(--fg);
  }

  .path {
    font-family: var(--mono);
    font-size: 0.6875rem;
    color: var(--muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  @media (max-width: 720px) { .path { display: none; } }

  .stage {
    position: fixed;
    inset: var(--rail) 0 0 0;
    display: grid;
    place-items: center;
    background:
      repeating-linear-gradient(45deg, #0b0d10 0 12px, #090a0d 12px 24px);
    overflow: auto;
  }

  iframe {
    width: 100%;
    height: 100%;
    border: 0;
    background: var(--ink);
    display: block;
  }

  .stage[data-view="mobile"] { padding: 1.25rem; align-items: start; }
  .stage[data-view="mobile"] iframe {
    width: 390px;
    max-width: 100%;
    height: 844px;
    max-height: 100%;
    border: 1px solid var(--line-strong);
    border-radius: 22px;
  }

  .fallback {
    max-width: 44ch;
    margin: 0;
    padding: 1.25rem 1.5rem;
    font-size: 0.875rem;
    line-height: 1.6;
    color: var(--muted);
    border: 1px solid var(--line);
    border-radius: 12px;
    background: var(--raised);
  }
  .fallback code { font-family: var(--mono); color: var(--fg); }
  .fallback[hidden] { display: none; }

  :focus-visible { outline: 2px solid var(--brand); outline-offset: 2px; }
</style>

<header class="rail">
  <span class="mark"><i></i>GA Logistics <span>redesign</span></span>
  <label class="path" for="route">Page</label>
  <select id="route" aria-label="Page"></select>
  <span class="path" id="current"></span>
  <div class="seg" role="group" aria-label="Viewport">
    <button type="button" data-view="desktop" aria-pressed="true">Desktop</button>
    <button type="button" data-view="mobile" aria-pressed="false">Mobile</button>
  </div>
</header>

<main class="stage" id="stage" data-view="desktop">
  <iframe id="frame" title="GA Logistics site preview"></iframe>
  <p class="fallback" id="fallback" hidden>
    This viewer needs to render the site in a frame, which this context blocks.
    Open <code>ga-logistics-redesign.html</code> directly in a browser instead —
    the file is fully self-contained.
  </p>
</main>

<script>
const CSS = ${json(css)};
const SCRIPTS = ${json(Object.fromEntries(Object.entries(scripts).map(([k, v]) => [k, guard(v)])))};
const ASSETS = ${json(assets)};
const PAGES = ${json(pages)};
const ROUTES = ${json(routes)};

/* Fonts load out of the critical path; the site is already fully inlined. */
var fontSheet = document.querySelector('[data-font]');
if (fontSheet) fontSheet.media = 'all';

const frame = document.getElementById('frame');
const select = document.getElementById('route');
const current = document.getElementById('current');
const stage = document.getElementById('stage');

ROUTES.forEach((route) => {
  const option = document.createElement('option');
  option.value = route;
  option.textContent = route === '/' ? 'Home' : route;
  select.appendChild(option);
});

function documentFor(route) {
  const page = PAGES[route] || PAGES['/404'] || PAGES['/'];

  let body = page.body
    .replace(/<!--SCRIPT:([^>]+?)-->/g, (_, key) =>
      '<scr' + 'ipt type="module">' + (SCRIPTS[key] || '') + '</scr' + 'ipt>')
    .replace(/\\/(?:media|favicon|apple-touch-icon)[^"')\\s]*/g, (href) => ASSETS[href] || href);

  return '<!doctype html><html lang="en" id="top"><head><meta charset="utf-8">'
    + '<meta name="viewport" content="width=device-width, initial-scale=1">'
    + '<title>' + page.title + '</title>'
    + '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
    // Loaded with media="print" so a slow or unreachable font host can never
    // stall the document; the next script flips it back once the parser is past.
    + '<link rel="stylesheet" media="print" data-font href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800&family=Inter+Tight:wght@400;500;600&display=swap">'
    + '<style>' + CSS + '</style>'
    + '<scr' + 'ipt>document.documentElement.classList.add("js");'
    + 'var f=document.querySelector("[data-font]");if(f)f.media="all";</scr' + 'ipt>'
    + '</head><body ' + page.bodyAttrs + '>' + body
    + '<scr' + 'ipt>document.addEventListener("click",function(e){'
    + 'var a=e.target.closest&&e.target.closest("a[href]");if(!a)return;'
    + 'var h=a.getAttribute("href");if(!h||h.charAt(0)!=="/")return;'
    + 'e.preventDefault();parent.postMessage({__preview:h},"*");},true);</scr' + 'ipt>'
    + '</body></html>';
}

function show(route, fromSelect) {
  if (!PAGES[route]) route = '/404';
  frame.srcdoc = documentFor(route);
  stage.scrollTop = 0;
  current.textContent = route;
  if (!fromSelect) select.value = ROUTES.includes(route) ? route : '/404';
  if (location.hash.slice(1) !== route) history.replaceState(null, '', '#' + route);
}

/* Links inside the preview navigate the shell rather than the whole page. */
window.addEventListener('message', (event) => {
  const route = event.data && event.data.__preview;
  if (typeof route === 'string') show(route);
});

select.addEventListener('change', () => show(select.value, true));

document.querySelectorAll('.seg button').forEach((button) => {
  button.addEventListener('click', () => {
    const view = button.dataset.view;
    stage.dataset.view = view;
    document.querySelectorAll('.seg button').forEach((other) => {
      other.setAttribute('aria-pressed', String(other === button));
    });
  });
});

show(location.hash.slice(1) || '/');

/* If frames are blocked here, say so rather than showing an empty stage. */
setTimeout(() => {
  const alive = frame.contentDocument === null || frame.contentDocument.querySelector('.hdr');
  if (frame.contentDocument !== null && !alive) {
    frame.hidden = true;
    document.getElementById('fallback').hidden = false;
  }
}, 4000);
</script>
`;

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(OUT, shell);

console.log(`\n${path.relative(ROOT, OUT)}`);
console.log(`  ${routes.length} routes · ${Object.keys(assets).length} assets · ${Object.keys(scripts).length} bundles`);
console.log(`  ${(fs.statSync(OUT).size / 1024 / 1024).toFixed(2)} MB\n`);
