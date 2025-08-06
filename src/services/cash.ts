import db from '../db'

// Get all cashflows for a user
export const getCashflows = async (userId: string) => {
  let [rows]: any = await db.execute(
    'SELECT id, value, description, time FROM cashflow_data WHERE user_id = ?',
    [userId]
  )

  //   Another query for summing up the cashflows
  let [sum]: any = await db.execute(
    'SELECT SUM(value) as sum FROM cashflow_data WHERE user_id = ?',
    [userId]
  )

  return { rows, sum: sum[0].sum }
}

// Get a single cashflow
export const getCashflow = async (userId: string, cashflowId: string) => {
  let [rows]: any = await db.execute(
    'SELECT id, value, description, time FROM cashflow_data WHERE user_id = ? AND id = ?',
    [userId, cashflowId]
  )

  return rows[0]
}

// Add a new cashflow
export const addCashflow = async (
  userId: string,
  amount: number,
  description?: string,
  date?: string
) => {
  if (!amount) return null

  if (!date) date = new Date().toISOString()

  const query = `INSERT INTO cashflow_data (user_id, value, time${
    description ? ', description' : ''
  }) VALUES (?, ?, ?${description ? ', ?' : ''})`

  const params = [userId, amount, date]
  if (description) params.push(description)

  const [result]: any = await db.execute(query, params)

  const id = result.insertId
  return { id, userId, amount, description, date }
}

// Update an existing cashflow
export const updateCashflow = async (
  userId: string,
  cashflowId: string,
  amount?: number,
  description?: string,
  date?: string
) => {
  const check = await getCashflow(userId, cashflowId)
  if (!check) {
    throw new Error(
      `Cannot update cashflow that does not exist: ${cashflowId} for user ${userId}`
    )
  }

  const updates = []
  const params = []

  if (amount !== undefined) {
    updates.push('value = ?')
    params.push(amount)
  }

  if (description !== undefined) {
    updates.push('description = ?')
    params.push(description)
  }

  if (date !== undefined) {
    updates.push('time = ?')
    params.push(new Date(date).toISOString().slice(0, 19).replace('T', ' '))
  }

  if (updates.length === 0) {
    return null
  }

  const query = `UPDATE cashflow_data SET ${updates.join(
    ', '
  )} WHERE id = ? AND user_id = ?`
  params.push(cashflowId, userId)

  await db.execute(query, params)

  return { id: cashflowId, userId, amount, description, date }
}

// Delete a cashflow
export const deleteCashflow = async (userId: string, cashflowId: string) => {
  const data = await getCashflow(userId, cashflowId)

  if (!data) {
    throw new Error(
      `Cannot delete cashflow that does not exist: ${cashflowId} for user ${userId}`
    )
  }

  const result = await db.execute(
    'DELETE FROM cashflow_data WHERE id = ? AND user_id = ?',
    [cashflowId, userId]
  )

  return { id: cashflowId }
}
