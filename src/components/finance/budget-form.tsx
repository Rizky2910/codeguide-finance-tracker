'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { CalendarIcon, Plus } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { BudgetInput, budgetSchema } from '@/app/actions'
import { createBudget, updateBudget, getUserCategories } from '@/app/actions'
import { Budget } from '@/lib/database.types'
import { toast } from 'sonner'

interface BudgetFormProps {
  budget?: Budget
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function BudgetForm({ budget, isOpen, onClose, onSuccess }: BudgetFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<any[]>([])

  const form = useForm<BudgetInput>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      name: budget?.name || '',
      category_id: budget?.category_id || null,
      amount: budget?.amount || 0,
      period: budget?.period || 'monthly',
      start_date: budget?.start_date || format(new Date(), 'yyyy-MM-dd'),
      end_date: budget?.end_date || format(new Date(new Date().setMonth(new Date().getMonth() + 1)), 'yyyy-MM-dd'),
    },
  })

  useEffect(() => {
    async function loadCategories() {
      try {
        const result = await getUserCategories('expense') // Budgets are typically for expenses
        if (result.success && result.data) {
          setCategories(result.data)
        }
      } catch (error) {
        console.error('Error loading categories:', error)
      }
    }

    if (isOpen) {
      loadCategories()
    }
  }, [isOpen])

  const watchedPeriod = form.watch('period')
  const watchedStartDate = form.watch('start_date')

  // Auto-calculate end date based on period
  useEffect(() => {
    if (watchedPeriod && watchedStartDate && !budget) {
      const startDate = new Date(watchedStartDate)
      let endDate = new Date(startDate)

      switch (watchedPeriod) {
        case 'weekly':
          endDate.setDate(startDate.getDate() + 7)
          break
        case 'monthly':
          endDate.setMonth(startDate.getMonth() + 1)
          break
        case 'quarterly':
          endDate.setMonth(startDate.getMonth() + 3)
          break
        case 'yearly':
          endDate.setFullYear(startDate.getFullYear() + 1)
          break
      }

      form.setValue('end_date', format(endDate, 'yyyy-MM-dd'))
    }
  }, [watchedPeriod, watchedStartDate, form, budget])

  async function onSubmit(data: BudgetInput) {
    setIsLoading(true)
    try {
      let result
      if (budget) {
        result = await updateBudget(budget.id, data)
      } else {
        result = await createBudget(data)
      }

      if (result.success) {
        toast.success(budget ? 'Budget updated successfully' : 'Budget created successfully')
        form.reset()
        onSuccess?.()
        onClose()
      } else {
        toast.error(result.error || 'Failed to save budget')
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {budget ? 'Edit Budget' : 'Create New Budget'}
          </DialogTitle>
          <DialogDescription>
            {budget ? 'Update the budget details below.' : 'Set up a budget to track your spending limits.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Monthly Food Budget" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category (Optional)</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(value || null)} 
                    value={field.value || ''}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category or leave empty for all expenses" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="period"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget Period</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select budget period" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(new Date(field.value), "PPP")
                            ) : (
                              <span>Pick date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={new Date(field.value)}
                          onSelect={(date) => {
                            if (date) {
                              field.setValue('start_date', format(date, 'yyyy-MM-dd'))
                            }
                          }}
                          disabled={(date) =>
                            date > new Date("2100-01-01") || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(new Date(field.value), "PPP")
                            ) : (
                              <span>Pick date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={new Date(field.value)}
                          onSelect={(date) => {
                            if (date) {
                              field.setValue('end_date', format(date, 'yyyy-MM-dd'))
                            }
                          }}
                          disabled={(date) =>
                            date > new Date("2100-01-01") || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : budget ? 'Update Budget' : 'Create Budget'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

interface BudgetFormButtonProps {
  budget?: Budget
  onSuccess?: () => void
}

export function BudgetFormButton({ budget, onSuccess }: BudgetFormButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          {budget ? (
            'Edit Budget'
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Create Budget
            </>
          )}
        </Button>
      </DialogTrigger>
      <BudgetForm
        budget={budget}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSuccess={() => {
          onSuccess?.()
          setIsOpen(false)
        }}
      />
    </Dialog>
  )
}