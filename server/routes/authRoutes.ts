import express from 'express'
import { signup, login, logout, checkAuth } from '../controllers/authController.js'
import auth from '../middleware/auth.js'
import { rateLimit } from '../middleware/security.js'

const authRouter = express.Router()

authRouter.post('/signup', rateLimit(10), signup)
authRouter.post('/login', rateLimit(20), login)
authRouter.post('/logout', logout)
authRouter.get('/check-auth', auth, checkAuth)

export default authRouter
