# Production Deployment & Zoho CRM Integration Blueprint

## 1. Executive Summary

The agency website has been completely upgraded to a **Zero-Cost, Database-Independent, Production-Ready Architecture**:
- **MongoDB & Mongoose 100% Removed**: Zero runtime database connections, zero connection timeouts, zero Atlas bills, and zero 503 cold-start errors on Vercel Serverless.
- **Zoho CRM Integration (India Data Center)**: Native OAuth 2.0 integration with Zoho CRM India (`https://accounts.zoho.in` and `https://www.zohoapis.in/crm/v8`) targeting Zoho Leads and Notes with automatic deduplication, lead updates, and structured project specifications.
- **In-Memory & Static Public Content**: Sub-millisecond content serving for all published services, projects, pricing plans, FAQs, testimonials, and studio settings.
- **Secure Server-Side Admin Authentication**: Environment-variable credential verification with signed HTTP-only cookies and JWT validation, completely independent of database records.
- **Full Visual & Interactive Fidelity Preserved**: Obsidian & emerald dark theme, Lenis smooth scrolling, micro-animations, mobile responsive layouts, direct WhatsApp scheduling (`+91 94909 55048`), and live chat handoff.

---

## 2. Zoho CRM India DC Setup & One-Time Authorization

### Step 1: Create Server-Based Application in Zoho API Console
1. Go to the [Zoho API Console (India)](https://api-console.zoho.in).
2. Click **Add Client** and select **Server-based Applications**.
3. Fill in:
   - **Client Name**: `Teja Studio Website`
   - **Homepage URL**: `https://wp-final-activity.vercel.app` (or `http://localhost:5000`)
   - **Authorized Redirect URIs**:
     - Local development: `http://localhost:5000/api/zoho/callback`
     - Production: `https://wp-final-activity.vercel.app/api/zoho/callback`
4. Click **Create**. Copy your **Client ID** and **Client Secret**.

### Step 2: Configure Environment Variables
In your local `server/.env`:
```env
ZOHO_CLIENT_ID=your_actual_zoho_client_id
ZOHO_CLIENT_SECRET=your_actual_zoho_client_secret
ZOHO_REDIRECT_URI=http://localhost:5000/api/zoho/callback
ZOHO_ACCOUNTS_URL=https://accounts.zoho.in
ZOHO_API_BASE_URL=https://www.zohoapis.in/crm/v8
```

### Step 3: Complete One-Time Authorization in Browser
1. Start the application locally (`npm run dev`) or visit your live website.
2. In your browser, open:
   ```text
   http://localhost:5000/api/zoho/auth
   ```
   *(In production, visit `https://wp-final-activity.vercel.app/api/zoho/auth`)*
3. You will be redirected to the official Zoho India consent screen requesting permission for:
   - `ZohoCRM.modules.leads.CREATE`
   - `ZohoCRM.modules.leads.READ`
   - `ZohoCRM.modules.leads.UPDATE`
   - `ZohoCRM.modules.notes.CREATE`
4. Click **Accept**.
5. Zoho will redirect back to `/api/zoho/callback`, which automatically:
   - Validates the cryptographic CSRF state.
   - Exchanges the authorization code for an **Access Token** and a permanent **Refresh Token**.
   - Displays a styled confirmation page with your **Refresh Token**.
6. Copy the Refresh Token and add it to `server/.env` and your Vercel Project Settings:
   ```env
   ZOHO_REFRESH_TOKEN=1000.xxxx.xxxx
   ```

> [!NOTE]
> Once `ZOHO_REFRESH_TOKEN` is set, the server automatically handles token refresh in memory on-the-fly. You will never need to manually generate or copy temporary access tokens again.

---

## 3. CRM Module & Field Mapping

| Website Form Field | Zoho CRM Module | Zoho CRM Field | Logic / Fallback |
| :--- | :--- | :--- | :--- |
| **Full Name** | Leads | `First_Name`, `Last_Name` | Split into first & last name. If single word provided, assigned to required `Last_Name`. |
| **Email Address** | Leads | `Email` | Sanitized & lowercased. Used as duplicate detection key. |
| **Phone Number** | Leads | `Phone` | Formatted contact phone. |
| **Business / Company**| Leads | `Company` | Provided company/business type or `${name} (Individual)`. (Required field in Zoho Leads). |
| **Form Source** | Leads | `Lead_Source` | `"Website Inquiry"` or `"Website Quotation"`. |
| **Inquiry Subject & Message** | Leads | `Description` | Overview summary of message. |
| **Complete Inquiry Content** | Notes | `Note_Title` & `Note_Content` | Attached timeline note containing subject, budget, service, and full message text. |
| **Quotation Project Scope** | Notes | `Note_Title` & `Note_Content` | Attached timeline note containing project type, budget range, timeline, required features, and estimate. |

---

## 4. Environment Variables Reference

| Variable | Description | Where to Set | Example / Default |
| :--- | :--- | :--- | :--- |
| `PORT` | Local backend HTTP port | Local `.env` | `5000` |
| `NODE_ENV` | Application environment | Both | `development` / `production` |
| `CLIENT_URL` | Frontend origin for CORS | Both | `http://localhost:5173` / `https://wp-final-activity.vercel.app` |
| `ZOHO_CLIENT_ID` | OAuth Client ID from Zoho Console | Both | `1000.XXXX` |
| `ZOHO_CLIENT_SECRET` | OAuth Client Secret from Zoho Console | Both | `xxxxxxxxxxxx` |
| `ZOHO_REDIRECT_URI` | Exact OAuth Callback URL | Both | `https://wp-final-activity.vercel.app/api/zoho/callback` |
| `ZOHO_REFRESH_TOKEN` | Permanent Refresh Token | Both | `1000.XXXX` |
| `ZOHO_ACCOUNTS_URL` | Zoho OAuth Accounts Base URL | Both | `https://accounts.zoho.in` |
| `ZOHO_API_BASE_URL` | Zoho CRM API Base URL | Both | `https://www.zohoapis.in/crm/v8` |
| `JWT_SECRET` | Secret key for signing admin tokens (>=32 chars) | Both | Random 64-char hex string |
| `DEFAULT_ADMIN_EMAIL` | Administrator login email | Both | `admin@tejastudio.com` |
| `DEFAULT_ADMIN_PASSWORD` | Administrator login password (>=12 chars) | Both | `StudioAdminPass2026!` |

---

## 5. Vercel Deployment Checklist

1. **Verify Local Git Status**:
   ```bash
   git status
   ```
   *(Ensure `.env` and `backups/` are untracked and ignored).*
2. **Add Environment Variables to Vercel**:
   Go to **Vercel Dashboard** > Your Project > **Settings** > **Environment Variables**:
   - `JWT_SECRET`
   - `DEFAULT_ADMIN_EMAIL`
   - `DEFAULT_ADMIN_PASSWORD`
   - `CLIENT_URL`
   - `ZOHO_CLIENT_ID`
   - `ZOHO_CLIENT_SECRET`
   - `ZOHO_REDIRECT_URI` (`https://wp-final-activity.vercel.app/api/zoho/callback`)
   - `ZOHO_REFRESH_TOKEN` (After completing one-time authorization)
   - `ZOHO_ACCOUNTS_URL` (`https://accounts.zoho.in`)
   - `ZOHO_API_BASE_URL` (`https://www.zohoapis.in/crm/v8`)
3. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "feat: complete zero-cost migration with Zoho CRM India integration"
   git push origin main
   ```
4. **Verify Live Deployment**:
   - Check `/health` endpoint: `https://wp-final-activity.vercel.app/health`
   - Check Zoho connection status: `https://wp-final-activity.vercel.app/api/zoho/status`
   - Submit a test inquiry on `/contact`
   - Log in to `/admin/login`

---

## 6. Verification Test Report

| Test Suite | Tests Run | Result | Notes |
| :--- | :--- | :--- | :--- |
| **Backend TypeScript Build** | `npm --prefix server run build` | **PASSED (Code 0)** | Zero type errors, clean `dist/` output |
| **Frontend Vite Build** | `npm --prefix client run build` | **PASSED (Code 0)** | 2179 modules transformed in 2.65s |
| **Unit Test Suite** | `tests/unit.cjs` | **10/10 PASSED** | Calendar, timezones, security, sanitization |
| **Integration Test Suite** | `tests/integration.cjs` | **11/11 PASSED** | Health, content, admin auth, cookies, forms, SEO, Zoho status |
| **Zoho CRM Service Test Suite** | `tests/zoho.test.cjs` | **8/8 PASSED** | OAuth URL, CSRF tokens, name splitting, unconfigured fallbacks |
| **Standalone Database Test** | Stopped `mongod` | **VERIFIED** | Server runs 100% independently with 0 database queries |
| **Live API Check** | Local endpoints | **5/5 PASSED** | `/health`, `/api/zoho/status`, `/api/inquiries`, `/api/quotations`, `/api/auth/login` |

---

## 7. Rollback Procedure

If for any reason you need to restore previous MongoDB data:
1. All 16 MongoDB collections remain exported and preserved under `backups/mongodb-pre-migration/`.
2. To re-import into a local or Atlas MongoDB cluster:
   ```bash
   mongoimport --uri="<MONGODB_URI>" --collection=<name> --file="backups/mongodb-pre-migration/<name>.json" --jsonArray
   ```
3. The git branch preserves previous commits prior to this migration.
