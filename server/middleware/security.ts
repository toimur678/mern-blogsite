import type { NextFunction, Request, Response } from 'express'

export const allowedOrigins = (): string[] => (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',').map(origin => origin.trim()).filter(Boolean)

export const securityHeaders = (_req: Request, res: Response, next: NextFunction): void => {
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('X-Frame-Options', 'DENY')
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
    res.setHeader('Cache-Control', 'no-store')
    next()
}

export const trustedOrigin = (req: Request, res: Response, next: NextFunction): void => {
    // Production cookies support separate frontend/API origins; validate state-changing browser requests against the CORS allowlist.
    const origin = req.get('origin')
    const unsafeMethod = !['GET', 'HEAD', 'OPTIONS'].includes(req.method)
    const untrustedOrigin = origin && !allowedOrigins().includes(origin)
    const untrustedBrowserRequest = !origin && req.get('sec-fetch-site') === 'cross-site'
    if (unsafeMethod && (untrustedOrigin || untrustedBrowserRequest)) {
        res.status(403).json({success: false, message: 'Requests from this origin are not allowed.'})
        return
    }
    next()
}

export const rateLimit = (maximum: number, windowMs = 15 * 60 * 1000) => {
    const requests = new Map<string, {count: number, resetAt: number}>()
    return (req: Request, res: Response, next: NextFunction): void => {
        const now = Date.now()
        const key = req.ip || req.socket?.remoteAddress || 'unknown'
        if (requests.size > 10000) {
            for (const [address, entry] of requests) if (entry.resetAt <= now) requests.delete(address)
            if (requests.size > 10000) {
                res.status(429).json({success: false, message: 'Too many requests. Please try again shortly.'})
                return
            }
        }
        const previous = requests.get(key)
        const entry = previous && previous.resetAt > now ? previous : {count: 0, resetAt: now + windowMs}
        entry.count += 1
        requests.set(key, entry)
        if (entry.count > maximum) {
            res.setHeader('Retry-After', Math.ceil((entry.resetAt - now) / 1000))
            res.status(429).json({success: false, message: 'Too many requests. Please try again shortly.'})
            return
        }
        next()
    }
}
