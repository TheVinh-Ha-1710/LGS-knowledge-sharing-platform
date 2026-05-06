require('dotenv').config()
const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const rateLimit = require('express-rate-limit')
const { register, login } = require('../auth')
const { pool } = require('../db')
const passport = require('../passport')
const requireAuth = require('../middleware/requireAuth')

const JWT_SECRET = process.env.JWT_SECRET

// Rate limiters (register & login + OAuth)
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 hour window
  max: 5,                     // max 5 accounts per IP per hour
  message: { error: 'Too many accounts created. Try again later.' },
  standardHeaders: true,
  legacyHeaders: false
})

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,  // 15 minute window
    max: 10,                    // max 10 attempts per window
    message: { error: 'Too many login attempts. Try again in 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false
})

const oauthInitLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,  // 15 minute window
    max: 10,                    // 10 attempts per window
    message: { error: 'Too many login attempts. Try again in 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false
})

const oauthCallbackLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,  // 15 minute window
    max: 10,                    // 10 attempts per window
    message: { error: 'Too many login attempts. Try again in 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false
})

// Register route
router.post('/register', registerLimiter, async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' })
        }

        const user = await register(email, password)
        res.json({ message: 'User created!', user })
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
})

// Login route
router.post('/login', loginLimiter, async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' })
        }

        const token = await login(email, password, req.ip)

        // Store token in an httpOnly cookie (JS can't read this — safer!)
        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' })
        res.json({ message: 'Logged in!' })
    } catch (err) {
        res.status(401).json({ error: err.message })
    }
})

// Redirect to Google route
router.get('/auth/google',
    oauthInitLimiter,
    passport.authenticate('google', { scope: ['email', 'profile'] })
)
    
// Google callback redirect route
router.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: 'http://localhost:5173/login', session: false }),
    (req, res) => {
        // req.user is now populated by Passport
        const user = req.user

        // 1. sign a JWT using req.user.id and req.user.email
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' })

        // 3. res.redirect to http://localhost:5173/dashboard
        res.redirect(`http://localhost:5173/auth/callback?token=${token}`)
    }
)

// router callback route -> To dashboard screen if OAuth success
router.post('/login/callback', oauthCallbackLimiter, (req, res) => {
  const { token } = req.body

  if (!token) return res.status(400).json({ error: 'No token provided' })

  try {
    // Verify it's a valid token we actually signed
    jwt.verify(token, JWT_SECRET)
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    })
    res.json({ message: 'Session established' })
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' })
  }
})
   
// Logout route
router.post('/logout', async (req, res) => {
    try {
        const token = req.cookies.token
        const decoded = jwt.verify(token, JWT_SECRET)
        
        await pool.query('INSERT INTO blocklist (token, expires_at) VALUES ($1, $2) ON CONFLICT DO NOTHING', [token, decoded.exp])

        res.clearCookie('token')
        res.json({ message: 'Logged out!' })
    } catch (err) {
        res.clearCookie('token')
        res.json({ message: 'Logged out!' })
    }
})

// Protected route
router.get('/me', requireAuth, (req, res) => {
  res.json({ message: 'Hello!', user: req.user })
})

module.exports = router
