import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import User from '../models/User.js'

export const signup = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password } = req.body

        if (!name || !email || !password) {
            res.json({ success: false, message: "Please provide all required fields" })
            return
        }

        const existingUser = await User.findOne({ email })
        if (existingUser) {
            res.json({ success: false, message: "User already exists with this email" })
            return
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'user'
        })

        const token = jwt.sign({ id: user._id, name: user.name, email: user.email, role: user.role }, process.env.JWT_SECRET as string)

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        })

        res.json({ success: true, role: user.role, user: { id: user._id, name: user.name, email: user.email, role: user.role } })
    } catch (error) {
        res.json({ success: false, message: (error as Error).message })
    }
}

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body

        // 1. Check if it's admin or editor
        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign({ email, name: 'Admin', role: 'admin' }, process.env.JWT_SECRET as string)
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            })
            res.json({ success: true, role: 'admin', user: { name: 'Admin', email, role: 'admin' } })
            return
        }
        else if (email === process.env.EDITOR_EMAIL && password === process.env.EDITOR_PASSWORD) {
            const token = jwt.sign({ email, name: 'Editor', role: 'editor' }, process.env.JWT_SECRET as string)
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            })
            res.json({ success: true, role: 'editor', user: { name: 'Editor', email, role: 'editor' } })
            return
        }

        // 2. Otherwise check normal user
        const user = await User.findOne({ email })
        if (!user || !user.password) {
            res.json({ success: false, message: "Invalid credentials" })
            return
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            res.json({ success: false, message: "Invalid credentials" })
            return
        }

        const token = jwt.sign({ id: user._id, name: user.name, email: user.email, role: user.role }, process.env.JWT_SECRET as string)

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })

        res.json({ success: true, role: user.role, user: { id: user._id, name: user.name, email: user.email, role: user.role } })
    } catch (error) {
        res.json({ success: false, message: (error as Error).message })
    }
}

export const logout = async (_req: Request, res: Response): Promise<void> => {
    try {
        res.cookie('token', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 0,
        })
        res.json({ success: true, message: "Logged out successfully" })
    } catch (error) {
        res.json({ success: false, message: (error as Error).message })
    }
}

export const checkAuth = async (req: Request, res: Response): Promise<void> => {
    // If this handler runs, the request already passed the auth middleware
    if (req.user) {
        res.json({ success: true, role: req.user.role, user: req.user })
    } else {
        res.json({ success: false, message: "Not authenticated" })
    }
}
