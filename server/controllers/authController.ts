import type { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import User from '../models/User.js'
import { handle, HttpError } from '../utils/http.js'
import { emailAddress, escapeRegex, passwordValue, record, text } from '../utils/validation.js'
import { clearSession, environmentUser, setSession } from '../utils/session.js'
import type { AuthPayload } from '../middleware/auth.js'

export const signup = handle(async (req, res) => {
    const body = record(req.body)
    const name = text(body.name, 'Name', 2, 80)
    const email = emailAddress(body.email)
    const password = passwordValue(body.password, true)
    const reservedEmails = [process.env.ADMIN_EMAIL, process.env.EDITOR_EMAIL].filter(Boolean).map(value => value!.trim().toLowerCase())
    if (reservedEmails.includes(email) || await User.exists({email: {$regex: `^${escapeRegex(email)}$`, $options: 'i'}})) throw new HttpError(409, 'An account with this email already exists.')

    const hashedPassword = await bcrypt.hash(password, 12)
    const user = await User.create({name, email, password: hashedPassword, role: 'user'})
    const payload: AuthPayload = {id: user._id.toString(), name: user.name, email: user.email, role: user.role}
    setSession(res, payload)
    res.status(201).json({success: true, role: user.role, user: payload})
})

export const authenticate = async (email: string, password: string): Promise<AuthPayload> => {
    // Check configured admin/editor credentials before looking up a registered account.
    const staff = environmentUser(email, password)
    if (staff) return staff
    // Case-insensitive lookup preserves access for accounts created before email normalization was introduced.
    const user = await User.findOne({email: {$regex: `^${escapeRegex(email)}$`, $options: 'i'}}).select('+password')
    if (!user?.password || user.isActive === false || !await bcrypt.compare(password, user.password)) {
        throw new HttpError(401, 'Invalid email or password.')
    }
    return {id: user._id.toString(), name: user.name, email: user.email, role: user.role}
}

export const login = handle(async (req, res) => {
    const body = record(req.body)
    const user = await authenticate(emailAddress(body.email), passwordValue(body.password))
    setSession(res, user)
    res.json({success: true, role: user.role, user})
})

export const logout = (_req: Request, res: Response): void => {
    clearSession(res)
    res.json({success: true, message: 'Logged out successfully'})
}

export const checkAuth = (req: Request, res: Response): void => {
    // If this handler runs, the request already passed the auth middleware.
    res.json({success: true, role: req.user?.role, user: req.user})
}
