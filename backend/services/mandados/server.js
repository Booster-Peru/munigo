/**
 * MuniGo — Mandados Microservice (port 4009)
 *
 * "Te hago un favor" — on-demand errand runner service
 *
 * States: PENDING → ACCEPTED → IN_PROGRESS → DELIVERED | CANCELLED
 *
 * POST   /v1/mandados               — citizen creates request
 * GET    /v1/mandados/active        — active mandado for caller
 * GET    /v1/mandados/history       — past mandados
 * GET    /v1/mandados/:id           — detail
 * POST   /v1/mandados/:id/cancel    — cancel (citizen, PENDING only)
 * PATCH  /v1/mandados/:id/accept    — runner accepts
 * PATCH  /v1/mandados/:id/start     — runner starts (IN_PROGRESS)
 * PATCH  /v1/mandados/:id/complete  — runner completes
 */

'use strict';

const http = require('http');
const { query } = require('../../shared/db');
const { verifyAccessToken } = require('../../shared/jwt');

const PORT = process.env.MANDADOS_PORT || 4009;

const FARES = { COMPRAS: 8, TRAMITE: 10, MENSAJERIA: 6, OTRO: 8 };

async function bootstrap() {
  await query(`
    CREATE TABLE IF NOT EXISTS mandado_requests (
      id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id           TEXT        NOT NULL,
      assignee_id       TEXT,
      type              TEXT        NOT NULL DEFAULT 'OTRO',
      description       TEXT        NOT NULL,
      pickup_address    TEXT,
      delivery_address  TEXT        NOT NULL,
      fare              NUMERIC(8,2) NOT NULL,
      status            TEXT        NOT NULL DEFAULT 'PENDING',
      notes             TEXT,
      created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
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

async function transition(id, newStatus, callerId) {
  const { rows } = await query('SELECT * FROM mandado_requests WHERE id=$1', [id]);
  if (!rows.length) throw Object.assign(new Error('Not found'), { status: 404 });
  const m = rows[0];
  if (newStatus === 'CANCELLED' && m.user_id !== callerId) {
    throw Object.assign(new Error('Forbidden'), { status: 403 });
  }
  const { rows: updated } = await query(
    `UPDATE mandado_requests SET status=$1, updated_at=now() WHERE id=$2 RETURNING *`,
    [newStatus, id]
  );
  return updated[0];
}

async function handleRequest(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const path = url.pathname;
  const method = req.method;

  try {
    if (method === 'POST' && path === '/v1/mandados') {
      const caller = requireAuth(req);
      const b = await readBody(req);
      const { type = 'OTRO', description, pickup_address, delivery_address, notes } = b;
      if (!description || !delivery_address) throw Object.assign(new Error('description and delivery_address required'), { status: 400 });
      const fare = FARES[type] || FARES.OTRO;
      const { rows } = await query(
        `INSERT INTO mandado_requests (user_id,type,description,pickup_address,delivery_address,fare,notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
        [caller.sub, type, description, pickup_address || null, delivery_address, fare, notes || null]
      );
      return json(res, 201, { mandado: rows[0] });
    }

    if (method === 'GET' && path === '/v1/mandados/active') {
      const caller = requireAuth(req);
      const { rows } = await query(
        `SELECT * FROM mandado_requests WHERE user_id=$1 AND status NOT IN ('DELIVERED','CANCELLED')
         ORDER BY created_at DESC LIMIT 1`,
        [caller.sub]
      );
      return json(res, 200, { mandado: rows[0] || null });
    }

    if (method === 'GET' && path === '/v1/mandados/history') {
      const caller = requireAuth(req);
      const limit = parseInt(url.searchParams.get('limit') || '20', 10);
      const { rows } = await query(
        `SELECT * FROM mandado_requests WHERE user_id=$1 ORDER BY created_at DESC LIMIT $2`,
        [caller.sub, limit]
      );
      return json(res, 200, { mandados: rows });
    }

    const idMatch = path.match(/^\/v1\/mandados\/([^/]+)$/);
    if (method === 'GET' && idMatch) {
      requireAuth(req);
      const { rows } = await query('SELECT * FROM mandado_requests WHERE id=$1', [idMatch[1]]);
      if (!rows.length) throw Object.assign(new Error('Not found'), { status: 404 });
      return json(res, 200, { mandado: rows[0] });
    }

    const cancelMatch = path.match(/^\/v1\/mandados\/([^/]+)\/cancel$/);
    if (method === 'POST' && cancelMatch) {
      const caller = requireAuth(req);
      const m = await transition(cancelMatch[1], 'CANCELLED', caller.sub);
      return json(res, 200, { mandado: m });
    }

    const acceptMatch = path.match(/^\/v1\/mandados\/([^/]+)\/accept$/);
    if (method === 'PATCH' && acceptMatch) {
      const caller = requireAuth(req);
      const { rows } = await query(
        `UPDATE mandado_requests SET assignee_id=$1, status='ACCEPTED', updated_at=now()
         WHERE id=$2 AND status='PENDING' RETURNING *`,
        [caller.sub, acceptMatch[1]]
      );
      if (!rows.length) throw Object.assign(new Error('Not available'), { status: 409 });
      return json(res, 200, { mandado: rows[0] });
    }

    const startMatch = path.match(/^\/v1\/mandados\/([^/]+)\/start$/);
    if (method === 'PATCH' && startMatch) {
      requireAuth(req);
      const { rows } = await query(
        `UPDATE mandado_requests SET status='IN_PROGRESS', updated_at=now()
         WHERE id=$1 AND status='ACCEPTED' RETURNING *`,
        [startMatch[1]]
      );
      if (!rows.length) throw Object.assign(new Error('Not in ACCEPTED state'), { status: 409 });
      return json(res, 200, { mandado: rows[0] });
    }

    const completeMatch = path.match(/^\/v1\/mandados\/([^/]+)\/complete$/);
    if (method === 'PATCH' && completeMatch) {
      requireAuth(req);
      const { rows } = await query(
        `UPDATE mandado_requests SET status='DELIVERED', updated_at=now()
         WHERE id=$1 AND status='IN_PROGRESS' RETURNING *`,
        [completeMatch[1]]
      );
      if (!rows.length) throw Object.assign(new Error('Not in progress'), { status: 409 });
      return json(res, 200, { mandado: rows[0] });
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
  .then(() => server.listen(PORT, () => console.log(`mandados service listening on :${PORT}`)))
  .catch(err => { console.error('bootstrap failed:', err); process.exit(1); });
