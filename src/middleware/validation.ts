import { Request, Response, NextFunction } from 'express'
import { ZodSchema, ZodError } from 'zod'
import { ValidationError } from '../utils/errors'

export const validateRequest = (
  schema: ZodSchema,
  source: 'body' | 'params' | 'query' = 'body'
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const data =
        source === 'body'
          ? req.body
          : source === 'params'
          ? req.params
          : req.query

      const result = schema.parse(data)

      // Replace the original data with validated data
      if (source === 'body') req.body = result
      else if (source === 'params') req.params = result
      else req.query = result

      next()
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessage = error.errors
          .map((err) => `${err.path.join('.')}: ${err.message}`)
          .join(', ')

        next(new ValidationError(errorMessage))
      } else {
        next(error)
      }
    }
  }
}
