'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, TrendingUp, TrendingDown } from 'lucide-react'
import { getTransactions } from '@/app/actions'
import { TransactionWithCategory } from '@/lib/database.types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { TransactionFormButton } from './transaction-form'

export function TransactionsList() {
  const [transactions, setTransactions] = useState<TransactionWithCategory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadTransactions() {
      try {
        const result = await getTransactions()
        if (result.success && result.data) {
          setTransactions(result.data)
        }
      } catch (error) {
        console.error('Error loading transactions:', error)
      } finally {
        setLoading(false)
      }
    }

    loadTransactions()
  }, [])

  if (loading) {
    return <TransactionsSkeleton />
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>
              Your latest income and expense transactions
            </CardDescription>
          </div>
          <TransactionFormButton onSuccess={() => window.location.reload()} />
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                No transactions yet. Start by adding your first transaction.
              </p>
              <TransactionFormButton onSuccess={() => window.location.reload()} />
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${
                      transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {transaction.type === 'income' ? (
                        <TrendingUp className={`h-4 w-4 text-green-600`} />
                      ) : (
                        <TrendingDown className={`h-4 w-4 text-red-600`} />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">
                        {transaction.description || 'Untitled Transaction'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {transaction.categories?.name || 'Uncategorized'} • {formatDate(transaction.date)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {transaction.type}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}