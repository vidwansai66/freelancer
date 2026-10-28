import dotenv from 'dotenv';
import path from 'path';

// Load .env file safely (in local environments where .env exists)
try {
  dotenv.config({ path: path.resolve(__dirname, '../../.env') });
} catch {
  // Ignore in serverless / production where environment variables are injected directly
}

export interface EnvStatus {
  isConfigured: boolean;
  missingRequired: string[];
  warnings: string[];
}

export const envStatus: EnvStatus = {
  isConfigured: true,
  missingRequired: [],
  warnings: [],
};

// Validate JWT Secret
if (
  !process.env.JWT_SECRET ||
  process.env.JWT_SECRET.length < 32 ||
  process.env.JWT_SECRET.includes('your_super_secret') ||
  process.env.JWT_SECRET.includes('super_secret_jwt_key')
) {
  envStatus.isConfigured = false;
  envStatus.missingRequired.push('JWT_SECRET (min 32 chars)');
  if (process.env.NODE_ENV !== 'production') {
    console.warn('[Env Warning] JWT_SECRET is not configured or too short (min 32 characters).');
  }
}

// Validate Default Admin Password
if (
  !process.env.DEFAULT_ADMIN_PASSWORD ||
  process.env.DEFAULT_ADMIN_PASSWORD.length < 12 ||
  process.env.DEFAULT_ADMIN_PASSWORD === 'AdminPassword123!' ||
  process.env.DEFAULT_ADMIN_PASSWORD.startsWith('replace_')
) {
  envStatus.isConfigured = false;
  envStatus.missingRequired.push('DEFAULT_ADMIN_PASSWORD (min 12 chars)');
  if (process.env.NODE_ENV !== 'production') {
    console.warn('[Env Warning] DEFAULT_ADMIN_PASSWORD is not configured or uses default value (min 12 characters).');
  }
}

// Client URL detection (supports custom CLIENT_URL or auto-injected VERCEL_URL)
const defaultClientUrl =
  process.env.CLIENT_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:5173');

if (process.env.NODE_ENV === 'production' && !process.env.CLIENT_URL) {
  envStatus.warnings.push('CLIENT_URL not explicitly set; derived from VERCEL_URL or default.');
}

export const env = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_URL: defaultClientUrl,
  // Zoho CRM Configuration (India Data Center by default)
  ZOHO_CLIENT_ID: process.env.ZOHO_CLIENT_ID || '',
  ZOHO_CLIENT_SECRET: process.env.ZOHO_CLIENT_SECRET || '',
  ZOHO_REDIRECT_URI:
    process.env.ZOHO_REDIRECT_URI ||
    `${defaultClientUrl.replace(/\/+$/, '')}/api/zoho/callback`,
  ZOHO_REFRESH_TOKEN: process.env.ZOHO_REFRESH_TOKEN || '',
  ZOHO_ACCOUNTS_URL: process.env.ZOHO_ACCOUNTS_URL || 'https://accounts.zoho.in',
  ZOHO_API_BASE_URL: process.env.ZOHO_API_BASE_URL || process.env.ZOHO_API_DOMAIN || 'https://www.zohoapis.in/crm/v8',
  ZOHO_API_DOMAIN: process.env.ZOHO_API_DOMAIN || 'https://www.zohoapis.in',
  JWT_SECRET: process.env.JWT_SECRET || '',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  DEFAULT_ADMIN_EMAIL: process.env.DEFAULT_ADMIN_EMAIL || 'admin@tejastudio.com',
  DEFAULT_ADMIN_PASSWORD: process.env.DEFAULT_ADMIN_PASSWORD || '',
  DEFAULT_ADMIN_NAME: process.env.DEFAULT_ADMIN_NAME || 'Studio Admin',
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
  SMTP_SECURE: process.env.SMTP_SECURE === 'true',
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  EMAIL_FROM: process.env.EMAIL_FROM || 'Teja Web Studio <hello@tejastudio.com>',
  ADMIN_NOTIFICATION_EMAIL: process.env.ADMIN_NOTIFICATION_EMAIL || 'admin@tejastudio.com',
  EMAIL_SERVICE_ENABLED: process.env.EMAIL_SERVICE_ENABLED === 'true',
};
