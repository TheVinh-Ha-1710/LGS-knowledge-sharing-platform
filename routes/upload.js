const express = require('express')
const router = express.Router()
const multer = require('multer')
const { v2: cloudinary } = require('cloudinary')
const requireAuth = require('../middleware/requireAuth')

// Configure Cloudinary
cloudinary.config({ secure: true })

// Multer — store file in memory, not disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    // Only allow images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed'))
    }
  }
})

// POST /api/upload — upload image to Cloudinary
router.post('/', requireAuth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' })
    }

    // Upload buffer to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'lgs-materials',    // organise uploads in a folder
          resource_type: 'image',
          transformation: [
            { width: 1200, crop: 'limit' },  // max width 1200px
            { quality: 'auto' },              // auto-optimise quality
            { fetch_format: 'auto' }          // serve WebP where supported
          ]
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      )
      stream.end(req.file.buffer)
    })

    res.json({ url: result.secure_url })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router