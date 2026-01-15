import express from 'express'
import { ledgerDB } from '../db.js'
import { requireAuth } from '../middleware/authMiddleware.js'
import { v4 as uuid } from 'uuid'
import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
const router = express.Router()

const db = new Low(
  new JSONFile('data/ledger.json'),
  { entries: [] }
)

await db.read()

router.get('/dashboard', requireAuth, (req, res) => {
  const entries = ledgerDB.data.entries.filter(
    e => e.user === req.session.user.username
  )
  res.render('dashboard', { entries })
})

router.get('/add', requireAuth, (req, res) => {
  res.render('add-entry')
})

router.post('/add', requireAuth, async (req, res) => {
  const { type, amount, description } = req.body

  ledgerDB.data.entries.push({
    id: uuid(),
    user: req.session.user.username,
    type,
    amount: Number(amount),
    description,
    date: new Date().toISOString()
  })

  await ledgerDB.write()
  res.redirect('/ledger/dashboard')
})

/* ===============================
   INCOME STATEMENT ROUTE
================================ */
router.get('/income-statement', requireAuth, async (req, res) => {
  await db.read()

  const entries = db.data.entries

  let totalIncome = 0
  let totalExpenses = 0

  entries.forEach(entry => {
    if (entry.type === 'income') {
      totalIncome += Number(entry.amount)
    }

    if (entry.type === 'expense') {
      totalExpenses += Number(entry.amount)
    }
  })

  const netProfit = totalIncome - totalExpenses

  res.render('income-statement', {
    totalIncome,
    totalExpenses,
    netProfit,
    entries
  })
})

export default router
