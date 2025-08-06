import db from '../db'
import { PaginationOptions, CashflowSummary } from '../types/api'

// Get all cashflows for a user with pagination
export const getCashflows = async (
  userId: string,
  options?: PaginationOptions
): Promise<CashflowSummary | null> => {
  try {
    const { page = 1, limit = 10 } = options || {}
    const offset = (page - 1) * limit

    // Get paginated cashflows
    const [rows]: any = await db.execute(
      `SELECT id, value, description, time FROM cashflow_data WHERE user_id = ? ORDER BY time DESC LIMIT ${limit} OFFSET ${offset}`,
      [userId]
    )

    // Get total sum
    const [sumResult]: any = await db.execute(
      'SELECT SUM(value) as sum FROM cashflow_data WHERE user_id = ?',
      [userId]
    )

    // Get total count
    const [countResult]: any = await db.execute(
      'SELECT COUNT(*) as count FROM cashflow_data WHERE user_id = ?',
      [userId]
    )

    return {
      cashflows: rows,
      total: sumResult[0].sum || 0,
      count: countResult[0].count || 0,
    }
  } catch (error) {
    throw new Error(`Failed to get cashflows: ${error}`)
  }
}

// Get a single cashflow
export const getCashflow = async (userId: string, cashflowId: string) => {
  try {
    const [rows]: any = await db.execute(
      'SELECT id, value, description, time FROM cashflow_data WHERE user_id = ? AND id = ?',
      [userId, cashflowId]
    )

    return rows[0] || null
  } catch (error) {
    throw new Error(`Failed to get cashflow: ${error}`)
  }
}

// Add a new cashflow
export const addCashflow = async (
  userId: string,
  amount: number,
  description?: string,
  date?: string
) => {
  try {
    if (!amount && amount !== 0) return null

    const cashflowDate = date
      ? new Date(date).toISOString().slice(0, 19).replace('T', ' ')
      : new Date().toISOString().slice(0, 19).replace('T', ' ')

    const query = `INSERT INTO cashflow_data (user_id, value, time${
      description ? ', description' : ''
    }) VALUES (?, ?, ?${description ? ', ?' : ''})`

    const params = [userId, amount, cashflowDate]
    if (description) params.push(description)

    const [result]: any = await db.execute(query, params)

    return {
      id: result.insertId,
      user_id: userId,
      value: amount,
      description: description || null,
      time: cashflowDate,
    }
  } catch (error) {
    throw new Error(`Failed to add cashflow: ${error}`)
  }
}

// Update an existing cashflow
export const updateCashflow = async (
  userId: string,
  cashflowId: string,
  amount?: number,
  description?: string,
  date?: string
) => {
  try {
    const existingCashflow = await getCashflow(userId, cashflowId)
    if (!existingCashflow) {
      return null
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
      return existingCashflow // No updates needed
    }

    const query = `UPDATE cashflow_data SET ${updates.join(
      ', '
    )} WHERE id = ? AND user_id = ?`
    params.push(cashflowId, userId)

    await db.execute(query, params)

    // Return updated cashflow
    return await getCashflow(userId, cashflowId)
  } catch (error) {
    throw new Error(`Failed to update cashflow: ${error}`)
  }
}

// Delete a cashflow
export const deleteCashflow = async (userId: string, cashflowId: string) => {
  try {
    const existingCashflow = await getCashflow(userId, cashflowId)
    if (!existingCashflow) {
      return null
    }

    const [result]: any = await db.execute(
      'DELETE FROM cashflow_data WHERE id = ? AND user_id = ?',
      [cashflowId, userId]
    )

    if (result.affectedRows === 0) {
      return null
    }

    return { id: cashflowId }
  } catch (error) {
    throw new Error(`Failed to delete cashflow: ${error}`)
  }
}
