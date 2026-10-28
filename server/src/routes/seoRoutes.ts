import { asyncRouter } from '../utils/asyncRouter';
import { contentStore } from '../services/contentStore';
import { env } from '../config/env';
import { escapeHtml } from '../utils/security';

export const seoRoutes = asyncRouter();

seoRoutes.get('/sitemap.xml', async (_req, res) => {
  const services = contentStore.getServices();
  const projects = contentStore.getProjects().data;
  const posts = contentStore.getBlogPosts().data;

  const paths = [
    '/',
    '/about',
    '/services',
    '/portfolio',
    '/pricing',
    '/contact',
    '/quote',
    '/book',
    '/reviews',
    '/blog',
    '/faqs',
    '/privacy',
    '/terms',
    ...services.map((value) => `/services/${encodeURIComponent(value.slug)}`),
    ...projects.map((value) => `/portfolio/${encodeURIComponent(value.slug)}`),
    ...posts.map((value) => `/blog/${encodeURIComponent(value.slug)}`),
  ];

  res
    .type('application/xml')
    .send(
      `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map((path) => `<url><loc>${escapeHtml(env.CLIENT_URL.replace(/\/$/, '') + path)}</loc></url>`).join('')}</urlset>`,
    );
});

seoRoutes.get('/robots.txt', (_req, res) =>
  res
    .type('text/plain')
    .send(
      `User-agent: *\nDisallow: /admin\nDisallow: /track\nDisallow: /manage-booking\nDisallow: /api\nSitemap: ${env.CLIENT_URL}/sitemap.xml\n`,
    ),
);
