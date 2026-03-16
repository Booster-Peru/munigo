const http = require('node:http');
const { URL } = require('node:url');
const { query } = require('../../shared/db');
const { verifyAccessToken } = require('../../shared/jwt');

const PORT = Number(process.env.REPORTS_PORT || 4002);

const json = (res, statusCode, payload) => {
  res.writeHead(statusCode, { 'content-type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
};

const readJsonBody = (req) =>
  new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > 2_000_000) reject(new Error('Payload too large'));
    });
    req.on('end', () => {
      if (!data) return resolve({});
      try {
        resolve(JSON.parse(data));
      } catch {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });

const initDb = async () => {
  await query(`
    CREATE TABLE IF NOT EXISTS reports (
      id BIGSERIAL PRIMARY KEY,
      user_id UUID NOT NULL,
      type TEXT NOT NULL,
      description TEXT NOT NULL,
      latitude DOUBLE PRECISION NOT NULL,
      longitude DOUBLE PRECISION NOT NULL,
      zone_id TEXT,
      status TEXT NOT NULL DEFAULT 'PENDING',
      image_blob BYTEA,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
};

const server = http.createServer(async (req, res) => {
  const requestUrl = new URL(req.url || '/', `http://${req.headers.host}`);

  if (requestUrl.pathname === '/health') {
    return json(res, 200, { service: 'reports', status: 'ok' });
  }

  // Auth Middleware
  const auth = verifyAccessToken(req.headers.authorization);
  if (!auth) {
    return json(res, 401, { error: 'unauthorized' });
  }

  if (req.method === 'POST' && requestUrl.pathname === '/v1/reports') {
    try {
      const body = await readJsonBody(req);
      const { type, description, latitude, longitude, zoneId, image_b64 } = body;

      if (!type || !description || latitude === undefined || longitude === undefined) {
        return json(res, 400, { error: 'missing required fields' });
      }

      const imageBlob = image_b64 ? Buffer.from(image_b64, 'base64') : null;

      const result = await query(
        `
        INSERT INTO reports (user_id, type, description, latitude, longitude, zone_id, image_blob)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, status, created_at
        `,
        [auth.userId, type, description, latitude, longitude, zoneId, imageBlob],
      );

      return json(res, 201, {
        reportId: result.rows[0].id,
        status: result.rows[0].status,
        createdAt: result.rows[0].created_at,
      });
    } catch (e) {
      return json(res, 400, { error: `invalid report data: ${e.message}` });
    }
  }

  if (req.method === 'GET' && requestUrl.pathname === '/v1/reports') {
    const result = await query(
      `
      SELECT id, type, description, latitude, longitude, zone_id, status, created_at
      FROM reports
      WHERE user_id = $1
      ORDER BY created_at DESC
      `,
      [auth.userId],
    );

    return json(res, 200, result.rows);
  }

  if (req.method === 'GET' && /^\/v1\/reports\/[^/]+$/.test(requestUrl.pathname)) {
    const reportId = requestUrl.pathname.split('/').pop();
    const result = await query(
      `
      SELECT id, type, description, latitude, longitude, zone_id, status, created_at
      FROM reports
      WHERE id = $1 AND user_id = $2
      `,
      [reportId, auth.userId],
    );

    if (result.rows.length === 0) {
      return json(res, 404, { error: 'report not found' });
    }

    return json(res, 200, result.rows[0]);
  }

  return json(res, 404, { error: 'route not found' });
});

initDb()
  .then(() => {
    server.listen(PORT, () => {
      process.stdout.write(`Reports service listening on ${PORT}\n`);
    });
  })
  .catch((error) => {
    process.stderr.write(`Reports service failed to start: ${error.message}\n`);
    process.exit(1);
  });
