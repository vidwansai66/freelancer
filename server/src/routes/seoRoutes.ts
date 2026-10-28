import { asyncRouter } from '../utils/asyncRouter';
import { contentStore } from '../services/contentStore';
import { env } from '../config/env';
import { escapeHtml } from '../utils/security';

export const seoRoutes = asyncRouter();

seoRoutes.get('/sitemap.xml', async (_req, res) => {
  const baseUrl = (env.PRIMARY_PRODUCTION_URL || env.CLIENT_URL).replace(/\/+$/, '');
  const services = contentStore.getServices();
  const projects = contentStore.getProjects().data;
  const posts = contentStore.getBlogPosts().data;

  interface SitemapEntry {
    path: string;
    priority: string;
    changefreq: string;
  }

  const entries: SitemapEntry[] = [
    { path: '/', priority: '1.0', changefreq: 'weekly' },
    { path: '/services', priority: '0.9', changefreq: 'weekly' },
    { path: '/portfolio', priority: '0.9', changefreq: 'weekly' },
    { path: '/pricing', priority: '0.8', changefreq: 'weekly' },
    { path: '/about', priority: '0.7', changefreq: 'monthly' },
    { path: '/contact', priority: '0.8', changefreq: 'monthly' },
    { path: '/quote', priority: '0.8', changefreq: 'monthly' },
    { path: '/book', priority: '0.8', changefreq: 'monthly' },
    { path: '/reviews', priority: '0.7', changefreq: 'monthly' },
    { path: '/blog', priority: '0.8', changefreq: 'weekly' },
    { path: '/faqs', priority: '0.6', changefreq: 'monthly' },
    { path: '/privacy', priority: '0.3', changefreq: 'yearly' },
    { path: '/terms', priority: '0.3', changefreq: 'yearly' },
    ...services.map((s) => ({
      path: `/services/${encodeURIComponent(s.slug)}`,
      priority: '0.8',
      changefreq: 'weekly',
    })),
    ...projects.map((p) => ({
      path: `/portfolio/${encodeURIComponent(p.slug)}`,
      priority: '0.7',
      changefreq: 'monthly',
    })),
    ...posts.map((b) => ({
      path: `/blog/${encodeURIComponent(b.slug)}`,
      priority: '0.7',
      changefreq: 'monthly',
    })),
  ];

  const xmlUrls = entries
    .map(
      (entry) =>
        `<url><loc>${escapeHtml(baseUrl + entry.path)}</loc><changefreq>${entry.changefreq}</changefreq><priority>${entry.priority}</priority></url>`,
    )
    .join('');

  res
    .type('application/xml; charset=utf-8')
    .send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${xmlUrls}</urlset>`);
});

seoRoutes.get('/robots.txt', (_req, res) => {
  const baseUrl = (env.PRIMARY_PRODUCTION_URL || env.CLIENT_URL).replace(/\/+$/, '');
  const robotsTxt = [
    'User-agent: *',
    'Allow: /',
    'Allow: /assets/',
    'Allow: /favicon.svg',
    'Disallow: /admin',
    'Disallow: /admin/',
    'Disallow: /track',
    'Disallow: /track/',
    'Disallow: /manage-booking',
    'Disallow: /manage-booking/',
    'Disallow: /api/',
    '',
    `Sitemap: ${baseUrl}/sitemap.xml`,
    '',
  ].join('\n');

  res.type('text/plain; charset=utf-8').send(robotsTxt);
});

// Dynamic handler for Google Search Console HTML verification files (e.g. /google1234567890abcdef.html)
seoRoutes.get(/^\/google([a-zA-Z0-9_-]+)\.html$/, (req, res) => {
  const code = req.params[0] || '';
  res
    .type('text/html; charset=utf-8')
    .send(`google-site-verification: google${code}.html`);
});

seoRoutes.get('/google:code.html', (req, res) => {
  const code = req.params.code || '';
  res
    .type('text/html; charset=utf-8')
    .send(`google-site-verification: google${code}.html`);
});

