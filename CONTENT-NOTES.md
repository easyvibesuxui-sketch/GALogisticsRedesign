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

**Inferred** — these two are in the site's own service list
("Cargo Pick-up & Trailer Parking", "Car Carrier Dispatch") and are built as
pages, but their exact slugs were not visible in the index:

```
/services/parking/                ← verify slug
/services/car-carrier-dispatch/   ← verify slug
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

## Needs your input

1. **Section headings.** Editorial headings on the redesigned sections
   ("Ten years on the road…", "Eight services. One dispatch desk.", "Pick a
   lane.") are new writing for the new layout. Replace them with the live
   headings if the originals must be preserved word for word.
2. **Team roster.** Ani Kapanadze, Rati Khutiashvili, Saba Tchanturidze,
   Ellie Khuluzauri and Lucas Miller came from indexed profiles. Confirm the
   real list, roles and spellings.
3. **Two service slugs** — parking and car-carrier-dispatch, above.
4. **Driver / CDL jobs page.** The site advertises CDL driver jobs but no
   dedicated URL surfaced. If one exists, it should be added.
5. **Legal / footer text.** The footer carries a generated copyright line and a
   USDOT mention. Replace with the real footer text.
6. **Media.** `npm run media:list` prints all 43 image slots the design is
   waiting for.

## Reference site

`mvplogistics.eu` was also unreachable from here, so its scroll behaviour could
not be studied first-hand. The motion direction was built from your brief —
scroll-driven UI, premium, more refined sections — and is documented in
README.md. If a specific effect from that site should be matched exactly, a
screen recording or a description is enough to tune it.
