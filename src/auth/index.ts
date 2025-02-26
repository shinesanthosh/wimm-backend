import { NextFunction, Request, Response } from 'express'

declare module 'express-serve-static-core' {
  interface Request {
    user?: string | JwtPayload
  }
}
import { login, register } from './authentication'
import { getToken, verifyToken } from './authorization'
import { User } from '../models/user'
import { JwtPayload } from 'jsonwebtoken'

const authenticate = async (username: string, password: string) => {
  const user = await login(username, password)
  if (user) {
    const token = await getToken(user.username, user.id)
    return {
      user,
      token,
    }
  }
  return null
}

// middleware to authorize requests
const authorizeMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const tokenCookie = req.cookies?.token?.split(' ')[1]

  if (tokenCookie) {
    const decoded = await verifyToken(tokenCookie)
    if (decoded) req.user = decoded
    next()
    return
  }

  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    res.status(401).send('Unauthorized')
    return
  }
  const decoded = await verifyToken(token)
  if (!decoded) {
    res.status(401).send('Unauthorized')
    return
  }
  req.user = decoded
  next()
}

const extractAuthorizedUserId = (req: Request): string | null => {
  const user = req.user as { userId: string } | undefined
  const userId = user?.userId

  if (!userId) return null

  return userId
}

export { register, authenticate, authorizeMiddleware, extractAuthorizedUserId }
