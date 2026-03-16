/**
 * MuniGo — SOS / Emergency Alerts Microservice (port 4011)
 *
 * POST   /v1/sos/alert              — citizen sends SOS alert
 * GET    /v1/sos/alerts             — list alerts (admin/officer)
 * GET    /v1/sos/alerts/my          — caller's own alerts
 * GET    /v1/sos/alerts/:id         — detail
 * PATCH  /v1/sos/alerts/:id/attend  — mark attended (officer)
 * PATCH  /v1/sos/alerts/:id/resolve — mark resolved (officer)
 */

'use strict';

const http = require('http');
const { query } = require('../../shared/db');
const { verifyAccessToken } = require('../../shared/jwt');

const PORT = process.env.SOS_PORT || 4011;

async function bootstrap() {
  await query(`
    CREATE TABLE IF NOT EXISTS sos_alerts (
      id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id       TEXT        NOT NULL,
      latitude      NUMERIC(10,7),
      longitude     NUMERIC(10,7),
      address       TEXT,
      type          TEXT        NOT NULL DEFAULT 'GENERAL',
      description   TEXT,
      status        TEXT        NOT NULL DEFAULT 'ACTIVE',
      attended_by   TEXT,
      attended_at   TIMESTAMPTZ,
      resolved_at   TIMESTAMPTZ,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
}

function requireAuth(req) {
  const h = req.headers['authorization'] || '';
  const t = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!t) throw Object.assign(new Error('Unauthorized'), { status: 401 });
  try { return verifyAccessToken(t); }
  catch { throw Object.assign(new Error('Unauthorized'), { status: 401 }); }
}

function json(res, status, body) {
  const p = JSON.stringify(body);
  res.writeHead(status, { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(p) });
  res.end(p);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let d = '';
    req.on('data', c => { d += c; });
    req.on('end', () => { try { resolve(d ? JSON.parse(d) : {}); } catch { reject(Object.assign(new Error('Invalid JSON'), { status: 400 })); } });
    req.on('error', reject);
  });
}

async function handleRequest(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const path = url.pathname;
  const method = req.method;

  try {
    // POST /v1/sos/alert
    if (method === 'POST' && path === '/v1/sos/alert') {
      const caller = requireAuth(req);
      const b = await readBody(req);
      const { latitude, longitude, address, type = 'GENERAL', description } = b;
      const { rows } = await query(
        `INSERT INTO sos_alerts (user_id, latitude, longitude, address, type, description)
         VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
        [caller.sub, latitude || null, longitude || null, address || null, type, description || null]
      );
      return json(res, 201, { alert: rows[0] });
    }

    // GET /v1/sos/alerts/my
    if (method === 'GET' && path === '/v1/sos/alerts/my') {
      const caller = requireAuth(req);
      const limit = parseInt(url.searchParams.get('limit') || '20', 10);
      const { rows } = await query(
        `SELECT * FROM sos_alerts WHERE user_id=$1 ORDER BY created_at DESC LIMIT $2`,
        [caller.sub, limit]
      );
      return json(res, 200, { alerts: rows });
    }

    // GET /v1/sos/alerts — admin list
    if (method === 'GET' && path === '/v1/sos/alerts') {
      requireAuth(req);
      const status = url.searchParams.get('status');
      const limit = parseInt(url.searchParams.get('limit') || '50', 10);
      let q = `SELECT * FROM sos_alerts`;
      const params = [];
      if (status) { q += ` WHERE status=$1`; params.push(status); }
      q += ` ORDER BY created_at DESC LIMIT $${params.length + 1}`;
      params.push(limit);
      const { rows } = await query(q, params);
      return json(res, 200, { alerts: rows });
    }

    const idMatch = path.match(/^\/v1\/sos\/alerts\/([^/]+)$/);
    // GET /v1/sos/alerts/:id
    if (method === 'GET' && idMatch) {
      requireAuth(req);
      const { rows } = await query('SELECT * FROM sos_alerts WHERE id=$1', [idMatch[1]]);
      if (!rows.length) throw Object.assign(new Error('Not found'), { status: 404 });
      return json(res, 200, { alert: rows[0] });
    }

    // PATCH /v1/sos/alerts/:id/attend
    const attendMatch = path.match(/^\/v1\/sos\/alerts\/([^/]+)\/attend$/);
    if (method === 'PATCH' && attendMatch) {
      const caller = requireAuth(req);
      const { rows } = await query(
        `UPDATE sos_alerts SET status='ATTENDED', attended_by=$1, attended_at=now(), updated_at=now()
         WHERE id=$2 AND status='ACTIVE' RETURNING *`,
        [caller.sub, attendMatch[1]]
      );
      if (!rows.length) throw Object.assign(new Error('Alert not active or not found'), { status: 409 });
      return json(res, 200, { alert: rows[0] });
    }

    // PATCH /v1/sos/alerts/:id/resolve
    const resolveMatch = path.match(/^\/v1\/sos\/alerts\/([^/]+)\/resolve$/);
    if (method === 'PATCH' && resolveMatch) {
      requireAuth(req);
      const { rows } = await query(
        `UPDATE sos_alerts SET status='RESOLVED', resolved_at=now(), updated_at=now()
         WHERE id=$1 AND status IN ('ACTIVE','ATTENDED') RETURNING *`,
        [resolveMatch[1]]
      );
      if (!rows.length) throw Object.assign(new Error('Alert not found or already resolved'), { status: 409 });
      return json(res, 200, { alert: rows[0] });
    }

    json(res, 404, { error: 'Not found' });
  } catch (err) {
    const status = err.status || 500;
    if (status === 500) console.error(err);
    json(res, status, { error: err.message });
  }
}

const server = http.createServer(handleRequest);
bootstrap()
  .then(() => server.listen(PORT, () => console.log(`sos service listening on :${PORT}`)))
  .catch(err => { console.error('bootstrap failed:', err); process.exit(1); });
