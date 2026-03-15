const http = require('node:http');
const { URL } = require('node:url');

const PORT = Number(process.env.GATEWAY_PORT || 8080);

const upstreams = {
  auth: process.env.IDENTITY_URL || 'http://localhost:4001',
  reports: process.env.REPORTS_URL || 'http://localhost:4002',
  geo: process.env.GEO_URL || 'http://localhost:4003',
  notifications: process.env.NOTIFICATIONS_URL || 'http://localhost:4004',
};

const json = (res, statusCode, payload) => {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'content-type': 'application/json; charset=utf-8',
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET,POST,PATCH,PUT,DELETE,OPTIONS',
    'access-control-allow-headers': 'content-type,authorization,x-user-id',
  });
  res.end(body);
};

const readRawBody = (req) =>
  new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > 1_000_000) {
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });

const routeForPath = (path) => {
  if (path.startsWith('/v1/auth/')) return upstreams.auth;
  if (path === '/v1/auth') return upstreams.auth;
  if (path.startsWith('/v1/reports/')) return upstreams.reports;
  if (path === '/v1/reports') return upstreams.reports;
  if (path.startsWith('/v1/geo/')) return upstreams.geo;
  if (path === '/v1/geo') return upstreams.geo;
  if (path.startsWith('/v1/notifications/')) return upstreams.notifications;
  if (path === '/v1/notifications') return upstreams.notifications;
  return null;
};

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    return json(res, 204, {});
  }

  const requestUrl = new URL(req.url || '/', `http://${req.headers.host}`);

  if (requestUrl.pathname === '/health') {
    return json(res, 200, {
      service: 'api-gateway',
      status: 'ok',
      upstreams,
      timestamp: new Date().toISOString(),
    });
  }

  const target = routeForPath(requestUrl.pathname);
  if (!target) {
    return json(res, 404, { error: 'Route not found', path: requestUrl.pathname });
  }

  try {
    const rawBody = await readRawBody(req);
    const headers = {
      'content-type': req.headers['content-type'] || 'application/json',
      authorization: req.headers.authorization || '',
      'x-user-id': req.headers['x-user-id'] || '',
    };

    const response = await fetch(`${target}${requestUrl.pathname}${requestUrl.search}`, {
      method: req.method,
      headers,
      body: req.method === 'GET' || req.method === 'HEAD' ? undefined : rawBody,
    });

    const text = await response.text();
    res.writeHead(response.status, {
      'content-type': response.headers.get('content-type') || 'application/json; charset=utf-8',
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET,POST,PATCH,PUT,DELETE,OPTIONS',
      'access-control-allow-headers': 'content-type,authorization,x-user-id',
    });
    res.end(text);
  } catch {
    return json(res, 502, {
      error: 'Upstream service unavailable',
      path: requestUrl.pathname,
    });
  }
});

server.listen(PORT, () => {
  process.stdout.write(`Gateway listening on ${PORT}\n`);
});
