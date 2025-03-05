import './init'

import express, { Request, Response } from 'express'
import userRoute from './routes/user'
import cashRoute from './routes/cash'
import db from './db'
import { authorizeMiddleware } from './auth'
const app = express()
const port = process.env.PORT || 3000

app.use(express.json())

// Try to connect to the database
db.getConnection()
  .then(() => {
    console.log('Connected to the database')
  })
  .catch((e) => {
    console.error('Failed to connect to the database', e)
    // Exit the process if we can't connect to the database
    process.exit(1)
  })

// Ignore all GET requests
app.get('*', (req: Request, res: Response) => {
  res.status(404).send('Not found')
})

app.use('/user', userRoute)
app.use('/cash', authorizeMiddleware, cashRoute)

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
})
