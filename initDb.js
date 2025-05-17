const pool = require('./db');
const bcrypt = require('bcrypt');

async function initDb() {
  if (process.env.NODE_ENV !== 'development') {
    console.log('Skipping DB init: not in development mode');
    return;
  }

  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    );
  `;

  try {
    await pool.query(createTableQuery);
    console.log('✅ Users table is ready');
  } catch (err) {
    console.error('Error creating users table:', err);
    return;
  }

  // Seed test user
  try {
    const userCheck = await pool.query('SELECT * FROM users WHERE username = $1', ['test']);
    if (userCheck.rows.length === 0) {
      const hashed = await bcrypt.hash('password123', 10);
      await pool.query('INSERT INTO users (username, password) VALUES ($1, $2)', ['test', hashed]);
      console.log('🧪 Test user added: test / password123');
    }
  } catch (err) {
    console.error('Error seeding test user:', err);
  }
}

module.exports = initDb;
