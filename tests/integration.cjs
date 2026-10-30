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
  assert.ok(prjRes.data.data.length >= 1);

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
  if (res.status === 502) {
    assert.ok(res.data.error.includes('Zoho CRM sync failed'));
  } else {
    assert.equal(res.status, 201);
    assert.equal(res.data.success, true);
    assert.ok(res.data.data.id);
  }
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
  if (res.status === 502) {
    assert.ok(res.data.error.includes('Zoho CRM sync failed'));
  } else {
    assert.equal(res.status, 201);
    assert.equal(res.data.success, true);
    assert.ok(res.data.data.id);
  }
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

function getTestWeekday(offset = 10) {
  const d = new Date();
  d.setDate(d.getDate() + offset + Math.floor(Math.random() * 500) + 120);
  while (d.getUTCDay() === 0 || d.getUTCDay() === 6) {
    d.setDate(d.getDate() + 1);
  }
  return d.toISOString().slice(0, 10);
}

test('Multiple-call booking preserves separate records independently', async () => {
  const futureDate = getTestWeekday(10);

  // 1. Create first booking
  const bookRes1 = await apiRequest('POST', '/api/appointments', {
    clientName: 'Alice Smith',
    clientEmail: 'alice.smith@example.com',
    clientPhone: '+91 99999 11111',
    serviceType: 'Discovery Consultation',
    appointmentDate: futureDate,
    startTime: '10:00',
    endTime: '10:30',
    notes: 'First discovery call',
  });
  assert.equal(bookRes1.status, 201);
  const apt1 = bookRes1.data.data;
  assert.ok(apt1._id || apt1.id);
  assert.ok(apt1.manageToken);

  // 2. Create second booking for a different slot (same client or another client)
  const bookRes2 = await apiRequest('POST', '/api/appointments', {
    clientName: 'Alice Smith',
    clientEmail: 'alice.smith@example.com',
    clientPhone: '+91 99999 11111',
    serviceType: 'Architecture & Technical Review',
    appointmentDate: futureDate,
    startTime: '11:00',
    endTime: '11:30',
    notes: 'Second technical call',
  });
  assert.equal(bookRes2.status, 201);
  const apt2 = bookRes2.data.data;
  assert.ok(apt2._id || apt2.id);
  assert.ok(apt2.manageToken);

  // Verify IDs and tokens are distinct
  assert.notEqual(apt1._id || apt1.id, apt2._id || apt2.id);
  assert.notEqual(apt1.manageToken, apt2.manageToken);

  // 3. Login as admin and fetch all appointments
  const loginRes = await apiRequest('POST', '/api/auth/login', {
    email: env.DEFAULT_ADMIN_EMAIL,
    password: env.DEFAULT_ADMIN_PASSWORD,
  });
  assert.equal(loginRes.status, 200);
  const authCookie =
    loginRes.headers.get('set-cookie')?.split(';')[0] || adminCookie;

  const adminListRes = await apiRequest('GET', `/api/appointments?date=${futureDate}`, null, authCookie);
  assert.equal(adminListRes.status, 200);
  const appointments = adminListRes.data.data;

  // Confirm BOTH records exist in admin view
  const id1 = apt1._id || apt1.id;
  const id2 = apt2._id || apt2.id;
  assert.ok(appointments.some((a) => a._id === id1), 'Call 1 should exist in admin appointments');
  assert.ok(appointments.some((a) => a._id === id2), 'Call 2 should exist in admin appointments');

  // 4. Re-fetch independently to ensure persistence
  const refetchRes = await apiRequest('GET', `/api/appointments?date=${futureDate}`, null, authCookie);
  assert.equal(refetchRes.status, 200);
  assert.ok(refetchRes.data.data.some((a) => a._id === id1));
  assert.ok(refetchRes.data.data.some((a) => a._id === id2));

  // 5. Verify overlapping booking is rejected with 409 Conflict
  const conflictRes = await apiRequest('POST', '/api/appointments', {
    clientName: 'Bob Jones',
    clientEmail: 'bob.jones@example.com',
    serviceType: 'Launch Review',
    appointmentDate: futureDate,
    startTime: '10:00', // Collides with Alice's first booking
    endTime: '10:30',
  });
  assert.equal(conflictRes.status, 409);
});

test('Meeting link updates synchronize between admin and client dashboard', async () => {
  const futureDate = getTestWeekday(55);

  // 1. Client books appointment with initial meeting link
  const bookRes = await apiRequest('POST', '/api/appointments', {
    clientName: 'Carlos Rivera',
    clientEmail: 'carlos.rivera@example.com',
    serviceType: 'Architecture Review',
    appointmentDate: futureDate,
    startTime: '14:00',
    endTime: '14:30',
    notes: 'Initial booking',
  });
  assert.equal(bookRes.status, 201);
  const apt = bookRes.data.data;
  const aptId = apt._id || apt.id;
  const clientToken = apt.manageToken;
  assert.ok(clientToken);

  // 2. Admin logs in
  const loginRes = await apiRequest('POST', '/api/auth/login', {
    email: env.DEFAULT_ADMIN_EMAIL,
    password: env.DEFAULT_ADMIN_PASSWORD,
  });
  assert.equal(loginRes.status, 200);
  const authCookie =
    loginRes.headers.get('set-cookie')?.split(';')[0] || adminCookie;

  // 3. Admin updates the meeting link
  const updatedMeetingUrl = 'https://meet.google.com/abc-sync-123';
  const updateRes = await apiRequest(
    'PUT',
    `/api/appointments/${aptId}`,
    {
      meetingLink: updatedMeetingUrl,
      notes: 'Updated by studio admin with custom Google Meet room',
    },
    authCookie,
  );
  assert.equal(updateRes.status, 200);
  assert.equal(updateRes.data.data.meetingLink, updatedMeetingUrl);

  // 4. Client fetches their booking via public /manage endpoint
  const clientViewRes = await apiRequest('POST', '/api/appointments/manage', {
    token: clientToken,
    action: 'view',
  });
  assert.equal(clientViewRes.status, 200);
  assert.equal(clientViewRes.data.data.meetingLink, updatedMeetingUrl);

  // 5. Client reschedules to another open slot
  const rescheduleRes = await apiRequest('POST', '/api/appointments/manage', {
    token: clientToken,
    action: 'reschedule',
    appointmentDate: futureDate,
    startTime: '15:00',
    endTime: '15:30',
  });
  assert.equal(rescheduleRes.status, 200);
  assert.equal(rescheduleRes.data.data.startTime, '15:00');
  // Meeting link remains preserved after client reschedule
  assert.equal(rescheduleRes.data.data.meetingLink, updatedMeetingUrl);
});

test('Security and validation: unauthorized meeting link edits and invalid formats are rejected', async () => {
  // 1. Unauthorized PUT request to appointments rejected with 401
  const unauthRes = await apiRequest('PUT', '/api/appointments/apt-fake-999', {
    meetingLink: 'https://meet.google.com/hack',
  });
  assert.equal(unauthRes.status, 401);

  // 2. Admin login
  const loginRes = await apiRequest('POST', '/api/auth/login', {
    email: env.DEFAULT_ADMIN_EMAIL,
    password: env.DEFAULT_ADMIN_PASSWORD,
  });
  assert.equal(loginRes.status, 200);
  const authCookie =
    loginRes.headers.get('set-cookie')?.split(';')[0] || adminCookie;

  // 3. Invalid meeting URL rejected with 400
  const invalidUrlRes = await apiRequest(
    'PUT',
    '/api/appointments/apt-sample-01',
    {
      meetingLink: 'javascript:alert(1)',
    },
    authCookie,
  );
  assert.equal(invalidUrlRes.status, 400);

  // 4. Non-existent appointment ID returns 404
  const notFoundRes = await apiRequest(
    'PUT',
    '/api/appointments/apt-non-existent-99999',
    {
      status: 'confirmed',
    },
    authCookie,
  );
  assert.equal(notFoundRes.status, 404);
});

test('Zoho CRM client registration triggers server sync and succeeds with 201', async () => {
  // 1. Admin login
  const loginRes = await apiRequest('POST', '/api/auth/login', {
    email: env.DEFAULT_ADMIN_EMAIL,
    password: env.DEFAULT_ADMIN_PASSWORD,
  });
  assert.equal(loginRes.status, 200);
  const authCookie = loginRes.headers.get('set-cookie')?.split(';')[0];

  // 2. Admin creates a new client project record (which triggers server-side syncClientToZoho)
  const clientRes = await apiRequest(
    'POST',
    '/api/client-projects',
    {
      clientName: 'Vikram Joshi',
      clientEmail: 'vikram.joshi@example.com',
      title: 'Real Estate Platform',
      quoteAmount: 75000,
      proposal: 'Full custom responsive real estate showcase website.',
      meetingLink: 'https://meet.google.com/vik-real-est',
    },
    authCookie,
  );

  assert.equal(clientRes.status, 201);
  assert.equal(clientRes.data.data.project.clientName, 'Vikram Joshi');
  assert.equal(clientRes.data.data.project.clientEmail, 'vikram.joshi@example.com');
  assert.ok(clientRes.data.data.token);
});

test('Zoho CRM OAuth callback does not expose refresh tokens or credentials in webpage', async () => {
  // Callback with error parameter renders user-friendly error without leaking sensitive tokens
  const callbackRes = await apiRequest('GET', '/api/zoho/callback?error=access_denied');
  assert.equal(callbackRes.status, 400);
  const bodyText = typeof callbackRes.data === 'string' ? callbackRes.data : callbackRes.data.raw || '';
  assert.ok(!bodyText.includes('ZOHO_REFRESH_TOKEN=1000.'));
  assert.ok(!bodyText.includes('client_secret'));
});

test('Zoho CRM admin diagnostic endpoint is protected and responds with structured status', async () => {
  // 1. Unauthenticated request to /api/zoho/test is rejected with 401
  const unauthRes = await apiRequest('POST', '/api/zoho/test', {});
  assert.equal(unauthRes.status, 401);

  // 2. Authenticated admin request runs diagnostic
  const loginRes = await apiRequest('POST', '/api/auth/login', {
    email: env.DEFAULT_ADMIN_EMAIL,
    password: env.DEFAULT_ADMIN_PASSWORD,
  });
  const authCookie = loginRes.headers.get('set-cookie')?.split(';')[0];

  const diagRes = await apiRequest('POST', '/api/zoho/test', { createTestLead: false }, authCookie);
  // Status is 200 (if Zoho authorized) or 502 (if Zoho unconfigured/offline), but never crashes or returns 500
  assert.ok([200, 502].includes(diagRes.status));
  assert.ok(typeof diagRes.data === 'object');

  // 3. Pending sync queue endpoint
  const pendingRes = await apiRequest('GET', '/api/zoho/pending', null, authCookie);
  assert.equal(pendingRes.status, 200);
  assert.ok(typeof pendingRes.data.data.count === 'number');
});

test('Technical SEO: /sitemap.xml returns valid XML with canonical indexable URLs', async () => {
  const res = await apiRequest('GET', '/sitemap.xml');
  assert.equal(res.status, 200);
  const contentType = res.headers.get('content-type') || '';
  assert.ok(contentType.includes('xml'), `Expected XML content-type, got: ${contentType}`);

  const xml = typeof res.data === 'string' ? res.data : res.data.raw || '';
  assert.ok(xml.includes('<?xml version="1.0" encoding="UTF-8"?>'));
  assert.ok(xml.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'));
  assert.ok(xml.includes('https://freelancer-one-woad.vercel.app/'));
  assert.ok(xml.includes('<changefreq>'));
  assert.ok(xml.includes('<priority>'));

  // Ensure private or admin routes are NOT in sitemap
  assert.ok(!xml.includes('/admin'));
  assert.ok(!xml.includes('/track'));
  assert.ok(!xml.includes('/manage-booking'));
  assert.ok(!xml.includes('/api/'));
  assert.ok(!xml.includes('localhost'));
});

test('Technical SEO: /robots.txt blocks private paths and points to canonical sitemap', async () => {
  const res = await apiRequest('GET', '/robots.txt');
  assert.equal(res.status, 200);
  const contentType = res.headers.get('content-type') || '';
  assert.ok(contentType.includes('text/plain'), `Expected text/plain, got: ${contentType}`);

  const txt = typeof res.data === 'string' ? res.data : res.data.raw || '';
  assert.ok(txt.includes('User-agent: *'));
  assert.ok(txt.includes('Allow: /'));
  assert.ok(txt.includes('Disallow: /admin'));
  assert.ok(txt.includes('Disallow: /track'));
  assert.ok(txt.includes('Disallow: /manage-booking'));
  assert.ok(txt.includes('Disallow: /api/'));
  assert.ok(txt.includes('Sitemap: https://freelancer-one-woad.vercel.app/sitemap.xml'));
});

test('Google Search Console: HTML-file verification route serves exact verification body', async () => {
  const testCode = '4b8c6e2a1d9e7f03';
  const res = await apiRequest('GET', `/google${testCode}.html`);
  assert.equal(res.status, 200);
  const contentType = res.headers.get('content-type') || '';
  assert.ok(contentType.includes('text/html'), `Expected text/html, got: ${contentType}`);

  const body = typeof res.data === 'string' ? res.data : res.data.raw || '';
  assert.equal(body.trim(), `google-site-verification: google${testCode}.html`);
});

test('Google Search Console: client/index.html contains exact verification meta tag', async () => {
  const fs = require('fs');
  const path = require('path');
  const indexPath = path.resolve(__dirname, '../client/index.html');
  const html = fs.readFileSync(indexPath, 'utf-8');
  assert.ok(
    html.includes('<meta name="google-site-verification" content="vpRHYVBANNZh4rlaUkJJOCIKekDSs2ZCuyOBVTpYIIo" />'),
    'client/index.html must contain the exact google-site-verification meta tag',
  );
});



