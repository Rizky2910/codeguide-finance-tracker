// Database types for the Finance Tracker application
// Generated from Supabase schema

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          name: string
          type: 'income' | 'expense'
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type: 'income' | 'expense'
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: 'income' | 'expense'
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          amount: number
          type: 'income' | 'expense'
          description: string | null
          category_id: string
          user_id: string
          date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          amount: number
          type: 'income' | 'expense'
          description?: string | null
          category_id: string
          user_id: string
          date: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          amount?: number
          type?: 'income' | 'expense'
          description?: string | null
          category_id?: string
          user_id?: string
          date?: string
          created_at?: string
          updated_at?: string
        }
      }
      budgets: {
        Row: {
          id: string
          name: string
          category_id: string | null
          amount: number
          period: 'weekly' | 'monthly' | 'quarterly' | 'yearly'
          start_date: string
          end_date: string
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          category_id?: string | null
          amount: number
          period: 'weekly' | 'monthly' | 'quarterly' | 'yearly'
          start_date: string
          end_date: string
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          category_id?: string | null
          amount?: number
          period?: 'weekly' | 'monthly' | 'quarterly' | 'yearly'
          start_date?: string
          end_date?: string
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      goals: {
        Row: {
          id: string
          title: string
          description: string | null
          target_amount: number
          current_amount: number
          deadline: string | null
          type: 'savings' | 'debt_payoff' | 'investment' | 'other'
          status: 'active' | 'completed' | 'paused'
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          target_amount: number
          current_amount?: number
          deadline?: string | null
          type: 'savings' | 'debt_payoff' | 'investment' | 'other'
          status?: 'active' | 'completed' | 'paused'
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          target_amount?: number
          current_amount?: number
          deadline?: string | null
          type?: 'savings' | 'debt_payoff' | 'investment' | 'other'
          status?: 'active' | 'completed' | 'paused'
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      default_categories: {
        Row: {
          id: string
          name: string
          type: 'income' | 'expense'
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          type: 'income' | 'expense'
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: 'income' | 'expense'
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Type aliases for commonly used table types
export type Category = Database['public']['Tables']['categories']['Row']
export type CategoryInsert = Database['public']['Tables']['categories']['Insert']
export type CategoryUpdate = Database['public']['Tables']['categories']['Update']

export type Transaction = Database['public']['Tables']['transactions']['Row']
export type TransactionInsert = Database['public']['Tables']['transactions']['Insert']
export type TransactionUpdate = Database['public']['Tables']['transactions']['Update']

export type Budget = Database['public']['Tables']['budgets']['Row']
export type BudgetInsert = Database['public']['Tables']['budgets']['Insert']
export type BudgetUpdate = Database['public']['Tables']['budgets']['Update']

export type Goal = Database['public']['Tables']['goals']['Row']
export type GoalInsert = Database['public']['Tables']['goals']['Insert']
export type GoalUpdate = Database['public']['Tables']['goals']['Update']

export type DefaultCategory = Database['public']['Tables']['default_categories']['Row']

// Extended types with relationships for frontend use
export type TransactionWithCategory = Transaction & {
  categories: Category | null
}

export type BudgetWithCategory = Budget & {
  categories: Category | null
}

export type BudgetWithSpending = Budget & {
  categories: Category | null
  spent: number
  remaining: number
  percentage_used: number
}

// Dashboard summary types
export interface DashboardSummary {
  total_income: number
  total_expenses: number
  net_income: number
  budget_usage: BudgetWithSpending[]
  goal_progress: Goal[]
  recent_transactions: TransactionWithCategory[]
}

// Chart data types
export interface SpendingByCategory {
  category: string
  amount: number
  percentage: number
  color?: string
}

export interface MonthlySpending {
  month: string
  income: number
  expenses: number
  net: number
}

export interface GoalProgress {
  goal: string
  current: number
  target: number
  percentage: number
  deadline?: string
}

// Form types
export type TransactionFormData = Omit<TransactionInsert, 'id' | 'user_id' | 'created_at' | 'updated_at'>

export type BudgetFormData = Omit<BudgetInsert, 'id' | 'user_id' | 'created_at' | 'updated_at'>

export type GoalFormData = Omit<GoalInsert, 'id' | 'user_id' | 'created_at' | 'updated_at'>

export type CategoryFormData = Omit<CategoryInsert, 'id' | 'user_id' | 'created_at' | 'updated_at'>

// API Response types
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  page_size: number
  has_more: boolean
}

// Filter and sort types
export interface TransactionFilters {
  category_id?: string
  type?: 'income' | 'expense'
  date_from?: string
  date_to?: string
  search?: string
}

export interface SortOption {
  column: string
  direction: 'asc' | 'desc'
}

// Date range types
export interface DateRange {
  start: string
  end: string
}

// Budget period utilities
export type BudgetPeriod = 'weekly' | 'monthly' | 'quarterly' | 'yearly'

export interface BudgetPeriodConfig {
  label: string
  days: number
}

export const BUDGET_PERIODS: Record<BudgetPeriod, BudgetPeriodConfig> = {
  weekly: { label: 'Weekly', days: 7 },
  monthly: { label: 'Monthly', days: 30 },
  quarterly: { label: 'Quarterly', days: 90 },
  yearly: { label: 'Yearly', days: 365 }
}