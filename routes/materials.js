const express = require('express')
const router = express.Router()
const { pool } = require('../db')
const requireAuth = require('../middleware/requireAuth')
const slugify = require('slugify')

// Get material list with optional filters
async function getMaterials(fieldSlug, difficulty) {
  // start with base query and an array of values
  let query = `
    SELECT 
      m.id, m.title, m.slug, m.difficulty,
      m.view_count, m.created_at,
      u.email as author_email,
      f.name as field_name,
      f.slug as field_slug,
      f.icon as field_icon
    FROM materials m
    LEFT JOIN users u ON m.author_id = u.id
    LEFT JOIN fields f ON m.field_id = f.id
    WHERE m.published = true
  `
  const values = []

  // add filters dynamically
  if (fieldSlug) {
    values.push(fieldSlug)
    query += ` AND f.slug = $${values.length}`
  }

  if (difficulty) {
    values.push(difficulty)
    query += ` AND m.difficulty = $${values.length}`
  }

  query += ` ORDER BY m.created_at DESC`

  return pool.query(query, values)
}

router.get('/', async (req, res) => {
  try {
    const { field, difficulty } = req.query
    const result = await getMaterials(field, difficulty)
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Get single material and increment view count
async function getMaterial(slug) {
  await pool.query(
    'UPDATE materials SET view_count = view_count + 1 WHERE slug = $1',
    [slug]
  )

  return pool.query(`
    SELECT m.*,
      u.email as author_email,
      f.name as field_name,
      f.slug as field_slug,
      f.icon as field_icon
    FROM materials m
    LEFT JOIN users u ON m.author_id = u.id
    LEFT JOIN fields f ON m.field_id = f.id
    WHERE m.slug = $1
  `, [slug])
}

router.get('/:slug', async (req, res) => {
    try {
        const result = await getMaterial(req.params.slug)
        const material = result.rows[0]

        if (!material) {
            return res.status(404).json({ error: 'Material not found' })
        }

        // Get tags seperately
        const tags = await pool.query(`
            SELECT t.name, t.slug
            FROM tags t
            JOIN material_tags mt ON t.id = mt.tag_id
            WHERE mt.material_id = $1
        `, [material.id])
        
        // Attach tags to material
        material.tags = tags.rows

        res.json(material)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// Get material by ID
router.get('/id/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM materials WHERE id = $1', [req.params.id]
    )
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' })
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST new material route
router.post('/', requireAuth, async (req, res) => {
    const { title, content, field_id, difficulty, tags } = req.body

    if (!title || !field_id) {
        return res.status(400).json({ error: 'Missing title or field ID' })
    }
    
    const client = await pool.connect()

    try {
        await client.query('BEGIN')

        // Create slug from title
        const slug = slugify(title, { lower: true, strict: true })

        // Create new material
        const newMaterial = await client.query(`
            INSERT INTO materials (title, slug, content, author_id, field_id, difficulty)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `, [title, slug, content, req.user.id, field_id, difficulty])
        
        // Create tag for new material
        if (tags && tags.length > 0) {         // Only create tag if given by author
            for (const tagName of tags) {
                const tagSlug = slugify(tagName, { lower: true, strict: true })

                // find or create tag
                const tag = await client.query(`
                    INSERT INTO tags (name, slug) VALUES ($1, $2)
                    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
                    RETURNING id
                `, [tagName, tagSlug])

                // link to material
                await client.query(`
                    INSERT INTO material_tags (material_id, tag_id) VALUES ($1, $2)
                    ON CONFLICT DO NOTHING
                `, [newMaterial.rows[0].id, tag.rows[0].id])
            }
        }

        await client.query('COMMIT')

        res.status(201).json(newMaterial.rows[0])
    } catch (err) {
        await client.query('ROLLBACK')
        res.status(500).json({ error: err.message })
    } finally {
        client.release()
    }
})

// PUT material route
router.put('/:id', requireAuth, async (req, res) => {
    const { title, content, field_id, difficulty } = req.body

    const client = await pool.connect()

    try {
        await client.query('BEGIN')

        // Ownership check
        const existing = await client.query(
            'SELECT * FROM materials WHERE id = $1', [req.params.id]
        )

        if (!existing.rows[0]) return res.status(404).json({ error: 'Not found' })
        if (existing.rows[0].author_id !== req.user.id) {
        return res.status(403).json({ error: 'Not authorised' })
        }

        // Update material
        const updatedMaterial = await client.query(`
            UPDATE materials 
            SET title = $1, content = $2, field_id = $3, 
                difficulty = $4, updated_at = NOW()
            WHERE id = $5
            RETURNING *
        `, [title, content, field_id, difficulty, req.params.id])

        await client.query('COMMIT')

        res.status(200).json(updatedMaterial.rows[0])
    } catch (err) {
        await client.query('ROLLBACK')
        res.status(500).json({ error: err.message })
    } finally {
        client.release()
    }
})

// DELETE material route
router.delete('/:id', requireAuth, async (req, res) => {
    const client = await pool.connect()

    try {
        await client.query('BEGIN')

        // Ownership check
        const existing = await client.query(
            'SELECT * FROM materials WHERE id = $1', [req.params.id]
        )

        if (!existing.rows[0]) return res.status(404).json({ error: 'Not found' })
        if (existing.rows[0].author_id !== req.user.id) {
        return res.status(403).json({ error: 'Not authorised' })
        }
        
        // Delete material
        await client.query(`
            DELETE FROM materials WHERE id = $1
        `, [req.params.id])
        
        await client.query('COMMIT')

        res.status(200).json({ message: 'Material deleted' })
    } catch (err) {
        await client.query('ROLLBACK')
        res.status(500).json({ error: err.message })
    } finally {
        client.release()
    }
})

module.exports = router
