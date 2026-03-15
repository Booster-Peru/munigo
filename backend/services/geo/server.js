const http = require('node:http');
const { URL } = require('node:url');
const { query } = require('../../shared/db');
const { verifyAccessToken } = require('../../shared/auth');

const PORT = Number(process.env.GEO_PORT || 4003);

const PERU_BBOX = {
  minLat: -18.5,
  maxLat: -0.03,
  minLng: -81.5,
  maxLng: -68.6,
};

const seedZones = [
  {
    zoneId: 'LIM-LIMA-MIRAFLORES',
    department: 'Lima',
    province: 'Lima',
    district: 'Miraflores',
    latitude: -12.1211,
    longitude: -77.0297,
  },
  {
    zoneId: 'LIM-LIMA-SJM',
    department: 'Lima',
    province: 'Lima',
    district: 'San Juan de Miraflores',
    latitude: -12.1589,
    longitude: -76.9683,
  },
  {
    zoneId: 'ARE-AREQUIPA-CERCADO',
    department: 'Arequipa',
    province: 'Arequipa',
    district: 'Cercado',
    latitude: -16.3989,
    longitude: -71.535,
  },
];

const json = (res, statusCode, payload) => {
  res.writeHead(statusCode, { 'content-type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
};

const readJsonBody = (req) =>
  new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > 1_000_000) reject(new Error('Payload too large'));
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

const isInsidePeru = (latitude, longitude) =>
  latitude >= PERU_BBOX.minLat &&
  latitude <= PERU_BBOX.maxLat &&
  longitude >= PERU_BBOX.minLng &&
  longitude <= PERU_BBOX.maxLng;

const estimateDistance = (a, b) => {
  const dLat = a.latitude - b.latitude;
  const dLng = a.longitude - b.longitude;
  return Math.sqrt(dLat * dLat + dLng * dLng);
};

const initDb = async () => {
  await query(`
    CREATE TABLE IF NOT EXISTS geo_zones (
      zone_id TEXT PRIMARY KEY,
      department TEXT NOT NULL,
      province TEXT NOT NULL,
      district TEXT NOT NULL,
      latitude DOUBLE PRECISION NOT NULL,
      longitude DOUBLE PRECISION NOT NULL
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS geo_resolution_logs (
      id BIGSERIAL PRIMARY KEY,
      latitude DOUBLE PRECISION NOT NULL,
      longitude DOUBLE PRECISION NOT NULL,
      inside_peru BOOLEAN NOT NULL,
      resolved_zone_id TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  for (const zone of seedZones) {
    await query(
      `
        INSERT INTO geo_zones (zone_id, department, province, district, latitude, longitude)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (zone_id) DO NOTHING
      `,
      [zone.zoneId, zone.department, zone.province, zone.district, zone.latitude, zone.longitude],
    );
  }
};

const resolveNearestZone = async (latitude, longitude) => {
  const result = await query(
    `
      SELECT zone_id, department, province, district, latitude, longitude
      FROM geo_zones
    `,
  );

  const point = { latitude, longitude };
  const best = result.rows
    .map((zone) => ({
      zone,
      score: estimateDistance(point, {
        latitude: zone.latitude,
        longitude: zone.longitude,
      }),
    }))
    .sort((left, right) => left.score - right.score)[0];

  if (!best) return null;

  return {
    zoneId: best.zone.zone_id,
    department: best.zone.department,
    province: best.zone.province,
    district: best.zone.district,
  };
};

const server = http.createServer(async (req, res) => {
  const requestUrl = new URL(req.url || '/', `http://${req.headers.host}`);

  if (requestUrl.pathname === '/health') {
    return json(res, 200, { service: 'geo', status: 'ok' });
  }

  // Geo validation is public (to help frontend)
  if (req.method === 'POST' && requestUrl.pathname === '/v1/geo/validate-peru') {
    try {
      const body = await readJsonBody(req);
      const latitude = Number(body.latitude);
      const longitude = Number(body.longitude);

      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        return json(res, 400, { error: 'latitude and longitude are required numeric values' });
      }

      return json(res, 200, {
        isInsidePeru: isInsidePeru(latitude, longitude),
        latitude,
        longitude,
      });
    } catch {
      return json(res, 400, { error: 'invalid request' });
    }
  }

  // Auth Middleware for sensitive routes
  const auth = verifyAccessToken(req.headers.authorization);

  if (req.method === 'POST' && requestUrl.pathname === '/v1/geo/resolve') {
    if (!auth) return json(res, 401, { error: 'unauthorized' });

    try {
      const body = await readJsonBody(req);
      const latitude = Number(body.latitude);
      const longitude = Number(body.longitude);

      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        return json(res, 400, { error: 'latitude and longitude are required numeric values' });
      }

      const insidePeru = isInsidePeru(latitude, longitude);
      const zone = await resolveNearestZone(latitude, longitude);

      await query(
        `
          INSERT INTO geo_resolution_logs (latitude, longitude, inside_peru, resolved_zone_id)
          VALUES ($1, $2, $3, $4)
        `,
        [latitude, longitude, insidePeru, zone?.zoneId || null],
      );

      return json(res, 200, {
        latitude,
        longitude,
        insidePeru,
        zone,
      });
    } catch {
      return json(res, 400, { error: 'invalid request' });
    }
  }

  return json(res, 404, { error: 'route not found' });
});

initDb()
  .then(() => {
    server.listen(PORT, () => {
      process.stdout.write(`Geo service listening on ${PORT}\n`);
    });
  })
  .catch((error) => {
    process.stderr.write(`Geo service failed to start: ${error.message}\n`);
    process.exit(1);
  });
