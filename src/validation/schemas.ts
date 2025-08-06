import { z } from 'zod'

// User schemas
export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required').max(50),
  password: z.string().min(1, 'Password is required'),
})

export const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(50),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(100),
})

// Cashflow schemas
export const addCashflowSchema = z.object({
  amount: z
    .number()
    .min(-999999.99, 'Amount too small')
    .max(999999.99, 'Amount too large')
    .refine((val) => Number.isFinite(val), 'Amount must be a valid number'),
  description: z.string().max(500, 'Description too long').optional(),
  date: z.string().datetime().optional(),
})

export const updateCashflowSchema = z.object({
  cashflowId: z.string().uuid('Invalid cashflow ID'),
  amount: z
    .number()
    .min(-999999.99, 'Amount too small')
    .max(999999.99, 'Amount too large')
    .optional(),
  description: z.string().max(500, 'Description too long').optional(),
  date: z.string().datetime().optional(),
})

export const deleteCashflowSchema = z.object({
  cashflowId: z.string().uuid('Invalid cashflow ID'),
})

export const getCashflowSchema = z.object({
  cashflowId: z.string().uuid('Invalid cashflow ID'),
})

// Pagination schema
export const paginationSchema = z.object({
  page: z
    .string()
    .transform((val) => parseInt(val) || 1)
    .refine((val) => val > 0, 'Page must be positive'),
  limit: z
    .string()
    .transform((val) => parseInt(val) || 10)
    .refine((val) => val > 0 && val <= 100, 'Limit must be between 1 and 100'),
})

// Environment config schema
export const configSchema = z.object({
  PORT: z.string().transform(Number).default('3000'),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('1h'),
  SALT_ROUNDS: z.string().transform(Number).default('12'),
  DB_SERVER: z.string().min(1, 'Database server is required'),
  DB_USER: z.string().min(1, 'Database user is required'),
  DB_PASSWORD: z.string().min(1, 'Database password is required'),
  DB_NAME: z.string().min(1, 'Database name is required'),
  DB_PORT: z.string().transform(Number).default('3306'),
  LOG_LEVEL: z.string().default('info'),
})
