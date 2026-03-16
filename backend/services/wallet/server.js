/**
 * MuniGo Wallet Service — Puerto 4006
 *
 * Maneja el dinero de la plataforma como ESCROW:
 * - Ciudadano paga → plataforma retiene en escrow
 * - Servicio completado → plataforma libera al partner (menos comisión)
 * - Cancelación → plataforma devuelve al ciudadano
 *
 * Regla anti-fraude: NUNCA hay transferencia directa cliente↔partner.
 * Todo pasa por este servicio con audit trail inmutable.
 */

const http = require('node:http');
const { URL } = require('node:url');
const crypto = require('node:crypto');
const { query } = require('../../shared/db');
const { verifyAccessToken } = require('../../shared/jwt');

const PORT = Number(process.env.WALLET_PORT || 4006);
const PLATFORM_FEE_DEFAULT = Number(process.env.PLATFORM_FEE_PERCENT || 10); // 10% por defecto

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
      try { resolve(JSON.parse(data)); }
      catch { reject(new Error('Invalid JSON')); }
    });
    req.on('error', reject);
  });

const parseBearerToken = (authHeader) => {
  if (!authHeader?.startsWith('Bearer ')) return null;
  return authHeader.slice('Bearer '.length);
};

const requireAuth = (req, res) => {
  const token = parseBearerToken(req.headers.authorization);
  if (!token) { json(res, 401, { error: 'authentication required' }); return null; }
  const payload = verifyAccessToken(token);
  if (!payload) { json(res, 401, { error: 'invalid or expired token' }); return null; }
  return payload;
};

const initDb = async () => {
  await query(`
    CREATE TABLE IF NOT EXISTS wallets (
      user_id UUID PRIMARY KEY,
      balance DECIMAL(12,2) NOT NULL DEFAULT 0.00,
      currency VARCHAR(3) NOT NULL DEFAULT 'PEN',
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS wallet_transactions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL,
      type VARCHAR(20) NOT NULL,
      amount DECIMAL(12,2) NOT NULL,
      balance_after DECIMAL(12,2) NOT NULL,
      description TEXT,
      reference_id VARCHAR(100),
      reference_type VARCHAR(30),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      metadata JSONB NOT NULL DEFAULT '{}'
    )
  `);

  await query(`
    CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user
    ON wallet_transactions(user_id, created_at DESC)
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS escrow_holds (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      payer_user_id UUID NOT NULL,
      beneficiary_user_id UUID NOT NULL,
      amount DECIMAL(12,2) NOT NULL,
      platform_fee DECIMAL(12,2) NOT NULL,
      net_amount DECIMAL(12,2) NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'HELD',
      reference_id VARCHAR(100) NOT NULL,
      reference_type VARCHAR(30) NOT NULL,
      held_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      released_at TIMESTAMPTZ,
      metadata JSONB NOT NULL DEFAULT '{}'
    )
  `);

  await query(`
    CREATE INDEX IF NOT EXISTS idx_escrow_reference
    ON escrow_holds(reference_id, reference_type)
  `);
};

// Helper: obtener o crear wallet
const getOrCreateWallet = async (userId) => {
  let result = await query('SELECT * FROM wallets WHERE user_id = $1', [userId]);
  if (result.rowCount === 0) {
    result = await query(
      'INSERT INTO wallets(user_id) VALUES($1) RETURNING *',
      [userId]
    );
  }
  return result.rows[0];
};

// Helper: registrar transacción (APPEND ONLY — nunca se borra)
const recordTransaction = async (userId, type, amount, balanceAfter, description, referenceId, referenceType, metadata = {}) => {
  await query(
    `INSERT INTO wallet_transactions(user_id, type, amount, balance_after, description, reference_id, reference_type, metadata)
     VALUES($1,$2,$3,$4,$5,$6,$7,$8)`,
    [userId, type, amount, balanceAfter, description, referenceId || null, referenceType || null, JSON.stringify(metadata)]
  );
};

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host}`);

  // Health check (público)
  if (url.pathname === '/health') {
    return json(res, 200, { service: 'wallet', status: 'ok' });
  }

  // GET /v1/wallet — saldo + últimas transacciones
  if (req.method === 'GET' && url.pathname === '/v1/wallet') {
    const auth = requireAuth(req, res);
    if (!auth) return;
    try {
      const wallet = await getOrCreateWallet(auth.sub);
      const txResult = await query(
        `SELECT id, type, amount, balance_after, description, reference_id, reference_type, created_at
         FROM wallet_transactions WHERE user_id = $1
         ORDER BY created_at DESC LIMIT 20`,
        [auth.sub]
      );
      return json(res, 200, {
        balance: parseFloat(wallet.balance),
        currency: wallet.currency,
        transactions: txResult.rows,
      });
    } catch {
      return json(res, 500, { error: 'unable to fetch wallet' });
    }
  }

  // POST /v1/wallet/credit — acreditar saldo (recarga)
  if (req.method === 'POST' && url.pathname === '/v1/wallet/credit') {
    const auth = requireAuth(req, res);
    if (!auth) return;
    try {
      const body = await readJsonBody(req);
      const amount = parseFloat(body.amount);
      if (!amount || amount <= 0) return json(res, 400, { error: 'amount must be positive' });

      const result = await query(
        `UPDATE wallets SET balance = balance + $1, updated_at = NOW()
         WHERE user_id = $2 RETURNING balance`,
        [amount, auth.sub]
      );
      if (result.rowCount === 0) {
        await query('INSERT INTO wallets(user_id, balance) VALUES($1, $2)', [auth.sub, amount]);
      }
      const newBalance = parseFloat(result.rows[0]?.balance || amount);
      await recordTransaction(auth.sub, 'CREDIT', amount, newBalance,
        body.description || 'Recarga MuniGo', body.reference_id, 'RECHARGE',
        { payment_method: body.payment_method });
      return json(res, 200, { balance: newBalance, credited: amount });
    } catch {
      return json(res, 500, { error: 'unable to credit wallet' });
    }
  }

  // POST /v1/wallet/debit — debitar saldo
  if (req.method === 'POST' && url.pathname === '/v1/wallet/debit') {
    const auth = requireAuth(req, res);
    if (!auth) return;
    try {
      const body = await readJsonBody(req);
      const amount = parseFloat(body.amount);
      if (!amount || amount <= 0) return json(res, 400, { error: 'amount must be positive' });

      const wallet = await getOrCreateWallet(auth.sub);
      if (parseFloat(wallet.balance) < amount) {
        return json(res, 422, { error: 'insufficient balance' });
      }
      const result = await query(
        `UPDATE wallets SET balance = balance - $1, updated_at = NOW()
         WHERE user_id = $2 RETURNING balance`,
        [amount, auth.sub]
      );
      const newBalance = parseFloat(result.rows[0].balance);
      await recordTransaction(auth.sub, 'DEBIT', -amount, newBalance,
        body.description, body.reference_id, body.reference_type);
      return json(res, 200, { balance: newBalance, debited: amount });
    } catch {
      return json(res, 500, { error: 'unable to debit wallet' });
    }
  }

  // POST /v1/wallet/escrow/hold — retener dinero para un servicio
  if (req.method === 'POST' && url.pathname === '/v1/wallet/escrow/hold') {
    const auth = requireAuth(req, res);
    if (!auth) return;
    try {
      const body = await readJsonBody(req);
      const amount = parseFloat(body.amount);
      const feePercent = parseFloat(body.platform_fee_percent || PLATFORM_FEE_DEFAULT);
      if (!amount || amount <= 0) return json(res, 400, { error: 'amount must be positive' });
      if (!body.beneficiary_user_id) return json(res, 400, { error: 'beneficiary_user_id required' });
      if (!body.reference_id || !body.reference_type) return json(res, 400, { error: 'reference_id and reference_type required' });

      const wallet = await getOrCreateWallet(auth.sub);
      if (parseFloat(wallet.balance) < amount) {
        return json(res, 422, { error: 'insufficient balance' });
      }

      const platformFee = parseFloat((amount * feePercent / 100).toFixed(2));
      const netAmount = parseFloat((amount - platformFee).toFixed(2));

      // Debitar del pagador
      const debitResult = await query(
        `UPDATE wallets SET balance = balance - $1, updated_at = NOW() WHERE user_id = $2 RETURNING balance`,
        [amount, auth.sub]
      );
      const newBalance = parseFloat(debitResult.rows[0].balance);

      // Crear hold de escrow
      const holdResult = await query(
        `INSERT INTO escrow_holds(payer_user_id, beneficiary_user_id, amount, platform_fee, net_amount, reference_id, reference_type)
         VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
        [auth.sub, body.beneficiary_user_id, amount, platformFee, netAmount, body.reference_id, body.reference_type]
      );

      await recordTransaction(auth.sub, 'ESCROW_HOLD', -amount, newBalance,
        `Pago retenido para ${body.reference_type}`, body.reference_id, body.reference_type,
        { escrow_id: holdResult.rows[0].id });

      return json(res, 201, {
        escrow_id: holdResult.rows[0].id,
        amount,
        platform_fee: platformFee,
        net_amount: netAmount,
        payer_balance: newBalance,
      });
    } catch {
      return json(res, 500, { error: 'unable to create escrow hold' });
    }
  }

  // POST /v1/wallet/escrow/release — liberar escrow al partner post-servicio
  if (req.method === 'POST' && url.pathname === '/v1/wallet/escrow/release') {
    const auth = requireAuth(req, res);
    if (!auth) return;
    // Solo SUPER_ADMIN o sistema interno puede liberar escrow
    if (auth.role !== 'SUPER_ADMIN' && auth.role !== 'OPERATOR') {
      return json(res, 403, { error: 'insufficient permissions' });
    }
    try {
      const body = await readJsonBody(req);
      if (!body.escrow_id) return json(res, 400, { error: 'escrow_id required' });

      const holdResult = await query(
        `SELECT * FROM escrow_holds WHERE id = $1 AND status = 'HELD'`,
        [body.escrow_id]
      );
      if (holdResult.rowCount === 0) {
        return json(res, 404, { error: 'escrow hold not found or already processed' });
      }
      const hold = holdResult.rows[0];

      // Acreditar net_amount al beneficiario (partner)
      await query(
        `INSERT INTO wallets(user_id, balance) VALUES($1, $2)
         ON CONFLICT(user_id) DO UPDATE SET balance = wallets.balance + $2, updated_at = NOW()`,
        [hold.beneficiary_user_id, hold.net_amount]
      );

      const beneficiaryWallet = await query(
        'SELECT balance FROM wallets WHERE user_id = $1', [hold.beneficiary_user_id]
      );
      const beneficiaryBalance = parseFloat(beneficiaryWallet.rows[0]?.balance || hold.net_amount);

      await recordTransaction(hold.beneficiary_user_id, 'ESCROW_RELEASE', hold.net_amount,
        beneficiaryBalance, `Pago recibido por ${hold.reference_type}`,
        hold.reference_id, hold.reference_type,
        { escrow_id: hold.id, platform_fee: hold.platform_fee });

      // Marcar escrow como liberado
      await query(
        `UPDATE escrow_holds SET status = 'RELEASED', released_at = NOW() WHERE id = $1`,
        [hold.id]
      );

      return json(res, 200, {
        released: true,
        net_amount_released: hold.net_amount,
        platform_fee_retained: hold.platform_fee,
      });
    } catch {
      return json(res, 500, { error: 'unable to release escrow' });
    }
  }

  // POST /v1/wallet/escrow/refund — devolver escrow al ciudadano (cancelación)
  if (req.method === 'POST' && url.pathname === '/v1/wallet/escrow/refund') {
    const auth = requireAuth(req, res);
    if (!auth) return;
    if (auth.role !== 'SUPER_ADMIN' && auth.role !== 'OPERATOR') {
      return json(res, 403, { error: 'insufficient permissions' });
    }
    try {
      const body = await readJsonBody(req);
      if (!body.escrow_id) return json(res, 400, { error: 'escrow_id required' });

      const holdResult = await query(
        `SELECT * FROM escrow_holds WHERE id = $1 AND status = 'HELD'`,
        [body.escrow_id]
      );
      if (holdResult.rowCount === 0) {
        return json(res, 404, { error: 'escrow hold not found or already processed' });
      }
      const hold = holdResult.rows[0];

      // Devolver monto COMPLETO al pagador
      const refundResult = await query(
        `UPDATE wallets SET balance = balance + $1, updated_at = NOW() WHERE user_id = $2 RETURNING balance`,
        [hold.amount, hold.payer_user_id]
      );
      const payerBalance = parseFloat(refundResult.rows[0].balance);

      await recordTransaction(hold.payer_user_id, 'ESCROW_REFUND', hold.amount,
        payerBalance, `Reembolso por ${body.reason || 'cancelación'}`,
        hold.reference_id, hold.reference_type, { escrow_id: hold.id });

      await query(
        `UPDATE escrow_holds SET status = 'REFUNDED', released_at = NOW() WHERE id = $1`,
        [hold.id]
      );

      return json(res, 200, { refunded: true, amount_refunded: hold.amount });
    } catch {
      return json(res, 500, { error: 'unable to refund escrow' });
    }
  }

  // GET /v1/wallet/transactions — historial paginado
  if (req.method === 'GET' && url.pathname === '/v1/wallet/transactions') {
    const auth = requireAuth(req, res);
    if (!auth) return;
    try {
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 50);
      const offset = (page - 1) * limit;
      const typeFilter = url.searchParams.get('type');

      const conditions = ['user_id = $1'];
      const params = [auth.sub];
      if (typeFilter) {
        conditions.push(`type = $${params.length + 1}`);
        params.push(typeFilter);
      }

      const result = await query(
        `SELECT id, type, amount, balance_after, description, reference_id, reference_type, created_at
         FROM wallet_transactions WHERE ${conditions.join(' AND ')}
         ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        [...params, limit, offset]
      );
      return json(res, 200, { transactions: result.rows, page, limit });
    } catch {
      return json(res, 500, { error: 'unable to fetch transactions' });
    }
  }

  return json(res, 404, { error: 'not found' });
});

initDb()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`[wallet] listening on :${PORT}`);
    });
  })
  .catch((err) => {
    console.error('[wallet] init failed', err);
    process.exit(1);
  });
