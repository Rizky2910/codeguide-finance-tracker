'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts'
import { getMonthlyTrends } from '@/app/actions'
import { formatCurrency } from '@/lib/utils'

interface TrendData {
  month: string
  income: number
  expenses: number
  net: number
}

interface SpendingTrendsChartProps {
  months?: number
}

export function SpendingTrendsChart({ months = 6 }: SpendingTrendsChartProps) {
  const [data, setData] = useState<TrendData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMonths, setSelectedMonths] = useState(months)

  useEffect(() => {
    async function loadTrendsData() {
      try {
        const result = await getMonthlyTrends(selectedMonths)
        if (result.success && result.data) {
          // Format month names for display
          const formattedData = result.data.map(item => ({
            ...item,
            month: new Date(item.month + '-01').toLocaleDateString('en-US', { 
              month: 'short', 
              year: '2-digit' 
            })
          }))
          setData(formattedData)
        }
      } catch (error) {
        console.error('Error loading trends data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadTrendsData()
  }, [selectedMonths])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Income vs Expenses Trends</CardTitle>
          <CardDescription>Track your financial patterns over time</CardDescription>
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
          <CardTitle>Income vs Expenses Trends</CardTitle>
          <CardDescription>Track your financial patterns over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No transaction data available for the selected period
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Income vs Expenses Trends</CardTitle>
          <CardDescription>Track your financial patterns over time</CardDescription>
        </div>
        <Select value={selectedMonths.toString()} onValueChange={(value) => setSelectedMonths(Number(value))}>
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3">3 months</SelectItem>
            <SelectItem value="6">6 months</SelectItem>
            <SelectItem value="12">12 months</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="income" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
                name="Income"
              />
              <Line 
                type="monotone" 
                dataKey="expenses" 
                stroke="#ef4444" 
                strokeWidth={2}
                dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
                name="Expenses"
              />
              <Line 
                type="monotone" 
                dataKey="net" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
                name="Net Income"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}