export const dbConfig = {
  host: process.env.DB_SERVER as string, // Docker container IP address
  user: process.env.DB_USER as string, // MySQL root user
  password: process.env.DB_PASSWORD as string, // MySQL root password
  database: process.env.DB_NAME as string, // Your database name
  port: Number(process.env.DB_PORT), // Convert string to number for the port
}
