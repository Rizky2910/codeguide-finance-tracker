'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PiggyBank,
  Target,
  AlertTriangle,
  Plus,
  BarChart3
} from 'lucide-react'
import Link from 'next/link'
import { 
  getTransactionSummary, 
  getGoalsSummary, 
  getBudgetAlerts,
  getSpendingByCategory 
} from '@/app/actions'
import { formatCurrency } from '@/lib/utils'

interface SummaryData {
  total_income: number
  total_expenses: number
  net_income: number
  transaction_count: number
}

interface GoalsSummary {
  total_goals: number
  active_goals: number
  completed_goals: number
  total_target_amount: number
  total_current_amount: number
  overall_progress_percentage: number
  upcoming_deadlines: any[]
}

interface BudgetAlert {
  type: 'over' | 'warning'
  budget: string
  percentage: number
  spent: number
  budget_amount: number
}

export function DashboardOverview() {
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null)
  const [goalsSummary, setGoalsSummary] = useState<GoalsSummary | null>(null)
  const [budgetAlerts, setBudgetAlerts] = useState<BudgetAlert[]>([])
  const [spendingByCategory, setSpendingByCategory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [summary, goals, alerts, spending] = await Promise.all([
          getTransactionSummary(),
          getGoalsSummary(),
          getBudgetAlerts(),
          getSpendingByCategory()
        ])

        if (summary.success) setSummaryData(summary.data)
        if (goals.success) setGoalsSummary(goals.data)
        if (alerts.success) setBudgetAlerts(alerts.data)
        if (spending.success) setSpendingByCategory(spending.data)
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  if (loading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(summaryData?.total_income || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(summaryData?.total_expenses || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Income</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              (summaryData?.net_income || 0) >= 0 ? 'text-blue-600' : 'text-red-600'
            }`}>
              {formatCurrency(summaryData?.net_income || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Goals Progress</CardTitle>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {goalsSummary?.overall_progress_percentage.toFixed(1) || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {goalsSummary?.active_goals || 0} active goals
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Budget Alerts */}
      {budgetAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Budget Alerts
            </CardTitle>
            <CardDescription>
              Budgets that need your attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {budgetAlerts.map((alert, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant={alert.type === 'over' ? 'destructive' : 'secondary'}>
                      {alert.type === 'over' ? 'Over Budget' : 'Nearly Limit'}
                    </Badge>
                    <span className="font-medium">{alert.budget}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {formatCurrency(alert.spent)} / {formatCurrency(alert.budget_amount)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {alert.percentage.toFixed(1)}% used
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button asChild variant="outline">
                <Link href="/budgets">View All Budgets</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Goals Overview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <PiggyBank className="h-5 w-5" />
              Goals Overview
            </CardTitle>
            <CardDescription>
              Track your financial goals progress
            </CardDescription>
          </div>
          <Button asChild size="sm">
            <Link href="/goals">
              <Plus className="h-4 w-4 mr-2" />
              Manage Goals
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {goalsSummary?.active_goals || 0}
              </div>
              <div className="text-sm text-muted-foreground">Active Goals</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(goalsSummary?.total_current_amount || 0)}
              </div>
              <div className="text-sm text-muted-foreground">Current Progress</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(goalsSummary?.total_target_amount || 0)}
              </div>
              <div className="text-sm text-muted-foreground">Target Amount</div>
            </div>
          </div>
          
          {goalsSummary?.upcoming_deadlines && goalsSummary.upcoming_deadlines.length > 0 && (
            <div className="mt-6">
              <h4 className="font-medium mb-3">Upcoming Deadlines</h4>
              <div className="space-y-2">
                {goalsSummary.upcoming_deadlines.slice(0, 3).map((goal, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <span className="font-medium">{goal.title}</span>
                    <Badge variant="outline">
                      {goal.daysUntilDeadline} days
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Spending by Category */}
      {spendingByCategory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
            <CardDescription>
              Where your money is going this month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {spendingByCategory.slice(0, 6).map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: `hsl(${index * 45}, 70%, 50%)` }}
                    />
                    <span className="font-medium">{category.category}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(category.amount)}</div>
                    <div className="text-xs text-muted-foreground">
                      {category.percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <Button asChild variant="outline">
                <Link href="/transactions">View All Transactions</Link>
              </Button>
              <Button asChild>
                <Link href="/reports">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Reports
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}