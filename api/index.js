let expressApp;

function getApp() {
  if (!expressApp) {
    try {
      const serverModule = require('../server/dist/server');
      expressApp = serverModule.default || serverModule;
    } catch {
      const serverSrc = require('../server/src/server');
      expressApp = serverSrc.default || serverSrc;
    }
  }
  return expressApp;
}

module.exports = function handler(req, res) {
  try {
    const app = getApp();

    if (req.query && req.query.route) {
      const route = String(req.query.route);
      delete req.query.route;
      const queryParams = new URLSearchParams(req.query).toString();
      const cleanUrl = (route.startsWith('/') ? route : '/' + route) + (queryParams ? '?' + queryParams : '');
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
};
