require('dotenv').config()
const cors = require('cors')
const express = require('express')
const cookieParser = require('cookie-parser')
const passport = require('./passport')
const path = require('path')

const app = express()
app.set('trust proxy', 1)     // Trust proxy on Railway deployment

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}))
app.use(express.json())
app.use(cookieParser())
app.use(passport.initialize())

// API routes
app.use('/api', require('./routes/auth'))
app.use('/api/materials', require('./routes/materials'))
app.use('/api/fields', require('./routes/fields'))

// Serve React build
app.use(express.static(path.join(__dirname, 'client/dist')))

// Catch-all — let React Router handle client-side navigation
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist/index.html'))
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
