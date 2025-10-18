'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ExpensesPieChart } from './charts/expenses-pie-chart'
import { SpendingTrendsChart } from './charts/spending-trends-chart'
import { BudgetComparisonChart } from './charts/budget-comparison-chart'
import { GoalProgressChart } from './charts/goal-progress-chart'
import { BarChart3, TrendingUp, PieChart, Target } from 'lucide-react'

export function ReportsOverview() {
  const [dateRange, setDateRange] = useState('current-month')

  const getDateRange = (range: string) => {
    const now = new Date()
    switch (range) {
      case 'current-month':
        return {
          from: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0],
          to: new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
        }
      case 'last-month':
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1)
        return {
          from: new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1).toISOString().split('T')[0],
          to: new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0).toISOString().split('T')[0]
        }
      case 'current-year':
        return {
          from: new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0],
          to: new Date(now.getFullYear(), 11, 31).toISOString().split('T')[0]
        }
      default:
        return undefined
    }
  }

  const currentRange = getDateRange(dateRange)

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Financial Analytics</h2>
          <p className="text-muted-foreground">
            Comprehensive view of your financial health and patterns
          </p>
        </div>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="current-month">Current Month</SelectItem>
            <SelectItem value="last-month">Last Month</SelectItem>
            <SelectItem value="current-year">Current Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Charts Grid */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="spending" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Spending
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Trends
          </TabsTrigger>
          <TabsTrigger value="goals" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Goals
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <ExpensesPieChart 
              dateFrom={currentRange?.from} 
              dateTo={currentRange?.to} 
            />
            <BudgetComparisonChart />
          </div>
          <div className="grid gap-6">
            <SpendingTrendsChart />
          </div>
        </TabsContent>

        <TabsContent value="spending" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <ExpensesPieChart 
              dateFrom={currentRange?.from} 
              dateTo={currentRange?.to} 
            />
            <Card>
              <CardHeader>
                <CardTitle>Spending Insights</CardTitle>
                <CardDescription>
                  Key insights about your spending patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">💡 Budget Tip</h4>
                    <p className="text-sm text-muted-foreground">
                      Track your spending regularly to identify areas where you can save money and 
                      stay within your budget limits.
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">📊 Category Analysis</h4>
                    <p className="text-sm text-muted-foreground">
                      Use the pie chart to see which categories consume most of your budget. 
                      Consider setting specific limits for high-spending categories.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid gap-6">
            <SpendingTrendsChart />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Income Analysis</CardTitle>
                <CardDescription>
                  Understanding your income patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">📈 Income Growth</h4>
                    <p className="text-sm text-muted-foreground">
                      Monitor your income trends over time to identify growth opportunities 
                      and plan for future expenses.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Expense Management</CardTitle>
                <CardDescription>
                  Controlling your spending habits
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">💰 Saving Opportunities</h4>
                    <p className="text-sm text-muted-foreground">
                      Identify trends in your spending to find opportunities to reduce 
                      unnecessary expenses and increase savings.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <div className="grid gap-6">
            <GoalProgressChart />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Goal Setting Tips</CardTitle>
                <CardDescription>
                  Best practices for financial goals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">🎯 SMART Goals</h4>
                    <p className="text-sm text-muted-foreground">
                      Set Specific, Measurable, Achievable, Relevant, and Time-bound 
                      financial goals for better success rates.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Progress Tracking</CardTitle>
                <CardDescription>
                  Stay motivated with regular updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">📱 Regular Updates</h4>
                    <p className="text-sm text-muted-foreground">
                      Update your goal progress regularly to stay motivated and 
                      make adjustments to your savings strategy as needed.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}