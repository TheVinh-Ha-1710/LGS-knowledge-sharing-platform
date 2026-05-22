const express = require('express')
const router = express.Router()
const { pool } = require('../db')
const requireAuth = require('../middleware/requireAuth')

// GET /:materialId — get current user's note for this material
router.get('/:materialId', requireAuth, async (req, res) => {
  try {
    const { materialId } = req.params

    const result = await pool.query(
      'SELECT * FROM notes WHERE user_id = $1 AND material_id = $2',
      [req.user.id, materialId]
    )

    res.json({ note: result.rows[0] || null })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /:materialId — create or update note
router.post('/:materialId', requireAuth, async (req, res) => {
  try {
    const { materialId } = req.params
    const { content } = req.body

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Note content cannot be empty' })
    }

    const result = await pool.query(`
      INSERT INTO notes (user_id, material_id, content)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, material_id)
      DO UPDATE SET content = EXCLUDED.content, updated_at = NOW()
      RETURNING *
    `, [req.user.id, materialId, content])

    res.json({ note: result.rows[0] })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE /:materialId — delete note
router.delete('/:materialId', requireAuth, async (req, res) => {
  try {
    const { materialId } = req.params

    await pool.query(
      'DELETE FROM notes WHERE user_id = $1 AND material_id = $2',
      [req.user.id, materialId]
    )

    res.json({ message: 'Note deleted' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router