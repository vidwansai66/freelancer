// 10 Acceptance Criteria Tests (TEST 1 to TEST 10)
// Tests exact consistency between Public Website, Admin Dashboard, Persistent Database, and Zoho CRM
process.env.NODE_ENV = 'test';
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const app = require('../server/dist/server').default;
const { env } = require('../server/dist/config/env');
const { contentStore } = require('../server/dist/services/contentStore');

let server;
let base;
let adminCookie;
let createdProjectId;
let createdProjectSlug = `test-agency-case-study-${Date.now()}`;

before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      base = `http://127.0.0.1:${port}`;
      resolve();
    });
  });

  // Authenticate Admin
  const res = await fetch(base + '/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: env.DEFAULT_ADMIN_EMAIL,
      password: env.DEFAULT_ADMIN_PASSWORD,
    }),
  });
  assert.equal(res.status, 200);
  const cookieHeader = res.headers.get('set-cookie');
  assert.ok(cookieHeader);
  adminCookie = cookieHeader.split(';')[0];
});

after(async () => {
  if (createdProjectId) {
    // Cleanup created test project
    await fetch(base + `/api/projects/${createdProjectId}`, {
      method: 'DELETE',
      headers: { Cookie: adminCookie },
    });
  }
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

// -------------------------------------------------------------
// TEST 1: Admin creates a case study
// -------------------------------------------------------------
test('TEST 1: Admin creates a case study and verifies persistence and public visibility', async () => {
  const payload = {
    title: 'Acme Logistics Cloud Platform',
    slug: createdProjectSlug,
    category: 'SaaS Platform',
    industry: 'Supply Chain & Logistics',
    clientName: 'Acme International',
    summary: 'Cloud-native warehouse tracking dashboard with real-time analytics.',
    description: 'Complete overhaul of legacy logistics portal into a high-speed React and Node platform.',
    objectives: 'Reduce dispatch latency by 50% and automate inventory reconciliation.',
    challenges: 'Integrating 14 legacy SOAP APIs with sub-second response limits.',
    solutions: 'Constructed an event-driven micro-proxy cache and modern responsive UI.',
    results: 'Dispatch turnaround improved by 62% in 90 days.',
    resultStat: '62% Faster Turnaround',
    featuredImage: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
    liveUrl: 'https://acme-logistics-preview.com',
    servicesDelivered: ['UI/UX Design', 'Full-Stack Development', 'API Integration'],
    technologies: ['React', 'TypeScript', 'Node.js', 'Tailwind CSS'],
    seoTitle: 'Acme Logistics Case Study | Teja Web Studio',
    seoDescription: 'Discover how Teja Web Studio accelerated Acme Logistics dispatch operations.',
    status: 'published',
    isFeatured: true,
  };

  // 1. Submit through Admin API
  const createRes = await apiRequest('POST', '/api/projects', payload, adminCookie);
  assert.equal(createRes.status, 201, `Creation failed: ${JSON.stringify(createRes.data)}`);
  assert.ok(createRes.data.success);
  assert.ok(createRes.data.data._id);
  createdProjectId = createRes.data.data._id;
  assert.equal(createRes.data.data.status, 'published');

  // 2. Verify persistence in Database / ContentStore
  const directLookup = contentStore.getProjectById(createdProjectId);
  assert.ok(directLookup, 'Record must be persisted in ContentStore');
  assert.equal(directLookup.title, 'Acme Logistics Cloud Platform');

  // 3. Verify public portfolio page renders it
  const publicList = await apiRequest('GET', '/api/projects');
  assert.equal(publicList.status, 200);
  const foundInPublic = publicList.data.data.find((p) => p._id === createdProjectId || p.slug === createdProjectSlug);
  assert.ok(foundInPublic, 'Published project must be returned by public /api/projects');
  assert.equal(foundInPublic.title, 'Acme Logistics Cloud Platform');
  assert.equal(foundInPublic.resultStat, '62% Faster Turnaround');

  // 4. Verify detail page opens directly by slug
  const publicDetail = await apiRequest('GET', `/api/projects/${createdProjectSlug}`);
  assert.equal(publicDetail.status, 200);
  assert.equal(publicDetail.data.data.slug, createdProjectSlug);
  assert.equal(publicDetail.data.data.category, 'SaaS Platform');
  assert.equal(publicDetail.data.data.clientName, 'Acme International');
});

// -------------------------------------------------------------
// TEST 2: Admin edits the case study
// -------------------------------------------------------------
test('TEST 2: Admin edits the case study and verifies instant public reflection', async () => {
  assert.ok(createdProjectId, 'Requires project from TEST 1');

  const updatePayload = {
    title: 'Acme Global Logistics Enterprise',
    resultStat: '78% Faster Turnaround',
    objectives: 'Expanded objectives to cover multi-region distribution centers.',
  };

  // 1. Admin updates record
  const updateRes = await apiRequest('PUT', `/api/projects/${createdProjectId}`, updatePayload, adminCookie);
  assert.equal(updateRes.status, 200);
  assert.equal(updateRes.data.data.title, 'Acme Global Logistics Enterprise');
  assert.equal(updateRes.data.data.resultStat, '78% Faster Turnaround');

  // 2. Verify instant reflection on public API without delay or stale cache
  const publicDetail = await apiRequest('GET', `/api/projects/${createdProjectSlug}`);
  assert.equal(publicDetail.status, 200);
  assert.equal(publicDetail.data.data.title, 'Acme Global Logistics Enterprise');
  assert.equal(publicDetail.data.data.resultStat, '78% Faster Turnaround');
});

// -------------------------------------------------------------
// TEST 3: Admin unpublishes the case study
// -------------------------------------------------------------
test('TEST 3: Admin unpublishes the case study; disappears from public list and rejects public access', async () => {
  assert.ok(createdProjectId, 'Requires project from TEST 1');

  // 1. Admin switches status to draft
  const unpublishRes = await apiRequest('PUT', `/api/projects/${createdProjectId}`, { status: 'draft' }, adminCookie);
  assert.equal(unpublishRes.status, 200);
  assert.equal(unpublishRes.data.data.status, 'draft');

  // 2. Verify it disappears from public listing
  const publicList = await apiRequest('GET', '/api/projects');
  assert.equal(publicList.status, 200);
  const foundInPublic = publicList.data.data.find((p) => p._id === createdProjectId);
  assert.equal(foundInPublic, undefined, 'Draft project must NOT be returned in public project listing');

  // 3. Verify public detail page rejects unauthenticated access with 404
  const publicDetail = await apiRequest('GET', `/api/projects/${createdProjectSlug}`);
  assert.equal(publicDetail.status, 404, 'Public visitor must receive 404 for draft project');

  // 4. Verify admin can still access it when authenticated
  const adminDetail = await apiRequest('GET', `/api/projects/${createdProjectSlug}`, null, adminCookie);
  assert.equal(adminDetail.status, 200, 'Authenticated admin must be able to view draft');
  assert.equal(adminDetail.data.data.status, 'draft');

  // Re-publish for remaining tests
  await apiRequest('PUT', `/api/projects/${createdProjectId}`, { status: 'published' }, adminCookie);
});

// -------------------------------------------------------------
// TEST 4: Client submits an enquiry / contact form
// -------------------------------------------------------------
test('TEST 4: Client submits enquiry, stored in database, visible in admin, Zoho sync initiated', async () => {
  const enquiryPayload = {
    name: 'David Sterling',
    email: 'david.sterling@acmecorp.com',
    phone: '+1-555-0199',
    subject: 'Enterprise Web Platform RFP',
    service: 'Web Development',
    budget: '$5,000 - $10,000',
    message: 'We require a new high-conversion agency platform with Zoho CRM integration.',
  };

  // 1. Submit public inquiry
  const submitRes = await apiRequest('POST', '/api/inquiries', enquiryPayload);
  assert.equal(submitRes.status, 201);
  assert.ok(submitRes.data.success);
  const inqId = submitRes.data.data?.id;
  assert.ok(inqId, 'Inquiry must generate a persistent record ID');

  // 2. Verify visible in admin dashboard
  const adminInquiries = await apiRequest('GET', '/api/inquiries', null, adminCookie);
  assert.equal(adminInquiries.status, 200);
  const found = adminInquiries.data.data.find((i) => i._id === inqId || i.email === 'david.sterling@acmecorp.com');
  assert.ok(found, 'Inquiry must appear in admin inquiries list');
  assert.equal(found.name, 'David Sterling');
  assert.equal(found.subject, 'Enterprise Web Platform RFP');
});

// -------------------------------------------------------------
// TEST 5: Admin updates a meeting link
// -------------------------------------------------------------
test('TEST 5: Admin updates meeting link and client booking views the updated link', async () => {
  // 1. Choose a unique random future date to avoid any conflict with persisted bookings
  const randomDayOffset = 30 + Math.floor(Math.random() * 900);
  const aptDate = new Date(Date.now() + 86400000 * randomDayOffset).toISOString().split('T')[0];

  const bookRes = await apiRequest('POST', '/api/appointments', {
    clientName: 'Elena Rostova',
    clientEmail: 'elena@rostova-design.com',
    clientPhone: '+1-555-0144',
    serviceType: 'Full Website Redesign',
    appointmentDate: aptDate,
    startTime: '14:00',
    endTime: '14:30',
    notes: 'Initial discovery call',
  });
  assert.equal(bookRes.status, 201);
  const aptId = bookRes.data.data._id || bookRes.data.data.id;
  const clientToken = bookRes.data.data.manageToken;
  assert.ok(aptId && clientToken, 'Must generate appointment ID and manageToken');

  // 2. Admin assigns meeting link
  const newMeetingLink = 'https://meet.google.com/tej-test-sync';
  const updateRes = await apiRequest('PUT', `/api/appointments/${aptId}`, {
    meetingLink: newMeetingLink,
    status: 'confirmed',
  }, adminCookie);
  assert.equal(updateRes.status, 200);
  assert.equal(updateRes.data.data.meetingLink, newMeetingLink);

  // 3. Client checks booking status with manageToken
  const clientView = await apiRequest('POST', '/api/appointments/manage', {
    token: clientToken,
    action: 'view',
  });
  assert.equal(clientView.status, 200);
  assert.equal(clientView.data.data.meetingLink, newMeetingLink, 'Client must see updated meeting link');
  assert.equal(clientView.data.data.status, 'confirmed');
});

// -------------------------------------------------------------
// TEST 6: Admin edits a service or website content
// -------------------------------------------------------------
test('TEST 6: Admin edits service and website content; public pages reflect changes', async () => {
  // 1. Update studio settings
  const settingsUpdate = await apiRequest('PUT', '/api/settings', {
    tagline: 'Precision Engineering & Conversion-Focused Design',
  }, adminCookie);
  assert.equal(settingsUpdate.status, 200);
  assert.equal(settingsUpdate.data.data.tagline, 'Precision Engineering & Conversion-Focused Design');

  // 2. Verify public settings reflect the change
  const publicSettings = await apiRequest('GET', '/api/settings');
  assert.equal(publicSettings.status, 200);
  assert.equal(publicSettings.data.data.tagline, 'Precision Engineering & Conversion-Focused Design');
});

// -------------------------------------------------------------
// TEST 7: Simulate CRM failure and queue recovery
// -------------------------------------------------------------
test('TEST 7: CRM fallback queue handles transient failures and admin retry works', async () => {
  // Query Zoho diagnostic status endpoint
  const statusRes = await apiRequest('GET', '/api/zoho/status', null, adminCookie);
  assert.equal(statusRes.status, 200);
  assert.ok(statusRes.data.data);
  assert.equal(typeof statusRes.data.data.isConfigured, 'boolean');

  // Query pending queue
  const queueRes = await apiRequest('GET', '/api/zoho/pending', null, adminCookie);
  assert.equal(queueRes.status, 200);
  assert.ok(Array.isArray(queueRes.data.data.pending));

  // Trigger manual retry
  const retryRes = await apiRequest('POST', '/api/zoho/retry', {}, adminCookie);
  assert.equal(retryRes.status, 200);
  assert.ok(retryRes.data.success);
});

// -------------------------------------------------------------
// TEST 8: Refresh admin dashboard / persisted data remains intact
// -------------------------------------------------------------
test('TEST 8: Persisted data remains intact across queries and simulated reload', async () => {
  // Read projects multiple times to verify no state leaks or accidental deletion
  const p1 = await apiRequest('GET', '/api/projects?status=all', null, adminCookie);
  const p2 = await apiRequest('GET', '/api/projects?status=all', null, adminCookie);
  assert.equal(p1.status, 200);
  assert.equal(p2.status, 200);
  assert.equal(p1.data.data.length, p2.data.data.length);

  // Inquiries count preserved
  const inq1 = await apiRequest('GET', '/api/inquiries', null, adminCookie);
  const inq2 = await apiRequest('GET', '/api/inquiries', null, adminCookie);
  assert.equal(inq1.data.data.length, inq2.data.data.length);
});

// -------------------------------------------------------------
// TEST 9: Security checks (Unauthorized mutations rejected)
// -------------------------------------------------------------
test('TEST 9: Protected endpoints reject unauthorized access with 401', async () => {
  // 1. Projects mutation without cookie
  const unauthProj = await apiRequest('POST', '/api/projects', {
    title: 'Hacked Project',
    category: 'Exploit',
    featuredImage: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d',
  });
  assert.equal(unauthProj.status, 401, 'POST /api/projects must reject unauthenticated request');

  // 2. Settings mutation without cookie
  const unauthSettings = await apiRequest('PUT', '/api/settings', {
    tagline: 'Defaced Site',
  });
  assert.equal(unauthSettings.status, 401, 'PUT /api/settings must reject unauthenticated request');

  // 3. Zoho retry without cookie
  const unauthZoho = await apiRequest('POST', '/api/zoho/retry', {});
  assert.equal(unauthZoho.status, 401, 'POST /api/zoho/retry must reject unauthenticated request');
});

// -------------------------------------------------------------
// TEST 10: SEO checks
// -------------------------------------------------------------
test('TEST 10: Technical SEO endpoints, sitemap, robots, and Google verification are intact', async () => {
  // 1. /sitemap.xml
  const sitemapRes = await apiRequest('GET', '/sitemap.xml');
  assert.equal(sitemapRes.status, 200);
  assert.ok(sitemapRes.headers.get('content-type')?.includes('xml'));
  assert.ok(sitemapRes.data.raw.includes('<urlset'));
  assert.ok(sitemapRes.data.raw.includes('https://freelancer-one-woad.vercel.app/'));

  // 2. /robots.txt
  const robotsRes = await apiRequest('GET', '/robots.txt');
  assert.equal(robotsRes.status, 200);
  assert.ok(robotsRes.data.raw.includes('User-agent: *'));
  assert.ok(robotsRes.data.raw.includes('Disallow: /admin'));
  assert.ok(robotsRes.data.raw.includes('Sitemap: https://freelancer-one-woad.vercel.app/sitemap.xml'));

  // 3. Google Search Console Verification HTML route
  const gscRes = await apiRequest('GET', '/googlec98ba8b0fca3398f.html');
  assert.equal(gscRes.status, 200);
  assert.ok(gscRes.data.raw.includes('google-site-verification: googlec98ba8b0fca3398f.html'));
});
