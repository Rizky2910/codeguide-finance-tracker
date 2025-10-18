'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Target, Calendar } from 'lucide-react'
import { getGoals } from '@/app/actions'
import { Goal } from '@/lib/database.types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { GoalFormButton } from './goal-form'
import { UpdateGoalProgressButton } from './update-goal-progress-form'

interface GoalWithProgress extends Goal {
  progress_percentage: number
}

export function GoalsList() {
  const [goals, setGoals] = useState<GoalWithProgress[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadGoals() {
      try {
        const result = await getGoals()
        if (result.success && result.data) {
          setGoals(result.data)
        }
      } catch (error) {
        console.error('Error loading goals:', error)
      } finally {
        setLoading(false)
      }
    }

    loadGoals()
  }, [])

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-green-500'
    if (percentage >= 75) return 'bg-blue-500'
    if (percentage >= 50) return 'bg-yellow-500'
    return 'bg-gray-300'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'active': return 'bg-blue-100 text-blue-800'
      case 'paused': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDaysUntilDeadline = (deadline: string | null) => {
    if (!deadline) return null
    const today = new Date()
    const deadlineDate = new Date(deadline)
    const diffTime = deadlineDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (loading) {
    return <GoalsSkeleton />
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Your Financial Goals</CardTitle>
            <CardDescription>
              Track progress towards your financial objectives
            </CardDescription>
          </div>
          <GoalFormButton onSuccess={() => window.location.reload()} />
        </CardHeader>
        <CardContent>
          {goals.length === 0 ? (
            <div className="text-center py-8">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                No financial goals set yet. Create your first goal to start tracking your progress.
              </p>
              <GoalFormButton onSuccess={() => window.location.reload()} />
            </div>
          ) : (
            <div className="space-y-6">
              {goals.map((goal) => {
                const daysUntilDeadline = getDaysUntilDeadline(goal.deadline)
                
                return (
                  <div key={goal.id} className="p-4 border rounded-lg space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{goal.title}</h3>
                          <Badge className={getStatusColor(goal.status)}>
                            {goal.status}
                          </Badge>
                        </div>
                        {goal.description && (
                          <p className="text-muted-foreground mb-3">{goal.description}</p>
                        )}
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <span className="capitalize">{goal.type.replace('_', ' ')}</span>
                          {goal.deadline && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(goal.deadline)}</span>
                              {daysUntilDeadline !== null && (
                                <Badge variant="outline" className="ml-2">
                                  {daysUntilDeadline < 0 
                                    ? `${Math.abs(daysUntilDeadline)} days overdue`
                                    : `${daysUntilDeadline} days left`
                                  }
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span className="font-medium">
                          {formatCurrency(goal.current_amount)} / {formatCurrency(goal.target_amount)}
                          <span className="ml-2 text-muted-foreground">
                            ({goal.progress_percentage.toFixed(1)}%)
                          </span>
                        </span>
                      </div>
                      <div className="relative">
                        <Progress 
                          value={Math.min(goal.progress_percentage, 100)} 
                          className="h-3"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Current</div>
                        <div className="font-medium text-blue-600">
                          {formatCurrency(goal.current_amount)}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Target</div>
                        <div className="font-medium text-green-600">
                          {formatCurrency(goal.target_amount)}
                        </div>
                      </div>
                    </div>

                    {goal.status === 'active' && goal.progress_percentage < 100 && (
                      <div className="pt-2">
                        <UpdateGoalProgressButton 
                          goal={goal} 
                          onSuccess={() => window.location.reload()} 
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}