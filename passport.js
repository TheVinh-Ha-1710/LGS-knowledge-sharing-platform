const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const { pool } = require('./db')

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const result = await pool.query(
            'SELECT * FROM users WHERE google_id = $1', [profile.id]
        )

        let user = result.rows[0]

        if (!user) {
            const newUser = await pool.query(
                'INSERT INTO users (email, google_id) VALUES ($1, $2) RETURNING *',
                [profile.emails[0].value, profile.id]
            )

            user = newUser.rows[0]
        }

        // Update last login
        await pool.query(
            'UPDATE users SET last_login = NOW() WHERE id = $1',
            [user.id]
        )

        // Insert login attempts
        await pool.query(
            'INSERT INTO login_attempts (user_id, success, ip_address) VALUES ($1, $2, $3)',
            [user.id, true, 'oauth:google']
        )

        return done(null, user)
    } catch (err) {
        done(err)
    }
}))

passport.serializeUser((user, done) => done(null, user))
passport.deserializeUser((user, done) => done(null, user))

module.exports = passport
