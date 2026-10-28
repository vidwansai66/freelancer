let expressApp;

function getApp() {
  if (!expressApp) {
    try {
      // 1. Try compiled distribution first
      const serverModule = require('../server/dist/server');
      expressApp = serverModule.default || serverModule;
    } catch (distErr) {
      try {
        // 2. Fall back to TypeScript source
        const serverSrc = require('../server/src/server');
        expressApp = serverSrc.default || serverSrc;
      } catch (srcErr) {
        console.error('[Vercel Boot Error] Failed to load server module:', distErr, srcErr);
        throw new Error(
          'Failed to initialize server application: ' +
            ((srcErr && srcErr.message) || (distErr && distErr.message))
        );
      }
    }
  }
  return expressApp;
}

function handler(req, res) {
  try {
    const app = getApp();

    // Handle Vercel rewrite route param
    if (req.query && req.query.route) {
      const route = String(req.query.route);
      delete req.query.route;
      const queryParams = new URLSearchParams(req.query).toString();
      const cleanUrl =
        (route.startsWith('/') ? route : '/' + route) +
        (queryParams ? '?' + queryParams : '');
      req.url = cleanUrl;
      req.originalUrl = cleanUrl;
    }

    return app(req, res);
  } catch (err) {
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

module.exports = handler;
module.exports.default = handler;
