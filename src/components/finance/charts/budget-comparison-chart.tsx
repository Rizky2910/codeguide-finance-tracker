'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts'
import { getBudgetPerformance } from '@/app/actions'
import { formatCurrency } from '@/lib/utils'

interface BudgetData {
  id: string
  name: string
  category: string
  budget_amount: number
  spent: number
  remaining: number
  percentage_used: number
  status: 'good' | 'warning' | 'over'
}

export function BudgetComparisonChart() {
  const [data, setData] = useState<BudgetData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadBudgetData() {
      try {
        const result = await getBudgetPerformance()
        if (result.success && result.data) {
          setData(result.data.slice(0, 10)) // Show top 10 budgets
        }
      } catch (error) {
        console.error('Error loading budget data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadBudgetData()
  }, [])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium mb-2">{label}</p>
          <p className="text-sm text-green-600">Budget: {formatCurrency(data.budget_amount)}</p>
          <p className="text-sm text-red-600">Spent: {formatCurrency(data.spent)}</p>
          <p className="text-sm text-blue-600">Remaining: {formatCurrency(data.remaining)}</p>
          <p className="text-sm font-medium">
            Usage: {data.percentage_used.toFixed(1)}%
          </p>
        </div>
      )
    }
    return null
  }

  const getBarColor = (percentage: number) => {
    if (percentage >= 100) return '#ef4444' // red
    if (percentage >= 80) return '#f59e0b' // amber 
    return '#10b981' // green
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'over':
        return <Badge variant="destructive">Over Budget</Badge>
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Warning</Badge>
      default:
        return <Badge variant="secondary" className="bg-green-100 text-green-800">On Track</Badge>
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Budget Performance</CardTitle>
          <CardDescription>Compare your spending against budget limits</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    )
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Budget Performance</CardTitle>
          <CardDescription>Compare your spending against budget limits</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No budget data available
          </div>
        </CardContent>
      </Card>
    )
  }

  // Prepare chart data - show shorter names for better display
  const chartData = data.map(item => ({
    ...item,
    shortName: item.name.length > 15 ? item.name.substring(0, 12) + '...' : item.name
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Performance</CardTitle>
        <CardDescription>Compare your spending against budget limits</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={chartData} 
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              layout="horizontal"
            >
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                type="number"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value}`}
              />
              <YAxis 
                type="category"
                dataKey="shortName"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={100}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="spent" fill="#ef4444" name="Spent" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.percentage_used)} />
                ))}
              </Bar>
              <Bar dataKey="budget_amount" fill="#e5e7eb" name="Budget" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Budget Status Summary */}
        <div className="mt-6 space-y-3">
          <h4 className="font-medium text-sm">Budget Status Summary</h4>
          <div className="grid grid-cols-1 gap-2">
            {data.slice(0, 5).map((budget) => (
              <div key={budget.id} className="flex items-center justify-between p-2 border rounded">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: getBarColor(budget.percentage_used) }}
                  />
                  <span className="text-sm font-medium">{budget.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {budget.percentage_used.toFixed(1)}% used
                  </span>
                  {getStatusBadge(budget.status)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}