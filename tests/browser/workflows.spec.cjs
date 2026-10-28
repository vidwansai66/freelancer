const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;
const { env } = require('../../server/dist/config/env');
const marker = `browser-${Date.now()}`,
  email = `${marker}@example.test`;

async function login(page) {
  await page.goto('/admin/login');
  await page.getByLabel(/Admin Email/i).fill(env.DEFAULT_ADMIN_EMAIL);
  await page.getByLabel(/Password/i).fill(env.DEFAULT_ADMIN_PASSWORD);
  await page.getByRole('button', { name: /Sign In|Login/i }).click();
  await expect(page).toHaveURL(/admin\/dashboard/);
}
test('contact form saves extended customer fields and has associated labels', async ({ page }) => {
  await page.goto('/contact');
  await page.getByLabel('Business type', { exact: true }).fill('Bakery');
  await page.getByLabel('Required service', { exact: true }).fill('Portfolio Websites');
  await page.getByLabel('Budget', { exact: true }).fill('500');
  await page.getByLabel(/Your Full Name/).fill(marker);
  await page.getByLabel(/Email Address/).fill(email);
  await page.getByLabel(/Subject/).fill(marker);
  await page.getByLabel(/Your Message/i).fill('A website for my business.');
  const audit = await new AxeBuilder({ page })
    .withRules(['label', 'button-name', 'aria-valid-attr-value', 'aria-input-field-name'])
    .analyze();
  expect(audit.violations).toEqual([]);
  await page.getByRole('button', { name: /Send Message|Submit/i }).click();
  await expect(page.getByText('We have saved your inquiry.', { exact: false })).toBeVisible();
});
test('mobile chat captures email without overflowing a 320px viewport', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Open live chat' }).click();
  await page.getByLabel('Email', { exact: true }).fill(email);
  await page.getByLabel('Your name', { exact: true }).fill(marker);
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByLabel('Email', { exact: true })).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.screenshot({ path: 'test-results/mobile-chat.png', fullPage: false });
});
test('owner login survives reload and service publication works through the dashboard', async ({
  page,
}) => {
  await login(page);
  await page.reload();
  await expect(page.getByRole('link', { name: 'Client Projects', exact: true })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('studio_admin_token'))).toBeNull();
  await page.getByRole('link', { name: 'Services', exact: true }).click();
  await page.getByRole('button', { name: 'Add New Service' }).click();
  await page.getByLabel(/Service Title/).fill(marker);
  await page.getByLabel(/Short Description/).fill('Browser-created service');
  await page.getByLabel('Published on the public website', { exact: true }).uncheck();
  const createdResponse = page.waitForResponse(
    (response) =>
      response.url().endsWith('/api/services') && response.request().method() === 'POST',
  );
  await page.getByRole('button', { name: 'Create Service', exact: true }).click();
  const response = await createdResponse;
  expect(response.status()).toBe(201);
  const service = (await response.json()).data;
  created.push([Service, service._id]);
  await expect(page.getByRole('dialog')).toHaveCount(0);
  const published = await page.request.get(`/api/services/${service.slug}`);
  expect(published.status()).toBe(404);
  await page.getByLabel('Search records', { exact: true }).fill(marker);
  await page.locator('tr').filter({ hasText: marker }).getByRole('button').first().click();
  await page.getByLabel('Published on the public website', { exact: true }).check();
  await page.getByRole('button', { name: 'Update Service', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  expect((await page.request.get(`/api/services/${service.slug}`)).status()).toBe(200);
  await page.getByRole('button', { name: 'Add New Service' }).click();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Add New Service' })).toBeFocused();
});
test('quotation attachment uploads and records the selected service', async ({ page }) => {
  await page.goto('/quote?service=Portfolio%20Websites');
  await expect(page.getByRole('button', { name: 'Portfolio Websites', exact: true })).toBeVisible();
  await page.getByLabel('Project brief or attachment').setInputFiles({
    name: 'brief.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-1.4\nBrowser test brief'),
  });
  await expect(page.getByText('brief.pdf', { exact: false })).toBeVisible();
  await page.getByLabel(/Your Name/).fill(marker);
  await page.getByLabel(/Email/).fill(email);
  await page.getByLabel(/Describe your project/).fill('Build a portfolio website.');
  const submission = page.waitForResponse(
    (response) =>
      response.url().endsWith('/api/quotations') && response.request().method() === 'POST',
  );
  await page
    .getByRole('button', { name: /Submit.*Proposal|Request.*Proposal|Submit.*Request/i })
    .click();
  const response = await submission;
  expect(response.status()).toBe(201);
  await expect(page.getByRole('heading', { name: 'Proposal Request Received!' })).toBeVisible();
});
test('project pipeline converts a lead and exposes updates through a private tracking page', async ({
  page,
}) => {
  await login(page);
  const lead = await page.request.post('/api/inquiries', {
    data: {
      name: marker,
      email,
      subject: `${marker}-tracking`,
      message: 'Track this project',
      idempotencyKey: `${marker}-tracking`,
    },
  });
  expect(lead.status()).toBe(201);
  await page.goto('/admin/client-projects');
  await page.getByLabel('Search customer requests').fill(`${marker}-tracking`);
  await expect(page.getByLabel('Customer request', { exact: true }).locator('option')).toHaveCount(
    2,
  );
  await page.getByLabel('Customer request', { exact: true }).selectOption({ index: 1 });
  const convert = page.waitForResponse(
    (response) =>
      response.url().endsWith('/api/client-projects') && response.request().method() === 'POST',
  );
  await page.getByRole('button', { name: 'Create client project' }).click();
  const response = await convert;
  expect(response.status()).toBe(201);
  const data = (await response.json()).data;
  created.push([ClientProject, data.project._id]);
  await page.getByLabel('Project status').selectOption('in_progress');
  await page.getByLabel('Client-visible progress update').fill('Design approved in browser test');
  await page.getByLabel('Quotation scope and terms').fill('Five pages and two revisions');
  const save = page.waitForResponse(
    (response) =>
      response.url().includes('/api/client-projects/') && response.request().method() === 'PUT',
  );
  await page.getByRole('button', { name: 'Save project' }).click();
  expect((await save).status()).toBe(200);
  await page.goto(`/track#${data.token}`);
  await page.getByRole('button', { name: 'View project' }).click();
  await expect(page.getByText('Design approved in browser test', { exact: true })).toBeVisible();
  await expect(page.getByText('Status: in progress', { exact: false })).toBeVisible();
});
test('owner settings and core admin forms have accessible field names', async ({ page }) => {
  await login(page);
  await page.goto('/admin/settings');
  await expect(page.getByLabel('Studio name')).toBeVisible();
  await expect(page.getByLabel('Notice required to cancel or reschedule (hours)')).toBeVisible();
  const audit = await new AxeBuilder({ page })
    .withRules(['label', 'button-name', 'aria-valid-attr-value', 'aria-input-field-name'])
    .analyze();
  expect(audit.violations).toEqual([]);
  await page.screenshot({ path: 'test-results/admin-settings.png', fullPage: true });
});
test('a client reschedules and cancels through the private booking page', async ({ page }) => {
  const date = '2099-01-05';
  const slots = (
    await (await page.request.get(`/api/appointments/available-slots?date=${date}`)).json()
  ).data.slots.filter((slot) => slot.isAvailable);
  expect(slots.length).toBeGreaterThan(1);
  const response = await page.request.post('/api/appointments', {
    data: {
      clientName: marker,
      clientEmail: email,
      serviceType: 'Browser consultation',
      appointmentDate: date,
      startTime: slots[0].startTime,
      endTime: slots[0].endTime,
      idempotencyKey: `${marker}-booking`,
    },
  });
  expect(response.status()).toBe(201);
  const booking = (await response.json()).data;
  created.push([Appointment, booking._id]);
  await page.goto(`/manage-booking#${booking.manageToken}`);
  await page.getByRole('button', { name: 'View booking', exact: true }).click();
  await expect(page.getByText('Status: confirmed', { exact: true })).toBeVisible();
  await page.getByLabel('New appointment date').fill(date);
  await expect(page.getByLabel('Available time').locator('option')).not.toHaveCount(1);
  await page.getByLabel('Available time').selectOption(slots[1].startTime);
  const changed = page.waitForResponse(
    (result) =>
      result.url().endsWith('/api/appointments/manage') &&
      result.request().postDataJSON()?.action === 'reschedule',
  );
  await page.getByRole('button', { name: 'Reschedule', exact: true }).click();
  expect((await changed).status()).toBe(200);
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Cancel booking', exact: true }).click();
  await expect(page.getByText('Status: cancelled', { exact: true })).toBeVisible();
});
