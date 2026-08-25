import { Request, Response, NextFunction } from 'express'

/**
 * Middleware factory that restricts access to users with specific roles.
 * Must be used AFTER the `auth` middleware (which attaches req.user).
 */
const requireRole = (...allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const userRole = req.user?.role

        if (!userRole) {
            res.status(401).json({ success: false, message: "Not authorized. Please log in." })
            return
        }

        if (!allowedRoles.includes(userRole)) {
            res.status(403).json({ success: false, message: "Insufficient permissions." })
            return
        }

        next()
    }
}

export default requireRole
