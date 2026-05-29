import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production'

export interface AuthRequest extends Request {
  user?: {
    id: number
    email: string
  }
}

export const checkAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.authToken

    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; email: string }

    req.user = decoded

    next()
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: 'Invalid token' })
    }
    next(err)
  }
}
