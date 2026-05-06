require('dotenv').config()
const cors = require('cors')
const express = require('express')
const cookieParser = require('cookie-parser')
const passport = require('./passport')

const app = express()
const JWT_SECRET = process.env.JWT_SECRET

// Set up
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true    // allows cookies to be sent cross-origin    
}))
app.use(express.json())
app.use(cookieParser())
app.use(express.static('public'))
app.use(passport.initialize())

// Routes
app.use('/api', require('./routes/auth'))
app.use('/api/materials', require('./routes/materials'))
app.use('/api/fields', require('./routes/fields'))

const PORT = 3000
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})
