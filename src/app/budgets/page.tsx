import { Suspense } from 'react'
import { FinanceLayout } from '@/components/finance/finance-layout'
import { BudgetsList } from '@/components/finance/budgets-list'
import { BudgetsSkeleton } from '@/components/finance/budgets-skeleton'

export default function BudgetsPage() {
  return (
    <FinanceLayout>
      <div className="container mx-auto p-6">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Budgets</h1>
            <p className="text-muted-foreground">
              Set and track your spending limits
            </p>
          </div>
        </div>
        
        <Suspense fallback={<BudgetsSkeleton />}>
          <BudgetsList />
        </Suspense>
      </div>
    </FinanceLayout>
  )
}