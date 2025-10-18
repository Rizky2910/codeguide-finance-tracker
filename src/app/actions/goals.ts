'use server'

import { createSupabaseServerClient } from '@/lib/supabase'
import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { goalSchema, GoalInput } from './schemas'
import { Goal, GoalInsert, GoalUpdate } from '@/lib/database.types'

// Get all goals for the authenticated user
export async function getGoals(status?: 'active' | 'completed' | 'paused') {
  try {
    const { userId } = await auth()
    if (!userId) throw new Error('Unauthorized')

    const supabase = await createSupabaseServerClient()

    let query = supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) throw error

    // Calculate progress percentage for each goal
    const goalsWithProgress = (data || []).map(goal => ({
      ...goal,
      progress_percentage: Number(goal.target_amount) > 0 
        ? (Number(goal.current_amount) / Number(goal.target_amount)) * 100 
        : 0
    }))

    return { success: true, data: goalsWithProgress }
  } catch (error) {
    console.error('Error fetching goals:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch goals' }
  }
}

// Get a single goal by ID
export async function getGoal(id: string) {
  try {
    const { userId } = await auth()
    if (!userId) throw new Error('Unauthorized')

    const supabase = await createSupabaseServerClient()

    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (error) throw error

    // Calculate progress percentage
    const goalWithProgress = {
      ...data,
      progress_percentage: Number(data.target_amount) > 0 
        ? (Number(data.current_amount) / Number(data.target_amount)) * 100 
        : 0
    }

    return { success: true, data: goalWithProgress }
  } catch (error) {
    console.error('Error fetching goal:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch goal' }
  }
}

// Create a new goal
export async function createGoal(input: GoalInput) {
  try {
    const { userId } = await auth()
    if (!userId) throw new Error('Unauthorized')

    // Validate input
    const validatedData = goalSchema.parse(input)

    const supabase = await createSupabaseServerClient()

    const { data, error } = await supabase
      .from('goals')
      .insert({
        ...validatedData,
        user_id: userId
      } as GoalInsert)
      .select()
      .single()

    if (error) throw error

    // Calculate progress percentage
    const goalWithProgress = {
      ...data,
      progress_percentage: Number(data.target_amount) > 0 
        ? (Number(data.current_amount) / Number(data.target_amount)) * 100 
        : 0
    }

    revalidatePath('/goals')
    revalidatePath('/dashboard')
    
    return { success: true, data: goalWithProgress }
  } catch (error) {
    console.error('Error creating goal:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create goal' 
    }
  }
}

// Update a goal
export async function updateGoal(id: string, input: Partial<GoalInput>) {
  try {
    const { userId } = await auth()
    if (!userId) throw new Error('Unauthorized')

    // Validate input
    const validatedData = goalSchema.partial().parse(input)

    const supabase = await createSupabaseServerClient()

    // First check if user owns the goal
    const { data: existing } = await supabase
      .from('goals')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (!existing) {
      throw new Error('Goal not found or access denied')
    }

    const { data, error } = await supabase
      .from('goals')
      .update(validatedData as GoalUpdate)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error

    // Calculate progress percentage
    const goalWithProgress = {
      ...data,
      progress_percentage: Number(data.target_amount) > 0 
        ? (Number(data.current_amount) / Number(data.target_amount)) * 100 
        : 0
    }

    // Auto-complete goal if target reached
    if (Number(data.current_amount) >= Number(data.target_amount) && data.status !== 'completed') {
      const { data: completedGoal, error: completeError } = await supabase
        .from('goals')
        .update({ status: 'completed' } as GoalUpdate)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single()

      if (completeError) throw completeError

      revalidatePath('/goals')
      revalidatePath('/dashboard')
      
      return { success: true, data: { ...completedGoal, progress_percentage: 100 } }
    }

    revalidatePath('/goals')
    revalidatePath('/dashboard')
    
    return { success: true, data: goalWithProgress }
  } catch (error) {
    console.error('Error updating goal:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update goal' 
    }
  }
}

// Delete a goal
export async function deleteGoal(id: string) {
  try {
    const { userId } = await auth()
    if (!userId) throw new Error('Unauthorized')

    const supabase = await createSupabaseServerClient()

    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) throw error

    revalidatePath('/goals')
    revalidatePath('/dashboard')
    
    return { success: true }
  } catch (error) {
    console.error('Error deleting goal:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete goal' 
    }
  }
}

// Update goal progress (add money to goal)
export async function updateGoalProgress(id: string, amount: number) {
  try {
    const { userId } = await auth()
    if (!userId) throw new Error('Unauthorized')

    if (amount <= 0) {
      throw new Error('Amount must be greater than 0')
    }

    const supabase = await createSupabaseServerClient()

    // First get current goal details
    const { data: currentGoal, error: fetchError } = await supabase
      .from('goals')
      .select('current_amount, target_amount, status')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (fetchError || !currentGoal) {
      throw new Error('Goal not found or access denied')
    }

    const newCurrentAmount = Number(currentGoal.current_amount) + amount
    const newPercentage = Number(currentGoal.target_amount) > 0 
      ? (newCurrentAmount / Number(currentGoal.target_amount)) * 100 
      : 0

    // Check if goal would exceed target
    if (newCurrentAmount > Number(currentGoal.target_amount)) {
      throw new Error('This amount would exceed the goal target')
    }

    // Update the goal with new progress
    const { data, error } = await supabase
      .from('goals')
      .update({ 
        current_amount: newCurrentAmount,
        status: newCurrentAmount >= Number(currentGoal.target_amount) ? 'completed' : currentGoal.status
      } as GoalUpdate)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error

    const goalWithProgress = {
      ...data,
      progress_percentage: newPercentage
    }

    revalidatePath('/goals')
    revalidatePath('/dashboard')
    
    return { success: true, data: goalWithProgress }
  } catch (error) {
    console.error('Error updating goal progress:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update goal progress' 
    }
  }
}

// Get goals summary for dashboard
export async function getGoalsSummary() {
  try {
    const { userId } = await auth()
    if (!userId) throw new Error('Unauthorized')

    const supabase = await createSupabaseServerClient()

    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    const goals = data || []
    
    // Calculate summary statistics
    const activeGoals = goals.filter(goal => goal.status === 'active')
    const completedGoals = goals.filter(goal => goal.status === 'completed')
    const pausedGoals = goals.filter(goal => goal.status === 'paused')
    
    const totalTargetAmount = activeGoals.reduce((sum, goal) => sum + Number(goal.target_amount), 0)
    const totalCurrentAmount = activeGoals.reduce((sum, goal) => sum + Number(goal.current_amount), 0)
    const overallProgress = totalTargetAmount > 0 ? (totalCurrentAmount / totalTargetAmount) * 100 : 0

    // Find goals approaching deadline
    const upcomingDeadlines = activeGoals
      .filter(goal => goal.deadline)
      .map(goal => {
        const daysUntilDeadline = Math.ceil((new Date(goal.deadline!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        return { ...goal, daysUntilDeadline }
      })
      .filter(goal => goal.daysUntilDeadline <= 30 && goal.daysUntilDeadline >= 0)
      .sort((a, b) => a.daysUntilDeadline - b.daysUntilDeadline)

    return { 
      success: true, 
      data: {
        total_goals: goals.length,
        active_goals: activeGoals.length,
        completed_goals: completedGoals.length,
        paused_goals: pausedGoals.length,
        total_target_amount: totalTargetAmount,
        total_current_amount: totalCurrentAmount,
        overall_progress_percentage: overallProgress,
        upcoming_deadlines: upcomingDeadlines.slice(0, 5) // Show next 5 deadlines
      }
    }
  } catch (error) {
    console.error('Error fetching goals summary:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch goals summary' 
    }
  }
}

// Get goal progress data for charts
export async function getGoalProgressData() {
  try {
    const { userId } = await auth()
    if (!userId) throw new Error('Unauthorized')

    const { data: goals, error } = await getGoals('active')
    if (error || !goals) throw new Error('Failed to fetch active goals')

    const progressData = goals.map(goal => ({
      title: goal.title,
      current: Number(goal.current_amount),
      target: Number(goal.target_amount),
      percentage: goal.progress_percentage || 0,
      type: goal.type,
      deadline: goal.deadline
    })).sort((a, b) => b.percentage - a.percentage)

    return { success: true, data: progressData }
  } catch (error) {
    console.error('Error fetching goal progress data:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch goal progress data' }
  }
}

// Check for goal deadlines approaching
export async function getGoalDeadlineAlerts() {
  try {
    const { userId } = await auth()
    if (!userId) throw new Error('Unauthorized')

    const supabase = await createSupabaseServerClient()

    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .not('deadline', 'is', null)

    if (error) throw error

    const today = new Date()
    const alerts = (data || [])
      .map(goal => {
        const deadline = new Date(goal.deadline!)
        const daysUntilDeadline = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        const progressPercentage = Number(goal.target_amount) > 0 
          ? (Number(goal.current_amount) / Number(goal.target_amount)) * 100 
          : 0

        return {
          ...goal,
          daysUntilDeadline,
          progressPercentage
        }
      })
      .filter(goal => {
        // Alert if deadline is within 30 days
        if (goal.daysUntilDeadline <= 0) {
          return { type: 'overdue', ...goal }
        } else if (goal.daysUntilDeadline <= 7) {
          return { type: 'urgent', ...goal }
        } else if (goal.daysUntilDeadline <= 30) {
          return { type: 'approaching', ...goal }
        }
        return null
      })
      .filter(Boolean)
      .sort((a, b) => a.daysUntilDeadline - b.daysUntilDeadline)

    return { success: true, data: alerts }
  } catch (error) {
    console.error('Error fetching goal deadline alerts:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch goal deadline alerts' }
  }
}