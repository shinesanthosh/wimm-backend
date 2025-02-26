import db from '../db'
import { User } from '../models/user'
import { addUser, getUserAuth } from '../services/user'
import { comparePassword, hashPassword } from './crypto'

export const register = async (
  username: string,
  password: string
): Promise<User> => {
  const hashedPassword = await hashPassword(password)
  return addUser(username, hashedPassword)
}

export const login = async (
  username: string,
  password: string
): Promise<User | null> => {
  const user = await getUserAuth(username)

  if (!user) return null

  const passwordMatch = await comparePassword(password, user.password_hash)
  if (!passwordMatch) {
    return null
  }
  return { id: user.id, username: user.user_name }
}
