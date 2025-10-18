import { z } from 'zod'

// Transaction validation schema
export const transactionSchema = z.object({
  amount: z.number().refine((amount) => amount !== 0, {
    message: 'Amount cannot be zero'
  }),
  type: z.enum(['income', 'expense'], {
    required_error: 'Please select a transaction type'
  }),
  description: z.string().optional(),
  category_id: z.string().uuid({
    message: 'Please select a valid category'
  }),
  date: z.string().refine((date) => {
    const parsedDate = new Date(date)
    return !isNaN(parsedDate.getTime())
  }, {
    message: 'Please enter a valid date'
  })
})

// Category validation schema
export const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(50, 'Category name must be less than 50 characters'),
  type: z.enum(['income', 'expense'], {
    required_error: 'Please select a category type'
  })
})

// Budget validation schema
export const budgetSchema = z.object({
  name: z.string().min(1, 'Budget name is required').max(100, 'Budget name must be less than 100 characters'),
  category_id: z.string().uuid().optional().nullable(),
  amount: z.number().positive('Budget amount must be greater than 0'),
  period: z.enum(['weekly', 'monthly', 'quarterly', 'yearly'], {
    required_error: 'Please select a budget period'
  }),
  start_date: z.string().refine((date) => {
    const parsedDate = new Date(date)
    return !isNaN(parsedDate.getTime())
  }, {
    message: 'Please enter a valid start date'
  }),
  end_date: z.string().refine((date) => {
    const parsedDate = new Date(date)
    return !isNaN(parsedDate.getTime())
  }, {
    message: 'Please enter a valid end date'
  })
}).refine((data) => new Date(data.end_date) > new Date(data.start_date), {
  message: 'End date must be after start date',
  path: ['end_date']
})

// Goal validation schema
export const goalSchema = z.object({
  title: z.string().min(1, 'Goal title is required').max(100, 'Goal title must be less than 100 characters'),
  description: z.string().optional(),
  target_amount: z.number().positive('Target amount must be greater than 0'),
  current_amount: z.number().min(0, 'Current amount cannot be negative').default(0),
  deadline: z.string().optional().nullable().refine((date) => {
    if (!date) return true
    const parsedDate = new Date(date)
    return !isNaN(parsedDate.getTime()) && parsedDate > new Date()
  }, {
    message: 'Deadline must be a future date'
  }),
  type: z.enum(['savings', 'debt_payoff', 'investment', 'other'], {
    required_error: 'Please select a goal type'
  }),
  status: z.enum(['active', 'completed', 'paused']).default('active')
}).refine((data) => data.current_amount <= data.target_amount, {
  message: 'Current amount cannot exceed target amount',
  path: ['current_amount']
})

// Filter schemas for API queries
export const transactionFiltersSchema = z.object({
  category_id: z.string().uuid().optional(),
  type: z.enum(['income', 'expense']).optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  search: z.string().max(100).optional()
})

export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  page_size: z.number().min(1).max(100).default(20)
})

// Date range schema
export const dateRangeSchema = z.object({
  start: z.string().refine((date) => !isNaN(new Date(date).getTime()), {
    message: 'Please enter a valid start date'
  }),
  end: z.string().refine((date) => !isNaN(new Date(date).getTime()), {
    message: 'Please enter a valid end date'
  })
}).refine((data) => new Date(data.end) >= new Date(data.start), {
  message: 'End date must be after or equal to start date',
  path: ['end']
})

// Export types for use in components
export type TransactionInput = z.infer<typeof transactionSchema>
export type CategoryInput = z.infer<typeof categorySchema>
export type BudgetInput = z.infer<typeof budgetSchema>
export type GoalInput = z.infer<typeof goalSchema>
export type TransactionFilters = z.infer<typeof transactionFiltersSchema>
export type PaginationInput = z.infer<typeof paginationSchema>
export type DateRangeInput = z.infer<typeof dateRangeSchema>