const express = require('express')
const router = express.Router()
const { pool } = require('../db')
const requireAuth = require('../middleware/requireAuth')

// POST /:materialId — toggle or switch reaction
router.post('/:materialId', requireAuth, async (req, res) => {
  try {
    const { materialId } = req.params
    const { type } = req.body

    // Validate reaction type
    const validTypes = ['helpful', 'mindblown', 'needs_work']
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid reaction type' })
    }

    // Check if user already has a reaction on this material
    const existing = await pool.query(
      'SELECT * FROM reactions WHERE user_id = $1 AND material_id = $2',
      [req.user.id, materialId]
    )

    const reaction = existing.rows[0]

    if (!reaction) {
      // No reaction yet — insert new one
      await pool.query(
        'INSERT INTO reactions (user_id, material_id, type) VALUES ($1, $2, $3)',
        [req.user.id, materialId, type]
      )
      return res.json({ action: 'added', type })
    }

    if (reaction.type === type) {
      // Same type — toggle off by deleting
      await pool.query(
        'DELETE FROM reactions WHERE user_id = $1 AND material_id = $2',
        [req.user.id, materialId]
      )
      return res.json({ action: 'removed', type })
    }

    // Different type — switch reaction
    await pool.query(
      'UPDATE reactions SET type = $1 WHERE user_id = $2 AND material_id = $3',
      [type, req.user.id, materialId]
    )
    return res.json({ action: 'updated', type })

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /:materialId — fetch reaction counts + current user's reaction
router.get('/:materialId', requireAuth, async (req, res) => {
  try {
    const { materialId } = req.params

    // Get counts grouped by type
    const counts = await pool.query(
      `SELECT type, COUNT(*) as count
       FROM reactions
       WHERE material_id = $1
       GROUP BY type`,
      [materialId]
    )

    // Get current user's reaction if any
    const userReaction = await pool.query(
      'SELECT type FROM reactions WHERE material_id = $1 AND user_id = $2',
      [materialId, req.user.id]
    )

    res.json({
      counts: counts.rows,              // [{ type: 'helpful', count: '5' }, ...]
      userReaction: userReaction.rows[0]?.type || null  // 'helpful' or null
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router