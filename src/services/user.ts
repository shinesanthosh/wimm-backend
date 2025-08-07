import db from '../db'

export const getUser = async (userId: string) => {
  const [rows]: any = await db.execute(
    'SELECT id,user_name FROM user_data WHERE id = ?',
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

export const getUserByUsername = async (username: string) => {
  const [rows]: any = await db.execute(
    'SELECT id, user_name FROM user_data WHERE user_name = ?',
    [username]
  )

  if (rows.length === 0) {
    return null
  }

  return rows[0]
}

export const addUser = async (username: string, password: string) => {
  try {
    // Insert the user and get the generated UUID
    await db.execute(
      'INSERT INTO user_data (user_name, password_hash) VALUES (?, ?)',
      [username, password]
    )

    // Retrieve the newly created user to get the UUID
    const [rows]: any = await db.execute(
      'SELECT id, user_name FROM user_data WHERE user_name = ?',
      [username]
    )

    if (rows.length === 0) {
      throw new Error('Failed to create user')
    }

    const user = rows[0]
    return { id: user.id, username: user.user_name }
  } catch (error: any) {
    // Handle duplicate key error
    if (error.code === 'ER_DUP_ENTRY') {
      throw new Error('Username already exists')
    }
    throw error
  }
}
