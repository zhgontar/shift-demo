import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthedRequest extends Request {
  userId?: string
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.token
  if (!token) return res.status(401).json({ error: 'No token' })

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev') as any
    req.userId = decoded.sub
    next()
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' })
  }
}