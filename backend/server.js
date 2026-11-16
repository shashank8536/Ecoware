import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import connectDB from './config/db.js'
import authRoutes from './routes/authRoutes.js'

dotenv.config()

connectDB()

const app = express()

app.use(helmet())

const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
]

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(null, true)
      }
    },
    credentials: true,
  })
)

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'))
}

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
})

app.use('/api/auth', authLimiter, authRoutes)

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    system: 'EcoWare Security & Identity Service',
    author: 'Member 3',
    timestamp: new Date().toISOString(),
  })
})

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'EcoWare API - Security and Identity Foundation running.',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      health: '/api/health',
    },
  })
})

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Resource not found at ${req.originalUrl}`,
  })
})

app.use((err, req, res, next) => {
  console.error('[Server Error]:', err.stack)
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  })
})

const PORT = process.env.PORT || 5000

const server = app.listen(PORT, () => {
  console.log(
    `[EcoWare Security Server]: Running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`
  )
})

export { app, server }
export default app
