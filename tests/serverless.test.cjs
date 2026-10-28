/**
 * Vercel Serverless Function & Entry Point Integration Test
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');

test('Vercel Serverless Entry Point (/api/index)', async (t) => {
  // Test loading the serverless handler
  const handlerModule = require('../api/index');
  const handler = handlerModule.default || handlerModule;

  assert.strictEqual(typeof handler, 'function', 'Serverless entry point must export a handler function');

  await t.test('handles /health route via Vercel query rewrite', async () => {
    let statusCode = 0;
    let headers = {};
    let responseBody = '';

    const mockReq = {
      method: 'GET',
      headers: { host: 'freelancer-one-woad.vercel.app' },
      query: { route: '/health' },
      url: '/api/index?route=/health',
      socket: { remoteAddress: '127.0.0.1' },
      connection: { remoteAddress: '127.0.0.1' },
    };

    const mockRes = {
      status(code) {
        statusCode = code;
        return this;
      },
      setHeader(name, val) {
        headers[name.toLowerCase()] = val;
        return this;
      },
      getHeader(name) {
        return headers[name.toLowerCase()];
      },
      removeHeader(name) {
        delete headers[name.toLowerCase()];
        return this;
      },
      json(data) {
        responseBody = JSON.stringify(data);
        return this;
      },
      send(data) {
        responseBody = data;
        return this;
      },
      headersSent: false,
    };

    await handler(mockReq, mockRes);

    assert.strictEqual(statusCode, 200, '/health should return HTTP 200');
    const parsed = JSON.parse(responseBody);
    assert.strictEqual(parsed.status, 'ok', 'Status should be ok');
    assert.ok(parsed.service, 'Service field should exist');
    assert.ok(parsed.crm, 'CRM status should exist');
    assert.ok(parsed.env, 'Env status should exist');
  });

  await t.test('handles unknown routes with controlled 404', async () => {
    let statusCode = 0;
    let responseBody = '';

    const mockReq = {
      method: 'GET',
      headers: { host: 'freelancer-one-woad.vercel.app' },
      query: { route: '/api/non-existent-route-999' },
      url: '/api/index?route=/api/non-existent-route-999',
      socket: { remoteAddress: '127.0.0.1' },
      connection: { remoteAddress: '127.0.0.1' },
    };

    await new Promise((resolve) => {
      const mockRes = {
        status(code) {
          statusCode = code;
          return this;
        },
        setHeader() {
          return this;
        },
        getHeader() {
          return undefined;
        },
        removeHeader() {
          return this;
        },
        json(data) {
          responseBody = JSON.stringify(data);
          resolve();
          return this;
        },
        send(data) {
          responseBody = data;
          resolve();
          return this;
        },
        headersSent: false,
      };

      handler(mockReq, mockRes);
    });

    assert.strictEqual(statusCode, 404, 'Unknown API route should return 404');
    const parsed = JSON.parse(responseBody);
    assert.strictEqual(parsed.success, false);
  });
});
