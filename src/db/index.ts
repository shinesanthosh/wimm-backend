import mysql from 'mysql2'
import { dbConfig } from './config'

// Create a MySQL connection pool
const pool = mysql.createPool({
  host: dbConfig.host,
  user: dbConfig.user,
  password: dbConfig.password,
  database: dbConfig.database,
  port: dbConfig.port,
})

// Wrap the pool into a Promise for easier async handling
const promisePool = pool.promise()

export default promisePool
