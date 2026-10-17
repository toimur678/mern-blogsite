import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import mongoose from 'mongoose'
import adminRouter from './routes/adminRoutes.js'
import blogRouter from './routes/blogRoutes.js'
import authRouter from './routes/authRoutes.js'
import userRouter from './routes/userRoutes.js'
import newsletterRouter from './routes/newsletterRoutes.js'
import { errorHandler, notFound } from './utils/http.js'
import { allowedOrigins, securityHeaders, trustedOrigin } from './middleware/security.js'

const app = express()
app.disable('x-powered-by')
// Set only when the API is behind a known reverse proxy; otherwise client IP headers must not be trusted.
if (process.env.TRUST_PROXY === '1') app.set('trust proxy', 1)

// Middlewares
app.use(securityHeaders)
app.use(cors({origin: (origin, callback) => callback(null, !origin || allowedOrigins().includes(origin)), credentials: true}))
app.use(trustedOrigin)
app.use(express.json({limit: '1mb'}))
app.use(cookieParser())

// Routes
app.get('/', (_req, res) => res.json({success: true, message: 'Editorial API is running'}))
app.get('/api/health', (_req, res) => {
    const ready = mongoose.connection.readyState === 1
    res.status(ready ? 200 : 503).json({success: ready, status: ready ? 'ready' : 'database unavailable'})
})
app.use('/api/auth', authRouter)
app.use('/api/user', userRouter)
app.use('/api/admin', adminRouter)
app.use('/api/blog', blogRouter)
app.use('/api/newsletter', newsletterRouter)
app.use(notFound)
app.use(errorHandler)

export default app
