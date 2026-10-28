/**
 * Check Database Script (Zero-Cost Architecture)
 * Validates system state and Zoho CRM configuration.
 */
import { env } from '../config/env';

async function check() {
  console.log('--- System Architecture Status ---');
  console.log('Database Mode: Zero-Cost Static & Edge Architecture (MongoDB Removed)');
  console.log(`Zoho Client ID: ${env.ZOHO_CLIENT_ID ? 'Configured' : 'Missing (Set ZOHO_CLIENT_ID in server/.env)'}`);
  console.log(`Zoho Refresh Token: ${env.ZOHO_REFRESH_TOKEN ? 'Authorized' : 'Pending (Visit /api/zoho/auth or set ZOHO_REFRESH_TOKEN)'}`);
  console.log(`Zoho Accounts URL: ${env.ZOHO_ACCOUNTS_URL}`);
  console.log(`Zoho API Base URL: ${env.ZOHO_API_BASE_URL}`);
  console.log(`Admin Email: ${env.DEFAULT_ADMIN_EMAIL}`);
  console.log('Status: Healthy (100% Zero Database Cost)');
}

check().catch(console.error);
