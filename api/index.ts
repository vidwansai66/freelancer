import app from '../server/src/server';

export default async function handler(req: any, res: any) {
  const route = String(req.query?.route || '');
  delete req.query?.route;
  if (route) {
    const query = new URLSearchParams(req.query as Record<string, string>).toString();
    req.url = `${route.startsWith('/') ? route : `/${route}`}${query ? `?${query}` : ''}`;
  }
  return app(req, res);
}
