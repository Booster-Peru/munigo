const crypto = require('node:crypto');

const base64UrlEncode = (value) => Buffer.from(value).toString('base64url');

const base64UrlDecode = (value) => Buffer.from(value, 'base64url').toString('utf8');

const getJwtSecret = () => process.env.JWT_SECRET || 'change-me-in-production';

const sign = (input) =>
  crypto.createHmac('sha256', getJwtSecret()).update(input).digest('base64url');

const createAccessToken = ({ sub, role }, ttlSeconds = 15 * 60) => {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub,
    role,
    type: 'access',
    iat: now,
    exp: now + ttlSeconds,
  };

  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = sign(`${encodedHeader}.${encodedPayload}`);
  return `${encodedHeader}.${encodedPayload}.${signature}`;
};

const verifyAccessToken = (token) => {
  if (!token || typeof token !== 'string') {
    throw new Error('invalid token');
  }

  const [encodedHeader, encodedPayload, signature] = token.split('.');
  if (!encodedHeader || !encodedPayload || !signature) {
    throw new Error('invalid token');
  }

  const expectedSignature = sign(`${encodedHeader}.${encodedPayload}`);
  if (!timingSafeCompare(expectedSignature, signature)) {
    throw new Error('invalid signature');
  }

  const payload = JSON.parse(base64UrlDecode(encodedPayload));
  if (payload.type !== 'access') {
    throw new Error('invalid token type');
  }

  const now = Math.floor(Date.now() / 1000);
  if (!payload.exp || payload.exp < now) {
    throw new Error('token expired');
  }

  return payload;
};

module.exports = {
  createAccessToken,
  verifyAccessToken,
};
