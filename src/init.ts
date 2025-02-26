if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({
    path: `.env.${process.env.NODE_ENV || 'local'}`,
  })
  console.info('Running in development mode')
} else {
  console.info('Running in production mode')
}
