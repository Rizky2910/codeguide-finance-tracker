'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, AlertTriangle } from 'lucide-react'
import { getBudgets } from '@/app/actions'
import { BudgetWithSpending } from '@/lib/database.types'
import { formatCurrency } from '@/lib/utils'
import { BudgetFormButton } from './budget-form'

export function BudgetsList() {
  const [budgets, setBudgets] = useState<BudgetWithSpending[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadBudgets() {
      try {
        const result = await getBudgets(true) // include spending data
        if (result.success && result.data) {
          setBudgets(result.data)
        }
      } catch (error) {
        console.error('Error loading budgets:', error)
      } finally {
        setLoading(false)
      }
    }

    loadBudgets()
  }, [])

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-red-500'
    if (percentage >= 80) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getStatusText = (percentage: number) => {
    if (percentage >= 100) return 'Over Budget'
    if (percentage >= 80) return 'Nearly Limit'
    return 'On Track'
  }

  if (loading) {
    return <BudgetsSkeleton />
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Your Budgets</CardTitle>
            <CardDescription>
              Track your spending against budget limits
            </CardDescription>
          </div>
          <BudgetFormButton onSuccess={() => window.location.reload()} />
        </CardHeader>
        <CardContent>
          {budgets.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                No budgets created yet. Set up your first budget to start tracking your spending.
              </p>
              <BudgetFormButton onSuccess={() => window.location.reload()} />
            </div>
          ) : (
            <div className="space-y-6">
              {budgets.map((budget) => (
                <div key={budget.id} className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{budget.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {budget.categories?.name || 'All Categories'} • {budget.period}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">
                        {formatCurrency(budget.spent)} / {formatCurrency(budget.amount)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {getStatusText(budget.percentage_used)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{budget.percentage_used.toFixed(1)}% used</span>
                    </div>
                    <div className="relative">
                      <Progress 
                        value={Math.min(budget.percentage_used, 100)} 
                        className="h-2"
                      />
                      {budget.percentage_used >= 100 && (
                        <div className="absolute -top-1 -right-1">
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Spent</div>
                      <div className="font-medium text-red-600">
                        {formatCurrency(budget.spent)}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Remaining</div>
                      <div className={`font-medium ${
                        budget.remaining >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(budget.remaining)}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Budget</div>
                      <div className="font-medium">
                        {formatCurrency(budget.amount)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}