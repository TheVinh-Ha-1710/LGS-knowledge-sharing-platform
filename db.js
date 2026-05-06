require('dotenv').config()
const { Pool } = require('pg')

// Create connection pool for the session
const pool = new Pool({ connectionString: process.env.DATABASE_URL })


// Clean up block list after 1 hour
async function cleanupBlocklist() {
  const now = Math.floor(Date.now() / 1000)
  await pool.query('DELETE FROM blocklist WHERE expires_at < $1', [now])
}

setInterval(cleanupBlocklist, 60 * 60 * 1000)

module.exports = { pool, cleanupBlocklist }
