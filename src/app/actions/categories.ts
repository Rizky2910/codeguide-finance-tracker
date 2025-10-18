'use server'

import { createSupabaseServerClient } from '@/lib/supabase'
import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { categorySchema, CategoryInput } from './schemas'
import { Category, CategoryInsert, CategoryUpdate, DefaultCategory } from '@/lib/database.types'

// Get all categories for the authenticated user
export async function getUserCategories(type?: 'income' | 'expense') {
  try {
    const { userId } = await auth()
    if (!userId) throw new Error('Unauthorized')

    const supabase = await createSupabaseServerClient()
    
    let query = supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true })

    if (type) {
      query = query.eq('type', type)
    }

    const { data, error } = await query

    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Error fetching categories:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch categories' }
  }
}

// Get default categories for new users
export async function getDefaultCategories(type?: 'income' | 'expense') {
  try {
    const supabase = await createSupabaseServerClient()
    
    let query = supabase
      .from('default_categories')
      .select('*')
      .order('name', { ascending: true })

    if (type) {
      query = query.eq('type', type)
    }

    const { data, error } = await query

    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Error fetching default categories:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch default categories' }
  }
}

// Create a new category
export async function createCategory(input: CategoryInput) {
  try {
    const { userId } = await auth()
    if (!userId) throw new Error('Unauthorized')

    // Validate input
    const validatedData = categorySchema.parse(input)

    const supabase = await createSupabaseServerClient()

    // Check if category already exists for this user
    const { data: existing } = await supabase
      .from('categories')
      .select('id')
      .eq('user_id', userId)
      .eq('name', validatedData.name)
      .eq('type', validatedData.type)
      .single()

    if (existing) {
      throw new Error(`Category "${validatedData.name}" already exists`)
    }

    const { data, error } = await supabase
      .from('categories')
      .insert({
        ...validatedData,
        user_id: userId
      } as CategoryInsert)
      .select()
      .single()

    if (error) throw error

    revalidatePath('/transactions')
    revalidatePath('/budgets')
    
    return { success: true, data }
  } catch (error) {
    console.error('Error creating category:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create category' 
    }
  }
}

// Update a category
export async function updateCategory(id: string, input: Partial<CategoryInput>) {
  try {
    const { userId } = await auth()
    if (!userId) throw new Error('Unauthorized')

    // Validate input
    const validatedData = categorySchema.partial().parse(input)

    const supabase = await createSupabaseServerClient()

    // First check if user owns the category
    const { data: existing } = await supabase
      .from('categories')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (!existing) {
      throw new Error('Category not found or access denied')
    }

    // If updating name, check for duplicates
    if (validatedData.name) {
      const { data: duplicate } = await supabase
        .from('categories')
        .select('id')
        .eq('user_id', userId)
        .eq('name', validatedData.name)
        .eq('type', validatedData.type || 'expense') // Default to expense if not specified
        .neq('id', id)
        .single()

      if (duplicate) {
        throw new Error(`Category "${validatedData.name}" already exists`)
      }
    }

    const { data, error } = await supabase
      .from('categories')
      .update(validatedData as CategoryUpdate)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error

    revalidatePath('/transactions')
    revalidatePath('/budgets')
    
    return { success: true, data }
  } catch (error) {
    console.error('Error updating category:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update category' 
    }
  }
}

// Delete a category
export async function deleteCategory(id: string) {
  try {
    const { userId } = await auth()
    if (!userId) throw new Error('Unauthorized')

    const supabase = await createSupabaseServerClient()

    // Check if category is being used by transactions or budgets
    const { data: transactions } = await supabase
      .from('transactions')
      .select('id')
      .eq('category_id', id)
      .eq('user_id', userId)
      .limit(1)

    if (transactions && transactions.length > 0) {
      throw new Error('Cannot delete category that is being used by transactions')
    }

    const { data: budgets } = await supabase
      .from('budgets')
      .select('id')
      .eq('category_id', id)
      .eq('user_id', userId)
      .limit(1)

    if (budgets && budgets.length > 0) {
      throw new Error('Cannot delete category that is being used by budgets')
    }

    // Delete the category
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) throw error

    revalidatePath('/transactions')
    revalidatePath('/budgets')
    
    return { success: true }
  } catch (error) {
    console.error('Error deleting category:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete category' 
    }
  }
}

// Initialize default categories for a new user
export async function initializeDefaultCategories() {
  try {
    const { userId } = await auth()
    if (!userId) throw new Error('Unauthorized')

    const supabase = await createSupabaseServerClient()

    // Get default categories
    const { data: defaultCategories, error: fetchError } = await getDefaultCategories()
    if (fetchError || !defaultCategories) {
      throw new Error('Failed to fetch default categories')
    }

    // Insert default categories for the user
    const categoriesToInsert = defaultCategories.map(cat => ({
      name: cat.name,
      type: cat.type,
      user_id: userId
    })) as CategoryInsert[]

    const { error: insertError } = await supabase
      .from('categories')
      .insert(categoriesToInsert)

    if (insertError) throw insertError

    revalidatePath('/transactions')
    revalidatePath('/budgets')
    
    return { success: true }
  } catch (error) {
    console.error('Error initializing default categories:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to initialize default categories' 
    }
  }
}