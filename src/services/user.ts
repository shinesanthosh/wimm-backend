import db from '../db'

export const getUser = async (userId: string) => {
  const [rows]: any = await db.execute(
    'SELECT id,username FROM user_data WHERE id = ?',
    [userId]
  )
  if (rows.length === 0) {
    return null
  }
  const user = rows[0]
  return user
}

export const getUserAuth = async (userId: string) => {
  const [rows]: any = await db.execute(
    `SELECT id, user_name, password_hash FROM user_data WHERE user_name = ?`,
    [userId]
  )

  if (rows.length === 0) {
    return null
  }
  const user = rows[0]
  return user
}

export const addUser = async (username: string, password: string) => {
  const [result]: any = await db.execute(
    'INSERT INTO user_data (user_name, password_hash) VALUES (?, ?)',
    [username, password]
  )
  const id = result.insertId
  return { id, username }
}
