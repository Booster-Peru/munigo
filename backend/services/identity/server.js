const http = require('node:http');
const { URL } = require('node:url');
const crypto = require('node:crypto');
const { query } = require('../../shared/db');
const { createAccessToken, verifyAccessToken } = require('../../shared/jwt');

const PORT = Number(process.env.IDENTITY_PORT || 4001);
const REFRESH_TOKEN_TTL_DAYS = Number(process.env.REFRESH_TOKEN_TTL_DAYS || 30);

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

const createRefreshToken = () => crypto.randomBytes(48).toString('base64url');

const refreshTokenHash = (value) => crypto.createHash('sha256').update(String(value)).digest('hex');

const sanitizeUser = (row) => ({
  id: row.id,
  fullName: row.full_name,
  email: row.email,
  dni: row.dni,
  role: row.role,
  createdAt: row.created_at,
});

const createSession = async (user) => {
  const accessToken = createAccessToken({
    sub: user.id,
    role: user.role,
  });

  const refreshToken = createRefreshToken();
  const expiresAt = new Date(
    Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();

  await query(
    `
      INSERT INTO refresh_tokens (token_hash, user_id, expires_at)
      VALUES ($1, $2, $3)
    `,
    [refreshTokenHash(refreshToken), user.id, expiresAt],
  );

  return {
    user,
    accessToken,
    accessTokenExpiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    refreshToken,
  };
};

const hashPassword = (password) =>
  new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('hex');
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      resolve(`${salt}:${derivedKey.toString('hex')}`);
    });
  });

const verifyPassword = (password, storedHash) =>
  new Promise((resolve, reject) => {
    const [salt, key] = storedHash.split(':');
    if (!salt || !key) return resolve(false);
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      resolve(crypto.timingSafeEqual(Buffer.from(key, 'hex'), derivedKey));
    });
  });

const initDb = async () => {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY,
      dni TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'CITIZEN',
      full_name TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS refresh_tokens (
      token_hash TEXT PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TIMESTAMPTZ NOT NULL,
      revoked_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  // Optional operator seeding
  const operatorEmail = process.env.OPERATOR_EMAIL;
  const operatorPassword = process.env.OPERATOR_PASSWORD;
  if (operatorEmail && operatorPassword) {
    const existing = await query('SELECT id FROM users WHERE email = $1', [operatorEmail.toLowerCase()]);
    if (existing.rowCount === 0) {
      const hashed = await hashPassword(operatorPassword);
      await query(
        `
          INSERT INTO users (id, dni, email, password_hash, role, full_name)
          VALUES ($1, $2, $3, $4, 'OPERATOR', $5)
        `,
        [crypto.randomUUID(), '00000000', operatorEmail.toLowerCase(), hashed, 'MuniGo Admin']
      );
    }
  }
};

const parseBearerToken = (authorizationHeader) => {
  if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
    return null;
  }
  return authorizationHeader.slice('Bearer '.length);
};

const server = http.createServer(async (req, res) => {
  const requestUrl = new URL(req.url || '/', `http://${req.headers.host}`);

  if (requestUrl.pathname === '/health') {
    return json(res, 200, { service: 'identity', status: 'ok' });
  }

  if (req.method === 'POST' && requestUrl.pathname === '/v1/auth/register') {
    try {
      const body = await readJsonBody(req);
      if (!body.fullName || !body.email || !body.password || !body.dni) {
        return json(res, 400, { error: 'fullName, email, password and dni are required' });
      }

      const id = crypto.randomUUID();
      const fullName = String(body.fullName).trim();
      const email = String(body.email).trim().toLowerCase();
      const passwordHash = await hashPassword(body.password);
      const dni = String(body.dni).trim();

      const insert = await query(
        `
          INSERT INTO users (id, dni, email, full_name, role, password_hash)
          VALUES ($1, $2, $3, $4, 'CITIZEN', $5)
          RETURNING id, dni, email, full_name, role, created_at
        `,
        [id, dni, email, fullName, passwordHash],
      );

      const user = sanitizeUser(insert.rows[0]);
      return json(res, 201, await createSession(user));
    } catch (error) {
      if (String(error?.message || '').includes('duplicate key')) {
        return json(res, 409, { error: 'email or DNI already registered' });
      }
      return json(res, 400, { error: 'unable to register user' });
    }
  }

  if (req.method === 'POST' && requestUrl.pathname === '/v1/auth/login') {
    try {
      const body = await readJsonBody(req);
      const email = String(body.email || '')
        .trim()
        .toLowerCase();

      const userResult = await query(
        `
          SELECT id, dni, email, full_name, role, created_at, password_hash
          FROM users
          WHERE email = $1
          LIMIT 1
        `,
        [email],
      );

      if (userResult.rowCount === 0) {
        return json(res, 401, { error: 'invalid credentials' });
      }

      const user = userResult.rows[0];
      const isMatch = await verifyPassword(body.password, user.password_hash);

      if (!isMatch) {
        return json(res, 401, { error: 'invalid credentials' });
      }

      return json(res, 200, await createSession(sanitizeUser(user)));
    } catch {
      return json(res, 400, { error: 'unable to login' });
    }
  }

  if (req.method === 'POST' && requestUrl.pathname === '/v1/auth/refresh') {
    try {
      const body = await readJsonBody(req);
      if (!body.refreshToken) {
        return json(res, 400, { error: 'refreshToken is required' });
      }

      const tokenHash = refreshTokenHash(body.refreshToken);
      const tokenLookup = await query(
        `
          SELECT rt.user_id, rt.expires_at, rt.revoked_at, u.id, u.dni, u.email, u.full_name, u.role, u.created_at
          FROM refresh_tokens rt
          JOIN users u ON u.id = rt.user_id
          WHERE rt.token_hash = $1
          LIMIT 1
        `,
        [tokenHash],
      );

      if (tokenLookup.rowCount === 0) {
        return json(res, 401, { error: 'invalid refresh token' });
      }

      const tokenRow = tokenLookup.rows[0];
      if (tokenRow.revoked_at || new Date(tokenRow.expires_at).getTime() < Date.now()) {
        return json(res, 401, { error: 'refresh token expired or revoked' });
      }

      // Revoke the old one and create new session (refresh token rotation)
      await query('UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = $1', [tokenHash]);
      
      const user = sanitizeUser({
        id: tokenRow.id,
        dni: tokenRow.dni,
        email: tokenRow.email,
        full_name: tokenRow.full_name,
        role: tokenRow.role,
        created_at: tokenRow.created_at,
      });

      return json(res, 200, await createSession(user));
    } catch (error) {
      console.error(error);
      return json(res, 400, { error: 'unable to refresh token' });
    }
  }

  if (req.method === 'POST' && requestUrl.pathname === '/v1/auth/logout') {
    try {
      const body = await readJsonBody(req);
      if (!body.refreshToken) {
        return json(res, 400, { error: 'refreshToken is required' });
      }

      await query('UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = $1', [
        refreshTokenHash(body.refreshToken),
      ]);
      return json(res, 200, { ok: true });
    } catch {
      return json(res, 400, { error: 'unable to logout' });
    }
  }

  if (req.method === 'GET' && requestUrl.pathname === '/v1/auth/me') {
    const token = parseBearerToken(req.headers.authorization || '');
    if (!token) {
      return json(res, 401, { error: 'missing bearer token' });
    }

    try {
      const payload = verifyAccessToken(token);
      const lookup = await query(
        `
          SELECT id, dni, email, full_name, role, created_at
          FROM users
          WHERE id = $1
          LIMIT 1
        `,
        [payload.sub],
      );

      if (lookup.rowCount === 0) {
        return json(res, 404, { error: 'user not found' });
      }

      return json(res, 200, { user: sanitizeUser(lookup.rows[0]) });
    } catch {
      return json(res, 401, { error: 'invalid token' });
    }
  }

  return json(res, 404, { error: 'route not found', path: requestUrl.pathname });
});

initDb()
  .then(() => {
    server.listen(PORT, () => {
      process.stdout.write(`Identity service listening on ${PORT}\n`);
    });
  })
  .catch((error) => {
    process.stderr.write(`Identity service failed to start: ${error.message}\n`);
    process.exit(1);
  });
