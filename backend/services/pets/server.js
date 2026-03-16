/**
 * MuniGo — Mascotas Microservice (port 4010)
 *
 * Municipal pet adoption & lost-pet registry
 *
 * POST   /v1/pets                   — register pet (shelter/admin)
 * GET    /v1/pets                   — list available pets (filter: type, status)
 * GET    /v1/pets/:id               — pet detail
 * PATCH  /v1/pets/:id               — update pet info (owner only)
 * DELETE /v1/pets/:id               — remove listing (owner only)
 * POST   /v1/pets/:id/adopt         — citizen requests adoption
 * GET    /v1/pets/my/listings       — pets created by caller
 * GET    /v1/pets/my/adoptions      — adoption requests by caller
 *
 * Lost pet flow (separate table):
 * POST   /v1/lost                   — report lost pet
 * GET    /v1/lost                   — list lost reports
 * GET    /v1/lost/:id               — detail
 * PATCH  /v1/lost/:id/found         — mark as found
 */

'use strict';

const http = require('http');
const { query } = require('../../shared/db');
const { verifyAccessToken } = require('../../shared/jwt');

const PORT = process.env.PETS_PORT || 4010;

async function bootstrap() {
  await query(`
    CREATE TABLE IF NOT EXISTS pets (
      id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
      owner_id      TEXT        NOT NULL,
      name          TEXT        NOT NULL,
      species       TEXT        NOT NULL DEFAULT 'PERRO',
      breed         TEXT,
      age_months    INTEGER,
      gender        TEXT        NOT NULL DEFAULT 'UNKNOWN',
      description   TEXT,
      photo_url     TEXT,
      status        TEXT        NOT NULL DEFAULT 'AVAILABLE',
      created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
  await query(`
    CREATE TABLE IF NOT EXISTS adoption_requests (
      id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
      pet_id      UUID        NOT NULL REFERENCES pets(id),
      user_id     TEXT        NOT NULL,
      message     TEXT,
      status      TEXT        NOT NULL DEFAULT 'PENDING',
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
  await query(`
    CREATE TABLE IF NOT EXISTS lost_pets (
      id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
      reporter_id   TEXT        NOT NULL,
      name          TEXT,
      species       TEXT        NOT NULL DEFAULT 'PERRO',
      description   TEXT        NOT NULL,
      last_seen_at  TEXT,
      last_seen_loc TEXT,
      contact       TEXT        NOT NULL,
      photo_url     TEXT,
      found         BOOLEAN     NOT NULL DEFAULT false,
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
    // POST /v1/pets — create listing
    if (method === 'POST' && path === '/v1/pets') {
      const caller = requireAuth(req);
      const b = await readBody(req);
      const { name, species = 'PERRO', breed, age_months, gender = 'UNKNOWN', description, photo_url } = b;
      if (!name) throw Object.assign(new Error('name required'), { status: 400 });
      const { rows } = await query(
        `INSERT INTO pets (owner_id,name,species,breed,age_months,gender,description,photo_url)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
        [caller.sub, name, species, breed || null, age_months || null, gender, description || null, photo_url || null]
      );
      return json(res, 201, { pet: rows[0] });
    }

    // GET /v1/pets/my/listings
    if (method === 'GET' && path === '/v1/pets/my/listings') {
      const caller = requireAuth(req);
      const { rows } = await query(
        `SELECT * FROM pets WHERE owner_id=$1 ORDER BY created_at DESC`,
        [caller.sub]
      );
      return json(res, 200, { pets: rows });
    }

    // GET /v1/pets/my/adoptions
    if (method === 'GET' && path === '/v1/pets/my/adoptions') {
      const caller = requireAuth(req);
      const { rows } = await query(
        `SELECT ar.*, p.name AS pet_name, p.species, p.photo_url
         FROM adoption_requests ar JOIN pets p ON p.id = ar.pet_id
         WHERE ar.user_id=$1 ORDER BY ar.created_at DESC`,
        [caller.sub]
      );
      return json(res, 200, { adoptions: rows });
    }

    // GET /v1/pets — list available
    if (method === 'GET' && path === '/v1/pets') {
      const species = url.searchParams.get('species');
      const status = url.searchParams.get('status') || 'AVAILABLE';
      const limit = parseInt(url.searchParams.get('limit') || '20', 10);
      let q = `SELECT * FROM pets WHERE status=$1`;
      const params = [status];
      if (species) { q += ` AND species=$2`; params.push(species); }
      q += ` ORDER BY created_at DESC LIMIT $${params.length + 1}`;
      params.push(limit);
      const { rows } = await query(q, params);
      return json(res, 200, { pets: rows });
    }

    // PATCH /v1/pets/:id — update
    const petIdMatch = path.match(/^\/v1\/pets\/([^/]+)$/);
    if (method === 'PATCH' && petIdMatch) {
      const caller = requireAuth(req);
      const b = await readBody(req);
      const { rows: existing } = await query('SELECT * FROM pets WHERE id=$1', [petIdMatch[1]]);
      if (!existing.length) throw Object.assign(new Error('Not found'), { status: 404 });
      if (existing[0].owner_id !== caller.sub) throw Object.assign(new Error('Forbidden'), { status: 403 });
      const { name, breed, age_months, gender, description, photo_url, status } = b;
      const { rows } = await query(
        `UPDATE pets SET
           name=COALESCE($1,name), breed=COALESCE($2,breed),
           age_months=COALESCE($3,age_months), gender=COALESCE($4,gender),
           description=COALESCE($5,description), photo_url=COALESCE($6,photo_url),
           status=COALESCE($7,status), updated_at=now()
         WHERE id=$8 RETURNING *`,
        [name||null, breed||null, age_months||null, gender||null, description||null, photo_url||null, status||null, petIdMatch[1]]
      );
      return json(res, 200, { pet: rows[0] });
    }

    // DELETE /v1/pets/:id
    if (method === 'DELETE' && petIdMatch) {
      const caller = requireAuth(req);
      const { rows } = await query('SELECT * FROM pets WHERE id=$1', [petIdMatch[1]]);
      if (!rows.length) throw Object.assign(new Error('Not found'), { status: 404 });
      if (rows[0].owner_id !== caller.sub) throw Object.assign(new Error('Forbidden'), { status: 403 });
      await query('DELETE FROM pets WHERE id=$1', [petIdMatch[1]]);
      return json(res, 200, { ok: true });
    }

    // GET /v1/pets/:id
    if (method === 'GET' && petIdMatch) {
      requireAuth(req);
      const { rows } = await query('SELECT * FROM pets WHERE id=$1', [petIdMatch[1]]);
      if (!rows.length) throw Object.assign(new Error('Not found'), { status: 404 });
      return json(res, 200, { pet: rows[0] });
    }

    // POST /v1/pets/:id/adopt
    const adoptMatch = path.match(/^\/v1\/pets\/([^/]+)\/adopt$/);
    if (method === 'POST' && adoptMatch) {
      const caller = requireAuth(req);
      const b = await readBody(req);
      const { rows: petRows } = await query('SELECT * FROM pets WHERE id=$1', [adoptMatch[1]]);
      if (!petRows.length) throw Object.assign(new Error('Not found'), { status: 404 });
      if (petRows[0].status !== 'AVAILABLE') throw Object.assign(new Error('Pet not available'), { status: 409 });
      const { rows } = await query(
        `INSERT INTO adoption_requests (pet_id, user_id, message) VALUES ($1,$2,$3) RETURNING *`,
        [adoptMatch[1], caller.sub, b.message || null]
      );
      return json(res, 201, { adoption: rows[0] });
    }

    // Lost pet routes
    if (method === 'POST' && path === '/v1/lost') {
      const caller = requireAuth(req);
      const b = await readBody(req);
      const { name, species = 'PERRO', description, last_seen_at, last_seen_loc, contact, photo_url } = b;
      if (!description || !contact) throw Object.assign(new Error('description and contact required'), { status: 400 });
      const { rows } = await query(
        `INSERT INTO lost_pets (reporter_id,name,species,description,last_seen_at,last_seen_loc,contact,photo_url)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
        [caller.sub, name||null, species, description, last_seen_at||null, last_seen_loc||null, contact, photo_url||null]
      );
      return json(res, 201, { lost: rows[0] });
    }

    if (method === 'GET' && path === '/v1/lost') {
      const limit = parseInt(url.searchParams.get('limit') || '20', 10);
      const { rows } = await query(
        `SELECT * FROM lost_pets WHERE found=false ORDER BY created_at DESC LIMIT $1`,
        [limit]
      );
      return json(res, 200, { lost: rows });
    }

    const lostIdMatch = path.match(/^\/v1\/lost\/([^/]+)$/);
    if (method === 'GET' && lostIdMatch) {
      const { rows } = await query('SELECT * FROM lost_pets WHERE id=$1', [lostIdMatch[1]]);
      if (!rows.length) throw Object.assign(new Error('Not found'), { status: 404 });
      return json(res, 200, { lost: rows[0] });
    }

    const foundMatch = path.match(/^\/v1\/lost\/([^/]+)\/found$/);
    if (method === 'PATCH' && foundMatch) {
      requireAuth(req);
      const { rows } = await query(
        `UPDATE lost_pets SET found=true, updated_at=now() WHERE id=$1 RETURNING *`,
        [foundMatch[1]]
      );
      if (!rows.length) throw Object.assign(new Error('Not found'), { status: 404 });
      return json(res, 200, { lost: rows[0] });
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
  .then(() => server.listen(PORT, () => console.log(`pets service listening on :${PORT}`)))
  .catch(err => { console.error('bootstrap failed:', err); process.exit(1); });
