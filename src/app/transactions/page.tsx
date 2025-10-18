import { Suspense } from 'react'
import { FinanceLayout } from '@/components/finance/finance-layout'
import { TransactionsList } from '@/components/finance/transactions-list'
import { TransactionsSkeleton } from '@/components/finance/transactions-skeleton'

export default function TransactionsPage() {
  return (
    <FinanceLayout>
      <div className="container mx-auto p-6">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Transactions</h1>
            <p className="text-muted-foreground">
              Manage your income and expenses
            </p>
          </div>
        </div>
        
        <Suspense fallback={<TransactionsSkeleton />}>
          <TransactionsList />
        </Suspense>
      </div>
    </FinanceLayout>
  )
}