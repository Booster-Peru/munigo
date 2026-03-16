/**
 * MuniGo — Transport Microservice (port 4005)
 *
 * Endpoints:
 *   POST   /v1/transport/request          — citizen requests a trip
 *   GET    /v1/transport/active           — get citizen's active trip
 *   GET    /v1/transport/history          — citizen trip history
 *   PATCH  /v1/transport/:id/accept       — driver accepts trip
 *   PATCH  /v1/transport/:id/start        — driver starts trip
 *   PATCH  /v1/transport/:id/complete     — driver completes trip
 *   PATCH  /v1/transport/:id/cancel       — cancel trip (citizen or driver)
 *   PUT    /v1/transport/driver/location  — driver updates location
 *   GET    /v1/transport/driver/nearby    — get nearby available drivers
 *   GET    /v1/transport/driver/trips     — driver trip history
 *   WS     /v1/transport/track/:tripId    — real-time tracking
 */

'use strict';

const http = require('http');
const { WebSocketServer } = require('ws');
const { query } = require('../../shared/db');
const { verifyAccessToken } = require('../../shared/jwt');

const PORT = process.env.TRANSPORT_PORT || 4005;
const FARES = { standard: 5.0, premium: 8.0 };

// ─── DB bootstrap ──────────────────────────────────────────────────────────

async function bootstrap() {
  await query(`
    CREATE TABLE IF NOT EXISTS trips (
      id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
      citizen_id    TEXT        NOT NULL,
      driver_id     TEXT,
      origin_lat    NUMERIC(10,7) NOT NULL,
      origin_lng    NUMERIC(10,7) NOT NULL,
      dest_lat      NUMERIC(10,7) NOT NULL,
      dest_lng      NUMERIC(10,7) NOT NULL,
      origin_label  TEXT,
      dest_label    TEXT,
      type          TEXT        NOT NULL DEFAULT 'standard',
      status        TEXT        NOT NULL DEFAULT 'pending',
      fare          NUMERIC(8,2) NOT NULL,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS driver_locations (
      driver_id    TEXT        PRIMARY KEY,
      latitude     NUMERIC(10,7) NOT NULL,
      longitude    NUMERIC(10,7) NOT NULL,
      is_available BOOLEAN     NOT NULL DEFAULT false,
      updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
}

// ─── Auth middleware ────────────────────────────────────────────────────────

function requireAuth(req) {
  const header = req.headers['authorization'] || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw Object.assign(new Error('Unauthorized'), { status: 401 });
  try {
    return verifyAccessToken(token);
  } catch {
    throw Object.assign(new Error('Unauthorized'), { status: 401 });
  }
}

// ─── HTTP helpers ───────────────────────────────────────────────────────────

function json(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) });
  res.end(payload);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => { data += chunk; });
    req.on('end', () => {
      try { resolve(data ? JSON.parse(data) : {}); }
      catch { reject(Object.assign(new Error('Invalid JSON'), { status: 400 })); }
    });
    req.on('error', reject);
  });
}

// ─── Route handlers ─────────────────────────────────────────────────────────

async function handleRequest(req, res) {
  const url = new URL(req.url, `http://localhost`);
  const path = url.pathname;
  const method = req.method;

  try {
    // POST /v1/transport/request
    if (method === 'POST' && path === '/v1/transport/request') {
      const caller = requireAuth(req);
      if (caller.role !== 'CITIZEN') throw Object.assign(new Error('Forbidden'), { status: 403 });
      const body = await readBody(req);
      const { origin_lat, origin_lng, dest_lat, dest_lng, origin_label, dest_label, type = 'standard' } = body;
      if (!origin_lat || !origin_lng || !dest_lat || !dest_lng) {
        throw Object.assign(new Error('origin and destination required'), { status: 400 });
      }
      if (!FARES[type]) throw Object.assign(new Error('invalid trip type'), { status: 400 });
      const fare = FARES[type];

      const result = await query(
        `INSERT INTO trips (citizen_id, origin_lat, origin_lng, dest_lat, dest_lng, origin_label, dest_label, type, fare)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
        [caller.sub, origin_lat, origin_lng, dest_lat, dest_lng, origin_label || null, dest_label || null, type, fare]
      );
      return json(res, 201, { trip: result.rows[0] });
    }

    // GET /v1/transport/active
    if (method === 'GET' && path === '/v1/transport/active') {
      const caller = requireAuth(req);
      const field = caller.role === 'DRIVER' ? 'driver_id' : 'citizen_id';
      const result = await query(
        `SELECT * FROM trips WHERE ${field} = $1 AND status NOT IN ('completed','cancelled') ORDER BY created_at DESC LIMIT 1`,
        [caller.sub]
      );
      return json(res, 200, { trip: result.rows[0] || null });
    }

    // GET /v1/transport/history
    if (method === 'GET' && path === '/v1/transport/history') {
      const caller = requireAuth(req);
      const limit = parseInt(url.searchParams.get('limit') || '20', 10);
      const offset = parseInt(url.searchParams.get('offset') || '0', 10);
      const result = await query(
        `SELECT * FROM trips WHERE citizen_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
        [caller.sub, limit, offset]
      );
      return json(res, 200, { trips: result.rows });
    }

    // GET /v1/transport/driver/trips
    if (method === 'GET' && path === '/v1/transport/driver/trips') {
      const caller = requireAuth(req);
      if (caller.role !== 'DRIVER') throw Object.assign(new Error('Forbidden'), { status: 403 });
      const limit = parseInt(url.searchParams.get('limit') || '20', 10);
      const offset = parseInt(url.searchParams.get('offset') || '0', 10);
      const result = await query(
        `SELECT * FROM trips WHERE driver_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
        [caller.sub, limit, offset]
      );
      return json(res, 200, { trips: result.rows });
    }

    // PATCH /v1/transport/:id/accept
    const acceptMatch = path.match(/^\/v1\/transport\/([^/]+)\/accept$/);
    if (method === 'PATCH' && acceptMatch) {
      const caller = requireAuth(req);
      if (caller.role !== 'DRIVER') throw Object.assign(new Error('Forbidden'), { status: 403 });
      const { rows } = await query(
        `UPDATE trips SET driver_id=$1, status='accepted', updated_at=now()
         WHERE id=$2 AND status='pending' RETURNING *`,
        [caller.sub, acceptMatch[1]]
      );
      if (!rows.length) throw Object.assign(new Error('Trip not available'), { status: 409 });
      broadcastTripUpdate(rows[0]);
      return json(res, 200, { trip: rows[0] });
    }

    // PATCH /v1/transport/:id/start
    const startMatch = path.match(/^\/v1\/transport\/([^/]+)\/start$/);
    if (method === 'PATCH' && startMatch) {
      const caller = requireAuth(req);
      if (caller.role !== 'DRIVER') throw Object.assign(new Error('Forbidden'), { status: 403 });
      const { rows } = await query(
        `UPDATE trips SET status='in_progress', updated_at=now()
         WHERE id=$1 AND driver_id=$2 AND status='accepted' RETURNING *`,
        [startMatch[1], caller.sub]
      );
      if (!rows.length) throw Object.assign(new Error('Trip not found or not accepted'), { status: 409 });
      broadcastTripUpdate(rows[0]);
      return json(res, 200, { trip: rows[0] });
    }

    // PATCH /v1/transport/:id/complete
    const completeMatch = path.match(/^\/v1\/transport\/([^/]+)\/complete$/);
    if (method === 'PATCH' && completeMatch) {
      const caller = requireAuth(req);
      if (caller.role !== 'DRIVER') throw Object.assign(new Error('Forbidden'), { status: 403 });
      const { rows } = await query(
        `UPDATE trips SET status='completed', updated_at=now()
         WHERE id=$1 AND driver_id=$2 AND status='in_progress' RETURNING *`,
        [completeMatch[1], caller.sub]
      );
      if (!rows.length) throw Object.assign(new Error('Trip not found or not in progress'), { status: 409 });
      broadcastTripUpdate(rows[0]);
      return json(res, 200, { trip: rows[0] });
    }

    // PATCH /v1/transport/:id/cancel
    const cancelMatch = path.match(/^\/v1\/transport\/([^/]+)\/cancel$/);
    if (method === 'PATCH' && cancelMatch) {
      const caller = requireAuth(req);
      const { rows } = await query(
        `UPDATE trips SET status='cancelled', updated_at=now()
         WHERE id=$1 AND (citizen_id=$2 OR driver_id=$2) AND status NOT IN ('completed','cancelled') RETURNING *`,
        [cancelMatch[1], caller.sub]
      );
      if (!rows.length) throw Object.assign(new Error('Trip not found or already closed'), { status: 409 });
      broadcastTripUpdate(rows[0]);
      return json(res, 200, { trip: rows[0] });
    }

    // PUT /v1/transport/driver/location
    if (method === 'PUT' && path === '/v1/transport/driver/location') {
      const caller = requireAuth(req);
      if (caller.role !== 'DRIVER') throw Object.assign(new Error('Forbidden'), { status: 403 });
      const body = await readBody(req);
      const { latitude, longitude, is_available } = body;
      if (latitude == null || longitude == null) {
        throw Object.assign(new Error('latitude and longitude required'), { status: 400 });
      }
      await query(
        `INSERT INTO driver_locations (driver_id, latitude, longitude, is_available, updated_at)
         VALUES ($1,$2,$3,$4,now())
         ON CONFLICT (driver_id) DO UPDATE
           SET latitude=$2, longitude=$3, is_available=$4, updated_at=now()`,
        [caller.sub, latitude, longitude, is_available !== false]
      );
      broadcastDriverLocation(caller.sub, latitude, longitude);
      return json(res, 200, { ok: true });
    }

    // GET /v1/transport/driver/nearby
    if (method === 'GET' && path === '/v1/transport/driver/nearby') {
      requireAuth(req);
      const { rows } = await query(
        `SELECT driver_id, latitude, longitude, updated_at FROM driver_locations
         WHERE is_available = true AND updated_at > now() - interval '5 minutes'`
      );
      return json(res, 200, { drivers: rows });
    }

    json(res, 404, { error: 'Not found' });
  } catch (err) {
    const status = err.status || 500;
    if (status === 500) console.error(err);
    json(res, status, { error: err.message });
  }
}

// ─── WebSocket tracking ─────────────────────────────────────────────────────

// tripClients: Map<tripId, Set<ws>>
// driverClients: Map<driverId, Set<ws>>
const tripClients = new Map();
const driverClients = new Map();

function broadcastTripUpdate(trip) {
  const clients = tripClients.get(trip.id);
  if (!clients) return;
  const msg = JSON.stringify({ type: 'trip_update', trip });
  for (const ws of clients) {
    if (ws.readyState === 1) ws.send(msg);
  }
}

function broadcastDriverLocation(driverId, latitude, longitude) {
  const clients = driverClients.get(driverId);
  if (!clients) return;
  const msg = JSON.stringify({ type: 'driver_location', driverId, latitude, longitude });
  for (const ws of clients) {
    if (ws.readyState === 1) ws.send(msg);
  }
}

function setupWebSocket(server) {
  const wss = new WebSocketServer({ server, path: '/v1/transport/track' });

  wss.on('connection', (ws, req) => {
    const url = new URL(req.url, 'http://localhost');
    const tripId = url.searchParams.get('tripId');
    const driverIdParam = url.searchParams.get('driverId');

    if (tripId) {
      if (!tripClients.has(tripId)) tripClients.set(tripId, new Set());
      tripClients.get(tripId).add(ws);
      ws.on('close', () => {
        const s = tripClients.get(tripId);
        if (s) { s.delete(ws); if (!s.size) tripClients.delete(tripId); }
      });
    }

    if (driverIdParam) {
      if (!driverClients.has(driverIdParam)) driverClients.set(driverIdParam, new Set());
      driverClients.get(driverIdParam).add(ws);
      ws.on('close', () => {
        const s = driverClients.get(driverIdParam);
        if (s) { s.delete(ws); if (!s.size) driverClients.delete(driverIdParam); }
      });
    }

    ws.on('message', async (raw) => {
      try {
        const msg = JSON.parse(raw.toString());
        // Driver sends location updates over WS
        if (msg.type === 'location' && msg.driverId) {
          broadcastDriverLocation(msg.driverId, msg.latitude, msg.longitude);
        }
      } catch { /* ignore malformed */ }
    });
  });
}

// ─── Start ──────────────────────────────────────────────────────────────────

const server = http.createServer(handleRequest);
setupWebSocket(server);

bootstrap()
  .then(() => {
    server.listen(PORT, () => console.log(`transport service listening on :${PORT}`));
  })
  .catch((err) => {
    console.error('bootstrap failed:', err);
    process.exit(1);
  });
