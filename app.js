import express from 'express'
import session from 'express-session'
import path from 'path'
import rateLimit from 'express-rate-limit'

import authRoutes from './routes/auth.js'
import ledgerRoutes from './routes/ledger.js'

const app = express()

// Body parsers
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(express.static('public'))

// Rate limiting (50 requests per minute)
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 50
})
app.use(limiter)

// Session (1 hour expiry)
app.use(session({
  name: 'soletrader.sid',
  secret: 'supersecurekey123',
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    maxAge: 1000 * 60 * 60 // 1 hour
  }
}))

// View engine
app.set('view engine', 'ejs')
app.set('views', path.join(process.cwd(), 'views'))

// Routes
app.use('/', authRoutes)
app.use('/ledger', ledgerRoutes)

// Server
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000')
})

