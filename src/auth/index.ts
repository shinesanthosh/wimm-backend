import { NextFunction, Request, Response } from 'express'
import { login, register } from './authentication'
import { getToken, verifyToken } from './authorization'
import { JwtPayload } from 'jsonwebtoken'
import { tryCatch } from '../utils/errorHandlers'
import { getUser } from '../services/user'
import { isBlacklisted } from '../utils/tokenBlacklist'

declare module 'express-serve-static-core' {
  interface Request {
    user?: string | JwtPayload
  }
}

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
  let token: string | undefined
  let decoded: string | JwtPayload | null = null

  // Check for token in cookie first
  const tokenCookie = req.cookies?.token
  if (tokenCookie) {
    token = tokenCookie
  } else {
    // Check for token in Authorization header
    token = req.headers.authorization?.split(' ')[1]
  }

  // If no token found, return unauthorized
  if (!token) {
    res.status(401).json({
      success: false,
      error: 'No token provided',
    })
    return
  }

  // Check if token is blacklisted
  if (isBlacklisted(token)) {
    res.status(401).json({
      success: false,
      error: 'Token has been revoked',
    })
    return
  }

  // Verify the token
  decoded = await verifyToken(token)
  if (!decoded) {
    res.status(401).json({
      success: false,
      error: 'Invalid or expired token',
    })
    return
  }

  // Check if the user exists in the database
  const user = await tryCatch(getUser, (decoded as JwtPayload).userId)
  if (!user) {
    res.status(401).json({
      success: false,
      error: 'User not found',
    })
    return
  }

  // Set user in request and continue
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
