# Content audit — what is verbatim and what needs your sign-off

## Why this file exists

This sandbox cannot reach `galogisticsllc.com` or `mvplogistics.eu` — the
network egress policy blocks both domains (the proxy answers `403` to the
CONNECT, for direct requests and for the fetch tool alike). So the live pages
could not be crawled directly.

Everything below was recovered from the search index (page titles, meta
descriptions and indexed page text). It covers the real architecture and a lot
of the real copy, but it is **not a guaranteed byte-for-byte copy of every
page**.

## How to make it exact

All copy lives in three files, and nothing else needs touching:

- `src/data/site.js` — nav, contact details, socials, stats
- `src/data/services.js` — the eight service pages
- `src/data/pages.js` — home, about, team, gallery, contact

Send the real text (or unblock the domain for a session) and it is a
find-and-replace, not a rebuild.

---

## Confirmed from the live site

**URLs** — every one of these appeared in the index:

```
/  ·  /about-us/  ·  /our-services/  ·  /our-team/  ·  /gallery/  ·  /contact-us/
/services/transportation/
/services/dispatching/
/services/port-to-destination-logistics/
/services/trailer-rental/
/services/shop/
/services/truck-dispatching-courses/
```

**Confirmed by the client** after the first pass, since these two were not
visible in the search index:

```
/services/truck-trailer-parking-rental/   Cargo Pick-up & Trailer Parking
/services/car-carrier-dispatch/           Car Carrier Dispatch
```

`/services_group/services/` also exists on the live site. It is a WordPress
taxonomy archive rather than an authored page, so it was not rebuilt. Say the
word if you want it kept as a redirect target.

**Contact details**

| Field | Value |
|---|---|
| Address | 357 County Rd, Cliffwood, NJ, 07721, USA |
| Phone | +1 717 340 2181 |
| Email | Info@ · Dispatch@ · hr@galogisticsllc.com |
| Yards | Cliffwood, NJ · Indianapolis, IN |

**Copy carried over verbatim** (marked `// verbatim` in the data files):

- "GA Logistics LLC is an asset-based carrier operating 100+ trucks across the United States…"
- "GA Logistics LLC is a fast-growing transportation company that serves customers within the USA for 10 years with around 200 power units."
- "Founded by drivers with 7 and 14 years of hands-on experience, we understand the business from the ground up — from the road to final delivery."
- "Our focus is simple: real capacity, clear communication, and long-term partnerships with shippers, brokers, and warehouses."
- "GA Logistics provides reliable, efficient, and professional transportation services across 48 states of the United States."
- "We have a fleet of well-maintained trucks and experienced drivers to ensure that goods are delivered safely, on time, and in perfect condition."
- "GA Logistics offers a wide range of dispatching services, including load planning, route optimization, and real-time tracking."
- "Each team has its own team leader…"  ·  "24/7 dispatching services in multiple languages."
- "GA Logistics LLC provides container transport, drayage and freight delivery from ports nationwide."
- "We have a variety of trailers available for rent, including Dry vans, Flatbeds, Step deck and Reefer trailers."
- "GA Logistics provides parking space for trucks and trailers." · "We understand the importance of safe and secure truck parking."
- "Our shop caters to the needs of truck owners and is equipped with state-of-the-art tools and equipment…"
- The dispatching course: 3 weeks, 2 meetings per week, 53-ft dry van / flatbed / step deck / reefer, trained by Ani Kapanadze.
- "GA Logistics LLC has a team of experienced drivers and dispatchers who are dedicated to providing customers with the best possible service."
- "GA Logistics LLC has put in many measures to take care of their drivers and ensure safety…"

---

---

## Status of the five open items (re-checked)

The egress block was re-tested after the first hand-off and is **still in
place** — `galogisticsllc.com` returns `403` at the CONNECT stage, for both the
plain HTTP client and the fetch tool. `unsplash.com` and `images.unsplash.com`
are blocked the same way.

| # | Item | State |
|---|---|---|
| 1 | Media | **Done.** Drawn placeholders for all 52 slots are committed, so the site renders complete with no network at all. `npm run media:fetch` swaps them for Unsplash photography — that one needs to run on your machine, since Unsplash is blocked here too. |
| 2 | Exact copy from the live site | **Blocked.** Cannot read the pages. |
| 3 | Real team roster | **Superseded.** The client supplied photographs and names for three people — Tamar Gazashvili, Tako Modebadze, Ika Kiknadze — and those are what `/our-team/` now shows. See the open question below about the five earlier names. |
| 4 | Two service slugs | **Resolved by the client.** Parking lives at `/services/truck-trailer-parking-rental/` and is now built there; `/services/car-carrier-dispatch/` and `/services/port-to-destination-logistics/` stand as built. |
| 5 | Logo and brand colours | **Done.** The badge you sent is in as `public/media/logo.webp` and drives the header, favicon and touch icon. `--brand-500` is now `#49ef45`, sampled from the artwork itself. |

### Unblocking

Either:

- open `galogisticsllc.com` (and `unsplash.com`, `images.unsplash.com`) in this
  environment's network policy — see
  https://code.claude.com/docs/en/claude-code-on-the-web — and everything above
  resolves itself in one pass; or
- paste the page texts and attach the logo file, and they go straight into
  `src/data/`.

### Item 4, resolved

The client confirmed the two addresses that had been guessed:

| Page | Address |
|---|---|
| Cargo Pick-up & Trailer Parking | `/services/truck-trailer-parking-rental/` — **corrected**, was `/services/parking/` |
| Car Carrier Dispatch | `/services/car-carrier-dispatch/` — stands |
| Port-to-Destination Logistics | `/services/port-to-destination-logistics/` — stands |

Every service URL on the rebuild now matches the live site, so search ranking
carries over page for page.

---

## Needs your input

1. **Section headings.** Editorial headings on the redesigned sections
   ("Ten years on the road…", "Eight services. One dispatch desk.", "Pick a
   lane.") are new writing for the new layout. Replace them with the live
   headings if the originals must be preserved word for word.
2. **Team roster and roles — needs a decision.** Five names were confirmed
   earlier from indexed profiles (Ani Kapanadze, Rati Khutiashvili, Saba
   Tchanturidze, Ellie Khuluzauri, Lucas Miller). The client then supplied
   photographs for three *different* people: Tamar Gazashvili, Tako Modebadze,
   Ika Kiknadze. The page now shows those three, since they come with the
   client's own photographs and are the more recent word.

   Say whether the earlier five should be added back, and send job titles for
   whoever appears. Titles are left blank rather than guessed — inventing one
   for a named real person is a misrepresentation, not a placeholder.

   Ika Kiknadze's photograph is 529x412, noticeably smaller than the other two
   (840x1258) and soft when it fills a card. A larger original would help.
3. **Driver / CDL jobs page.** The site advertises CDL driver jobs but no
   dedicated URL surfaced. If one exists, it should be added.
4. **Legal / footer text.** The footer carries a generated copyright line and a
   USDOT mention. Replace with the real footer text.
5. **Media.** `npm run media:list` prints every image slot the design is
   waiting for.
6. **Logo lockup.** The supplied badge is a mark without the company name, so
   the header shows it beside a "GA Logistics" wordmark. If there is an
   official lockup that already contains the name, drop it in as
   `public/media/logo-full.svg` and it replaces both.

## Reference site

`mvplogistics.eu` was also unreachable from here, so its scroll behaviour could
not be studied first-hand. The motion direction was built from your brief —
scroll-driven UI, premium, more refined sections — and is documented in
README.md. If a specific effect from that site should be matched exactly, a
screen recording or a description is enough to tune it.
