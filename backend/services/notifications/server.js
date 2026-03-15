const http = require('node:http');
const { URL } = require('node:url');
const crypto = require('node:crypto');
const { query } = require('../../shared/db');
const { verifyAccessToken } = require('../../shared/auth');

const PORT = Number(process.env.NOTIFICATIONS_PORT || 4004);

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

const initDb = async () => {
  await query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id UUID PRIMARY KEY,
      user_id UUID NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      channel TEXT NOT NULL,
      metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      delivered_at TIMESTAMPTZ
    )
  `);
};

const rowToNotification = (row) => ({
  id: row.id,
  userId: row.user_id,
  title: row.title,
  message: row.message,
  channel: row.channel,
  metadata: row.metadata,
  createdAt: row.created_at,
  deliveredAt: row.delivered_at,
});

const server = http.createServer(async (req, res) => {
  const requestUrl = new URL(req.url || '/', `http://${req.headers.host}`);

  if (requestUrl.pathname === '/health') {
    return json(res, 200, { service: 'notifications', status: 'ok' });
  }

  // Auth Middleware
  const auth = verifyAccessToken(req.headers.authorization);

  if (req.method === 'POST' && requestUrl.pathname === '/v1/notifications/push') {
    // Internal pushing doesn't require user token if coming from internal mesh,
    // but here we allow Officers or the system to push.
    if (!auth || (auth.role !== 'Officer' && auth.role !== 'Admin')) {
      return json(res, 403, { error: 'forbidden' });
    }

    try {
      const body = await readJsonBody(req);
      if (!body.userId || !body.title || !body.message) {
        return json(res, 400, { error: 'userId, title and message are required' });
      }

      const id = crypto.randomUUID();
      const result = await query(
        `
          INSERT INTO notifications (id, user_id, title, message, channel, metadata)
          VALUES ($1, $2, $3, $4, $5, $6::jsonb)
          RETURNING id, user_id, title, message, channel, metadata, created_at, delivered_at
        `,
        [
          id,
          body.userId,
          String(body.title),
          String(body.message),
          body.channel ? String(body.channel) : 'push',
          JSON.stringify(body.metadata || {}),
        ],
      );

      return json(res, 202, { accepted: true, notification: rowToNotification(result.rows[0]) });
    } catch (err) {
      return json(res, 400, { error: err.message || 'invalid request' });
    }
  }

  if (req.method === 'GET' && requestUrl.pathname === '/v1/notifications') {
    if (!auth) return json(res, 401, { error: 'unauthorized' });

    let userId = auth.userId;
    // Admins/Officers can query other users' notifications
    if ((auth.role === 'Admin' || auth.role === 'Officer') && requestUrl.searchParams.get('userId')) {
      userId = requestUrl.searchParams.get('userId');
    }

    const status = requestUrl.searchParams.get('status');
    const clauses = [`user_id = $1`];
    const params = [userId];

    if (status === 'pending') clauses.push('delivered_at IS NULL');
    if (status === 'delivered') clauses.push('delivered_at IS NOT NULL');

    const result = await query(
      `
        SELECT id, user_id, title, message, channel, metadata, created_at, delivered_at
        FROM notifications
        WHERE ${clauses.join(' AND ')}
        ORDER BY created_at DESC
        LIMIT 100
      `,
      params,
    );

    const items = result.rows.map(rowToNotification);
    return json(res, 200, { items, total: items.length });
  }

  if (req.method === 'PATCH' && /^\/v1\/notifications\/[^/]+\/deliver$/.test(requestUrl.pathname)) {
    if (!auth) return json(res, 401, { error: 'unauthorized' });

    const id = requestUrl.pathname.split('/')[3];
    const updated = await query(
      `
        UPDATE notifications
        SET delivered_at = NOW()
        WHERE id = $1 AND (user_id = $2 OR $3 = 'Admin')
        RETURNING id, user_id, title, message, channel, metadata, created_at, delivered_at
      `,
      [id, auth.userId, auth.role],
    );

    if (updated.rowCount === 0) {
      return json(res, 404, { error: 'notification not found or access denied' });
    }

    return json(res, 200, rowToNotification(updated.rows[0]));
  }

  return json(res, 404, { error: 'route not found' });
});

initDb()
  .then(() => {
    server.listen(PORT, () => {
      process.stdout.write(`Notifications service listening on ${PORT}\n`);
    });
  })
  .catch((error) => {
    process.stderr.write(`Notifications service failed to start: ${error.message}\n`);
    process.exit(1);
  });
