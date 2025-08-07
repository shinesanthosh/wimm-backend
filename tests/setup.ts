// Test setup file
import { config } from 'dotenv'

// Load test environment variables
config({ path: '.env.test' })

// Set test environment
process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'test-jwt-secret-key-that-is-long-enough-for-testing'
process.env.DB_NAME = 'wimm_test'

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}

// Increase test timeout for database operations
jest.setTimeout(30000)

// Setup and teardown
beforeAll(async () => {
  // Wait a bit for any previous tests to finish
  await new Promise((resolve) => setTimeout(resolve, 1000))
})

afterAll(async () => {
  // Clean up any open handles
  await new Promise((resolve) => setTimeout(resolve, 1000))
})
