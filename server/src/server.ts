import { seoRoutes } from './routes/seoRoutes';
import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env, envStatus } from './config/env';
import apiRoutes from './routes/apiRoutes';
import { errorHandler } from './middleware/errorHandler';
import { generalApiLimiter } from './middleware/rateLimiter';
import { sendError } from './utils/apiResponse';

const app = express();

// Security headers
app.use(helmet());

const isAllowedOrigin = (origin?: string): boolean => {
  if (!origin) return true;
  if (origin === env.CLIENT_URL) return true;
  try {
    const url = new URL(origin);
    if (url.hostname.endsWith('.vercel.app') || url.hostname === 'localhost') {
      return true;
    }
  } catch {
    // invalid URL format
  }
  return false;
};

// Cross-origin resource sharing
app.use(
  cors({
    origin: (origin, callback) => callback(null, isAllowedOrigin(origin)),
    credentials: true,
  }),
);

// Logging: Only run morgan in local standalone development
if (env.NODE_ENV === 'development' && !process.env.VERCEL) {
  app.use(morgan('dev'));
}

// Body parsing
app.use(express.json({ limit: '8mb' }));
app.use((req, res, next) => {
  if (
    !['GET', 'HEAD', 'OPTIONS'].includes(req.method) &&
    req.headers.origin &&
    !isAllowedOrigin(req.headers.origin)
  ) {
    return void sendError(res, 'Origin not allowed.', 403);
  }
  next();
});
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  const crmStatus = env.ZOHO_CLIENT_ID
    ? (env.ZOHO_REFRESH_TOKEN ? 'Zoho CRM India (Authorized)' : 'Zoho CRM India (Pending /api/zoho/auth)')
    : 'Zoho CRM India (Credentials Pending)';
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Freelance Studio API',
    database: 'Zero-Cost Static & Edge Architecture',
    crm: crmStatus,
    env: {
      configured: envStatus.isConfigured,
      missing: envStatus.missingRequired,
      warnings: envStatus.warnings,
    },
  });
});

app.use(seoRoutes);

// Mount Master API Router
app.use('/api', generalApiLimiter, apiRoutes);

// Catch-all for undefined API routes
app.use('/api/*', (_req: Request, res: Response) => {
  sendError(res, 'API endpoint not found', 404, 'Not Found');
});

// Centralized error handling
app.use(errorHandler);

// Bootstrap Server
const startServer = async () => {
  try {
    app.listen(env.PORT, () => {
      console.log(`\n🚀 [Server] Freelance Web Studio API running at http://localhost:${env.PORT}`);
      console.log(`📡 [Health] http://localhost:${env.PORT}/health`);
      console.log(`🔐 [Admin Login] http://localhost:${env.PORT}/api/auth/login`);
      console.log(`💻 [Client App] ${env.CLIENT_URL}\n`);
    });
  } catch (err: any) {
    console.error('[Bootstrap Error] Failed to start server:', err.message);
    process.exit(1);
  }
};

if (require.main === module) startServer();

export default app;
