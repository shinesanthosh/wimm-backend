// The cashflow routes

import express, { Request, Response } from 'express'
import {
  addCashflow,
  deleteCashflow,
  getCashflow,
  getCashflows,
  updateCashflow,
} from '../services/cash'
import { extractAuthorizedUserId } from '../auth'
import { errorLog, tryCatch, warnLog } from '../utils/errorHandlers'

const app = express.Router()

// Get all cashflows
app.post('/', async (req: Request, res: Response) => {
  const userId = extractAuthorizedUserId(req)

  if (!userId) {
    res.status(401).send('Unauthorized')
    warnLog('Unauthorized request attempted; no user ID found; at /cash/ ')
    return
  }

  const cashflows = await tryCatch(getCashflows, userId)
  res.send(cashflows)
})

// Add a new cashflow
app.post('/add', async (req: Request, res: Response) => {
  const { amount, description, date } = req.body

  const userId = extractAuthorizedUserId(req)

  if (!userId) {
    res.status(401).send('Unauthorized')
    warnLog('Unauthorized request attempted; no user ID found; at /cash/add')
    return
  }

  if (!amount) {
    res.status(400).send('Amount is required')
    return
  }

  const data = await tryCatch(
    addCashflow,
    userId,
    amount,
    description,
    date ?? new Date().toISOString().slice(0, 19).replace('T', ' ')
  )

  res.send(data)
})

// Update an existing cashflow
app.put('/update', async (req: Request, res: Response) => {
  const { cashflowId, amount, description, date } = req.body

  const userId = extractAuthorizedUserId(req)

  if (!userId) {
    res.status(401).send('Unauthorized')
    warnLog('Unauthorized request attempted; no user ID found; at /cash/update')
    return
  }

  if (!cashflowId) {
    res.status(400).send('Cashflow ID is required')
    return
  }

  const cashflow = await tryCatch(getCashflow, userId, cashflowId)

  if (!cashflow) {
    errorLog(
      `Cannot update cashflow that does not exist: ${cashflowId} for user ${userId}`
    )
    res.status(400).send('Cashflow not found')
    return
  }

  const newAmount = amount ?? cashflow.value
  const newDescription = description ?? cashflow.description
  const newDate = date ?? cashflow.time

  const newData = await tryCatch(
    updateCashflow,
    userId,
    cashflowId,
    newAmount,
    newDescription,
    newDate
  )

  res.send(newData)
})

// Get a single cashflow
app.post('/:cashflowId', async (req: Request, res: Response) => {
  const { cashflowId } = req.params

  const userId = extractAuthorizedUserId(req)

  if (!userId) {
    res.status(401).send('Unauthorized')
    warnLog(
      'Unauthorized request attempted; no user ID found; at /cash/:cashflowId'
    )
    return
  }

  const cashflow = await tryCatch(getCashflow, userId, cashflowId)

  res.send(cashflow)
})

// Delete a cashflow
app.delete('/delete', async (req: Request, res: Response) => {
  const { cashflowId } = req.body

  const userId = extractAuthorizedUserId(req)

  if (!userId) {
    res.status(401).send('Unauthorized')
    warnLog('Unauthorized request attempted; no user ID found; at /cash/delete')
    return
  }

  if (!cashflowId) {
    res.status(400).send('Cashflow ID is required')
    return
  }

  const id = await tryCatch(deleteCashflow, userId, cashflowId)

  if (!id) {
    res.status(400).send('Cashflow not found')
    return
  }

  res.send(id)
})

export default app
