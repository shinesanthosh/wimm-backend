import { Request, Response, NextFunction } from 'express'
import logger from './logger'
import { AppError } from './errors'

export const tryCatch = async <T>(
  fn: (...args: any[]) => Promise<T>,
  ...args: any[]
): Promise<T | null> => {
  try {
    return await fn(...args)
  } catch (error) {
    logger.error('Handled error in tryCatch', { error, args })
    return null
  }
}

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

export const globalErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query,
  })

  if (res.headersSent) {
    return next(err)
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
    })
    return
  }

  // Handle specific error types
  if (err.name === 'ValidationError') {
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: err.message,
    })
    return
  }

  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({
      success: false,
      error: 'Invalid token',
    })
    return
  }

  if (err.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      error: 'Token expired',
    })
    return
  }

  // Default error response
  res.status(500).json({
    success: false,
    error:
      process.env.NODE_ENV === 'production'
        ? 'Something went wrong'
        : err.message,
  })
}

export const errorLog = (message: string, meta?: any) => {
  logger.error(message, meta)
}

export const warnLog = (message: string, meta?: any) => {
  logger.warn(message, meta)
}
