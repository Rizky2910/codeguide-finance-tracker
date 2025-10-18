'use server'

import { createSupabaseServerClient } from '@/lib/supabase'
import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { budgetSchema, BudgetInput } from './schemas'
import { Budget, BudgetInsert, BudgetUpdate, BudgetWithSpending } from '@/lib/database.types'

// Get all budgets for the authenticated user
export async function getBudgets(includeSpending: boolean = false) {
  try {
    const { userId } = await auth()
    if (!userId) throw new Error('Unauthorized')

    const supabase = await createSupabaseServerClient()

    let query = supabase
      .from('budgets')
      .select(`
        *,
        categories (
          id,
          name,
          type
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    const { data, error } = await query

    if (error) throw error

    let budgets = data || []

    // Calculate spending for each budget if requested
    if (includeSpending) {
      budgets = await Promise.all(
        budgets.map(async (budget) => {
          const spent = await getBudgetSpending(budget.id)
          const remaining = Number(budget.amount) - spent
          const percentage_used = Number(budget.amount) > 0 ? (spent / Number(budget.amount)) * 100 : 0

          return {
            ...budget,
            spent,
            remaining,
            percentage_used
          } as BudgetWithSpending
        })
      )
    }

    return { success: true, data: budgets }
  } catch (error) {
    console.error('Error fetching budgets:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch budgets' }
  }
}

// Get a single budget by ID
export async function getBudget(id: string) {
  try {
    const { userId } = await auth()
    if (!userId) throw new Error('Unauthorized')

    const supabase = await createSupabaseServerClient()

    const { data, error } = await supabase
      .from('budgets')
      .select(`
        *,
        categories (
          id,
          name,
          type
        )
      `)
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error('Error fetching budget:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch budget' }
  }
}

// Create a new budget
export async function createBudget(input: BudgetInput) {
  try {
    const { userId } = await auth()
    if (!userId) throw new Error('Unauthorized')

    // Validate input
    const validatedData = budgetSchema.parse(input)

    const supabase = await createSupabaseServerClient()

    const { data, error } = await supabase
      .from('budgets')
      .insert({
        ...validatedData,
        user_id: userId
      } as BudgetInsert)
      .select(`
        *,
        categories (
          id,
          name,
          type
        )
      `)
      .single()

    if (error) throw error

    revalidatePath('/budgets')
    revalidatePath('/dashboard')
    
    return { success: true, data }
  } catch (error) {
    console.error('Error creating budget:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create budget' 
    }
  }
}

// Update a budget
export async function updateBudget(id: string, input: Partial<BudgetInput>) {
  try {
    const { userId } = await auth()
    if (!userId) throw new Error('Unauthorized')

    // Validate input
    const validatedData = budgetSchema.partial().parse(input)

    const supabase = await createSupabaseServerClient()

    // First check if user owns the budget
    const { data: existing } = await supabase
      .from('budgets')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (!existing) {
      throw new Error('Budget not found or access denied')
    }

    const { data, error } = await supabase
      .from('budgets')
      .update(validatedData as BudgetUpdate)
      .eq('id', id)
      .eq('user_id', userId)
      .select(`
        *,
        categories (
          id,
          name,
          type
        )
      `)
      .single()

    if (error) throw error

    revalidatePath('/budgets')
    revalidatePath('/dashboard')
    
    return { success: true, data }
  } catch (error) {
    console.error('Error updating budget:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update budget' 
    }
  }
}

// Delete a budget
export async function deleteBudget(id: string) {
  try {
    const { userId } = await auth()
    if (!userId) throw new Error('Unauthorized')

    const supabase = await createSupabaseServerClient()

    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) throw error

    revalidatePath('/budgets')
    revalidatePath('/dashboard')
    
    return { success: true }
  } catch (error) {
    console.error('Error deleting budget:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete budget' 
    }
  }
}

// Get spending for a specific budget
export async function getBudgetSpending(budgetId: string) {
  try {
    const { userId } = await auth()
    if (!userId) throw new Error('Unauthorized')

    const supabase = await createSupabaseServerClient()

    // First get the budget details
    const { data: budget, error: budgetError } = await supabase
      .from('budgets')
      .select('category_id, start_date, end_date')
      .eq('id', budgetId)
      .eq('user_id', userId)
      .single()

    if (budgetError || !budget) {
      throw new Error('Budget not found or access denied')
    }

    // Get transactions within the budget period
    let query = supabase
      .from('transactions')
      .select('amount')
      .eq('user_id', userId)
      .eq('type', 'expense')
      .gte('date', budget.start_date)
      .lte('date', budget.end_date)

    // If budget has a category, filter by it
    if (budget.category_id) {
      query = query.eq('category_id', budget.category_id)
    }

    const { data: transactions, error: transactionError } = await query

    if (transactionError) throw transactionError

    // Sum up the spending
    const totalSpent = transactions?.reduce((sum, transaction) => {
      return sum + Number(transaction.amount)
    }, 0) || 0

    return totalSpent
  } catch (error) {
    console.error('Error calculating budget spending:', error)
    return 0
  }
}

// Get active budgets (current date is within budget period)
export async function getActiveBudgets() {
  try {
    const { userId } = await auth()
    if (!userId) throw new Error('Unauthorized')

    const supabase = await createSupabaseServerClient()
    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('budgets')
      .select(`
        *,
        categories (
          id,
          name,
          type
        )
      `)
      .eq('user_id', userId)
      .lte('start_date', today)
      .gte('end_date', today)
      .order('created_at', { ascending: false })

    if (error) throw error

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Error fetching active budgets:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch active budgets' }
  }
}

// Get budget performance data for charts
export async function getBudgetPerformance() {
  try {
    const { userId } = await auth()
    if (!userId) throw new Error('Unauthorized')

    const supabase = await createSupabaseServerClient()

    // Get all budgets with spending data
    const { data: budgets, error } = await supabase
      .from('budgets')
      .select(`
        *,
        categories (
          id,
          name,
          type
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Calculate spending for each budget
    const budgetsWithSpending = await Promise.all(
      (budgets || []).map(async (budget) => {
        const spent = await getBudgetSpending(budget.id)
        const remaining = Number(budget.amount) - spent
        const percentage_used = Number(budget.amount) > 0 ? (spent / Number(budget.amount)) * 100 : 0

        return {
          id: budget.id,
          name: budget.name,
          category: budget.categories?.name || 'Uncategorized',
          budget_amount: Number(budget.amount),
          spent,
          remaining,
          percentage_used,
          status: percentage_used > 100 ? 'over' : percentage_used > 80 ? 'warning' : 'good'
        }
      })
    )

    return { success: true, data: budgetsWithSpending }
  } catch (error) {
    console.error('Error fetching budget performance:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch budget performance' }
  }
}

// Check for budget alerts (budgets that are over or nearing their limit)
export async function getBudgetAlerts() {
  try {
    const { userId } = await auth()
    if (!userId) throw new Error('Unauthorized')

    const { data: budgets, error } = await getActiveBudgets()
    if (error || !budgets) throw new Error('Failed to fetch active budgets')

    const alerts = await Promise.all(
      budgets.map(async (budget) => {
        const spent = await getBudgetSpending(budget.id)
        const percentage = Number(budget.amount) > 0 ? (spent / Number(budget.amount)) * 100 : 0

        if (percentage >= 100) {
          return {
            type: 'over',
            budget: budget.name,
            percentage,
            spent,
            budget_amount: Number(budget.amount)
          }
        } else if (percentage >= 80) {
          return {
            type: 'warning',
            budget: budget.name,
            percentage,
            spent,
            budget_amount: Number(budget.amount)
          }
        }
        return null
      })
    )

    const validAlerts = alerts.filter(alert => alert !== null)

    return { success: true, data: validAlerts }
  } catch (error) {
    console.error('Error fetching budget alerts:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch budget alerts' }
  }
}