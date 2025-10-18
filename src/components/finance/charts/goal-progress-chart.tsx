'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
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
import { getGoalProgressData } from '@/app/actions'
import { formatCurrency } from '@/lib/utils'
import { Target } from 'lucide-react'

interface GoalData {
  title: string
  current: number
  target: number
  percentage: number
  type: string
  deadline?: string
}

export function GoalProgressChart() {
  const [data, setData] = useState<GoalData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadGoalData() {
      try {
        const result = await getGoalProgressData()
        if (result.success && result.data) {
          setData(result.data)
        }
      } catch (error) {
        console.error('Error loading goal data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadGoalData()
  }, [])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium mb-2">{label}</p>
          <p className="text-sm text-blue-600">Current: {formatCurrency(data.current)}</p>
          <p className="text-sm text-green-600">Target: {formatCurrency(data.target)}</p>
          <p className="text-sm font-medium">
            Progress: {data.percentage.toFixed(1)}%
          </p>
          {data.deadline && (
            <p className="text-xs text-muted-foreground mt-1">
              Deadline: {new Date(data.deadline).toLocaleDateString()}
            </p>
          )}
        </div>
      )
    }
    return null
  }

  const getBarColor = (percentage: number) => {
    if (percentage >= 100) return '#10b981' // green
    if (percentage >= 75) return '#3b82f6' // blue
    if (percentage >= 50) return '#f59e0b' // amber
    return '#94a3b8' // slate
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-green-500'
    if (percentage >= 75) return 'bg-blue-500'
    if (percentage >= 50) return 'bg-yellow-500'
    return 'bg-slate-400'
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Goal Progress</CardTitle>
          <CardDescription>Track progress towards your financial goals</CardDescription>
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
          <CardTitle>Goal Progress</CardTitle>
          <CardDescription>Track progress towards your financial goals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground">
            <Target className="h-12 w-12 mb-4 opacity-50" />
            <p>No active goals to display</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Prepare chart data - show shorter names for better display
  const chartData = data.map(item => ({
    ...item,
    shortName: item.title.length > 20 ? item.title.substring(0, 17) + '...' : item.title
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Goal Progress</CardTitle>
        <CardDescription>Track progress towards your financial goals</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={chartData} 
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                type="number"
                domain={[0, 100]}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}%`}
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
              <Bar dataKey="percentage" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.percentage)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Goal Progress Details */}
        <div className="mt-6 space-y-4">
          <h4 className="font-medium text-sm">Goal Progress Details</h4>
          <div className="space-y-3">
            {data.slice(0, 5).map((goal) => (
              <div key={goal.title} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: getBarColor(goal.percentage) }}
                    />
                    <span className="text-sm font-medium">{goal.title}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{goal.percentage.toFixed(1)}%</div>
                    <div className="text-xs text-muted-foreground">
                      {formatCurrency(goal.current)} / {formatCurrency(goal.target)}
                    </div>
                  </div>
                </div>
                <Progress 
                  value={goal.percentage} 
                  className="h-2"
                />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}