import { StringValue } from '../types/jwt'
import { jwtConfig } from './config'
import jwt, { SignOptions } from 'jsonwebtoken'

export const getToken = async (username: string, userId: string) => {
  let { secret, expiresIn } = jwtConfig

  if (!expiresIn) {
    expiresIn = '3600'
  }

  const options: SignOptions = {
    expiresIn: expiresIn as StringValue,
  }

  if (username && userId && secret) {
    const token = jwt.sign({ username, userId }, secret, options)
    return token
  }
  return null
}

export const verifyToken = async (token: string) => {
  let { secret } = jwtConfig

  if (token && secret) {
    try {
      const decoded = jwt.verify(token, secret)
      return decoded
    } catch (err) {
      return null
    }
  }
  return null
}
