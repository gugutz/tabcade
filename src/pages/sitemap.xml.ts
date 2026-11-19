import type { APIRoute } from 'astro';
import { developers, games } from '../games';

const pages = ['/', '/library', '/about', ...games.map((g) => `/games/${g.id}`), ...developers.map((d) => `/dev/${d.id}`)];

export const GET: APIRoute = ({ site }) => {
  const urls = pages.map((p) => `<url><loc>${new URL(p, site)}</loc></url>`).join('');
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`,
    { headers: { 'Content-Type': 'application/xml' } },
  );
};
