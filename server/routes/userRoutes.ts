import express from 'express'
import { getUserLikedBlogs, getUserComments } from '../controllers/userController.js'
import auth from '../middleware/auth.js'

const userRouter = express.Router()

userRouter.get('/liked-blogs', auth, getUserLikedBlogs)
userRouter.get('/comments', auth, getUserComments)

export default userRouter
