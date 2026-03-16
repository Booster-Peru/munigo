/**
 * MuniGo — Orders Microservice (port 4008)
 *
 * States: PENDING → ACCEPTED → PREPARING → READY → DELIVERING → DELIVERED | CANCELLED
 *
 * Citizen:
 *   POST /v1/orders                    — place order
 *   GET  /v1/orders/active             — active order
 *   GET  /v1/orders/history            — past orders
 *   GET  /v1/orders/:id                — order detail
 *   POST /v1/orders/:id/cancel         — cancel (only if PENDING)
 *
 * Operator:
 *   GET  /v1/orders/operator/pending   — incoming orders for my restaurant/store
 *   PATCH /v1/orders/:id/accept        — accept
 *   PATCH /v1/orders/:id/preparing     — mark as preparing
 *   PATCH /v1/orders/:id/ready         — mark as ready
 *   PATCH /v1/orders/:id/delivering    — mark as delivering
 *   PATCH /v1/orders/:id/delivered     — mark as delivered
 */

'use strict';

const http = require('http');
const { query } = require('../../shared/db');
const { verifyAccessToken } = require('../../shared/jwt');

const PORT = process.env.ORDERS_PORT || 4008;

// ─── DB bootstrap ─────────────────────────────────────────────────────────────

async function bootstrap() {
  await query(`
    CREATE TABLE IF NOT EXISTS orders (
      id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id          TEXT        NOT NULL,
      source_type      TEXT        NOT NULL,  -- RESTAURANT | STORE
      source_id        UUID        NOT NULL,
      items            JSONB       NOT NULL DEFAULT '[]',
      subtotal         NUMERIC(8,2) NOT NULL,
      delivery_fee     NUMERIC(8,2) NOT NULL DEFAULT 3.00,
      total            NUMERIC(8,2) NOT NULL,
      status           TEXT        NOT NULL DEFAULT 'PENDING',
      delivery_address TEXT,
      notes            TEXT,
      created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

function requireAuth(req) {
  const header = req.headers['authorization'] || '';
  const t = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!t) throw Object.assign(new Error('Unauthorized'), { status: 401 });
  try { return verifyAccessToken(t); }
  catch { throw Object.assign(new Error('Unauthorized'), { status: 401 }); }
}

// ─── HTTP helpers ─────────────────────────────────────────────────────────────

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

// ─── Transition guard ─────────────────────────────────────────────────────────

const ALLOWED_TRANSITIONS = {
  PENDING:    ['ACCEPTED', 'CANCELLED'],
  ACCEPTED:   ['PREPARING', 'CANCELLED'],
  PREPARING:  ['READY'],
  READY:      ['DELIVERING'],
  DELIVERING: ['DELIVERED'],
};

function assertTransition(current, next) {
  if (!ALLOWED_TRANSITIONS[current]?.includes(next)) {
    throw Object.assign(
      new Error(`Cannot transition from ${current} to ${next}`),
      { status: 409 }
    );
  }
}

async function transitionOrder(id, newStatus, actorId, actorRole) {
  const { rows } = await query('SELECT * FROM orders WHERE id=$1', [id]);
  if (!rows.length) throw Object.assign(new Error('Order not found'), { status: 404 });
  const order = rows[0];

  // Only the ordering citizen can cancel a PENDING order
  if (newStatus === 'CANCELLED' && order.status === 'PENDING' && order.user_id !== actorId) {
    throw Object.assign(new Error('Forbidden'), { status: 403 });
  }
  // Operator transitions require OPERATOR or SUPER_ADMIN role
  if (!['CANCELLED'].includes(newStatus) && !['OPERATOR','SUPER_ADMIN'].includes(actorRole)) {
    if (order.user_id !== actorId) throw Object.assign(new Error('Forbidden'), { status: 403 });
  }

  assertTransition(order.status, newStatus);

  const { rows: updated } = await query(
    `UPDATE orders SET status=$1, updated_at=now() WHERE id=$2 RETURNING *`,
    [newStatus, id]
  );
  return updated[0];
}

// ─── Router ───────────────────────────────────────────────────────────────────

async function handleRequest(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const path = url.pathname;
  const method = req.method;

  try {
    // POST /v1/orders — place order
    if (method === 'POST' && path === '/v1/orders') {
      const caller = requireAuth(req);
      const b = await readBody(req);
      const { source_type, source_id, items, delivery_address, notes } = b;

      if (!source_type || !source_id || !Array.isArray(items) || !items.length) {
        throw Object.assign(new Error('source_type, source_id and items required'), { status: 400 });
      }
      if (!['RESTAURANT','STORE'].includes(source_type)) {
        throw Object.assign(new Error('source_type must be RESTAURANT or STORE'), { status: 400 });
      }

      const subtotal = items.reduce((s, item) => s + (item.unit_price * item.quantity), 0);
      const delivery_fee = 3.00;
      const total = subtotal + delivery_fee;

      const { rows } = await query(
        `INSERT INTO orders (user_id, source_type, source_id, items, subtotal, delivery_fee, total, delivery_address, notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
        [caller.sub, source_type, source_id, JSON.stringify(items), subtotal, delivery_fee, total, delivery_address||null, notes||null]
      );
      return json(res, 201, { order: rows[0] });
    }

    // GET /v1/orders/active
    if (method === 'GET' && path === '/v1/orders/active') {
      const caller = requireAuth(req);
      const { rows } = await query(
        `SELECT * FROM orders WHERE user_id=$1 AND status NOT IN ('DELIVERED','CANCELLED')
         ORDER BY created_at DESC LIMIT 1`,
        [caller.sub]
      );
      return json(res, 200, { order: rows[0] || null });
    }

    // GET /v1/orders/history
    if (method === 'GET' && path === '/v1/orders/history') {
      const caller = requireAuth(req);
      const limit = parseInt(url.searchParams.get('limit') || '20', 10);
      const offset = parseInt(url.searchParams.get('offset') || '0', 10);
      const { rows } = await query(
        `SELECT * FROM orders WHERE user_id=$1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
        [caller.sub, limit, offset]
      );
      return json(res, 200, { orders: rows });
    }

    // GET /v1/orders/operator/pending — for operator to see incoming orders
    if (method === 'GET' && path === '/v1/orders/operator/pending') {
      const caller = requireAuth(req);
      if (!['OPERATOR','SUPER_ADMIN'].includes(caller.role)) {
        throw Object.assign(new Error('Forbidden'), { status: 403 });
      }
      const source_id = url.searchParams.get('source_id');
      if (!source_id) throw Object.assign(new Error('source_id required'), { status: 400 });
      const { rows } = await query(
        `SELECT * FROM orders WHERE source_id=$1 AND status NOT IN ('DELIVERED','CANCELLED')
         ORDER BY created_at ASC`,
        [source_id]
      );
      return json(res, 200, { orders: rows });
    }

    // GET /v1/orders/:id
    const orderMatch = path.match(/^\/v1\/orders\/([^/]+)$/);
    if (method === 'GET' && orderMatch && !['active','history'].includes(orderMatch[1])) {
      const caller = requireAuth(req);
      const { rows } = await query('SELECT * FROM orders WHERE id=$1', [orderMatch[1]]);
      if (!rows.length) throw Object.assign(new Error('Order not found'), { status: 404 });
      if (rows[0].user_id !== caller.sub && !['OPERATOR','SUPER_ADMIN'].includes(caller.role)) {
        throw Object.assign(new Error('Forbidden'), { status: 403 });
      }
      return json(res, 200, { order: rows[0] });
    }

    // POST /v1/orders/:id/cancel
    const cancelMatch = path.match(/^\/v1\/orders\/([^/]+)\/cancel$/);
    if (method === 'POST' && cancelMatch) {
      const caller = requireAuth(req);
      const order = await transitionOrder(cancelMatch[1], 'CANCELLED', caller.sub, caller.role);
      return json(res, 200, { order });
    }

    // PATCH /v1/orders/:id/:status (operator transitions)
    const statusMatch = path.match(/^\/v1\/orders\/([^/]+)\/(accept|preparing|ready|delivering|delivered)$/);
    if (method === 'PATCH' && statusMatch) {
      const caller = requireAuth(req);
      const statusMap = {
        accept: 'ACCEPTED', preparing: 'PREPARING',
        ready: 'READY', delivering: 'DELIVERING', delivered: 'DELIVERED',
      };
      const order = await transitionOrder(statusMatch[1], statusMap[statusMatch[2]], caller.sub, caller.role);
      return json(res, 200, { order });
    }

    json(res, 404, { error: 'Not found' });
  } catch (err) {
    const status = err.status || 500;
    if (status === 500) console.error(err);
    json(res, status, { error: err.message });
  }
}

// ─── Start ────────────────────────────────────────────────────────────────────

const server = http.createServer(handleRequest);
bootstrap()
  .then(() => server.listen(PORT, () => console.log(`orders service listening on :${PORT}`)))
  .catch(err => { console.error('bootstrap failed:', err); process.exit(1); });
