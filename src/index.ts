import './init'

import express, { Request, Response } from 'express'
import cookieParser from 'cookie-parser'
import userRoute from './routes/user'
import cashRoute from './routes/cash'
import healthRoute from './routes/health'
import { createDbConnection } from './db'
import { authorizeMiddleware } from './auth'
import { globalErrorHandler } from './utils/errorHandlers'
import {
  securityHeaders,
  generalLimiter,
  requestLogger,
} from './middleware/security'
import { setupSwagger } from './docs/swagger'
import config from './config'
import logger from './utils/logger'

const app = express()
const port = config.PORT

// Security middleware
app.use(securityHeaders)
app.use(generalLimiter)

// Request parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// Request logging
app.use(requestLogger)

// API Documentation
if (config.NODE_ENV !== 'production') {
  setupSwagger(app)
  logger.info('Swagger documentation available at /api-docs')
}

// Initialize database connection
const initializeApp = async () => {
  try {
    await createDbConnection()
    logger.info('Application initialized successfully')
  } catch (error) {
    logger.error('Failed to initialize application', { error })
    process.exit(1)
  }
}

// Health check routes (no auth required)
app.use('/health', healthRoute)

// API routes
app.use('/user', userRoute)
app.use('/cash', authorizeMiddleware, cashRoute)

// Handle 404 for undefined routes
app.all('*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.path} not found`,
  })
})

// Global error handler (must be last)
app.use(globalErrorHandler)

// Graceful shutdown handling
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully')
  process.exit(0)
})

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully')
  process.exit(0)
})

// Start server
const startServer = async () => {
  await initializeApp()

  app.listen(port, () => {
    logger.info(`Server is running on http://localhost:${port}`)
    if (config.NODE_ENV !== 'production') {
      logger.info(`API Documentation: http://localhost:${port}/api-docs`)
    }
  })
}

startServer().catch((error) => {
  logger.error('Failed to start server', { error })
  process.exit(1)
})

export { app }
