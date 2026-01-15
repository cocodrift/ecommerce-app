import express from 'express'
import bcrypt from 'bcryptjs'
import { usersDB } from '../db.js'
import { v4 as uuid } from 'uuid'
import { requireAuth } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/', (req, res) => res.redirect('/login'))

router.get('/register', (req, res) => {
  res.render('register')
})

router.get('/add', requireAuth, (req, res) => {
  res.render('add-entry')
})

// HANDLE add-entry form submission
router.post('/add', requireAuth, async (req, res) => {
  const { type, amount, description } = req.body

  ledgerDB.data.entries.push({
    id: uuid(),
    user: req.session.user.username,
    type,                       // income | expense
    amount: Number(amount),     // ensure numeric
    description,
    date: new Date().toISOString()
  })

  await ledgerDB.write()
  res.redirect('/ledger/dashboard')
})

router.post('/register', async (req, res) => {
  const { username, password } = req.body
  const hashed = await bcrypt.hash(password, 10)

  usersDB.data.users.push({
    id: uuid(),
    username,
    password: hashed
  })

  await usersDB.write()
  res.redirect('/login')
})

router.get('/login', (req, res) => {
  res.render('login')
})

router.post('/login', async (req, res) => {
  const { username, password } = req.body
  const user = usersDB.data.users.find(u => u.username === username)

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.send('Invalid credentials')
  }

  req.session.user = user
  res.redirect('/ledger/dashboard')
})

router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'))
})

export default router
