const jwt = require('jsonwebtoken')
const { pool } = require('../db')

const JWT_SECRET = process.env.JWT_SECRET

async function requireAuth(req, res, next) {
  try {
    const token = req.cookies.token
    if (!token) return res.status(401).json({ error: 'Not logged in' })

    const blocked = await pool.query(
      'SELECT * FROM blocklist WHERE token = $1', [token]
    )
    if (blocked.rows[0]) return res.status(401).json({ error: 'Token has been invalidated' })

    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
    next()
  } catch (err) {
    res.status(401).json({ error: 'Not logged in' })
  }
}

module.exports = requireAuth
