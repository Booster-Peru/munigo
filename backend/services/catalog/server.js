/**
 * MuniGo — Catalog Microservice (port 4007)
 *
 * Restaurants:
 *   GET  /v1/catalog/restaurants           — list (with filters)
 *   GET  /v1/catalog/restaurants/:id        — detail + menu
 *   POST /v1/catalog/restaurants            — create (OPERATOR/SUPER_ADMIN)
 *   PUT  /v1/catalog/restaurants/:id        — update (owner OPERATOR)
 *
 * Menu items:
 *   GET  /v1/catalog/restaurants/:id/menu   — list items
 *   POST /v1/catalog/restaurants/:id/menu   — add item (owner OPERATOR)
 *   PUT  /v1/catalog/menu/:itemId           — update item
 *   DELETE /v1/catalog/menu/:itemId         — remove item
 *
 * Stores:
 *   GET  /v1/catalog/stores                 — list
 *   GET  /v1/catalog/stores/:id             — detail + products
 *   POST /v1/catalog/stores                 — create (OPERATOR/SUPER_ADMIN)
 *
 * Products:
 *   GET  /v1/catalog/stores/:id/products    — list
 *   POST /v1/catalog/stores/:id/products    — add product (owner OPERATOR)
 *   PUT  /v1/catalog/products/:productId    — update product
 */

'use strict';

const http = require('http');
const { query } = require('../../shared/db');
const { verifyAccessToken } = require('../../shared/jwt');

const PORT = process.env.CATALOG_PORT || 4007;

// ─── DB bootstrap ────────────────────────────────────────────────────────────

async function bootstrap() {
  await query(`
    CREATE TABLE IF NOT EXISTS restaurants (
      id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
      name          TEXT        NOT NULL,
      category      TEXT        NOT NULL DEFAULT 'Restaurante',
      description   TEXT,
      photo_url     TEXT,
      address       TEXT,
      lat           NUMERIC(10,7),
      lng           NUMERIC(10,7),
      open_time     TEXT        DEFAULT '08:00',
      close_time    TEXT        DEFAULT '22:00',
      is_active     BOOLEAN     NOT NULL DEFAULT true,
      owner_user_id TEXT,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS menu_items (
      id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
      restaurant_id UUID        NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
      name          TEXT        NOT NULL,
      description   TEXT,
      price         NUMERIC(8,2) NOT NULL,
      photo_url     TEXT,
      is_available  BOOLEAN     NOT NULL DEFAULT true,
      category      TEXT        DEFAULT 'Principal',
      created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS stores (
      id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
      name          TEXT        NOT NULL,
      category      TEXT        NOT NULL DEFAULT 'Bodega',
      description   TEXT,
      photo_url     TEXT,
      address       TEXT,
      lat           NUMERIC(10,7),
      lng           NUMERIC(10,7),
      is_active     BOOLEAN     NOT NULL DEFAULT true,
      owner_user_id TEXT,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS products (
      id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
      store_id    UUID        NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
      name        TEXT        NOT NULL,
      description TEXT,
      price       NUMERIC(8,2) NOT NULL,
      photo_url   TEXT,
      stock       INTEGER     NOT NULL DEFAULT 0,
      category    TEXT        DEFAULT 'General',
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);

  // Seed demo data if empty
  const { rows } = await query('SELECT id FROM restaurants LIMIT 1');
  if (!rows.length) await seedDemoData();
}

async function seedDemoData() {
  const r1 = await query(
    `INSERT INTO restaurants (name, category, description, address, lat, lng, open_time, close_time)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
    ['Frutos del Mar', 'Comida de mar', 'La mejor cevichería de Canoas', 'Jr. Los Peces 123, Canoas', -3.982, -80.958, '10:00', '21:00']
  );
  const r2 = await query(
    `INSERT INTO restaurants (name, category, description, address, lat, lng)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
    ['El Buen Sabor', 'Criollo', 'Almuerzos criollos caseros', 'Av. Principal 45, Canoas', -3.981, -80.957]
  );
  const r3 = await query(
    `INSERT INTO restaurants (name, category, description, address, lat, lng)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
    ['Pizzería El Faro', 'Rápida', 'Pizza y pastas al paso', 'Calle del Faro 8, Canoas', -3.983, -80.956]
  );

  const rid1 = r1.rows[0].id, rid2 = r2.rows[0].id, rid3 = r3.rows[0].id;

  await query(`INSERT INTO menu_items (restaurant_id, name, description, price, category) VALUES
    ($1,'Ceviche Mixto','Ceviche de pescado y mariscos con leche de tigre',28.00,'Entradas'),
    ($1,'Arroz con Mariscos','Arroz meloso con mariscos frescos',32.00,'Fondos'),
    ($1,'Chicharrón de Pescado','Pescado frito crocante con yuca',22.00,'Entradas'),
    ($1,'Limonada','Limonada fresca con hierbabuena',6.00,'Bebidas')
  `, [rid1]);

  await query(`INSERT INTO menu_items (restaurant_id, name, description, price, category) VALUES
    ($1,'Menú del Día','Sopa + segundo + refresco',12.00,'Menú'),
    ($1,'Lomo Saltado','Lomo saltado con papas fritas y arroz',22.00,'Fondos'),
    ($1,'Causa Limeña','Causa rellena de atún o pollo',14.00,'Entradas'),
    ($1,'Chicha Morada','Chicha morada casera',5.00,'Bebidas')
  `, [rid2]);

  await query(`INSERT INTO menu_items (restaurant_id, name, description, price, category) VALUES
    ($1,'Pizza Margarita','Masa artesanal, salsa de tomate, mozzarella',22.00,'Pizzas'),
    ($1,'Pizza Pepperoni','Con extra pepperoni y queso',26.00,'Pizzas'),
    ($1,'Pasta Alfredo','Fettuccine con salsa alfredo y pollo',18.00,'Pastas'),
    ($1,'Gaseosa Personal','Inca Kola o Coca Cola',5.00,'Bebidas')
  `, [rid3]);

  const s1 = await query(
    `INSERT INTO stores (name, category, description, address, lat, lng)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
    ['SIAR Supermarket', 'Supermercado', 'El supermercado más completo de Canoas', 'Av. Comercial 200, Canoas', -3.980, -80.955]
  );
  await query(`INSERT INTO products (store_id, name, description, price, stock, category) VALUES
    ($1,'Arroz Extra Añejo 5kg','Arroz extra calidad premium',18.50,50,'Abarrotes'),
    ($1,'Aceite Vegetal 1L','Aceite de girasol',8.00,30,'Abarrotes'),
    ($1,'Leche Gloria Evaporada','Tarro de 410g',4.50,100,'Lácteos'),
    ($1,'Pollo Entero (kg)','Pollo fresco del día',9.00,20,'Carnes')
  `, [s1.rows[0].id]);
}

// ─── Auth middleware ──────────────────────────────────────────────────────────

function getCallerOptional(req) {
  try { return requireAuth(req); } catch { return null; }
}

function requireAuth(req) {
  const header = req.headers['authorization'] || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw Object.assign(new Error('Unauthorized'), { status: 401 });
  try { return verifyAccessToken(token); }
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

// ─── Router ───────────────────────────────────────────────────────────────────

async function handleRequest(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const path = url.pathname;
  const method = req.method;

  try {
    // ── Restaurants ──────────────────────────────────────────────────────────

    // GET /v1/catalog/restaurants
    if (method === 'GET' && path === '/v1/catalog/restaurants') {
      const category = url.searchParams.get('category');
      const search = url.searchParams.get('search');
      let q = 'SELECT * FROM restaurants WHERE is_active = true';
      const params = [];
      if (category) { params.push(category); q += ` AND category ILIKE $${params.length}`; }
      if (search)   { params.push(`%${search}%`); q += ` AND (name ILIKE $${params.length} OR description ILIKE $${params.length})`; }
      q += ' ORDER BY name';
      const { rows } = await query(q, params);
      return json(res, 200, { restaurants: rows });
    }

    // GET /v1/catalog/restaurants/:id
    const rDetailMatch = path.match(/^\/v1\/catalog\/restaurants\/([^/]+)$/);
    if (method === 'GET' && rDetailMatch) {
      const { rows: r } = await query('SELECT * FROM restaurants WHERE id=$1', [rDetailMatch[1]]);
      if (!r.length) throw Object.assign(new Error('Restaurant not found'), { status: 404 });
      const { rows: items } = await query('SELECT * FROM menu_items WHERE restaurant_id=$1 ORDER BY category, name', [rDetailMatch[1]]);
      return json(res, 200, { restaurant: r[0], menu: items });
    }

    // POST /v1/catalog/restaurants
    if (method === 'POST' && path === '/v1/catalog/restaurants') {
      const caller = requireAuth(req);
      if (!['OPERATOR','SUPER_ADMIN'].includes(caller.role)) throw Object.assign(new Error('Forbidden'), { status: 403 });
      const b = await readBody(req);
      const { name, category, description, photo_url, address, lat, lng, open_time, close_time } = b;
      if (!name) throw Object.assign(new Error('name required'), { status: 400 });
      const { rows } = await query(
        `INSERT INTO restaurants (name,category,description,photo_url,address,lat,lng,open_time,close_time,owner_user_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
        [name, category||'Restaurante', description||null, photo_url||null, address||null, lat||null, lng||null, open_time||'08:00', close_time||'22:00', caller.sub]
      );
      return json(res, 201, { restaurant: rows[0] });
    }

    // PUT /v1/catalog/restaurants/:id
    const rUpdateMatch = path.match(/^\/v1\/catalog\/restaurants\/([^/]+)$/);
    if (method === 'PUT' && rUpdateMatch) {
      const caller = requireAuth(req);
      const b = await readBody(req);
      const { name, category, description, is_active, open_time, close_time } = b;
      const { rows } = await query(
        `UPDATE restaurants SET
           name=COALESCE($1,name), category=COALESCE($2,category),
           description=COALESCE($3,description), is_active=COALESCE($4,is_active),
           open_time=COALESCE($5,open_time), close_time=COALESCE($6,close_time)
         WHERE id=$7 AND (owner_user_id=$8 OR $9='SUPER_ADMIN') RETURNING *`,
        [name||null, category||null, description||null, is_active??null, open_time||null, close_time||null, rUpdateMatch[1], caller.sub, caller.role]
      );
      if (!rows.length) throw Object.assign(new Error('Not found or forbidden'), { status: 404 });
      return json(res, 200, { restaurant: rows[0] });
    }

    // ── Menu items ────────────────────────────────────────────────────────────

    // GET /v1/catalog/restaurants/:id/menu
    const menuListMatch = path.match(/^\/v1\/catalog\/restaurants\/([^/]+)\/menu$/);
    if (method === 'GET' && menuListMatch) {
      const { rows } = await query(
        'SELECT * FROM menu_items WHERE restaurant_id=$1 ORDER BY category, name',
        [menuListMatch[1]]
      );
      return json(res, 200, { items: rows });
    }

    // POST /v1/catalog/restaurants/:id/menu
    if (method === 'POST' && menuListMatch) {
      const caller = requireAuth(req);
      const b = await readBody(req);
      const { name, description, price, photo_url, category } = b;
      if (!name || price == null) throw Object.assign(new Error('name and price required'), { status: 400 });
      const { rows } = await query(
        `INSERT INTO menu_items (restaurant_id,name,description,price,photo_url,category)
         VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
        [menuListMatch[1], name, description||null, price, photo_url||null, category||'Principal']
      );
      return json(res, 201, { item: rows[0] });
    }

    // PUT /v1/catalog/menu/:itemId
    const menuUpdateMatch = path.match(/^\/v1\/catalog\/menu\/([^/]+)$/);
    if (method === 'PUT' && menuUpdateMatch) {
      requireAuth(req);
      const b = await readBody(req);
      const { name, description, price, is_available, category } = b;
      const { rows } = await query(
        `UPDATE menu_items SET
           name=COALESCE($1,name), description=COALESCE($2,description),
           price=COALESCE($3,price), is_available=COALESCE($4,is_available),
           category=COALESCE($5,category)
         WHERE id=$6 RETURNING *`,
        [name||null, description||null, price??null, is_available??null, category||null, menuUpdateMatch[1]]
      );
      if (!rows.length) throw Object.assign(new Error('Item not found'), { status: 404 });
      return json(res, 200, { item: rows[0] });
    }

    // DELETE /v1/catalog/menu/:itemId
    if (method === 'DELETE' && menuUpdateMatch) {
      requireAuth(req);
      await query('DELETE FROM menu_items WHERE id=$1', [menuUpdateMatch[1]]);
      return json(res, 200, { ok: true });
    }

    // ── Stores ────────────────────────────────────────────────────────────────

    // GET /v1/catalog/stores
    if (method === 'GET' && path === '/v1/catalog/stores') {
      const category = url.searchParams.get('category');
      let q = 'SELECT * FROM stores WHERE is_active = true';
      const params = [];
      if (category) { params.push(category); q += ` AND category ILIKE $${params.length}`; }
      q += ' ORDER BY name';
      const { rows } = await query(q, params);
      return json(res, 200, { stores: rows });
    }

    // GET /v1/catalog/stores/:id
    const sDetailMatch = path.match(/^\/v1\/catalog\/stores\/([^/]+)$/);
    if (method === 'GET' && sDetailMatch) {
      const { rows: s } = await query('SELECT * FROM stores WHERE id=$1', [sDetailMatch[1]]);
      if (!s.length) throw Object.assign(new Error('Store not found'), { status: 404 });
      const { rows: products } = await query('SELECT * FROM products WHERE store_id=$1 ORDER BY category, name', [sDetailMatch[1]]);
      return json(res, 200, { store: s[0], products });
    }

    // POST /v1/catalog/stores
    if (method === 'POST' && path === '/v1/catalog/stores') {
      const caller = requireAuth(req);
      if (!['OPERATOR','SUPER_ADMIN'].includes(caller.role)) throw Object.assign(new Error('Forbidden'), { status: 403 });
      const b = await readBody(req);
      const { name, category, description, photo_url, address, lat, lng } = b;
      if (!name) throw Object.assign(new Error('name required'), { status: 400 });
      const { rows } = await query(
        `INSERT INTO stores (name,category,description,photo_url,address,lat,lng,owner_user_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
        [name, category||'Bodega', description||null, photo_url||null, address||null, lat||null, lng||null, caller.sub]
      );
      return json(res, 201, { store: rows[0] });
    }

    // ── Products ──────────────────────────────────────────────────────────────

    // GET /v1/catalog/stores/:id/products
    const prodListMatch = path.match(/^\/v1\/catalog\/stores\/([^/]+)\/products$/);
    if (method === 'GET' && prodListMatch) {
      const { rows } = await query('SELECT * FROM products WHERE store_id=$1 ORDER BY category, name', [prodListMatch[1]]);
      return json(res, 200, { products: rows });
    }

    // POST /v1/catalog/stores/:id/products
    if (method === 'POST' && prodListMatch) {
      requireAuth(req);
      const b = await readBody(req);
      const { name, description, price, photo_url, stock, category } = b;
      if (!name || price == null) throw Object.assign(new Error('name and price required'), { status: 400 });
      const { rows } = await query(
        `INSERT INTO products (store_id,name,description,price,photo_url,stock,category)
         VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
        [prodListMatch[1], name, description||null, price, photo_url||null, stock||0, category||'General']
      );
      return json(res, 201, { product: rows[0] });
    }

    // PUT /v1/catalog/products/:productId
    const prodUpdateMatch = path.match(/^\/v1\/catalog\/products\/([^/]+)$/);
    if (method === 'PUT' && prodUpdateMatch) {
      requireAuth(req);
      const b = await readBody(req);
      const { name, description, price, stock, category } = b;
      const { rows } = await query(
        `UPDATE products SET
           name=COALESCE($1,name), description=COALESCE($2,description),
           price=COALESCE($3,price), stock=COALESCE($4,stock), category=COALESCE($5,category)
         WHERE id=$6 RETURNING *`,
        [name||null, description||null, price??null, stock??null, category||null, prodUpdateMatch[1]]
      );
      if (!rows.length) throw Object.assign(new Error('Product not found'), { status: 404 });
      return json(res, 200, { product: rows[0] });
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
  .then(() => server.listen(PORT, () => console.log(`catalog service listening on :${PORT}`)))
  .catch(err => { console.error('bootstrap failed:', err); process.exit(1); });
