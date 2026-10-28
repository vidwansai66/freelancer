/**
 * Zoho CRM OAuth and Management Routes
 * 
 * Provides:
 * - GET /api/zoho/auth: Initiates OAuth authorization redirect
 * - GET /api/zoho/callback: Receives authorization code, exchanges for tokens, renders confirmation UI
 * - GET /api/zoho/status: Diagnostic health/status of Zoho integration
 * - POST /api/zoho/test: Send a test ping to Zoho CRM (admin only)
 */

import { Request, Response } from 'express';
import { asyncRouter } from '../utils/asyncRouter';
import {
  getZohoAuthUrl,
  validateOAuthState,
  exchangeAuthorizationCode,
  isZohoConfigured,
  hasZohoAuthorization,
  getActiveRefreshToken,
  setInMemoryRefreshToken,
  getValidAccessToken,
  runZohoDiagnostic,
  getPendingZohoSyncs,
  processPendingZohoSyncs,
} from '../services/zohoService';
import { env } from '../config/env';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { authenticateAdmin } from '../middleware/authMiddleware';

const router = asyncRouter();

/**
 * GET /api/zoho/status
 * Returns public connection status without leaking secrets
 */
router.get('/status', (req: Request, res: Response) => {
  const configured = isZohoConfigured();
  const authorized = hasZohoAuthorization();
  const accountsUrl = env.ZOHO_ACCOUNTS_URL || 'https://accounts.zoho.in';
  const apiBaseUrl = env.ZOHO_API_BASE_URL || 'https://www.zohoapis.in/crm/v8';
  const redirectUri = env.ZOHO_REDIRECT_URI || `${env.CLIENT_URL || 'http://localhost:5000'}/api/zoho/callback`;

  res.json({
    success: true,
    data: {
      provider: 'Zoho CRM (India DC)',
      accountsUrl,
      apiBaseUrl,
      redirectUri,
      isConfigured: configured,
      hasAuthorization: authorized,
      missingConfig: [
        !env.ZOHO_CLIENT_ID ? 'ZOHO_CLIENT_ID' : null,
        !env.ZOHO_CLIENT_SECRET ? 'ZOHO_CLIENT_SECRET' : null,
      ].filter(Boolean),
      authUrl: configured ? '/api/zoho/auth' : null,
    },
  });
});

/**
 * GET /api/zoho/auth
 * Initiates the Zoho OAuth 2.0 flow
 */
router.get('/auth', (req: Request, res: Response) => {
  if (!isZohoConfigured()) {
    res.status(400).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Zoho CRM Setup Needed</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #09090b; color: #f4f4f5; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
          .card { background: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 32px; max-width: 500px; width: 100%; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
          h2 { color: #f87171; margin-top: 0; }
          code { background: #27272a; padding: 2px 6px; border-radius: 4px; color: #34d399; }
          a { color: #10b981; text-decoration: none; }
          a:hover { text-decoration: underline; }
        </style>
      </head>
      <body>
        <div class="card">
          <h2>Configuration Required</h2>
          <p>Please add your Zoho Client ID and Secret to <code>server/.env</code>:</p>
          <ul>
            <li><code>ZOHO_CLIENT_ID=your_client_id</code></li>
            <li><code>ZOHO_CLIENT_SECRET=your_client_secret</code></li>
            <li><code>ZOHO_REDIRECT_URI=${encodeURI(env.ZOHO_REDIRECT_URI || 'http://localhost:5000/api/zoho/callback')}</code></li>
          </ul>
          <p><a href="/admin/dashboard">Return to Dashboard</a></p>
        </div>
      </body>
      </html>
    `);
    return;
  }

  const authUrl = getZohoAuthUrl();
  res.redirect(authUrl);
});

/**
 * GET /api/zoho/callback
 * Handles OAuth callback, exchanges code for refresh token, and renders success page
 */
router.get('/callback', async (req: Request, res: Response) => {
  const { code, state, error } = req.query as Record<string, string>;

  if (error) {
    res.status(400).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Zoho Authorization Declined</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: #09090b; color: #f4f4f5; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
          .card { background: #18181b; border: 1px solid #ef4444; border-radius: 12px; padding: 32px; max-width: 480px; text-align: center; }
          h2 { color: #ef4444; }
          a { color: #10b981; }
        </style>
      </head>
      <body>
        <div class="card">
          <h2>Authorization Declined</h2>
          <p>Zoho returned an error: <strong>${error}</strong></p>
          <p><a href="/api/zoho/auth">Try Authorizing Again</a> &bull; <a href="/">Return Home</a></p>
        </div>
      </body>
      </html>
    `);
    return;
  }

  if (!code) {
    res.status(400).send('Authorization code was missing from callback.');
    return;
  }

  // Verify OAuth state for CSRF protection
  if (state && !validateOAuthState(state)) {
    res.status(403).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Invalid OAuth State</title>
        <style>
          body { font-family: sans-serif; background: #09090b; color: #f4f4f5; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
          .card { background: #18181b; border: 1px solid #f59e0b; padding: 30px; border-radius: 10px; max-width: 450px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="card">
          <h2 style="color:#f59e0b">Invalid State Session</h2>
          <p>The OAuth state parameter expired or was tampered with. Please restart the authorization.</p>
          <a style="color:#10b981" href="/api/zoho/auth">Restart Authorization</a>
        </div>
      </body>
      </html>
    `);
    return;
  }

  // Exchange code
  const tokenResult = await exchangeAuthorizationCode(code);

  if (!tokenResult.success || !tokenResult.refreshToken) {
    res.status(502).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Token Exchange Failed</title>
        <style>
          body { font-family: sans-serif; background: #09090b; color: #f4f4f5; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
          .card { background: #18181b; border: 1px solid #ef4444; padding: 30px; border-radius: 10px; max-width: 500px; }
          pre { background: #27272a; padding: 12px; border-radius: 6px; overflow-x: auto; color: #f87171; }
        </style>
      </head>
      <body>
        <div class="card">
          <h2 style="color:#ef4444">Token Exchange Failed</h2>
          <p>Unable to retrieve refresh token from Zoho:</p>
          <pre>${tokenResult.error || 'Unknown error'}</pre>
          <p><a style="color:#10b981" href="/api/zoho/auth">Retry Authorization</a></p>
        </div>
      </body>
      </html>
    `);
    return;
  }

  // Retain token in active server memory
  setInMemoryRefreshToken(tokenResult.refreshToken);

  // Render secure success confirmation without exposing any secret tokens or credentials
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Zoho CRM Connected Successfully</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: #09090b;
          color: #f4f4f5;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          margin: 0;
          padding: 24px;
        }
        .card {
          background: #18181b;
          border: 1px solid #10b981;
          border-radius: 16px;
          padding: 36px;
          max-width: 520px;
          width: 100%;
          box-shadow: 0 25px 50px -12px rgba(16, 185, 129, 0.15);
          text-align: center;
        }
        .badge {
          display: inline-block;
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
          padding: 4px 12px;
          border-radius: 9999px;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 16px;
        }
        h1 {
          font-size: 22px;
          margin: 0 0 12px 0;
          color: #ffffff;
        }
        p {
          color: #a1a1aa;
          font-size: 14px;
          line-height: 1.6;
        }
        .secure-note {
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.3);
          border-radius: 8px;
          padding: 14px;
          margin: 20px 0;
          font-size: 13px;
          color: #34d399;
          line-height: 1.5;
        }
        .actions {
          margin-top: 24px;
          display: flex;
          justify-content: center;
          gap: 12px;
        }
        .action-link {
          display: inline-block;
          background: #10b981;
          color: #09090b;
          text-decoration: none;
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          transition: background 0.2s;
        }
        .action-link:hover {
          background: #059669;
        }
        .action-link.secondary {
          background: #27272a;
          color: #f4f4f5;
        }
        .action-link.secondary:hover {
          background: #3f3f46;
        }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="badge">Connected &bull; India DC</div>
        <h1>Zoho CRM Authorized Successfully</h1>
        <p>Your studio website has established secure OAuth communication with Zoho CRM. Authorization credentials are active and securely managed on the server.</p>
        <div class="secure-note">
          &check; All authentication tokens and secrets are protected on the server.<br>
          Client registrations, consultations, inquiries, and quotations will now synchronize to Zoho CRM Leads.
        </div>
        <div class="actions">
          <a class="action-link" href="/admin/dashboard">Go to Dashboard</a>
          <a class="action-link secondary" href="/contact">Test Contact Form</a>
        </div>
      </div>
    </body>
    </html>
  `);
});

/**
 * GET /api/zoho/pending
 * Admin endpoint to check deferred / retry sync queue size
 */
router.get('/pending', authenticateAdmin, async (_req: Request, res: Response) => {
  const syncs = getPendingZohoSyncs();
  sendSuccess(res, {
    count: syncs.length,
    pending: syncs.map((s) => ({
      id: s.id,
      type: s.type,
      createdAt: s.createdAt,
      attempts: s.attempts,
      lastError: s.lastError,
    })),
  }, 'Pending sync queue retrieved.');
});

/**
 * POST /api/zoho/process-queue
 * Admin endpoint to manually trigger flush of pending syncs
 */
router.post('/process-queue', authenticateAdmin, async (_req: Request, res: Response) => {
  try {
    const result = await processPendingZohoSyncs();
    sendSuccess(res, result, `Processed ${result.processed} items (${result.succeeded} succeeded, ${result.failed} failed).`);
  } catch (err: any) {
    sendError(res, `Failed to process queue: ${err.message}`, 500);
  }
});

/**
 * POST /api/zoho/test (and /api/zoho/diagnostic)
 * Protected admin diagnostic endpoint that:
 * 1. Verifies OAuth token refresh against Zoho accounts endpoint
 * 2. Verifies Zoho CRM API endpoint read permissions
 * 3. Optionally creates a clearly identified test Lead without modifying/deleting real records
 * 4. Verifies the returned record ID
 * 5. Flushes pending sync queue
 */
const handleDiagnostic = async (req: Request, res: Response) => {
  try {
    const createTestLead = Boolean(req.body?.createTestLead);
    const diagnostic = await runZohoDiagnostic({ createTestLead });
    if (diagnostic.success) {
      sendSuccess(res, diagnostic, diagnostic.message);
    } else {
      sendError(res, diagnostic.message, 502);
    }
  } catch (err: any) {
    sendError(res, `Zoho diagnostic failed: ${err.message}`, 502);
  }
};

router.post('/test', authenticateAdmin, handleDiagnostic);
router.post('/diagnostic', authenticateAdmin, handleDiagnostic);

export default router;
