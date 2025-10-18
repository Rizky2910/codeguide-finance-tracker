import { Suspense } from 'react'
import { FinanceLayout } from '@/components/finance/finance-layout'
import { DashboardOverview } from '@/components/finance/dashboard-overview'
import { DashboardSkeleton } from '@/components/finance/dashboard-skeleton'

export default function DashboardPage() {
  return (
    <FinanceLayout>
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your financial health
          </p>
        </div>
        
        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardOverview />
        </Suspense>
      </div>
    </FinanceLayout>
  )
}