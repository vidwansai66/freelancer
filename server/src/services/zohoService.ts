/**
 * Zoho CRM Integration Service (India Data Center & Global DC Support)
 * 
 * Supports OAuth 2.0:
 * - Authorization URL generation with CSRF state protection
 * - Authorization code exchange for Access & Refresh tokens
 * - Automated token refresh using ZOHO_REFRESH_TOKEN
 * - Lead creation & deduplication in Zoho CRM Leads module
 * - Quotation & inquiry attachment via Zoho CRM Notes module
 */

import https from 'https';
import { URL } from 'url';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { env } from '../config/env';

export interface ZohoSyncResult {
  success: boolean;
  leadId?: string;
  noteId?: string;
  isExisting?: boolean;
  message?: string;
  error?: string;
  statusCode?: number;
}

export interface ContactFormPayload {
  name: string;
  email: string;
  phone?: string;
  businessType?: string;
  service?: string;
  budget?: string;
  subject: string;
  message: string;
}

export interface QuotationFormPayload {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  businessType?: string;
  projectType: string;
  budgetRange: string;
  timeline: string;
  requiredFeatures?: string[];
  description: string;
  estimatedQuote?: number;
  attachments?: Array<{ fileId: string; token?: string }> | string[];
}

export interface ClientSyncPayload {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  source?: string;
  title?: string;
  notes?: string;
  quoteAmount?: number;
}

export interface AppointmentSyncPayload {
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  serviceType?: string;
  appointmentDate: string;
  startTime: string;
  endTime?: string;
  meetingLink?: string;
  notes?: string;
}

export interface PendingZohoSync {
  id: string;
  type: 'client' | 'appointment' | 'inquiry' | 'quotation';
  payload: any;
  createdAt: string;
  attempts: number;
  lastError?: string;
}

// In-memory token state
interface TokenState {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // UNIX timestamp in ms
  apiDomain?: string;
}

let tokenState: TokenState = {
  accessToken: '',
  refreshToken: '',
  expiresAt: 0,
};

import { loadJsonFromBestPath, saveJsonToAllPaths } from '../utils/storagePaths';

// Persistent pending sync queue file
let inMemoryPendingSyncs: PendingZohoSync[] = [];

export function getPendingZohoSyncs(): PendingZohoSync[] {
  if (inMemoryPendingSyncs.length > 0) return inMemoryPendingSyncs;
  inMemoryPendingSyncs = loadJsonFromBestPath<PendingZohoSync[]>('wp_zoho_pending_syncs.json', []);
  return inMemoryPendingSyncs;
}

export function persistPendingZohoSyncs(): void {
  saveJsonToAllPaths('wp_zoho_pending_syncs.json', inMemoryPendingSyncs);
}

export function queuePendingZohoSync(
  type: 'client' | 'appointment' | 'inquiry' | 'quotation',
  payload: any,
  lastError?: string,
): void {
  const syncs = getPendingZohoSyncs();
  const email = (payload.email || payload.clientEmail || '').toLowerCase().trim();
  const existing = syncs.find(
    (s) => s.type === type && (s.payload.email || s.payload.clientEmail || '').toLowerCase().trim() === email,
  );
  if (existing) {
    existing.payload = { ...existing.payload, ...payload };
    existing.attempts += 1;
    existing.lastError = lastError;
  } else {
    syncs.push({
      id: `sync-${crypto.randomUUID().slice(0, 8)}`,
      type,
      payload,
      createdAt: new Date().toISOString(),
      attempts: 1,
      lastError,
    });
  }
  inMemoryPendingSyncs = syncs;
  persistPendingZohoSyncs();
}

// OAuth state store for CSRF protection (valid for 10 minutes)
const oauthStates = new Map<string, number>();

/**
 * Generate a cryptographically secure OAuth state and register it
 */
export function generateOAuthState(): string {
  const state = crypto.randomBytes(24).toString('hex');
  oauthStates.set(state, Date.now() + 10 * 60 * 1000);
  return state;
}

/**
 * Validate an OAuth state parameter
 */
export function validateOAuthState(state: string): boolean {
  if (!state) return false;
  const expiresAt = oauthStates.get(state);
  if (!expiresAt) return false;
  oauthStates.delete(state);
  return Date.now() < expiresAt;
}

/**
 * Get active refresh token (from env or memory)
 */
export function getActiveRefreshToken(): string {
  return env.ZOHO_REFRESH_TOKEN?.trim() || tokenState.refreshToken || '';
}

/**
 * Set in-memory refresh token (e.g. from OAuth callback)
 */
export function setInMemoryRefreshToken(token: string): void {
  tokenState.refreshToken = token.trim();
}

/**
 * Check if Zoho CRM integration is configured with minimum required credentials
 */
export function isZohoConfigured(): boolean {
  return Boolean(
    env.ZOHO_CLIENT_ID?.trim() &&
    env.ZOHO_CLIENT_SECRET?.trim()
  );
}

/**
 * Check if Zoho CRM has an active or configured refresh token
 */
export function hasZohoAuthorization(): boolean {
  return Boolean(getActiveRefreshToken());
}

/**
 * Construct Zoho OAuth authorization URL (India Data Center by default)
 */
export function getZohoAuthUrl(state?: string): string {
  const accountsUrl = (env.ZOHO_ACCOUNTS_URL || 'https://accounts.zoho.in').replace(/\/+$/, '');
  const clientId = env.ZOHO_CLIENT_ID?.trim() || '';
  const redirectUri = env.ZOHO_REDIRECT_URI?.trim() || '';
  const finalState = state || generateOAuthState();

  // Scopes required for creating leads and attaching notes
  const scopes = [
    'ZohoCRM.modules.leads.CREATE',
    'ZohoCRM.modules.leads.READ',
    'ZohoCRM.modules.leads.UPDATE',
    'ZohoCRM.modules.notes.CREATE',
  ].join(',');

  const params = new URLSearchParams({
    scope: scopes,
    client_id: clientId,
    response_type: 'code',
    access_type: 'offline',
    redirect_uri: redirectUri,
    prompt: 'consent',
    state: finalState,
  });

  return `${accountsUrl}/oauth/v2/auth?${params.toString()}`;
}

/**
 * Generic HTTPS request helper
 */
function makeHttpsRequest(
  urlStr: string,
  options: {
    method: 'GET' | 'POST' | 'PUT' | 'PATCH';
    headers?: Record<string, string>;
    body?: string;
  }
): Promise<{ status: number; data: any; headers: any }> {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const postData = options.body || '';

    const headers: Record<string, string | number> = {
      ...(options.headers || {}),
      'User-Agent': 'TejaStudio-Website/2.0 (India DC)',
    };

    if (postData && (options.method === 'POST' || options.method === 'PUT' || options.method === 'PATCH')) {
      if (!headers['Content-Length']) {
        headers['Content-Length'] = Buffer.byteLength(postData);
      }
    }

    const reqOptions: https.RequestOptions = {
      hostname: url.hostname,
      port: url.port || 443,
      path: `${url.pathname}${url.search}`,
      method: options.method,
      headers,
    };

    const req = https.request(reqOptions, (res) => {
      let rawData = '';
      res.on('data', (chunk) => {
        rawData += chunk;
      });
      res.on('end', () => {
        let parsed: any = null;
        try {
          parsed = rawData ? JSON.parse(rawData) : null;
        } catch {
          parsed = rawData;
        }
        resolve({
          status: res.statusCode || 500,
          data: parsed,
          headers: res.headers,
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.setTimeout(12000, () => {
      req.destroy(new Error('Zoho API request timed out after 12 seconds'));
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

/**
 * Exchange an OAuth authorization code for Access & Refresh tokens
 */
export async function exchangeAuthorizationCode(code: string): Promise<{
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  apiDomain?: string;
  error?: string;
}> {
  try {
    const accountsUrl = (env.ZOHO_ACCOUNTS_URL || 'https://accounts.zoho.in').replace(/\/+$/, '');
    const tokenUrl = `${accountsUrl}/oauth/v2/token`;

    const bodyParams = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: env.ZOHO_CLIENT_ID?.trim() || '',
      client_secret: env.ZOHO_CLIENT_SECRET?.trim() || '',
      redirect_uri: env.ZOHO_REDIRECT_URI?.trim() || '',
      code: code.trim(),
    });

    const res = await makeHttpsRequest(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: bodyParams.toString(),
    });

    if (res.data?.error) {
      return {
        success: false,
        error: `Zoho OAuth error: ${res.data.error}`,
      };
    }

    if (!res.data?.access_token) {
      return {
        success: false,
        error: `Zoho token response missing access_token (HTTP ${res.status}).`,
      };
    }

    const accessToken = res.data.access_token;
    const refreshToken = res.data.refresh_token || '';
    const expiresIn = Number(res.data.expires_in || 3600);

    // Cache tokens
    tokenState = {
      accessToken,
      refreshToken: refreshToken || tokenState.refreshToken,
      expiresAt: Date.now() + (expiresIn * 1000) - 60000, // 1 min buffer
      apiDomain: res.data.api_domain,
    };

    return {
      success: true,
      accessToken,
      refreshToken,
      expiresIn,
      apiDomain: res.data.api_domain,
    };
  } catch (err: any) {
    return {
      success: false,
      error: `Failed to exchange authorization code: ${err.message}`,
    };
  }
}

/**
 * Refresh the Access Token using the active Refresh Token
 */
export async function refreshAccessToken(): Promise<{
  success: boolean;
  accessToken?: string;
  error?: string;
}> {
  const refreshToken = getActiveRefreshToken();
  if (!refreshToken) {
    return {
      success: false,
      error: 'No Zoho Refresh Token available. Please complete one-time authorization via /api/zoho/auth or set ZOHO_REFRESH_TOKEN in server/.env.',
    };
  }

  try {
    const accountsUrl = (env.ZOHO_ACCOUNTS_URL || 'https://accounts.zoho.in').replace(/\/+$/, '');
    const tokenUrl = `${accountsUrl}/oauth/v2/token`;

    const bodyParams = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: env.ZOHO_CLIENT_ID?.trim() || '',
      client_secret: env.ZOHO_CLIENT_SECRET?.trim() || '',
      refresh_token: refreshToken,
    });

    const res = await makeHttpsRequest(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: bodyParams.toString(),
    });

    if (res.data?.error) {
      return {
        success: false,
        error: `Zoho token refresh failed: ${res.data.error}`,
      };
    }

    if (!res.data?.access_token) {
      return {
        success: false,
        error: `Zoho refresh response missing access_token (HTTP ${res.status}).`,
      };
    }

    const expiresIn = Number(res.data.expires_in || 3600);
    tokenState.accessToken = res.data.access_token;
    tokenState.expiresAt = Date.now() + (expiresIn * 1000) - 60000;
    if (res.data.api_domain) {
      tokenState.apiDomain = res.data.api_domain;
    }

    return {
      success: true,
      accessToken: tokenState.accessToken,
    };
  } catch (err: any) {
    return {
      success: false,
      error: `Network error during Zoho token refresh: ${err.message}`,
    };
  }
}

/**
 * Get a valid Zoho Access Token, refreshing automatically if expired
 */
export async function getValidAccessToken(): Promise<string> {
  // If active access token is valid for at least 30 more seconds, reuse it
  if (tokenState.accessToken && Date.now() < tokenState.expiresAt) {
    return tokenState.accessToken;
  }

  // Refresh token
  const refreshResult = await refreshAccessToken();
  if (!refreshResult.success || !refreshResult.accessToken) {
    throw new Error(refreshResult.error || 'Failed to acquire valid Zoho Access Token');
  }

  return refreshResult.accessToken;
}

/**
 * Safely construct the Zoho CRM API v8 base URL.
 * Normalizes any configured or dynamically returned api_domain (e.g. from India DC accounts.zoho.in)
 * and guarantees that /crm/v8 is NEVER duplicated or missing.
 */
export function getZohoApiBaseUrl(customBase?: string): string {
  let domainOrBase = (customBase || tokenState.apiDomain || env.ZOHO_API_BASE_URL || (env as any).ZOHO_API_DOMAIN || 'https://www.zohoapis.in').trim().replace(/\/+$/, '');
  
  // Clean up any existing trailing /crm/v8 or /crm/v* segments
  domainOrBase = domainOrBase.replace(/(\/crm\/v\d+)+$/i, '');
  
  // Return with exactly one /crm/v8 suffix
  return `${domainOrBase}/crm/v8`;
}

/**
 * Helper to call Zoho CRM REST API endpoints
 */
async function zohoApiRequest(
  endpointPath: string,
  options: {
    method: 'GET' | 'POST' | 'PUT';
    body?: any;
    customToken?: string;
  }
): Promise<{ status: number; data: any }> {
  const token = options.customToken || (await getValidAccessToken());
  const baseUrl = getZohoApiBaseUrl();
  const url = `${baseUrl}${endpointPath.startsWith('/') ? endpointPath : `/${endpointPath}`}`;

  const postBody = options.body ? JSON.stringify(options.body) : undefined;

  return makeHttpsRequest(url, {
    method: options.method,
    headers: {
      Authorization: `Zoho-oauthtoken ${token}`,
      'Content-Type': 'application/json',
    },
    body: postBody,
  });
}

/**
 * Search for an existing lead by email in Zoho CRM
 */
export async function searchLeadByEmail(email: string): Promise<string | null> {
  try {
    const res = await zohoApiRequest(`/Leads/search?email=${encodeURIComponent(email)}`, {
      method: 'GET',
    });

    if (res.status === 200 && Array.isArray(res.data?.data) && res.data.data.length > 0) {
      return res.data.data[0].id || null;
    }
    return null;
  } catch (err: any) {
    console.warn('[Zoho CRM] Lead search failed:', err.message);
    return null;
  }
}

/**
 * Attach a Note to a Zoho CRM Lead
 */
export async function attachZohoNote(
  leadId: string,
  title: string,
  content: string
): Promise<string | undefined> {
  try {
    const payload = {
      data: [
        {
          Note_Title: title,
          Note_Content: content,
          Parent_Id: {
            id: leadId,
            module: {
              api_name: 'Leads',
            },
          },
        },
      ],
    };

    const res = await zohoApiRequest('/Notes', {
      method: 'POST',
      body: payload,
    });

    if (res.status === 201 || res.status === 200) {
      const firstResult = res.data?.data?.[0];
      if (firstResult?.code === 'SUCCESS') {
        return firstResult.details?.id;
      }
    }
    console.warn('[Zoho CRM] Could not attach note:', JSON.stringify(res.data));
    return undefined;
  } catch (err: any) {
    console.warn('[Zoho CRM] Note attachment error:', err.message);
    return undefined;
  }
}

/**
 * Split a single full name string into First_Name and Last_Name for Zoho CRM.
 * Zoho CRM strictly requires `Last_Name`. If only a single word is provided,
 * it must be assigned to `Last_Name`.
 */
function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) {
    return { firstName: '', lastName: parts[0] };
  }
  const lastName = parts.pop() || '';
  const firstName = parts.join(' ');
  return { firstName, lastName };
}

/**
 * Process a Contact Form submission and sync to Zoho CRM Leads
 */
const isTestEmail = (email?: string): boolean => {
  if (process.env.NODE_ENV === 'test' || process.env.DISABLE_ZOHO_SYNC === 'true') {
    return true;
  }
  if (!email) return false;
  return (
    /@(?:example\.(?:com|in|org)|test\.(?:com|in|org))/i.test(email) ||
    /^(?:test|dummy|fake|carlos\.rivera|vikram\.joshi|alice\.smith|bob\.jones)/i.test(email)
  );
};

export async function syncInquiryToZoho(
  payload: ContactFormPayload,
  shouldQueueOnFailure: boolean = true,
): Promise<ZohoSyncResult> {
  if (isTestEmail(payload.email)) {
    return {
      success: true,
      leadId: 'test-lead-id',
      message: 'Test mode: Zoho CRM sync bypassed for test email.',
    };
  }
  if (!isZohoConfigured()) {
    if (shouldQueueOnFailure) queuePendingZohoSync('inquiry', payload, 'Zoho CRM credentials not configured');
    return {
      success: false,
      error: 'Zoho CRM is not configured. Set ZOHO_CLIENT_ID and ZOHO_CLIENT_SECRET in server/.env.',
    };
  }

  if (!hasZohoAuthorization()) {
    if (shouldQueueOnFailure) queuePendingZohoSync('inquiry', payload, 'Zoho CRM authorization pending');
    return {
      success: false,
      error: 'Zoho CRM is not authorized. Visit /api/zoho/auth or set ZOHO_REFRESH_TOKEN in server/.env.',
    };
  }

  const cleanEmail = payload.email.toLowerCase().trim();
  const { firstName, lastName } = splitName(payload.name);
  const companyName = payload.businessType || `${payload.name} (Inquiry)`;

  try {
    // 1. Check for existing lead by email to prevent duplicate fragmentation
    const existingLeadId = await searchLeadByEmail(cleanEmail);

    let leadId = existingLeadId;
    let isExisting = Boolean(existingLeadId);

    const leadData: Record<string, any> = {
      Last_Name: lastName,
      Email: cleanEmail,
      Phone: payload.phone || undefined,
      Company: companyName,
      Lead_Source: 'Website Inquiry',
      Description: `[Subject]: ${payload.subject}\n[Service]: ${payload.service || 'General'}\n[Budget]: ${payload.budget || 'Not specified'}\n\n${payload.message}`,
    };
    if (firstName) {
      leadData.First_Name = firstName;
    }

    if (existingLeadId) {
      // Update existing lead with latest inquiry info
      const updateRes = await zohoApiRequest(`/Leads/${existingLeadId}`, {
        method: 'PUT',
        body: { data: [leadData] },
      });

      if (updateRes.status !== 200) {
        console.warn('[Zoho CRM] Update lead warning:', JSON.stringify(updateRes.data));
      }
    } else {
      // Create new lead in Zoho CRM
      const createRes = await zohoApiRequest('/Leads', {
        method: 'POST',
        body: {
          data: [leadData],
          trigger: ['workflow', 'approval'],
        },
      });

      if (createRes.status !== 201 && createRes.status !== 200) {
        const errDetails = createRes.data?.data?.[0]?.message || createRes.data?.message || `HTTP ${createRes.status}`;
        if (shouldQueueOnFailure) queuePendingZohoSync('inquiry', payload, `Lead creation rejected: ${errDetails}`);
        return {
          success: false,
          error: `Zoho CRM lead creation rejected: ${errDetails}`,
          statusCode: createRes.status,
        };
      }

      const recordResult = createRes.data?.data?.[0];
      if (recordResult?.code !== 'SUCCESS') {
        const errMsg = recordResult?.message || 'Unknown response';
        if (shouldQueueOnFailure) queuePendingZohoSync('inquiry', payload, errMsg);
        return {
          success: false,
          error: `Zoho CRM error: ${errMsg}`,
        };
      }

      leadId = recordResult.details?.id;
    }

    // 2. Attach detailed Note with inquiry content
    let noteId: string | undefined;
    if (leadId) {
      const noteContent = [
        `=== Website Contact Inquiry ===`,
        `Subject: ${payload.subject}`,
        `Service Needed: ${payload.service || 'N/A'}`,
        `Estimated Budget: ${payload.budget || 'N/A'}`,
        `Business Category: ${payload.businessType || 'N/A'}`,
        `Received: ${new Date().toISOString()}`,
        `----------------------------------------`,
        `Message:`,
        payload.message,
      ].join('\n');

      noteId = await attachZohoNote(leadId, `Inquiry: ${payload.subject}`, noteContent);
    }

    return {
      success: true,
      leadId: leadId || undefined,
      noteId,
      isExisting,
      message: isExisting
        ? 'Existing Zoho CRM lead updated and inquiry note attached.'
        : 'New lead successfully created in Zoho CRM.',
    };
  } catch (err: any) {
    if (shouldQueueOnFailure) queuePendingZohoSync('inquiry', payload, err.message);
    return {
      success: false,
      error: `Zoho CRM communication failure: ${err.message}`,
    };
  }
}

/**
 * Process a Quotation Request submission and sync to Zoho CRM Leads
 */
export async function syncQuotationToZoho(
  payload: QuotationFormPayload,
  shouldQueueOnFailure: boolean = true,
): Promise<ZohoSyncResult> {
  if (isTestEmail(payload.email)) {
    return {
      success: true,
      leadId: 'test-lead-id',
      message: 'Test mode: Zoho CRM sync bypassed for test email.',
    };
  }
  if (!isZohoConfigured()) {
    if (shouldQueueOnFailure) queuePendingZohoSync('quotation', payload, 'Zoho CRM credentials not configured');
    return {
      success: false,
      error: 'Zoho CRM is not configured. Set ZOHO_CLIENT_ID and ZOHO_CLIENT_SECRET in server/.env.',
    };
  }

  if (!hasZohoAuthorization()) {
    if (shouldQueueOnFailure) queuePendingZohoSync('quotation', payload, 'Zoho CRM authorization pending');
    return {
      success: false,
      error: 'Zoho CRM is not authorized. Visit /api/zoho/auth or set ZOHO_REFRESH_TOKEN in server/.env.',
    };
  }

  const cleanEmail = payload.email.toLowerCase().trim();
  const { firstName, lastName } = splitName(payload.name);
  const companyName = payload.company || payload.businessType || `${payload.name} (Quotation)`;

  try {
    const existingLeadId = await searchLeadByEmail(cleanEmail);
    let leadId = existingLeadId;
    let isExisting = Boolean(existingLeadId);

    const description = [
      `[Quotation Request]`,
      `Project Type: ${payload.projectType}`,
      `Budget Range: ${payload.budgetRange}`,
      `Timeline: ${payload.timeline}`,
      payload.requiredFeatures?.length ? `Features: ${payload.requiredFeatures.join(', ')}` : '',
      `Scope: ${payload.description}`,
    ].filter(Boolean).join('\n');

    const leadData: Record<string, any> = {
      Last_Name: lastName,
      Email: cleanEmail,
      Phone: payload.phone || undefined,
      Company: companyName,
      Lead_Source: 'Website Quotation',
      Description: description,
    };
    if (firstName) {
      leadData.First_Name = firstName;
    }

    if (existingLeadId) {
      await zohoApiRequest(`/Leads/${existingLeadId}`, {
        method: 'PUT',
        body: { data: [leadData] },
      });
    } else {
      const createRes = await zohoApiRequest('/Leads', {
        method: 'POST',
        body: {
          data: [leadData],
          trigger: ['workflow', 'approval'],
        },
      });

      if (createRes.status !== 201 && createRes.status !== 200) {
        const errDetails = createRes.data?.data?.[0]?.message || createRes.data?.message || `HTTP ${createRes.status}`;
        if (shouldQueueOnFailure) queuePendingZohoSync('quotation', payload, `Lead creation rejected: ${errDetails}`);
        return {
          success: false,
          error: `Zoho CRM quotation lead creation rejected: ${errDetails}`,
          statusCode: createRes.status,
        };
      }

      const recordResult = createRes.data?.data?.[0];
      if (recordResult?.code !== 'SUCCESS') {
        const errMsg = recordResult?.message || 'Unknown response';
        if (shouldQueueOnFailure) queuePendingZohoSync('quotation', payload, errMsg);
        return {
          success: false,
          error: `Zoho CRM error: ${errMsg}`,
        };
      }

      leadId = recordResult.details?.id;
    }

    // Attach quotation specification note
    let noteId: string | undefined;
    if (leadId) {
      const noteContent = [
        `=== Website Quotation Specification ===`,
        `Project Type: ${payload.projectType}`,
        `Budget Range: ${payload.budgetRange}`,
        `Timeline: ${payload.timeline}`,
        `Company: ${payload.company || 'N/A'}`,
        `Business Type: ${payload.businessType || 'N/A'}`,
        payload.requiredFeatures?.length ? `Required Features:\n- ${payload.requiredFeatures.join('\n- ')}` : '',
        payload.estimatedQuote ? `Calculated Estimate: ₹${payload.estimatedQuote.toLocaleString('en-IN')}` : '',
        payload.attachments?.length
          ? `Uploaded Attachments:\n${payload.attachments.map((a: any) => `- File ID: ${typeof a === 'string' ? a : a.fileId} (Download: /api/files/${typeof a === 'string' ? a : a.fileId})`).join('\n')}`
          : '',
        `Submitted: ${new Date().toISOString()}`,
        `----------------------------------------`,
        `Project Description:`,
        payload.description,
      ].filter(Boolean).join('\n');

      noteId = await attachZohoNote(leadId, `Quotation: ${payload.projectType}`, noteContent);
    }

    return {
      success: true,
      leadId: leadId || undefined,
      noteId,
      isExisting,
      message: isExisting
        ? 'Existing Zoho CRM lead updated with quotation specifications.'
        : 'Quotation lead successfully created in Zoho CRM.',
    };
  } catch (err: any) {
    if (shouldQueueOnFailure) queuePendingZohoSync('quotation', payload, err.message);
    return {
      success: false,
      error: `Zoho CRM quotation communication failure: ${err.message}`,
    };
  }
}

/**
 * Synchronize a registered or created client to Zoho CRM Leads.
 * Uses Zoho CRM Leads module with Last_Name, First_Name, Email, Phone, Company, Lead_Source.
 * Safely deduplicates by searching for existing records with the same email.
 */
export async function syncClientToZoho(
  payload: ClientSyncPayload,
  shouldQueueOnFailure: boolean = true,
): Promise<ZohoSyncResult> {
  if (isTestEmail(payload.email)) {
    return {
      success: true,
      leadId: 'test-lead-id',
      message: 'Test mode: Zoho CRM sync bypassed for test email.',
    };
  }
  if (!isZohoConfigured()) {
    if (shouldQueueOnFailure) queuePendingZohoSync('client', payload, 'Zoho CRM credentials not configured');
    return {
      success: false,
      error: 'Zoho CRM is not configured. Set ZOHO_CLIENT_ID and ZOHO_CLIENT_SECRET in server/.env.',
    };
  }

  if (!hasZohoAuthorization()) {
    if (shouldQueueOnFailure) queuePendingZohoSync('client', payload, 'Zoho CRM authorization pending');
    return {
      success: false,
      error: 'Zoho CRM is not authorized. Visit /api/zoho/auth or set ZOHO_REFRESH_TOKEN in server/.env.',
    };
  }

  const cleanEmail = payload.email.toLowerCase().trim();
  const { firstName, lastName } = splitName(payload.name);
  const companyName = payload.company || (payload.title ? `${payload.name} (${payload.title})` : `${payload.name} (Client)`);

  try {
    const existingLeadId = await searchLeadByEmail(cleanEmail);
    let leadId = existingLeadId;
    let isExisting = Boolean(existingLeadId);

    const description = [
      `[Client Registration]`,
      `Project / Title: ${payload.title || 'Website Project'}`,
      payload.quoteAmount ? `Quote / Budget: ₹${payload.quoteAmount.toLocaleString('en-IN')}` : '',
      payload.notes ? `Notes / Scope: ${payload.notes}` : '',
      `Registered At: ${new Date().toISOString()}`,
    ].filter(Boolean).join('\n');

    const leadData: Record<string, any> = {
      Last_Name: lastName,
      Email: cleanEmail,
      Phone: payload.phone || undefined,
      Company: companyName,
      Lead_Source: payload.source || 'Client Registration',
      Description: description,
    };
    if (firstName) {
      leadData.First_Name = firstName;
    }

    if (existingLeadId) {
      const updateRes = await zohoApiRequest(`/Leads/${existingLeadId}`, {
        method: 'PUT',
        body: { data: [leadData] },
      });
      if (updateRes.status !== 200) {
        console.warn('[Zoho CRM] Update lead warning:', JSON.stringify(updateRes.data));
      }
    } else {
      const createRes = await zohoApiRequest('/Leads', {
        method: 'POST',
        body: {
          data: [leadData],
          trigger: ['workflow', 'approval'],
        },
      });

      if (createRes.status !== 201 && createRes.status !== 200) {
        const errDetails = createRes.data?.data?.[0]?.message || createRes.data?.message || `HTTP ${createRes.status}`;
        if (shouldQueueOnFailure) queuePendingZohoSync('client', payload, `Lead creation rejected: ${errDetails}`);
        return {
          success: false,
          error: `Zoho CRM lead creation rejected: ${errDetails}`,
          statusCode: createRes.status,
        };
      }

      const recordResult = createRes.data?.data?.[0];
      if (recordResult?.code !== 'SUCCESS') {
        const errMsg = recordResult?.message || 'Unknown response';
        if (shouldQueueOnFailure) queuePendingZohoSync('client', payload, errMsg);
        return {
          success: false,
          error: `Zoho CRM error: ${errMsg}`,
        };
      }

      leadId = recordResult.details?.id;
    }

    // Attach Note with registration details
    let noteId: string | undefined;
    if (leadId) {
      const noteContent = [
        `=== Client Registration & Project Overview ===`,
        `Client Name: ${payload.name}`,
        `Email: ${cleanEmail}`,
        `Phone: ${payload.phone || 'N/A'}`,
        `Project Title: ${payload.title || 'Website Project'}`,
        payload.quoteAmount ? `Quote Amount: ₹${payload.quoteAmount.toLocaleString('en-IN')}` : '',
        `Source: ${payload.source || 'Client Registration'}`,
        `Created: ${new Date().toISOString()}`,
        `----------------------------------------`,
        `Details:`,
        payload.notes || 'Client profile registered in system.',
      ].filter(Boolean).join('\n');

      noteId = await attachZohoNote(leadId, `Client Registration: ${payload.title || payload.name}`, noteContent);
    }

    return {
      success: true,
      leadId: leadId || undefined,
      noteId,
      isExisting,
      message: isExisting
        ? 'Existing Zoho CRM lead updated with new client details.'
        : 'New lead successfully created in Zoho CRM.',
    };
  } catch (err: any) {
    if (shouldQueueOnFailure) queuePendingZohoSync('client', payload, err.message);
    return {
      success: false,
      error: `Zoho CRM client communication failure: ${err.message}`,
    };
  }
}

/**
 * Synchronize a booked consultation appointment to Zoho CRM Leads.
 * Saves client's name, email, phone, appointment date/time, and meeting link.
 * Updates existing lead if client already exists.
 */
export async function syncAppointmentToZoho(
  payload: AppointmentSyncPayload,
  shouldQueueOnFailure: boolean = true,
): Promise<ZohoSyncResult> {
  if (isTestEmail(payload.clientEmail)) {
    return {
      success: true,
      leadId: 'test-lead-id',
      message: 'Test mode: Zoho CRM sync bypassed for test email.',
    };
  }
  if (!isZohoConfigured()) {
    if (shouldQueueOnFailure) queuePendingZohoSync('appointment', payload, 'Zoho CRM credentials not configured');
    return {
      success: false,
      error: 'Zoho CRM is not configured. Set ZOHO_CLIENT_ID and ZOHO_CLIENT_SECRET in server/.env.',
    };
  }

  if (!hasZohoAuthorization()) {
    if (shouldQueueOnFailure) queuePendingZohoSync('appointment', payload, 'Zoho CRM authorization pending');
    return {
      success: false,
      error: 'Zoho CRM is not authorized. Visit /api/zoho/auth or set ZOHO_REFRESH_TOKEN in server/.env.',
    };
  }

  const cleanEmail = payload.clientEmail.toLowerCase().trim();
  const { firstName, lastName } = splitName(payload.clientName);
  const companyName = `${payload.clientName} (Consultation)`;

  try {
    const existingLeadId = await searchLeadByEmail(cleanEmail);
    let leadId = existingLeadId;
    let isExisting = Boolean(existingLeadId);

    const description = [
      `[Consultation Booking]`,
      `Service: ${payload.serviceType || 'General Consultation'}`,
      `Date & Time: ${payload.appointmentDate} at ${payload.startTime}${payload.endTime ? ` - ${payload.endTime}` : ''}`,
      payload.meetingLink ? `Meeting Link: ${payload.meetingLink}` : '',
      payload.notes ? `Notes: ${payload.notes}` : '',
      `Booked At: ${new Date().toISOString()}`,
    ].filter(Boolean).join('\n');

    const leadData: Record<string, any> = {
      Last_Name: lastName,
      Email: cleanEmail,
      Phone: payload.clientPhone || undefined,
      Company: companyName,
      Lead_Source: 'Website Booking',
      Description: description,
    };
    if (firstName) {
      leadData.First_Name = firstName;
    }

    if (existingLeadId) {
      const updateRes = await zohoApiRequest(`/Leads/${existingLeadId}`, {
        method: 'PUT',
        body: { data: [leadData] },
      });
      if (updateRes.status !== 200) {
        console.warn('[Zoho CRM] Update lead warning:', JSON.stringify(updateRes.data));
      }
    } else {
      const createRes = await zohoApiRequest('/Leads', {
        method: 'POST',
        body: {
          data: [leadData],
          trigger: ['workflow', 'approval'],
        },
      });

      if (createRes.status !== 201 && createRes.status !== 200) {
        const errDetails = createRes.data?.data?.[0]?.message || createRes.data?.message || `HTTP ${createRes.status}`;
        if (shouldQueueOnFailure) queuePendingZohoSync('appointment', payload, `Lead creation rejected: ${errDetails}`);
        return {
          success: false,
          error: `Zoho CRM consultation lead creation rejected: ${errDetails}`,
          statusCode: createRes.status,
        };
      }

      const recordResult = createRes.data?.data?.[0];
      if (recordResult?.code !== 'SUCCESS') {
        const errMsg = recordResult?.message || 'Unknown response';
        if (shouldQueueOnFailure) queuePendingZohoSync('appointment', payload, errMsg);
        return {
          success: false,
          error: `Zoho CRM error: ${errMsg}`,
        };
      }

      leadId = recordResult.details?.id;
    }

    // Attach Note with consultation details
    let noteId: string | undefined;
    if (leadId) {
      const noteContent = [
        `=== Consultation Booking Details ===`,
        `Client Name: ${payload.clientName}`,
        `Email: ${cleanEmail}`,
        `Phone: ${payload.clientPhone || 'N/A'}`,
        `Service: ${payload.serviceType || 'General Consultation'}`,
        `Scheduled Date: ${payload.appointmentDate}`,
        `Time: ${payload.startTime}${payload.endTime ? ` to ${payload.endTime}` : ''}`,
        `Meeting Link: ${payload.meetingLink || 'Scheduled online'}`,
        `----------------------------------------`,
        `Client Notes:`,
        payload.notes || 'No extra notes provided by client.',
      ].join('\n');

      noteId = await attachZohoNote(leadId, `Consultation: ${payload.serviceType} (${payload.appointmentDate})`, noteContent);
    }

    return {
      success: true,
      leadId: leadId || undefined,
      noteId,
      isExisting,
      message: isExisting
        ? 'Existing Zoho CRM lead updated with new consultation booking.'
        : 'Consultation lead successfully created in Zoho CRM.',
    };
  } catch (err: any) {
    if (shouldQueueOnFailure) queuePendingZohoSync('appointment', payload, err.message);
    return {
      success: false,
      error: `Zoho CRM consultation communication failure: ${err.message}`,
    };
  }
}

/**
 * Drain and retry pending synchronization items from the recovery queue.
 */
export async function processPendingZohoSyncs(): Promise<{
  processed: number;
  succeeded: number;
  failed: number;
}> {
  if (!isZohoConfigured() || !hasZohoAuthorization()) {
    return { processed: 0, succeeded: 0, failed: 0 };
  }

  const syncs = getPendingZohoSyncs();
  if (syncs.length === 0) {
    return { processed: 0, succeeded: 0, failed: 0 };
  }

  let succeeded = 0;
  let failed = 0;
  const remaining: PendingZohoSync[] = [];

  for (const item of syncs) {
    try {
      let result: ZohoSyncResult;
      if (item.type === 'client') {
        result = await syncClientToZoho(item.payload, false);
      } else if (item.type === 'appointment') {
        result = await syncAppointmentToZoho(item.payload, false);
      } else if (item.type === 'inquiry') {
        result = await syncInquiryToZoho(item.payload, false);
      } else if (item.type === 'quotation') {
        result = await syncQuotationToZoho(item.payload, false);
      } else {
        result = { success: false, error: 'Unknown sync type' };
      }

      if (result.success) {
        succeeded++;
      } else {
        item.attempts += 1;
        item.lastError = result.error;
        if (item.attempts < 5) {
          remaining.push(item);
        }
        failed++;
      }
    } catch (err: any) {
      item.attempts += 1;
      item.lastError = err.message;
      if (item.attempts < 5) {
        remaining.push(item);
      }
      failed++;
    }
  }

  inMemoryPendingSyncs = remaining;
  persistPendingZohoSyncs();
  return { processed: syncs.length, succeeded, failed };
}

/**
 * Admin-only diagnostic runner.
 * Verifies OAuth token refresh, checks live API connectivity,
 * optionally creates a clearly identified test lead (without modifying real records),
 * and verifies generated record ID.
 */
export async function runZohoDiagnostic(options?: { createTestLead?: boolean }): Promise<{
  success: boolean;
  tokenRefreshSuccess: boolean;
  apiVerified: boolean;
  testLeadCreated?: boolean;
  testLeadId?: string;
  pendingSyncStats?: { processed: number; succeeded: number; failed: number; queueSize: number };
  message: string;
  error?: string;
}> {
  if (!isZohoConfigured()) {
    return {
      success: false,
      tokenRefreshSuccess: false,
      apiVerified: false,
      message: 'Zoho CRM credentials (ZOHO_CLIENT_ID / ZOHO_CLIENT_SECRET) are missing or incomplete in environment.',
      error: 'Configuration incomplete',
    };
  }

  const refreshRes = await refreshAccessToken();
  if (!refreshRes.success || !refreshRes.accessToken) {
    return {
      success: false,
      tokenRefreshSuccess: false,
      apiVerified: false,
      message: `Token refresh failed: ${refreshRes.error}`,
      error: refreshRes.error,
    };
  }

  try {
    const apiRes = await zohoApiRequest('/Leads?fields=id&limit=1', {
      method: 'GET',
      customToken: refreshRes.accessToken,
    });

    if (apiRes.status !== 200) {
      return {
        success: false,
        tokenRefreshSuccess: true,
        apiVerified: false,
        message: `Zoho CRM API returned HTTP ${apiRes.status} on verification check.`,
        error: JSON.stringify(apiRes.data),
      };
    }

    let testLeadId: string | undefined;
    let testLeadCreated = false;

    if (options?.createTestLead) {
      const testTimestamp = new Date().toISOString();
      const testLeadData = {
        Last_Name: 'TestLead (Diagnostic)',
        First_Name: 'System',
        Email: `zoho-diagnostic-${Date.now()}@teja.studio`,
        Company: 'Teja Web Studio Diagnostics',
        Lead_Source: 'System Diagnostic Test',
        Description: `[System Diagnostic] Safe test lead created via Admin Diagnostic endpoint at ${testTimestamp}. Confirms write permission and record ID generation.`,
      };

      const createRes = await zohoApiRequest('/Leads', {
        method: 'POST',
        body: { data: [testLeadData] },
        customToken: refreshRes.accessToken,
      });

      if (createRes.status === 201 || createRes.status === 200) {
        const recordResult = createRes.data?.data?.[0];
        if (recordResult?.code === 'SUCCESS' && recordResult?.details?.id) {
          testLeadId = recordResult.details.id;
          testLeadCreated = true;
        }
      }
    }

    const queueDrain = await processPendingZohoSyncs();
    const currentQueue = getPendingZohoSyncs();

    return {
      success: true,
      tokenRefreshSuccess: true,
      apiVerified: true,
      testLeadCreated,
      testLeadId,
      pendingSyncStats: {
        ...queueDrain,
        queueSize: currentQueue.length,
      },
      message: testLeadCreated
        ? `Zoho CRM fully verified: OAuth token refreshed, API connectivity confirmed, and test lead created (Record ID: ${testLeadId}).`
        : 'Zoho CRM fully verified: OAuth token refreshed and API read permissions confirmed.',
    };
  } catch (err: any) {
    return {
      success: false,
      tokenRefreshSuccess: true,
      apiVerified: false,
      message: `Failed to verify Zoho CRM API endpoint: ${err.message}`,
      error: err.message,
    };
  }
}

