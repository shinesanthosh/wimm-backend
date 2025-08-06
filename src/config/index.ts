import { configSchema } from '../validation/schemas'

// Validate environment variables
let config: ReturnType<typeof configSchema.parse>

try {
  config = configSchema.parse(process.env)
  console.log('Configuration validated successfully')
} catch (error) {
  console.error('Configuration validation failed:', error)
  process.exit(1)
}

export default config

// Export specific config objects for backwards compatibility
export const dbConfig = {
  host: config.DB_SERVER,
  user: config.DB_USER,
  password: config.DB_PASSWORD,
  database: config.DB_NAME,
  port: config.DB_PORT,
}

export const jwtConfig = {
  secret: config.JWT_SECRET,
  expiresIn: config.JWT_EXPIRES_IN,
}

export const cryptoConfig = {
  saltRounds: config.SALT_ROUNDS,
}
