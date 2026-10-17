import type { NextFunction, Request, Response } from 'express'
import mongoose from 'mongoose'
import multer from 'multer'

export class HttpError extends Error {
    constructor(public status: number, message: string) {
        super(message)
    }
}

export const handle = (handler: (req: Request, res: Response) => Promise<void>) =>
    (req: Request, res: Response, next: NextFunction): void => {
        void handler(req, res).catch(next)
    }

export const notFound = (_req: Request, _res: Response, next: NextFunction): void => {
    next(new HttpError(404, 'This API endpoint does not exist.'))
}

export const errorHandler = (error: unknown, _req: Request, res: Response, _next: NextFunction): void => {
    if (error instanceof HttpError) {
        res.status(error.status).json({ success: false, message: error.message })
        return
    }
    if (error instanceof multer.MulterError) {
        res.status(400).json({ success: false, message: error.code === 'LIMIT_FILE_SIZE' ? 'Cover images must be smaller than 5 MB.' : 'Invalid file upload.' })
        return
    }
    if (error instanceof mongoose.Error.ValidationError || error instanceof mongoose.Error.CastError) {
        res.status(400).json({ success: false, message: 'Please check the submitted fields.' })
        return
    }
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 11000) {
        res.status(409).json({ success: false, message: 'A record with these details already exists.' })
        return
    }
    if (error instanceof SyntaxError && 'body' in error) {
        res.status(400).json({ success: false, message: 'Request body must contain valid JSON.' })
        return
    }
    if (typeof error === 'object' && error !== null && 'status' in error && error.status === 413) {
        res.status(413).json({ success: false, message: 'Request body is too large.' })
        return
    }
    // Never return database connection strings, service credentials, or stack traces to clients.
    console.error('API request failed:', error instanceof Error ? error.name : 'UnknownError')
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' })
}
