import express from 'express'
import { subscribe } from '../controllers/newsletterController.js'
import { rateLimit } from '../middleware/security.js'

const newsletterRouter = express.Router()
newsletterRouter.post('/subscribe', rateLimit(10), subscribe)

export default newsletterRouter
