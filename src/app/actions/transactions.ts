'use server'

import { createSupabaseServerClient } from '@/lib/supabase'
import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { transactionSchema, TransactionInput, TransactionFilters, PaginationInput } from './schemas'
import { Transaction, TransactionInsert, TransactionUpdate, TransactionWithCategory } from '@/lib/database.types'

// Get transactions with pagination and filters
export async function getTransactions(
  filters: TransactionFilters = {},
  pagination: PaginationInput = { page: 1, page_size: 20 }
) {
  try {
    const { userId } = await auth()
    if (!userId) throw new Error('Unauthorized')

    const supabase = await createSupabaseServerClient()
    
    // Calculate offset for pagination
    const offset = (pagination.page - 1) * pagination.page_size

    // Build query
    let query = supabase
      .from('transactions')
      .select(`
        *,
        categories (
          id,
          name,
          type,
          color
        )
      `, { count: 'exact' })
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + pagination.page_size - 1)

    // Apply filters
    if (filters.type) {
      query = query.eq('type', filters.type)
    }

    if (filters.category_id) {
      query = query.eq('category_id', filters.category_id)
    }

    if (filters.date_from) {
      query = query.gte('date', filters.date_from)
    }

    if (filters.date_to) {
      query = query.lte('date', filters.date_to)
    }

    if (filters.search) {
      query = query.ilike('description', `%${filters.search}%`)
    }

    const { data, error, count } = await query

    if (error) throw error

    const transactions = data as TransactionWithCategory[] || []

    return { 
      success: true, 
      data: transactions,
      pagination: {
        page: pagination.page,
        page_size: pagination.page_size,
        total: count || 0,
        has_more: (count || 0) > offset + pagination.page_size
      }
    }
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch transactions' 
    }
  }
}

// Get a single transaction by ID
export async function getTransaction(id: string) {
  try {
    const { userId } = await auth()
    if (!userId) throw new Error('Unauthorized')

    const supabase = await createSupabaseServerClient()

    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        categories (
          id,
          name,
          type,
          color
        )
      `)
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (error) throw error

    return { success: true, data: data as TransactionWithCategory }
  } catch (error) {
    console.error('Error fetching transaction:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch transaction' 
    }
  }
}

// Create a new transaction
export async function createTransaction(input: TransactionInput) {
  try {
    const { userId } = await auth()
    if (!userId) throw new Error('Unauthorized')

    // Validate input
    const validatedData = transactionSchema.parse(input)

    const supabase = await createSupabaseServerClient()

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        ...validatedData,
        user_id: userId
      } as TransactionInsert)
      .select(`
        *,
        categories (
          id,
          name,
          type,
          color
        )
      `)
      .single()

    if (error) throw error

    revalidatePath('/dashboard')
    revalidatePath('/transactions')
    revalidatePath('/budgets')
    
    return { success: true, data: data as TransactionWithCategory }
  } catch (error) {
    console.error('Error creating transaction:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create transaction' 
    }
  }
}

// Update a transaction
export async function updateTransaction(id: string, input: Partial<TransactionInput>) {
  try {
    const { userId } = await auth()
    if (!userId) throw new Error('Unauthorized')

    // Validate input
    const validatedData = transactionSchema.partial().parse(input)

    const supabase = await createSupabaseServerClient()

    // First check if user owns the transaction
    const { data: existing } = await supabase
      .from('transactions')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (!existing) {
      throw new Error('Transaction not found or access denied')
    }

    const { data, error } = await supabase
      .from('transactions')
      .update(validatedData as TransactionUpdate)
      .eq('id', id)
      .eq('user_id', userId)
      .select(`
        *,
        categories (
          id,
          name,
          type,
          color
        )
      `)
      .single()

    if (error) throw error

    revalidatePath('/dashboard')
    revalidatePath('/transactions')
    revalidatePath('/budgets')
    
    return { success: true, data: data as TransactionWithCategory }
  } catch (error) {
    console.error('Error updating transaction:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update transaction' 
    }
  }
}

// Delete a transaction
export async function deleteTransaction(id: string) {
  try {
    const { userId } = await auth()
    if (!userId) throw new Error('Unauthorized')

    const supabase = await createSupabaseServerClient()

    // Delete the transaction (RLS will ensure user can only delete their own)
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)

    if (error) throw error

    revalidatePath('/dashboard')
    revalidatePath('/transactions')
    revalidatePath('/budgets')
    
    return { success: true }
  } catch (error) {
    console.error('Error deleting transaction:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete transaction' 
    }
  }
}

// Get transaction summary for dashboard
export async function getTransactionSummary(dateFrom?: string, dateTo?: string) {
  try {
    const { userId } = await auth()
    if (!userId) throw new Error('Unauthorized')

    const supabase = await createSupabaseServerClient()

    // Default to current month if no date range provided
    const now = new Date()
    const defaultDateFrom = dateFrom || new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
    const defaultDateTo = dateTo || new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('transactions')
      .select('amount, type, date')
      .eq('user_id', userId)
      .gte('date', defaultDateFrom)
      .lte('date', defaultDateTo)

    if (error) throw error

    const transactions = data || []
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0)
    
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0)

    return { 
      success: true, 
      data: {
        total_income: income,
        total_expenses: expenses,
        net_income: income - expenses,
        transaction_count: transactions.length
      }
    }
  } catch (error) {
    console.error('Error fetching transaction summary:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch transaction summary' 
    }
  }
}

// Get spending by category for charts
export async function getSpendingByCategory(dateFrom?: string, dateTo?: string) {
  try {
    const { userId } = await auth()
    if (!userId) throw new Error('Unauthorized')

    const supabase = await createSupabaseServerClient()

    // Default to current month if no date range provided
    const now = new Date()
    const defaultDateFrom = dateFrom || new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
    const defaultDateTo = dateTo || new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('transactions')
      .select(`
        amount,
        categories!inner (
          name,
          type
        )
      `)
      .eq('user_id', userId)
      .eq('type', 'expense')
      .gte('date', defaultDateFrom)
      .lte('date', defaultDateTo)

    if (error) throw error

    // Group by category and sum amounts
    const spendingByCategory = data?.reduce((acc: any, transaction: any) => {
      const categoryName = transaction.categories.name
      acc[categoryName] = (acc[categoryName] || 0) + Number(transaction.amount)
      return acc
    }, {}) || {}

    // Convert to array format for charts
    const total = Object.values(spendingByCategory).reduce((sum: number, amount: any) => sum + amount, 0)
    
    const chartData = Object.entries(spendingByCategory).map(([category, amount]) => ({
      category,
      amount: Number(amount),
      percentage: total > 0 ? (Number(amount) / total) * 100 : 0
    })).sort((a, b) => b.amount - a.amount)

    return { success: true, data: chartData }
  } catch (error) {
    console.error('Error fetching spending by category:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch spending by category' 
    }
  }
}

// Get monthly trends for charts
export async function getMonthlyTrends(months: number = 6) {
  try {
    const { userId } = await auth()
    if (!userId) throw new Error('Unauthorized')

    const supabase = await createSupabaseServerClient()

    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - months + 1)
    startDate.setDate(1)
    const startDateStr = startDate.toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('transactions')
      .select('amount, type, date')
      .eq('user_id', userId)
      .gte('date', startDateStr)
      .order('date', { ascending: true })

    if (error) throw error

    // Group by month
    const monthlyData = data?.reduce((acc: any, transaction: any) => {
      const date = new Date(transaction.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      if (!acc[monthKey]) {
        acc[monthKey] = { income: 0, expenses: 0 }
      }
      
      if (transaction.type === 'income') {
        acc[monthKey].income += Number(transaction.amount)
      } else {
        acc[monthKey].expenses += Number(transaction.amount)
      }
      
      return acc
    }, {}) || {}

    // Convert to array format for charts
    const chartData = Object.entries(monthlyData).map(([month, data]: any) => ({
      month,
      income: data.income,
      expenses: data.expenses,
      net: data.income - data.expenses
    }))

    return { success: true, data: chartData }
  } catch (error) {
    console.error('Error fetching monthly trends:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch monthly trends' 
    }
  }
}