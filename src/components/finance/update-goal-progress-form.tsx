'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { TrendingUp } from 'lucide-react'
import { z } from 'zod'
import { updateGoalProgress } from '@/app/actions'
import { Goal } from '@/lib/database.types'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'

const updateProgressSchema = z.object({
  amount: z.number().positive('Amount must be greater than 0')
})

type UpdateProgressInput = z.infer<typeof updateProgressSchema>

interface UpdateGoalProgressFormProps {
  goal: Goal
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function UpdateGoalProgressForm({ 
  goal, 
  isOpen, 
  onClose, 
  onSuccess 
}: UpdateGoalProgressFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<UpdateProgressInput>({
    resolver: zodResolver(updateProgressSchema),
    defaultValues: {
      amount: 0,
    },
  })

  const remainingAmount = Number(goal.target_amount) - Number(goal.current_amount)

  async function onSubmit(data: UpdateProgressInput) {
    setIsLoading(true)
    try {
      const result = await updateGoalProgress(goal.id, data.amount)

      if (result.success) {
        toast.success(`Added ${formatCurrency(data.amount)} to ${goal.title}`)
        form.reset()
        onSuccess?.()
        onClose()
      } else {
        toast.error(result.error || 'Failed to update goal progress')
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
            Update Goal Progress
          </DialogTitle>
          <DialogDescription>
            Add funds to your "{goal.title}" goal
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Current Progress</span>
                <span className="text-sm text-muted-foreground">
                  {formatCurrency(goal.current_amount)} / {formatCurrency(goal.target_amount)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Remaining</span>
                <span className="text-sm font-bold text-green-600">
                  {formatCurrency(remainingAmount)}
                </span>
              </div>
            </div>

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount to Add</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      max={remainingAmount}
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      disabled={isLoading}
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
                {isLoading ? 'Adding...' : 'Add to Goal'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

interface UpdateGoalProgressButtonProps {
  goal: Goal
  onSuccess?: () => void
}

export function UpdateGoalProgressButton({ goal, onSuccess }: UpdateGoalProgressButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <TrendingUp className="h-4 w-4 mr-2" />
          Update Progress
        </Button>
      </DialogTrigger>
      <UpdateGoalProgressForm
        goal={goal}
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