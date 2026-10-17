import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { jwtSecret } from '../utils/session.js'
import { HttpError } from '../utils/http.js'

export interface AuthPayload {
    id?: string
    email: string
    name?: string
    role: 'user' | 'admin' | 'editor'
    iat?: number
    exp?: number
}

// Extend Express Request to include user payload
declare global {
    namespace Express {
        interface Request {
            user?: AuthPayload
        }
    }
}

export const resolveUser = async (token: unknown): Promise<AuthPayload | null> => {
    if (typeof token !== 'string' || token.length > 4096) return null
    let decoded: AuthPayload
    try {
        decoded = jwt.verify(token, jwtSecret(), { algorithms: ['HS256'] }) as AuthPayload
    } catch (error) {
        if (error instanceof HttpError) throw error
        return null
    }
    if (!decoded || typeof decoded !== 'object' || typeof decoded.exp !== 'number' || !['user', 'admin', 'editor'].includes(decoded.role) || typeof decoded.email !== 'string') return null
    if (decoded.id) {
        if (!/^[a-f\d]{24}$/i.test(decoded.id)) return null
        const user = await User.findById(decoded.id).select('name email role isActive')
        if (!user || user.isActive === false) return null
        // Read the current role on every request so revocation and suspension take effect immediately.
        return { id: user._id.toString(), name: user.name, email: user.email, role: user.role }
    }
    if (decoded.role === 'user') return null
    const configuredEmail = process.env[`${decoded.role.toUpperCase()}_EMAIL`]?.trim().toLowerCase()
    if (!configuredEmail || !process.env[`${decoded.role.toUpperCase()}_PASSWORD`] || configuredEmail !== decoded.email) return null
    return { email: decoded.email, name: decoded.role === 'admin' ? 'Admin' : 'Editor', role: decoded.role }
}

const auth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const token = req.cookies?.token

    if (!token) {
        res.status(401).json({success: false, message: "Not authorized. Please log in."})
        return
    }

    try {
        const user = await resolveUser(token)
        if (!user) {
            res.status(401).json({success: false, message: "Your session has expired. Please log in again."})
            return
        }
        req.user = user
        next()
    } catch (error) {
        next(error)
    }
}

export const optionalAuth = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
        const user = req.cookies?.token ? await resolveUser(req.cookies.token) : null
        if (user) req.user = user
        next()
    } catch (error) { next(error) }
}

export default auth
