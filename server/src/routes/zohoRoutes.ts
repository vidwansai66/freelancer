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

  // Render emerald-styled success page displaying the refresh token for easy persistent copying
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
          max-width: 600px;
          width: 100%;
          box-shadow: 0 25px 50px -12px rgba(16, 185, 129, 0.15);
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
          font-size: 24px;
          margin: 0 0 12px 0;
          color: #ffffff;
        }
        p {
          color: #a1a1aa;
          font-size: 14px;
          line-height: 1.6;
        }
        .token-box {
          background: #09090b;
          border: 1px solid #27272a;
          border-radius: 8px;
          padding: 14px;
          margin: 20px 0;
          position: relative;
        }
        .token-label {
          font-size: 11px;
          text-transform: uppercase;
          color: #71717a;
          letter-spacing: 0.05em;
          margin-bottom: 6px;
        }
        .token-val {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          color: #34d399;
          word-break: break-all;
          font-size: 13px;
          user-select: all;
        }
        .copy-btn {
          margin-top: 10px;
          background: #10b981;
          color: #09090b;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          font-size: 13px;
          transition: background 0.2s;
        }
        .copy-btn:hover {
          background: #059669;
        }
        .steps {
          background: rgba(39, 39, 42, 0.5);
          border-radius: 8px;
          padding: 16px;
          font-size: 13px;
          margin-top: 20px;
        }
        .steps ol {
          margin: 8px 0 0 0;
          padding-left: 20px;
          color: #d4d4d8;
        }
        .steps li {
          margin-bottom: 6px;
        }
        .actions {
          margin-top: 28px;
          display: flex;
          gap: 12px;
        }
        .action-link {
          display: inline-block;
          background: #27272a;
          color: #f4f4f5;
          text-decoration: none;
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
        }
        .action-link:hover {
          background: #3f3f46;
        }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="badge">Connected to Zoho India DC</div>
        <h1>Zoho CRM Authorization Successful</h1>
        <p>Your website is now authenticated to communicate with Zoho CRM! The integration is currently active in memory for this session.</p>

        <div class="token-box">
          <div class="token-label">Permanent Refresh Token (ZOHO_REFRESH_TOKEN)</div>
          <div class="token-val" id="refreshToken">${tokenResult.refreshToken}</div>
          <button class="copy-btn" onclick="navigator.clipboard.writeText(document.getElementById('refreshToken').innerText); this.innerText = 'Copied!';">Copy Refresh Token</button>
        </div>

        <div class="steps">
          <strong>To persist across server restarts &amp; Vercel deployments:</strong>
          <ol>
            <li>Copy the Refresh Token above.</li>
            <li>Paste it into your local <code>server/.env</code>:
              <br><code style="color:#34d399">ZOHO_REFRESH_TOKEN=${tokenResult.refreshToken}</code>
            </li>
            <li>Add <code>ZOHO_REFRESH_TOKEN</code> to your Vercel Project Environment Variables.</li>
          </ol>
        </div>

        <div class="actions">
          <a class="action-link" href="/admin/dashboard">Go to Admin Dashboard</a>
          <a class="action-link" href="/contact">Test Contact Form</a>
        </div>
      </div>
    </body>
    </html>
  `);
});

/**
 * POST /api/zoho/test
 * Protected test endpoint to verify access token acquisition
 */
router.post('/test', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const token = await getValidAccessToken();
    sendSuccess(res, {
      message: 'Successfully acquired valid Zoho Access Token',
      tokenPreview: `${token.slice(0, 10)}...${token.slice(-4)}`,
    });
  } catch (err: any) {
    sendError(res, `Failed to acquire Zoho token: ${err.message}`, 502);
  }
});

export default router;
