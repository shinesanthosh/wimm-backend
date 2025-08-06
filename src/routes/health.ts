import express, { Request, Response } from 'express'
import db from '../db'
import { asyncHandler } from '../utils/errorHandlers'

const router = express.Router()

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: healthy
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 services:
 *                   type: object
 *                   properties:
 *                     database:
 *                       type: string
 *                       example: connected
 *       503:
 *         description: Service is unhealthy
 */
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const healthCheck: any = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {},
    }

    try {
      // Check database connection
      await db.execute('SELECT 1')
      healthCheck.services.database = 'connected'
    } catch (error) {
      healthCheck.status = 'unhealthy'
      healthCheck.services.database = 'disconnected'
      healthCheck.error = 'Database connection failed'

      return res.status(503).json(healthCheck)
    }

    res.json(healthCheck)
  })
)

/**
 * @swagger
 * /health/ready:
 *   get:
 *     summary: Readiness check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is ready
 *       503:
 *         description: Service is not ready
 */
router.get(
  '/ready',
  asyncHandler(async (req: Request, res: Response) => {
    try {
      await db.execute('SELECT 1')
      res.json({ status: 'ready' })
    } catch (error) {
      res
        .status(503)
        .json({ status: 'not ready', error: 'Database not available' })
    }
  })
)

export default router
