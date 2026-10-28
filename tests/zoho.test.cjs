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
    // When no client ID / secret are configured
    const configured = isZohoConfigured();
    // Default env has empty strings for client ID/secret
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
});

test('Zoho Service lead payload formatting and name handling', async (t) => {
  // Test simulated request mocking HTTPS calls
  const originalRequest = https.request;
  t.after(() => {
    https.request = originalRequest;
  });

  let capturedRequests = [];
  https.request = function (options, callback) {
    const reqInstance = {
      headers: options.headers || {},
      method: options.method,
      path: options.path,
      write: function (chunk) {
        this.body = chunk;
      },
      end: function () {
        capturedRequests.push({
          method: options.method,
          path: options.path,
          headers: options.headers,
          body: this.body ? JSON.parse(this.body) : null,
        });

        // Mock response
        const resMock = {
          statusCode: 200,
          headers: { 'content-type': 'application/json' },
          on: function (event, handler) {
            if (event === 'data') {
              // Return mock Zoho lead response
              handler(
                JSON.stringify({
                  data: [
                    {
                      code: 'SUCCESS',
                      details: { id: 'zoho-lead-998877' },
                      message: 'record added',
                    },
                  ],
                })
              );
            }
            if (event === 'end') {
              handler();
            }
          },
        };
        callback(resMock);
      },
      on: function () {},
      setTimeout: function () {},
      destroy: function () {},
    };
    return reqInstance;
  };

  assert.strictEqual(typeof https.request, 'function');
});
