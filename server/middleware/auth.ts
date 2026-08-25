import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthPayload {
    email: string
    role: 'admin' | 'editor'
    iat?: number
}

// Extend Express Request to include user payload
declare global {
    namespace Express {
        interface Request {
            user?: AuthPayload
        }
    }
}

const auth = (req: Request, res: Response, next: NextFunction): void => {
    const token = req.cookies?.token

    if (!token) {
        res.json({success: false, message: "Not authorized. Please log in."})
        return
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as AuthPayload
        req.user = decoded
        next()
    } catch (error) {
        res.json({success: false, message: "Invalid Token"})
    }
}

export default auth
