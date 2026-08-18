import { defineConfig } from 'astro/config';

// GA Logistics LLC — static marketing site.
// Trailing slashes are kept so the URL architecture matches the live site 1:1
// (e.g. /services/transportation/).
export default defineConfig({
  site: 'https://galogisticsllc.com',
  trailingSlash: 'always',
  build: { format: 'directory' },
  devToolbar: { enabled: false },
});
