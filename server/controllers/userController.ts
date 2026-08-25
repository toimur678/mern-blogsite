import { Request, Response } from 'express'
import Blog from '../models/Blog.js'
import Comment from '../models/Comment.js'

export const getUserLikedBlogs = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id
        if (!userId) {
            res.json({ success: false, message: "User not found" })
            return
        }
        
        // Find blogs where the likes array contains the userId
        const likedBlogs = await Blog.find({ likes: userId }).sort({ createdAt: -1 })
        res.json({ success: true, blogs: likedBlogs })
    } catch (error) {
        res.json({ success: false, message: (error as Error).message })
    }
}

export const getUserComments = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id
        if (!userId) {
            res.json({ success: false, message: "User not found" })
            return
        }

        const comments = await Comment.find({ user: userId }).populate('blog', 'title').sort({ createdAt: -1 })
        res.json({ success: true, comments })
    } catch (error) {
        res.json({ success: false, message: (error as Error).message })
    }
}
