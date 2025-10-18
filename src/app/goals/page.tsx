import { Suspense } from 'react'
import { FinanceLayout } from '@/components/finance/finance-layout'
import { GoalsList } from '@/components/finance/goals-list'
import { GoalsSkeleton } from '@/components/finance/goals-skeleton'

export default function GoalsPage() {
  return (
    <FinanceLayout>
      <div className="container mx-auto p-6">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Financial Goals</h1>
            <p className="text-muted-foreground">
              Track and achieve your financial objectives
            </p>
          </div>
        </div>
        
        <Suspense fallback={<GoalsSkeleton />}>
          <GoalsList />
        </Suspense>
      </div>
    </FinanceLayout>
  )
}