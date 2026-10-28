let expressApp: any;

function getApp() {
  if (!expressApp) {
    try {
      // 1. Try compiled distribution first
      const serverModule = require('../server/dist/server');
      expressApp = serverModule.default || serverModule;
    } catch {
      // 2. Fall back to TypeScript source
      const serverSrc = require('../server/src/server');
      expressApp = serverSrc.default || serverSrc;
    }
  }
  return expressApp;
}

export default function handler(req: any, res: any) {
  try {
    const app = getApp();

    // Handle Vercel rewrite route param
    if (req.query?.route) {
      const route = String(req.query.route);
      delete req.query.route;
      const queryParams = new URLSearchParams(req.query as Record<string, string>).toString();
      const cleanUrl = `${route.startsWith('/') ? route : `/${route}`}${queryParams ? `?${queryParams}` : ''}`;
      req.url = cleanUrl;
      req.originalUrl = cleanUrl;
    }

    return app(req, res);
  } catch (err: any) {
    console.error('[Vercel Serverless Function Crash]:', err);
    if (!res.headersSent) {
      res.status(500).json({
        status: 'error',
        message: 'Serverless Function Invocation Failed',
        error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
      });
    }
  }
}
