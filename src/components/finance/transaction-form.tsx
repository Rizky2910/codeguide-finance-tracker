'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { CalendarIcon, Plus } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { TransactionInput, transactionSchema } from '@/app/actions'
import { createTransaction, updateTransaction, getUserCategories } from '@/app/actions'
import { TransactionWithCategory } from '@/lib/database.types'
import { toast } from 'sonner'

interface TransactionFormProps {
  transaction?: TransactionWithCategory
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function TransactionForm({ transaction, isOpen, onClose, onSuccess }: TransactionFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [selectedType, setSelectedType] = useState<'income' | 'expense'>('expense')

  const form = useForm<TransactionInput>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      amount: transaction?.amount || 0,
      type: transaction?.type || 'expense',
      description: transaction?.description || '',
      category_id: transaction?.category_id || '',
      date: transaction?.date || format(new Date(), 'yyyy-MM-dd'),
    },
  })

  useEffect(() => {
    async function loadCategories() {
      try {
        const result = await getUserCategories(selectedType)
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
  }, [isOpen, selectedType])

  const watchedType = form.watch('type')
  useEffect(() => {
    if (watchedType && watchedType !== selectedType) {
      setSelectedType(watchedType)
      form.setValue('category_id', '') // Reset category when type changes
    }
  }, [watchedType, selectedType, form])

  async function onSubmit(data: TransactionInput) {
    setIsLoading(true)
    try {
      let result
      if (transaction) {
        result = await updateTransaction(transaction.id, data)
      } else {
        result = await createTransaction(data)
      }

      if (result.success) {
        toast.success(transaction ? 'Transaction updated successfully' : 'Transaction created successfully')
        form.reset()
        onSuccess?.()
        onClose()
      } else {
        toast.error(result.error || 'Failed to save transaction')
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
            {transaction ? 'Edit Transaction' : 'Add New Transaction'}
          </DialogTitle>
          <DialogDescription>
            {transaction ? 'Update the transaction details below.' : 'Enter the transaction details to add a new record.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transaction Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select transaction type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
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
                  <FormLabel>Amount</FormLabel>
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
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
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
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
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
                            <span>Pick a date</span>
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
                            field.setValue('date', format(date, 'yyyy-MM-dd'))
                          }
                        }}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add a note about this transaction..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                {isLoading ? 'Saving...' : transaction ? 'Update Transaction' : 'Add Transaction'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

interface TransactionFormButtonProps {
  transaction?: TransactionWithCategory
  onSuccess?: () => void
}

export function TransactionFormButton({ transaction, onSuccess }: TransactionFormButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          {transaction ? (
            'Edit Transaction'
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Add Transaction
            </>
          )}
        </Button>
      </DialogTrigger>
      <TransactionForm
        transaction={transaction}
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