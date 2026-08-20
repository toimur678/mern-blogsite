import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import Blog from '../models/Blog.js'
import Comment from '../models/Comment.js'

export const adminLogin = async (req: Request, res: Response): Promise<void> => {
    try {
        const {email, password} = req.body

        if (email != process.env.ADMIN_EMAIL || password != process.env.ADMIN_PASSWORD) {
            res.json({success: false, message: "Invalid Credentials"})
            return
        }

        const token = jwt.sign({email}, process.env.JWT_SECRET as string)

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        })

        res.json({success: true})
    } catch(error) {
        res.json({success: false, message: (error as Error).message})
    }
} 

export const adminLogout = async (_req: Request, res: Response): Promise<void> => {
    try {
        res.cookie('token', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 0,
        })
        res.json({success: true, message: "Logged out successfully"})
    } catch (error) {
        res.json({success: false, message: (error as Error).message})
    }
}

export const checkAuth = async (_req: Request, res: Response): Promise<void> => {
    // If this handler runs, the request already passed the auth middleware
    res.json({success: true})
}

export const getAllBlogsAdmin = async (_req: Request, res: Response): Promise<void> => {
    try {
        const blogs = await Blog.find({}).sort({createdAt: -1})
        res.json({success: true, blogs})
    } catch (error) {
        res.json({success: false, message: (error as Error).message})
    }
}

export const getAllComments = async (_req: Request, res: Response): Promise<void> => {
    try {
        const comments = await Comment.find({}).populate("blog").sort({createdAt: -1})
        res.json({success: true, comments})
    } catch (error) {
        res.status(500).json({success: false, message: (error as Error).message})
    }
}

export const getDashboard = async (_req: Request, res: Response): Promise<void> => {
    try {
        const recentBlogs = await Blog.find({}).sort({createdAt: -1}).limit(5)
        const blogs = await Blog.countDocuments()
        const comments = await Comment.countDocuments()
        const drafts = await Blog.countDocuments({isPublished: false})
        const dashboardData = {
            blogs, comments, drafts, recentBlogs
        }
        res.json({success: true, dashboardData})
    } catch (error) {
        res.json({success: false, message: (error as Error).message})
    }
}

export const deleteCommentById = async (req: Request, res: Response): Promise<void> => {
    try {
        const {id} = req.body
        await Comment.findByIdAndDelete(id)
        res.json({success: true, message: "Comment deleted successfully"})
    } catch (error) {
        res.json({success: false, message: (error as Error).message})
    }
}

export const approveCommentById = async (req: Request, res: Response): Promise<void> => {
    try {
        const {id} = req.body
        await Comment.findByIdAndUpdate(id, {isApproved: true})
        res.json({success: true, message: "Comment approved successfully"})
    } catch (error) {
        res.json({success: false, message: (error as Error).message})
    }
}
