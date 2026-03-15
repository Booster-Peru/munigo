const { Pool } = require('pg');

let pool;

const getPool = () => {
  if (pool) return pool;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is required for persistent storage');
  }

  pool = new Pool({
    connectionString,
  });

  return pool;
};

const query = async (text, params = []) => {
  const db = getPool();
  return db.query(text, params);
};

module.exports = {
  getPool,
  query,
};
