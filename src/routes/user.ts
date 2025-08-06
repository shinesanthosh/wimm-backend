import express, { Request, Response } from 'express'
import { authenticate } from '../auth'
import { JwtPayload } from 'jsonwebtoken'
import { verifyToken } from '../auth/authorization'
import { validateRequest } from '../middleware/validation'
import { loginSchema } from '../validation/schemas'
import { authLimiter } from '../middleware/security'
import { asyncHandler } from '../utils/errorHandlers'
import { AuthenticationError, AuthorizationError } from '../utils/errors'
import { ApiResponse } from '../types/api'
import config from '../config'
import { addToBlacklist, isBlacklisted } from '../utils/tokenBlacklist'

const router = express.Router()

/**
 * @swagger
 * /user/login:
 *   post:
 *     summary: User login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         user:
 *                           $ref: '#/components/schemas/User'
 *                         token:
 *                           type: string
 *       401:
 *         description: Invalid credentials
 *       429:
 *         description: Too many login attempts
 */
router.post(
  '/login',
  authLimiter,
  validateRequest(loginSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { username, password } = req.body

    const result = await authenticate(username, password)
    if (!result) {
      throw new AuthenticationError('Invalid username or password')
    }

    // Set secure cookie
    res.cookie('token', result.token, {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: config.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    })

    const response: ApiResponse = {
      success: true,
      data: result,
      message: 'Login successful',
    }

    res.json(response)
  })
)

/**
 * @swagger
 * /user/me:
 *   get:
 *     summary: Get current user information
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         username:
 *                           type: string
 *                         userId:
 *                           type: string
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/me',
  asyncHandler(async (req: Request, res: Response) => {
    const token =
      req.headers?.authorization?.split(' ')[1] || req.cookies?.token

    if (!token) {
      throw new AuthorizationError('No token provided')
    }

    if (isBlacklisted(token)) {
      throw new AuthorizationError('Token has been revoked')
    }

    const decoded = (await verifyToken(token)) as JwtPayload
    if (!decoded) {
      throw new AuthorizationError('Invalid token')
    }

    const response: ApiResponse = {
      success: true,
      data: {
        username: decoded.username,
        userId: decoded.userId,
      },
    }

    res.json(response)
  })
)

/**
 * @swagger
 * /user/logout:
 *   post:
 *     summary: User logout
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post(
  '/logout',
  asyncHandler(async (req: Request, res: Response) => {
    // Get the token from cookie or header
    const token =
      req.cookies?.token || req.headers?.authorization?.split(' ')[1]

    // Add token to blacklist if it exists
    if (token) {
      addToBlacklist(token)
    }

    // Clear cookie with same options as when it was set
    res.clearCookie('token', {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: config.NODE_ENV === 'production' ? 'none' : 'lax',
    })

    const response: ApiResponse = {
      success: true,
      message: 'Logout successful',
    }

    res.json(response)
  })
)

export default router
