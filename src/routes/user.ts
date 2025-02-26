import express, { Request, Response } from 'express'
import { authenticate } from '../auth'

const app = express.Router()

app.post('/login', async (req: Request, res: Response) => {
  const { username, password } = req.body
  if (!username || !password) {
    res.status(400).send('Bad request')
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
      res.status(401).send('Invalid credentials')
    }
  } catch (e) {
    console.error(e)
    res.status(500).send('Internal server error')
  }
})

export default app
