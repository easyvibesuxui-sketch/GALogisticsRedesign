# GA Logistics LLC — Website Redesign

A rebuild of [galogisticsllc.com](https://galogisticsllc.com) that keeps the
**content and URL architecture unchanged** and replaces the UI, the section
composition and the motion layer with a premium, scroll-driven system.

---

## Stack

| Piece | Choice | Why |
|---|---|---|
| Framework | **Astro 7** (static output) | Multi-page site, zero client framework, ships almost no JS |
| Smooth scroll | **Lenis** | Inertial scrolling that the scroll effects can hook into |
| Scrubbed motion | **GSAP + ScrollTrigger** | Pinning, parallax, counters, velocity-linked marquees |
| Enter reveals | Native `IntersectionObserver` + CSS transitions | Cheap, interruption-safe, degrades to visible without JS |
| Styling | Plain CSS with design tokens | No build-time CSS framework, everything re-skinnable from one file |

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # → dist/  (static, deploy anywhere)
npm run preview
```

---

## Architecture

URLs mirror the live site one-to-one, trailing slashes included.

```
/                                          Home
/about-us/                                 About Us
/our-services/                             Our Services (index)
/services/transportation/                  ┐
/services/dispatching/                     │
/services/port-to-destination-logistics/   │
/services/trailer-rental/                  ├ generated from src/data/services.js
/services/parking/                         │
/services/car-carrier-dispatch/            │
/services/shop/                            │
/services/truck-dispatching-courses/       ┘
/our-team/                                 Our Team
/gallery/                                  Gallery
/contact-us/                               Contact Us
/404                                       Not found
/sitemap.xml, /robots.txt
```

```
src/
├── data/            ← ALL COPY LIVES HERE. Markup never hard-codes text.
│   ├── site.js          navigation, contact details, socials, stats
│   ├── services.js      the eight service pages
│   └── pages.js         home / about / team / gallery / contact copy
├── styles/
│   ├── tokens.css       colour, type scale, spacing, motion easings
│   ├── base.css         reset, typography, layout primitives
│   ├── motion.css       reveal primitives + reduced-motion handling
│   └── components.css   buttons, cards, marquee, stats, cursor, progress
├── scripts/motion.js    the scroll engine (see below)
├── components/          Header, Footer, Hero, PageHero, ServiceTrack,
│                        PillarStack, StatBand, CtaBand, Marquee, Media…
├── layouts/Base.astro   head, fonts, JSON-LD, header/footer, motion boot
└── pages/               one file per route
```

---

## The motion system

`src/scripts/motion.js` is the single owner of scroll behaviour. Two layers:

1. **Enter reveals** — declarative CSS transitions flipped by an
   `IntersectionObserver`. Interruption-safe and free.
2. **Scrubbed effects** — GSAP ScrollTrigger, fed by Lenis.

Everything is authored as data attributes in markup:

| Attribute | Effect |
|---|---|
| `data-reveal="up\|fade\|blur\|mask\|rule\|scale"` | Enter reveal |
| `data-reveal-delay="240"` | Delay in ms |
| `data-reveal-group="90"` | Stagger direct children by 90 ms |
| `data-split` | Heading split into masked lines that slide up |
| `data-parallax` + `data-parallax-speed="0.12"` | Vertical drift |
| `data-count="200"` | Number counts up when it enters |
| `data-marquee` + `data-marquee-speed/-direction` | Infinite ticker, nudged by scroll velocity |
| `data-pin-track` / `data-pin-lane` | Section pins, lane scrolls horizontally |
| `data-stick-scale` | Stacked sticky panels that recede as the next arrives |
| `data-magnetic="0.28"` | Element leans toward the cursor |
| `data-hero-media` / `data-hero-veil` / `data-hero-copy` | Hero scale, veil and copy drift |

### The scroll-driven reel

Sections [01] and [02] on the home page share one video backdrop whose playhead
is tied to scroll position — `ScrollReel` wraps them, `initScrollReels` maps the
run's scroll range onto the clip's duration. It never autoplays: scrolling down
advances the footage, scrolling up rewinds it, and the video stays paused
throughout. The reel ends before [03], which returns to a solid surface.

`start` / `end` props trim the clip to a sub-range without touching the file.

**Encoding matters more than the file size here.** Source footage usually
carries one keyframe every few seconds, which means every seek re-decodes from
the previous keyframe and scrubbing stutters. The clip in `public/media/reel.mp4`
was re-encoded to a keyframe every 5 frames (0.2s):

```bash
ffmpeg -i source.mp4 -an -vf "fps=25,scale=1152:-2" \
  -c:v libx264 -preset slow -crf 27 \
  -g 5 -keyint_min 5 -sc_threshold 0 \
  -pix_fmt yuv420p -movflags +faststart public/media/reel.mp4
```

Drop a `reel.webm` beside it and it is preferred automatically, with the MP4
kept as the fallback.

**Signature moments**

- Hero media scales and darkens while the copy drifts up and fades out.
- Sections [01] and [02] sit on one video whose playhead is driven by scroll.
- Two counter-running tickers, one solid, one outline, both accelerating with scroll velocity.
- The services section **pins and scrolls sideways** through all eight cards, with its own progress rail.
- Stat numbers count up; hairline rules draw themselves left to right.
- "How we work" panels **stack and recede** as each new one settles on top.
- Service index rows carry a **cursor-following image preview**.
- Headings arrive **line by line from behind a hard mask edge**.
- Custom cursor, magnetic buttons, a page progress bar, and a header that tucks away on scroll down.

**Accessibility & resilience**

- Every effect is disabled under `prefers-reduced-motion: reduce`.
- Without JavaScript nothing is hidden — reveals only arm once `html.js` is set.
- The pinned horizontal track becomes a snap-scrolling row below 900 px.
- Custom cursor and magnetic buttons only run on fine pointers.
- Skip link, focus-visible rings, labelled controls, keyboard-navigable lightbox.

---

## Media

Every image on the site is addressed by a **slot name**, not a path. Drop a file
into `public/media/` named after the slot and it appears — no code changes.

```
public/media/hero.jpg              → the home hero
public/media/transportation-hero.webp
public/media/team-1.jpg
```

Supported extensions, in priority order: `.webp`, `.avif`, `.jpg`, `.jpeg`,
`.png`, `.svg`, plus `.mp4` (rendered as an autoplaying muted loop — the hero
looks best this way).

A slot can also be filled **by link**: set `url` on it in
`src/data/media-sources.js` and the page loads that image directly, wherever it
is hosted. Useful for pulling an asset off the current site without moving
files around. `npm run media:fetch` later downloads those URLs into
`public/media/`, so the launched site no longer depends on the old host.

Resolution order per slot: a file you supplied → `url` → generated placeholder.

Until a file exists the slot renders a designed placeholder printing its own
name, so the layout is always complete and you can see exactly what to send.

```bash
npm run media:list          # every slot, and whether it is filled
npm run media:placeholders  # draw local placeholder artwork (no network)
npm run media:fetch         # swap placeholders for Unsplash photography
```

### Placeholder artwork (committed)

`public/media/` already ships with drawn SVG placeholders for all 52 slots —
brand-tinted plates with category line art (truck, trailer, container, crane,
wrench, parking, car carrier, route, portrait, dispatch desk) and the slot name
printed on them. The site therefore looks complete straight after a clone, with
no fetching and no network.

They are listed in `public/media/.generated.json`, which is how the other two
scripts know a file is a placeholder they may replace — anything you drop in by
hand is never touched.

### Stock photography

`npm run media:fetch` replaces the drawn placeholders with real photography,
driven
by `src/data/media-sources.js` where every slot carries its own search term.

- **With a free Unsplash key** — `UNSPLASH_ACCESS_KEY=xxx npm run media:fetch` —
  each slot gets a distinct photo matched to its own term, and credits are
  written to `public/media/ATTRIBUTION.md`.
- **Without a key** the script falls back to a small curated set of trucking
  shots. Fewer unique images, zero setup.

Generated placeholders are replaced; files you supplied yourself are never
touched (`--force` re-downloads everything), so client photography always wins.

The five team portrait slots are deliberately left empty: they sit under the
real names of real employees, and a stock face under someone's name is a
misrepresentation, not a placeholder.

### Logo

The client's badge ships at `public/media/logo.webp`, and `public/favicon.png` /
`public/apple-touch-icon.png` are rendered from it.

The `Logo` component resolves, in order:

| File | Result |
|---|---|
| `logo-full.*` | Used alone — assumed to be a lockup that already contains the name |
| `logo.*` | Shown as a badge beside the "GA Logistics" wordmark |
| *(none)* | Falls back to a built-in truck glyph |

`logo-light.*` is picked up on light surfaces when the main mark needs a
different version there.

---

## Contact form

`src/data/site.js → formEndpoint` is empty. While empty, the form validates and
then opens the visitor's mail client with the message pre-filled. Set it to a
Formspree / Netlify Forms / custom endpoint URL and it posts normally.

---

## Re-skinning

`src/styles/tokens.css` is the whole visual system — brand colour, ink and bone
surfaces, the fluid type scale, spacing rhythm, easings and durations.

`--brand-500` (`#49ef45`, sampled from the GA Logistics badge) is the **only**
authored brand colour. The lighter and darker steps derive from it, and every
accent, CTA, active state and focus ring resolves back to it, so changing that
one line re-skins the entire site.

Because that green is light, anything printed *on* a brand fill reads
`--accent-fg` (ink) rather than white. A darker brand colour only needs that
one token flipped back.
