const express = require('express')
const router = express.Router()
const { pool } = require('../db')

// GET /leaderboard — top 10 contributors by material count
router.get('/leaderboard', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.email, COUNT(m.id) as material_count
      FROM users u
      JOIN materials m ON m.author_id = u.id
      WHERE m.published = true
      GROUP BY u.id, u.email
      ORDER BY material_count DESC
      LIMIT 10
    `)
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /trending — top 5 most viewed materials in last 7 days
router.get('/trending', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT m.id, m.title, m.slug, m.view_count, m.created_at,
        u.email as author_email,
        f.name as field_name,
        f.slug as field_slug,
        f.icon as field_icon
      FROM materials m
      LEFT JOIN users u ON m.author_id = u.id
      LEFT JOIN fields f ON m.field_id = f.id
      WHERE m.published = true
    //   AND m.created_at >= NOW() - INTERVAL '7 days'  (just opt out this for now since not much users yet)
      ORDER BY m.view_count DESC
      LIMIT 5
    `)
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router