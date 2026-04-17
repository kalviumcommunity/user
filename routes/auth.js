// routes/auth.js — Fixed version
const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const db = require('../db')
const authenticate = require('../middleware/authenticate')
const { toAuthUser, toProfileUser } = require('../mappers/response-mappers')

const router = express.Router()

// POST /auth/signup
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'name, email, and password are required' })
  }
  try {
    const hash = await bcrypt.hash(password, 10)
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const result = await db.query(
      `INSERT INTO users (name, email, password_hash, verification_token)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, email, hash, verificationToken]
    )
    const user = result.rows[0]
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )
    // toAuthUser strips password_hash, verification_token, stripe_customer_id, etc.
    res.status(201).json({ token, user: toAuthUser(user) })
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Email already in use' })
    res.status(500).json({ error: 'Signup failed' })
  }
})

// POST /auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' })
  }
  try {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email])
    const user = result.rows[0]
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    // JWT contains only userId and role — nothing else
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )
    // toAuthUser strips all sensitive and internal fields before sending
    res.json({ token, user: toAuthUser(user) })
  } catch (err) {
    res.status(500).json({ error: 'Login failed' })
  }
})

// GET /auth/me
router.get('/me', authenticate, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM users WHERE id = $1', [req.user.userId])
    const user = result.rows[0]
    if (!user) return res.status(404).json({ error: 'User not found' })
    // toProfileUser includes plan and timestamps but still excludes all sensitive fields
    res.json({ user: toProfileUser(user) })
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch profile' })
  }
})

module.exports = router
