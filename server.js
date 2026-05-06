require('dotenv').config()
const cors = require('cors')
const express = require('express')
const cookieParser = require('cookie-parser')
const passport = require('./passport')
const path = require('path')

const app = express()
const JWT_SECRET = process.env.JWT_SECRET

// Set up
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true    // allows cookies to be sent cross-origin    
}))
app.use(express.json())
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'client/dist')))      // Serve React build
app.use(passport.initialize())

// Routes
app.use('/api', require('./routes/auth'))
app.use('/api/materials', require('./routes/materials'))
app.use('/api/fields', require('./routes/fields'))

// For any route not caught by API routes, serve React's index.html
// This lets React Router handle client-side navigation
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist/index.html'))
})

const PORT = 3000
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})
