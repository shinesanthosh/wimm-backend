import express, { Request, Response } from 'express'
import { authenticate } from '../auth'
import { JwtPayload } from 'jsonwebtoken'
import { verifyToken } from '../auth/authorization'

const app = express.Router()

app.post('/login', async (req: Request, res: Response) => {
  const { username, password } = req.body
  if (!username || !password) {
    res.status(400).send({ error: 'Username and password are required' })
    return
  }
  try {
    const user = await authenticate(username, password)
    if (user) {
      // set cookie
      res.cookie('token', user.token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
      })
      res.send(user)
    } else {
      res.status(401).send({ error: 'Invalid username or password' })
    }
  } catch (e) {
    console.error(e)
    res.status(500).send({ error: 'An error occurred while logging in' })
  }
})

// get the user info from the request
app.post('/me', async (req: Request, res: Response) => {
  const token = req.headers?.authorization?.split(' ')[1]

  if (!token) {
    res.status(401).send({ error: 'Unauthorized' })
    return
  }

  const decoded = (await verifyToken(token)) as JwtPayload
  if (!decoded) {
    res.status(401).send({ error: 'Unauthorized' })
    return
  }

  res.send({
    username: decoded.username,
    userId: decoded.userId,
  })
})

export default app
