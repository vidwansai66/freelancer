// Integration test suite for Zero-Cost Architecture & HubSpot CRM Integration
process.env.NODE_ENV = 'test';
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const app = require('../server/dist/server').default;
const { env } = require('../server/dist/config/env');

let server;
let base;
let adminCookie;

before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      base = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
});

async function apiRequest(method, url, body = null, cookie = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (cookie) headers['Cookie'] = cookie;

  const res = await fetch(base + url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }

  return { status: res.status, headers: res.headers, data: json };
}

test('Health endpoint returns 200 without database connection', async () => {
  const res = await apiRequest('GET', '/health');
  assert.equal(res.status, 200);
  assert.equal(res.data.status, 'ok');
});

test('Public content endpoints return static data with 0ms database latency', async () => {
  // Services
  const srvRes = await apiRequest('GET', '/api/services');
  assert.equal(srvRes.status, 200);
  assert.ok(Array.isArray(srvRes.data.data));
  assert.ok(srvRes.data.data.length >= 6);

  // Projects
  const prjRes = await apiRequest('GET', '/api/projects');
  assert.equal(prjRes.status, 200);
  assert.ok(Array.isArray(prjRes.data.data));
  assert.ok(prjRes.data.data.length >= 3);

  // Pricing
  const prcRes = await apiRequest('GET', '/api/pricing');
  assert.equal(prcRes.status, 200);
  assert.ok(Array.isArray(prcRes.data.data));
  assert.ok(prcRes.data.data.length >= 3);

  // FAQs
  const faqRes = await apiRequest('GET', '/api/faqs');
  assert.equal(faqRes.status, 200);
  assert.ok(Array.isArray(faqRes.data.data));
  assert.ok(faqRes.data.data.length >= 6);

  // Testimonials
  const tstRes = await apiRequest('GET', '/api/testimonials');
  assert.equal(tstRes.status, 200);
  assert.ok(Array.isArray(tstRes.data.data));
  assert.ok(tstRes.data.data.length >= 3);

  // Blog
  const blgRes = await apiRequest('GET', '/api/blog');
  assert.equal(blgRes.status, 200);
  assert.ok(Array.isArray(blgRes.data.data));
  assert.ok(blgRes.data.data.length >= 2);

  // Settings
  const setRes = await apiRequest('GET', '/api/settings');
  assert.equal(setRes.status, 200);
  assert.equal(setRes.data.data.studioName, 'Teja Web Studio');
  assert.equal(setRes.data.data.whatsappNumber, '919490955048');
});

test('Admin authentication rejects invalid credentials with 401', async () => {
  const res = await apiRequest('POST', '/api/auth/login', {
    email: 'admin@tejastudio.com',
    password: 'WrongPassword!',
  });
  assert.equal(res.status, 401);
  assert.equal(res.data.success, false);
});

test('Admin authentication succeeds with valid credentials and sets secure cookie', async () => {
  const res = await apiRequest('POST', '/api/auth/login', {
    email: env.DEFAULT_ADMIN_EMAIL,
    password: env.DEFAULT_ADMIN_PASSWORD,
  });
  assert.equal(res.status, 200);
  assert.equal(res.data.success, true);
  assert.ok(res.data.data.token);

  // Capture cookie
  const cookieHeader = res.headers.get('set-cookie');
  assert.ok(cookieHeader && cookieHeader.includes('studio_session='));
  adminCookie = cookieHeader.split(';')[0];
});

test('Protected admin endpoint /api/auth/me accepts authenticated cookie and rejects unauthenticated request', async () => {
  // Unauthenticated
  const unauthRes = await apiRequest('GET', '/api/auth/me');
  assert.equal(unauthRes.status, 401);

  // Authenticated
  const authRes = await apiRequest('GET', '/api/auth/me', null, adminCookie);
  assert.equal(authRes.status, 200);
  assert.equal(authRes.data.success, true);
  assert.equal(authRes.data.data.email, env.DEFAULT_ADMIN_EMAIL);
});

test('Contact form submission validates required fields', async () => {
  const res = await apiRequest('POST', '/api/inquiries', {
    name: '',
    email: '',
  });
  assert.equal(res.status, 400);
  assert.equal(res.data.success, false);
});

test('Contact form submission processes valid payloads', async () => {
  const res = await apiRequest('POST', '/api/inquiries', {
    name: 'Jane Doe',
    email: 'jane@example.com',
    phone: '+91 94909 55048',
    subject: 'Website Project Inquiry',
    message: 'Hello, I would like to get a quote for a new business website.',
  });
  assert.equal(res.status, 201);
  assert.equal(res.data.success, true);
  assert.ok(res.data.data.id);
});

test('Quotation form submission validates required fields', async () => {
  const res = await apiRequest('POST', '/api/quotations', {
    name: 'John Smith',
  });
  assert.equal(res.status, 400);
  assert.equal(res.data.success, false);
});

test('Quotation form submission processes valid estimates', async () => {
  const res = await apiRequest('POST', '/api/quotations', {
    name: 'Acme Corp',
    email: 'acme@example.com',
    projectType: 'Business Website Package',
    budgetRange: '$449 - $899',
    timeline: 'Within 5–7 Days',
    description: 'We need a multi-page business website with mobile responsiveness.',
  });
  assert.equal(res.status, 201);
  assert.equal(res.data.success, true);
  assert.ok(res.data.data.id);
});

test('SEO sitemap and robots routes render valid outputs', async () => {
  const sitemapRes = await apiRequest('GET', '/sitemap.xml');
  assert.equal(sitemapRes.status, 200);
  assert.ok(sitemapRes.data.raw.includes('<urlset'));

  const robotsRes = await apiRequest('GET', '/robots.txt');
  assert.equal(robotsRes.status, 200);
  assert.ok(robotsRes.data.raw.includes('User-agent: *'));
});

test('Zoho CRM diagnostic status endpoint returns accurate configuration metadata', async () => {
  const res = await apiRequest('GET', '/api/zoho/status');
  assert.equal(res.status, 200);
  assert.equal(res.data.success, true);
  assert.equal(res.data.data.provider, 'Zoho CRM (India DC)');
  assert.equal(res.data.data.accountsUrl, 'https://accounts.zoho.in');
  assert.equal(res.data.data.apiBaseUrl, 'https://www.zohoapis.in/crm/v8');
  assert.equal(typeof res.data.data.isConfigured, 'boolean');
});

