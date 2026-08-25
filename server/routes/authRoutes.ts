import express from 'express'
import { signup, login, logout, checkAuth } from '../controllers/authController.js'
import auth from '../middleware/auth.js'

const authRouter = express.Router()

authRouter.post('/signup', signup)
authRouter.post('/login', login)
authRouter.post('/logout', logout)
authRouter.get('/check-auth', auth, checkAuth)

export default authRouter
