export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T = any> extends ApiResponse<T> {
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface PaginationOptions {
  page: number
  limit: number
}

export interface Cashflow {
  id: string
  user_id: string
  value: number
  description?: string
  time: string
}

export interface CashflowSummary {
  cashflows: Cashflow[]
  total: number
  count: number
}

export interface CreateCashflowDto {
  amount: number
  description?: string
  date?: string
}

export interface UpdateCashflowDto {
  amount?: number
  description?: string
  date?: string
}
