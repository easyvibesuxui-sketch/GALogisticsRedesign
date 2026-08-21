/* ==========================================================================
   Media sources
   --------------------------------------------------------------------------
   Every image slot on the site is listed here with the Unsplash search term
   that fits it. `npm run media:fetch` turns this map into real files in
   public/media/, after which the site picks them up automatically.

   A slot may also carry `url`, pointing at an image hosted anywhere (for
   example one still living on the current galogisticsllc.com). The site loads
   it straight from there, so a slot can be filled by pasting a link — no
   download, no file handling. `npm run media:fetch` later pulls those URLs
   down into public/media/ so the site stops depending on the old host.

   Two modes, see scripts/fetch-media.mjs:

   1. With an Unsplash access key (UNSPLASH_ACCESS_KEY) — each slot is filled
      with the best match for its own `query`, so all 43 slots get distinct,
      on-topic photography.
   2. Without a key — slots fall back to the curated `photo` ids below, a small
      hand-picked set of trucking shots. Fewer unique images, zero setup.

   Replacing any of this with the client's own photography is just dropping a
   file into public/media/ named after the slot; local files always win.
   ========================================================================== */

/* Hand-picked Unsplash photo ids, used by the keyless path in
   scripts/fetch-media.mjs.

   These slots used to carry a `url` pointing straight at Unsplash's public
   download endpoint, so the browser resolved the picture with no download
   step and no key. That endpoint now answers 401 to unauthenticated
   requests: every one of those links was dead on the page, and — because an
   explicit `url` wins over everything in the fetcher — it also stopped the
   access-key path from ever running. The links are gone, so a slot is filled
   by fetching it into public/media/ rather than by hotlinking. */

export const curated = {
  /* trucking */
  road: '5M_RGvhvQ_g',       // white semi-truck parked on asphalt, blue sky
  highway: 'dlyz37qqHfM',    // red semi truck driving down a highway
  convoy: 'e3Lb6KlDXgw',     // semi-trucks hauling an oversized load
  country: 'H2UzCyX32p4',    // red semi truck on a country road
  desert: 'Rhwj3CPwc6o',     // semi truck on a desert highway
  turbines: '9lNE4qc6LLc',   // green semi-truck, wind turbines behind

  /* yards, docks and ports */
  dock: '2vM-hJbDwME',       // truck parked in front of a loading dock
  dockWide: 'dGUbqTfP2xE',   // truck at a loading dock
  port: 'ip0yX8W1veE',       // busy shipping port, cranes and containers
  crane: 'mpgeKYesx8w',      // crane loading containers onto a ship

  /* workshop */
  shop: 'P1itawXTCgg',       // mechanic working inside a garage

  /* dispatch desks */
  desk: 'WbLJd4M88I8',       // working at a multi-monitor setup
  deskPair: '6pMI--IXV-8',   // desk with two monitors and a chair
  deskLaptop: '0Z6gQ0p9hVI', // desk with two monitors and a laptop
  deskDark: 'rtY0WbkRdPk',   // dark office desk with a monitor
};
/* slot → { query, photo }
   `query`  drives the API-key path.
   `photo`  is the no-key fallback id. */
export const mediaSources = {
  /* --- home ------------------------------------------------------------- */
  hero:            { query: 'semi truck highway dusk', photo: curated.highway },
  intro:           { query: 'truck fleet parked lot', photo: curated.road },
  'team-teaser':   { query: 'logistics dispatcher office desk', photo: curated.country },
  'pillar-1':      { query: 'semi truck fleet lineup', photo: curated.road },
  'pillar-2':      { query: 'dispatcher headset office', photo: curated.highway },
  'pillar-3':      { query: 'warehouse loading dock', photo: curated.convoy },
  'pillar-4':      { query: 'truck driver cabin', photo: curated.desert },
  og:              { query: 'semi truck highway', photo: curated.highway },

  /* --- about ------------------------------------------------------------ */
  'about-hero':    { query: 'trucking company yard', photo: curated.turbines },
  'about-story':   { query: 'truck driver portrait', photo: curated.country },
  'about-fleet':   { query: 'semi trucks parked fleet', photo: curated.road },

  /* --- services --------------------------------------------------------- */
  'services-hero':          { query: 'freight logistics trucks', photo: curated.convoy },

  'transportation-hero':    { query: 'semi truck interstate highway', photo: curated.highway },
  'transportation-1':       { query: 'truck driving mountain road', photo: curated.desert },
  'transportation-2':       { query: 'trucks on freeway aerial', photo: curated.turbines },

  'dispatching-hero':       { query: 'dispatch office monitors logistics', photo: curated.road },
  'dispatching-1':          { query: 'office desk computer monitors', photo: curated.country },
  'dispatching-2':          { query: 'route planning map screen', photo: curated.highway },

  'port-hero':              { query: 'container port terminal crane', photo: curated.convoy },
  'port-1':                 { query: 'shipping containers stacked', photo: curated.road },
  'port-2':                 { query: 'container truck drayage', photo: curated.highway },

  'trailer-hero':           { query: 'dry van trailer', photo: curated.road },
  'trailer-1':              { query: 'flatbed trailer cargo', photo: curated.convoy },
  'trailer-2':              { query: 'refrigerated trailer reefer', photo: curated.turbines },

  'parking-hero':           { query: 'semi trucks parked row', photo: curated.desert },
  'parking-1':              { query: 'truck parking lot', photo: curated.road },
  'parking-2':              { query: 'trailer yard aerial', photo: curated.country },

  'carcarrier-hero':        { query: 'car carrier trailer transport', photo: curated.convoy },
  'carcarrier-1':           { query: 'auto transport truck', photo: curated.highway },
  'carcarrier-2':           { query: 'cars loaded on trailer', photo: curated.road },

  'shop-hero':              { query: 'mechanic garage workshop', photo: curated.country },
  'shop-1':                 { query: 'diesel mechanic tools', photo: curated.desert },
  'shop-2':                 { query: 'truck maintenance garage', photo: curated.turbines },

  'courses-hero':           { query: 'training classroom laptop office', photo: curated.highway },
  'courses-1':              { query: 'people learning office training', photo: curated.road },
  'courses-2':              { query: 'logistics team meeting', photo: curated.country },

  /* --- team ------------------------------------------------------------- */
  'team-hero':     { query: 'logistics team office', photo: curated.convoy },
  /* Real people, photographed by the client. Never stock-filled: a stranger's
     face under someone's name is a misrepresentation, not a placeholder. */
  'team-1':        { person: 'Tamar Gazashvili', skip: 'client photograph' },
  'team-2':        { person: 'Tako Modebadze',   skip: 'client photograph' },
  'team-3':        { person: 'Ika Kiknadze',     skip: 'client photograph' },

  /* --- gallery ---------------------------------------------------------- */
  'gallery-1':     { query: 'semi truck front grille', photo: curated.highway },
  'gallery-2':     { query: 'semi trailers parked', photo: curated.road },
  'gallery-3':     { query: 'truck yard sunset', photo: curated.turbines },
  'gallery-4':     { query: 'truck engine repair', photo: curated.country },
  'gallery-5':     { query: 'truck on open road', photo: curated.desert },
  'gallery-6':     { query: 'flatbed step deck trailer', photo: curated.convoy },
  'gallery-7':     { query: 'trailer parking lot aerial', photo: curated.road },
  'gallery-8':     { query: 'mechanic working under truck', photo: curated.country },
  'gallery-9':     { query: 'fleet of trucks lined up', photo: curated.highway },

  /* The scroll-driven backdrop behind [01] and [02]. Supplied by the client
     and re-encoded for scrubbing (see README) — never stock-filled. */
  reel:            { skip: 'client footage — public/media/reel.mp4' },
  reel2:           { skip: 'client footage — public/media/reel2.mp4' },

  /* --- contact ---------------------------------------------------------- */
  'contact-map':   { query: 'aerial highway interchange', photo: curated.turbines },
};

export const slotNames = Object.keys(mediaSources);
