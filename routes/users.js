const express = require('express')
const router = express.Router()
const { pool } = require('../db')
const requireAuth = require('../middleware/requireAuth')

// GET /me — full profile for logged-in user
router.get('/me', requireAuth, async (req, res) => {
  try {
    // Basic user info
    const user = await pool.query(
      `SELECT u.id, u.email, up.created_at
      FROM users u LEFT JOIN user_profiles up
      ON u.id = up.user_id
      WHERE u.id = $1`,
      [req.user.id]
    )

    // Authored materials
    const materials = await pool.query(
      `
      SELECT * FROM materials 
      WHERE author_id = $1 AND published = true 
      ORDER BY created_at DESC
      `,
      [req.user.id]
    )

    // Aggregated stats
    const stats = await pool.query(`
      SELECT
        COUNT(DISTINCT m.id) as materials_authored,
        COUNT(DISTINCT r.material_id) FILTER (WHERE r.read_at IS NOT NULL) as materials_read,
        COUNT(DISTINCT r.material_id) FILTER (WHERE r.completed = true) as materials_completed,
        COUNT(DISTINCT re.id) as reactions_received
      FROM users u
      LEFT JOIN materials m ON m.author_id = u.id AND m.published = true
      LEFT JOIN reads r ON r.user_id = u.id
      LEFT JOIN reactions re ON re.material_id IN (
        SELECT id FROM materials WHERE author_id = u.id
      )
      WHERE u.id = $1
    `, [req.user.id])

    // Fields explored from reading history
    const exploredFields = await pool.query(`
      SELECT COUNT(DISTINCT m.field_id) as fields_explored
      FROM reads r
      JOIN materials m ON m.id = r.material_id
      WHERE r.user_id = $1
    `, [req.user.id])

    // Reading history — materials user has opened or completed
    const reads = await pool.query(`
      SELECT m.id, m.title, m.slug, m.difficulty, m.created_at,
        r.completed, r.read_at,
        f.name as field_name, f.slug as field_slug, f.icon as field_icon
      FROM reads r
      JOIN materials m ON m.id = r.material_id
      LEFT JOIN fields f ON f.id = m.field_id
      WHERE r.user_id = $1
      ORDER BY r.read_at DESC
    `, [req.user.id])
    
    // Streak Data
    const streakData = await pool.query(`
      WITH completion_days AS (
        -- Get distinct days where user completed at least one material
        SELECT DISTINCT DATE(read_at) as day
        FROM reads
        WHERE user_id = $1 AND completed = true
      ),
      grouped AS (
        -- Gap-and-islands: subtract row number from date to group consecutive days
        -- Consecutive dates produce the same group value
        SELECT day,
          day - (ROW_NUMBER() OVER (ORDER BY day) || ' days')::INTERVAL as grp
        FROM completion_days
      ),
      streaks AS (
        -- Count days in each consecutive group
        SELECT grp, COUNT(*) as streak_length,
          MAX(day) as last_day
        FROM grouped
        GROUP BY grp
      )
      SELECT
        -- Longest streak ever
        MAX(streak_length) as longest_streak,
        -- Current streak — only count if the most recent group includes today or yesterday
        -- (yesterday allows for the day not being over yet)
        COALESCE((
          SELECT streak_length FROM streaks
          WHERE last_day >= CURRENT_DATE - INTERVAL '1 day'
          ORDER BY last_day DESC
          LIMIT 1
        ), 0) as current_streak
      FROM streaks
    `, [req.user.id])

    const notes = await pool.query(`
      SELECT n.id, n.content, n.updated_at,
        m.title, m.slug,
        f.name as field_name, f.icon as field_icon
      FROM notes n
      JOIN materials m ON m.id = n.material_id
      LEFT JOIN fields f ON f.id = m.field_id
      WHERE n.user_id = $1
      ORDER BY n.updated_at DESC
    `, [req.user.id])

    res.json({
      user: user.rows[0],
      stats: {
        ...stats.rows[0],
        fields_explored: exploredFields.rows[0].fields_explored,
        current_streak: streakData.rows[0]?.current_streak || 0,
        longest_streak: streakData.rows[0]?.longest_streak || 0
      },
      materials: materials.rows,
      reads: reads.rows,
      notes: notes.rows
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /:username — public profile for any user
router.get('/:username', async (req, res) => {
  try {
    // Find user by username (email prefix)
    const userResult = await pool.query(`
        SELECT u.id, u.email, up.created_at
        FROM users u
        LEFT JOIN user_profiles up ON up.user_id = u.id
        WHERE SPLIT_PART(u.email, '@', 1) = $1
      `,
      [req.params.username]
    )

    const profile = userResult.rows[0]

    // Return 404 if username doesn't exist
    if (!profile) return res.status(404).json({ error: 'User not found' })

    // Public stats only — no reading history or streak
    const publicStats = await pool.query(`
      SELECT
        COUNT(DISTINCT m.id) as materials_authored,
        COUNT(DISTINCT re.id) as reactions_received
      FROM users u
      LEFT JOIN materials m ON m.author_id = u.id AND m.published = true
      LEFT JOIN reactions re ON re.material_id IN (
        SELECT id FROM materials WHERE author_id = u.id
      )
      WHERE u.id = $1
    `, [profile.id])

    // Their published materials
    const materials = await pool.query(
      `SELECT m.*, f.name as field_name, f.slug as field_slug, f.icon as field_icon
       FROM materials m
       LEFT JOIN fields f ON f.id = m.field_id
       WHERE m.author_id = $1 AND m.published = true
       ORDER BY m.created_at DESC`,
      [profile.id]
    )

    res.json({
      // Don't expose email — only username and join date
      user: {
        username: profile.email.split('@')[0],
        created_at: profile.created_at
      },
      stats: publicStats.rows[0],
      materials: materials.rows
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router