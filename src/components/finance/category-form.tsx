'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus } from 'lucide-react'
import { CategoryInput, categorySchema } from '@/app/actions'
import { createCategory, updateCategory } from '@/app/actions'
import { Category } from '@/lib/database.types'
import { toast } from 'sonner'

interface CategoryFormProps {
  category?: Category
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  defaultType?: 'income' | 'expense'
}

export function CategoryForm({ 
  category, 
  isOpen, 
  onClose, 
  onSuccess, 
  defaultType = 'expense' 
}: CategoryFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name || '',
      type: category?.type || defaultType,
    },
  })

  async function onSubmit(data: CategoryInput) {
    setIsLoading(true)
    try {
      let result
      if (category) {
        result = await updateCategory(category.id, data)
      } else {
        result = await createCategory(data)
      }

      if (result.success) {
        toast.success(category ? 'Category updated successfully' : 'Category created successfully')
        form.reset()
        onSuccess?.()
        onClose()
      } else {
        toast.error(result.error || 'Failed to save category')
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
            {category ? 'Edit Category' : 'Create New Category'}
          </DialogTitle>
          <DialogDescription>
            {category ? 'Update the category details below.' : 'Add a new category to organize your transactions.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Groceries, Gas, Salary" 
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category type" />
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
                {isLoading ? 'Saving...' : category ? 'Update Category' : 'Create Category'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

interface CategoryFormButtonProps {
  category?: Category
  onSuccess?: () => void
  defaultType?: 'income' | 'expense'
}

export function CategoryFormButton({ 
  category, 
  onSuccess, 
  defaultType = 'expense' 
}: CategoryFormButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          {category ? (
            'Edit Category'
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </>
          )}
        </Button>
      </DialogTrigger>
      <CategoryForm
        category={category}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSuccess={() => {
          onSuccess?.()
          setIsOpen(false)
        }}
        defaultType={defaultType}
      />
    </Dialog>
  )
}