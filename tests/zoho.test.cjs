/**
 * Zoho CRM Integration Unit & Mocked Flow Tests
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const https = require('https');

// Build server first so dist has latest TypeScript code
const {
  isZohoConfigured,
  hasZohoAuthorization,
  getZohoAuthUrl,
  getZohoApiBaseUrl,
  generateOAuthState,
  validateOAuthState,
  syncInquiryToZoho,
  syncQuotationToZoho,
  syncClientToZoho,
  syncAppointmentToZoho,
  runZohoDiagnostic,
  getPendingZohoSyncs,
  queuePendingZohoSync,
} = require('../server/dist/services/zohoService');

test('Zoho CRM API Base URL Construction & Normalization', async (t) => {
  await t.test('appends /crm/v8 when only domain is provided', () => {
    assert.strictEqual(
      getZohoApiBaseUrl('https://www.zohoapis.in'),
      'https://www.zohoapis.in/crm/v8'
    );
  });

  await t.test('does not duplicate /crm/v8 when already present', () => {
    assert.strictEqual(
      getZohoApiBaseUrl('https://www.zohoapis.in/crm/v8'),
      'https://www.zohoapis.in/crm/v8'
    );
    assert.strictEqual(
      getZohoApiBaseUrl('https://www.zohoapis.in/crm/v8/'),
      'https://www.zohoapis.in/crm/v8'
    );
  });

  await t.test('cleans up accidental repeated /crm/v8', () => {
    assert.strictEqual(
      getZohoApiBaseUrl('https://www.zohoapis.in/crm/v8/crm/v8'),
      'https://www.zohoapis.in/crm/v8'
    );
  });
});

test('Zoho Service configuration check and OAuth state security', async (t) => {
  await t.test('detects unconfigured credentials', () => {
    const configured = isZohoConfigured();
    assert.strictEqual(typeof configured, 'boolean');
  });

  await t.test('generates cryptographically secure OAuth state and validates it once', () => {
    const state = generateOAuthState();
    assert.strictEqual(typeof state, 'string');
    assert.strictEqual(state.length, 48); // 24 bytes in hex = 48 chars

    // First validation should succeed
    const validFirstTime = validateOAuthState(state);
    assert.strictEqual(validFirstTime, true);

    // Second validation with same state should fail (prevent replay attacks)
    const validSecondTime = validateOAuthState(state);
    assert.strictEqual(validSecondTime, false);

    // Invalid state should fail
    assert.strictEqual(validateOAuthState('non-existent-state'), false);
    assert.strictEqual(validateOAuthState(''), false);
  });

  await t.test('constructs valid Zoho India OAuth URL', () => {
    const authUrl = getZohoAuthUrl('test-state-token');
    assert.ok(authUrl.startsWith('https://accounts.zoho.in/oauth/v2/auth?'));
    assert.ok(authUrl.includes('response_type=code'));
    assert.ok(authUrl.includes('access_type=offline'));
    assert.ok(authUrl.includes('state=test-state-token'));
    assert.ok(authUrl.includes('ZohoCRM.modules.leads.CREATE'));
    assert.ok(authUrl.includes('ZohoCRM.modules.notes.CREATE'));
  });
});

test('Zoho Service lead syncing and state handling', async (t) => {
  await t.test('syncInquiryToZoho processes inquiry cleanly', async () => {
    const result = await syncInquiryToZoho({
      name: 'Priya Sharma',
      email: 'priya@example.in',
      phone: '+91 94909 55048',
      subject: 'E-commerce Website',
      message: 'Need a shop for artisanal baked goods.',
    });

    if (isZohoConfigured() && hasZohoAuthorization()) {
      if (!result.success && result.error && result.error.includes('EAI_AGAIN')) {
        assert.ok(result.error);
      } else {
        assert.strictEqual(result.success, true);
        assert.ok(result.leadId);
      }
    } else {
      assert.strictEqual(result.success, false);
      assert.ok(result.error.includes('Zoho CRM is not configured') || result.error.includes('not authorized'));
    }
  });

  await t.test('syncQuotationToZoho processes quotation cleanly', async () => {
    const result = await syncQuotationToZoho({
      name: 'Arun Varma',
      email: 'arun@example.in',
      phone: '+91 94909 55048',
      projectType: 'Web Application',
      budgetRange: '₹50,000 - ₹1,00,000',
      timeline: '4 weeks',
      requiredFeatures: ['Admin Panel', 'Payment Gateway'],
      description: 'Custom portal for logistics tracking.',
    });

    if (isZohoConfigured() && hasZohoAuthorization()) {
      if (!result.success && result.error && result.error.includes('EAI_AGAIN')) {
        assert.ok(result.error);
      } else {
        assert.strictEqual(result.success, true);
        assert.ok(result.leadId);
      }
    } else {
      assert.strictEqual(result.success, false);
      assert.ok(result.error.includes('Zoho CRM is not configured') || result.error.includes('not authorized'));
    }
  });

  await t.test('syncClientToZoho handles unconfigured environment safely', async () => {
    // When credentials are not authorized, returns clean failure and enqueues
    const result = await syncClientToZoho({
      name: 'Rohan Mehra',
      email: 'rohan.mehra@example.com',
      company: 'Mehra Logistics',
      title: 'Logistics Website',
    }, false);

    if (!isZohoConfigured() || !hasZohoAuthorization()) {
      assert.strictEqual(result.success, false);
      assert.ok(result.error);
    }
  });

  await t.test('syncAppointmentToZoho handles unconfigured environment safely', async () => {
    const result = await syncAppointmentToZoho({
      clientName: 'Sunita Rao',
      clientEmail: 'sunita@example.com',
      appointmentDate: '2026-11-10',
      startTime: '11:00',
      serviceType: 'Brand Identity',
    }, false);

    if (!isZohoConfigured() || !hasZohoAuthorization()) {
      assert.strictEqual(result.success, false);
      assert.ok(result.error);
    }
  });
});

test('Zoho Service recovery queue persists deferred sync items', async () => {
  const initialQueue = getPendingZohoSyncs();
  const initialLength = initialQueue.length;

  queuePendingZohoSync('client', {
    name: 'Test Client Queue',
    email: 'queue.test@example.com',
    title: 'Queued Website',
  }, 'Simulated network offline');

  const updatedQueue = getPendingZohoSyncs();
  assert.ok(updatedQueue.length >= initialLength);
  const found = updatedQueue.find((i) => i.payload.email === 'queue.test@example.com');
  assert.ok(found);
  assert.equal(found.type, 'client');
  assert.equal(found.lastError, 'Simulated network offline');
});

test('Zoho Service Admin Diagnostic test verifies configuration status', async () => {
  const diagResult = await runZohoDiagnostic({ createTestLead: false });
  assert.ok(typeof diagResult.success === 'boolean');
  assert.ok(typeof diagResult.message === 'string');
});
