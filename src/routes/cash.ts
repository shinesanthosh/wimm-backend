import express, { Request, Response } from 'express'
import {
  addCashflow,
  deleteCashflow,
  getCashflow,
  getCashflows,
  updateCashflow,
} from '../services/cash'
import { extractAuthorizedUserId } from '../auth'
import { asyncHandler } from '../utils/errorHandlers'
import { validateRequest } from '../middleware/validation'
import {
  addCashflowSchema,
  getCashflowSchema,
  paginationSchema,
} from '../validation/schemas'
import { AuthorizationError, NotFoundError } from '../utils/errors'
import { ApiResponse, PaginatedResponse } from '../types/api'

const router = express.Router()

/**
 * @swagger
 * /cash:
 *   get:
 *     summary: Get all cashflows for the authenticated user
 *     tags: [Cashflow]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Cashflows retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         cashflows:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Cashflow'
 *                         total:
 *                           type: number
 *                         count:
 *                           type: integer
 */
router.get(
  '/',
  validateRequest(paginationSchema, 'query'),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = extractAuthorizedUserId(req)
    if (!userId) {
      throw new AuthorizationError()
    }

    const { page, limit } = req.query as any
    const cashflows = await getCashflows(userId, { page, limit })

    if (!cashflows) {
      throw new Error('Failed to retrieve cashflows')
    }

    const response: PaginatedResponse = {
      success: true,
      data: cashflows,
      pagination: {
        page,
        limit,
        total: cashflows.count,
        totalPages: Math.ceil(cashflows.count / limit),
      },
    }

    res.json(response)
  })
)

/**
 * @swagger
 * /cash:
 *   post:
 *     summary: Add a new cashflow entry
 *     tags: [Cashflow]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCashflowRequest'
 *     responses:
 *       201:
 *         description: Cashflow created successfully
 *       400:
 *         description: Invalid input data
 */
router.post(
  '/',
  validateRequest(addCashflowSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = extractAuthorizedUserId(req)
    if (!userId) {
      throw new AuthorizationError()
    }

    const { amount, description, date } = req.body
    const data = await addCashflow(
      userId,
      amount,
      description,
      date ?? new Date().toISOString()
    )

    if (!data) {
      throw new Error('Failed to create cashflow')
    }

    const response: ApiResponse = {
      success: true,
      data,
      message: 'Cashflow created successfully',
    }

    res.status(201).json(response)
  })
)

/**
 * @swagger
 * /cash/{cashflowId}:
 *   get:
 *     summary: Get a specific cashflow entry
 *     tags: [Cashflow]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cashflowId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Cashflow retrieved successfully
 *       404:
 *         description: Cashflow not found
 */
router.get(
  '/:cashflowId',
  validateRequest(getCashflowSchema, 'params'),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = extractAuthorizedUserId(req)
    if (!userId) {
      throw new AuthorizationError()
    }

    const { cashflowId } = req.params
    const cashflow = await getCashflow(userId, cashflowId)

    if (!cashflow) {
      throw new NotFoundError(`Cashflow with ID ${cashflowId} not found`)
    }

    const response: ApiResponse = {
      success: true,
      data: cashflow,
    }

    res.json(response)
  })
)

/**
 * @swagger
 * /cash/{cashflowId}:
 *   put:
 *     summary: Update an existing cashflow entry
 *     tags: [Cashflow]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cashflowId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               description:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Cashflow updated successfully
 *       404:
 *         description: Cashflow not found
 */
router.put(
  '/:cashflowId',
  validateRequest(getCashflowSchema, 'params'),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = extractAuthorizedUserId(req)
    if (!userId) {
      throw new AuthorizationError()
    }

    const { cashflowId } = req.params
    const { amount, description, date } = req.body

    // Check if cashflow exists
    const existingCashflow = await getCashflow(userId, cashflowId)
    if (!existingCashflow) {
      throw new NotFoundError(`Cashflow with ID ${cashflowId} not found`)
    }

    const updatedData = await updateCashflow(
      userId,
      cashflowId,
      amount,
      description,
      date
    )

    if (!updatedData) {
      throw new Error('Failed to update cashflow')
    }

    const response: ApiResponse = {
      success: true,
      data: updatedData,
      message: 'Cashflow updated successfully',
    }

    res.json(response)
  })
)

/**
 * @swagger
 * /cash/{cashflowId}:
 *   delete:
 *     summary: Delete a cashflow entry
 *     tags: [Cashflow]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cashflowId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Cashflow deleted successfully
 *       404:
 *         description: Cashflow not found
 */
router.delete(
  '/:cashflowId',
  validateRequest(getCashflowSchema, 'params'),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = extractAuthorizedUserId(req)
    if (!userId) {
      throw new AuthorizationError()
    }

    const { cashflowId } = req.params
    const result = await deleteCashflow(userId, cashflowId)

    if (!result) {
      throw new NotFoundError(`Cashflow with ID ${cashflowId} not found`)
    }

    const response: ApiResponse = {
      success: true,
      data: result,
      message: 'Cashflow deleted successfully',
    }

    res.json(response)
  })
)

export default router
