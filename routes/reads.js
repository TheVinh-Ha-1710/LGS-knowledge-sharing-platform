const express = require('express')
const router = express.Router()
const { pool } = require('../db')
const requireAuth = require('../middleware/requireAuth')

// POST reads
router.post('/:materialId', requireAuth, async (req, res) => {
    try {
        const { materialId } = req.params

        const existing = await pool.query(
            'SELECT * FROM reads WHERE material_id = $1 AND user_id = $2',
            [materialId, req.user.id]
        )

        const reads = existing.rows[0]

        if (!reads) {
            // Insert a read record if never read
            await pool.query(
                'INSERT INTO reads (user_id, material_id, completed) VALUES ($1, $2, $3)',
                [req.user.id, materialId, false]
            )

            return res.json({ action: 'added', read: true, completed: false })
        } else {
            // Mark as completed
            if (reads.completed === false) {
                await pool.query(
                    'UPDATE reads SET completed = true WHERE user_id = $1 AND material_id = $2',
                    [req.user.id, materialId]
                )

                return res.json({ action: 'updated', read: true, completed: true })
            }

            // Undo complete mark
            await pool.query(
                'UPDATE reads SET completed = false WHERE user_id = $1 AND material_id = $2',
                [req.user.id, materialId]
            )
            
            return res.json({ action: 'updated', read: true, completed: false })
        }
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// GET reads
router.get('/:materialId', requireAuth, async (req, res) => {
    try {
        const { materialId } = req.params

        const userReads = await pool.query(
            'SELECT * FROM reads WHERE user_id = $1 AND material_id = $2',
            [req.user.id, materialId]
        )

        const record = userReads.rows[0]

        res.json({
            read: !!record,                    // true if any record exists, false if null
            completed: record?.completed || false
        })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

module.exports = router