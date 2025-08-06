import mysql from 'mysql2'
import { dbConfig } from './config'
import logger from '../utils/logger'

// Create a MySQL connection pool
const pool = mysql.createPool({
  host: dbConfig.host,
  user: dbConfig.user,
  password: dbConfig.password,
  database: dbConfig.database,
  port: dbConfig.port,
  connectionLimit: 10,
})

// Wrap the pool into a Promise for easier async handling
const promisePool = pool.promise()

// Connection retry logic
export const createDbConnection = async (retries = 5): Promise<void> => {
  for (let i = 0; i < retries; i++) {
    try {
      const connection = await promisePool.getConnection()
      connection.release()
      logger.info('Database connected successfully')
      return
    } catch (error) {
      logger.error(`Database connection attempt ${i + 1} failed`, { error })
      if (i === retries - 1) {
        throw new Error(
          `Failed to connect to database after ${retries} attempts`
        )
      }
      await new Promise((resolve) => setTimeout(resolve, 2000 * (i + 1))) // Exponential backoff
    }
  }
}

// Handle pool errors
pool.on('error', (err) => {
  logger.error('Database pool error', { error: err })
})

export default promisePool
