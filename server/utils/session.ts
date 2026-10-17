import type { CookieOptions, Response } from 'express'
import jwt from 'jsonwebtoken'
import { HttpError } from './http.js'
import type { AuthPayload } from '../middleware/auth.js'

export const cookieOptions = (): CookieOptions => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
})

export const jwtSecret = (): string => {
    const secret = process.env.JWT_SECRET
    if (!secret) throw new HttpError(503, 'Authentication is not configured. Please contact the administrator.')
    return secret
}

export const setSession = (res: Response, user: AuthPayload): void => {
    const token = jwt.sign(user, jwtSecret(), { expiresIn: '7d', algorithm: 'HS256' })
    res.cookie('token', token, { ...cookieOptions(), maxAge: 7 * 24 * 60 * 60 * 1000 })
}

export const clearSession = (res: Response): void => { res.clearCookie('token', cookieOptions()) }

export const environmentUser = (email: string, password: string): AuthPayload | null => {
    for (const role of ['admin', 'editor'] as const) {
        const prefix = role.toUpperCase()
        const configuredEmail = process.env[`${prefix}_EMAIL`]?.trim().toLowerCase()
        const configuredPassword = process.env[`${prefix}_PASSWORD`]
        // Both credentials must exist; an empty request must never match missing environment values.
        if (configuredEmail && configuredPassword && email === configuredEmail && password === configuredPassword) {
            return { email, name: role === 'admin' ? 'Admin' : 'Editor', role }
        }
    }
    return null
}
