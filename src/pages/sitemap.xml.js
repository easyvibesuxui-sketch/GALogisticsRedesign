import { site } from '../data/site.js';
import { services } from '../data/services.js';

const routes = [
  '/',
  '/about-us/',
  '/our-services/',
  '/our-team/',
  '/gallery/',
  '/contact-us/',
  ...services.map((service) => `/services/${service.slug}/`),
];

export function GET() {
  const today = new Date().toISOString().split('T')[0];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (route) => `  <url>
    <loc>${site.url}${route}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${route === '/' ? '1.0' : '0.7'}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;

  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
