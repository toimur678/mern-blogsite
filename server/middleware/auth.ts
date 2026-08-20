import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const auth = (req: Request, res: Response, next: NextFunction): void => {
    const token = req.cookies?.token

    if (!token) {
        res.json({success: false, message: "Not authorized. Please log in."})
        return
    }

    try {
        jwt.verify(token, process.env.JWT_SECRET as string)
        next()
    } catch (error) {
        res.json({success: false, message: "Invalid Token"})
    }
}

export default auth
