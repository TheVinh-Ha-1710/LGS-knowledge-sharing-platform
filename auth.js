require('dotenv').config()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { pool } = require('./db')
const zxcvbn = require('zxcvbn')

const SALT_ROUNDS = 10
const JWT_SECRET = process.env.JWT_SECRET

// Password strength validation
function validatePassword(password) {
    // Run zxcvbn check on password
    const result = zxcvbn(password)
    if (result.score < 3) {
        throw new Error ('Password is too weak. Try a longer or more unusual password.')
    }
} 

// Register a new user
async function register(email, password) {
    // Validate password strength before register process
    validatePassword(password)

    // Grab a dedicated connection
    const client = await pool.connect()  

    // Insert user & user_profiles transaction
    try {
        await client.query('BEGIN')

        // Check if user already exists
        const existing = await client.query('SELECT id FROM users WHERE email = $1', [email])
        if (existing.rows[0]) {
            throw new Error('User already exists')
        }

        // Hash the password using bcrypt
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)
        
        // Insert user
        const inserted = await client.query(
            'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id',
            [email, hashedPassword]
        )
        const id = inserted.rows[0].id

        // Insert profile
        await client.query(
            'INSERT INTO user_profiles (user_id, display_name) VALUES ($1, $2)',
            [id, email.split('@')[0]]
        )

        // Log registration as first login attempt
        await client.query(
            'INSERT INTO login_attempts (user_id, success, ip_address) VALUES ($1, $2, $3)',
            [id, true, 'registration']
        )
        
        await client.query('COMMIT')

        return { id: id, email }
    } catch (err) {
        await client.query('ROLLBACK')      // undo everything on any error
        throw err
    } finally {
        client.release()                    // always return connection to pool
    }
}

// Login a user
async function login(email, password, ipAddress) {
    let user

    // Grab a connection to pool
    const client = await pool.connect()

    // Transaction start
    try {
        await client.query('BEGIN')

        // Check if user is registered
        const result = await client.query(
            'SELECT id, email, password FROM users WHERE email = $1',
            [email]
        )

        user = result.rows[0]

        if (!user) {
            throw new Error('Invalid credentials')
        }

        // Compare hashed password with the provided password
        const passwordMatch = await bcrypt.compare(password, user.password)
        if (!passwordMatch) {
            throw new Error('Invalid credentials')
        }

        // Update last login timestamp in users table
        await client.query(
            'UPDATE users SET last_login = NOW() WHERE id = $1',
            [user.id]
        )

        // Add attempts to login attempts table
        await client.query(
            'INSERT INTO login_attempts (user_id, success, ip_address) VALUES ($1, $2, $3)',
            [user.id, true, ipAddress]
        )

        // Generate a JWT token
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' })        

        await client.query('COMMIT')

        return token
    } catch (err) {
        await client.query('ROLLBACK')

        // only log if we actually found the user
        if (user) {
            await pool.query(
                'INSERT INTO login_attempts (user_id, success, ip_address) VALUES ($1, $2, $3)',
                [user.id, false, ipAddress]
            )
        }

        throw err
    } finally {
        client.release()
    }
}

module.exports = { register, login }
