import { Suspense } from 'react'
import { FinanceLayout } from '@/components/finance/finance-layout'
import { ReportsOverview } from '@/components/finance/reports-overview'
import { ReportsSkeleton } from '@/components/finance/reports-skeleton'

export default function ReportsPage() {
  return (
    <FinanceLayout>
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Financial Reports</h1>
          <p className="text-muted-foreground">
            Visualize your financial data with interactive charts and insights
          </p>
        </div>
        
        <Suspense fallback={<ReportsSkeleton />}>
          <ReportsOverview />
        </Suspense>
      </div>
    </FinanceLayout>
  )
}