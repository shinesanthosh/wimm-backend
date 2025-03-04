import { NextFunction, Request, Response } from 'express'
import { login, register } from './authentication'
import { getToken, verifyToken } from './authorization'
import { JwtPayload } from 'jsonwebtoken'
import { tryCatch } from '../utils/errorHandlers'
import { getUser } from '../services/user'

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
  const tokenCookie = req.cookies?.token?.split(' ')[1]

  // check if the token is in the cookie
  if (tokenCookie) {
    const decoded = await verifyToken(tokenCookie)
    if (decoded) req.user = decoded
    next()
    return
  }

  // if not in the cookie, check if the token is in the headers
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

  // once the token is verified, check if the user exists
  const user = await tryCatch(getUser, (decoded as JwtPayload).userId)

  if (!user) {
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
