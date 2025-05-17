const { Pool } = require('pg');

const pool = new Pool({
  user: 'user',
  host: 'localhost',
  database: 'authdb',
  password: 'password',
  port: 5432,
});

module.exports = pool;
// This code sets up a connection pool to a PostgreSQL database using the 'pg' library.
// It exports the pool object, which can be used to query the database.