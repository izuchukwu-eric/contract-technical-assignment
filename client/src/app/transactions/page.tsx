"use client"

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { TransactionList } from '@/components/transactions/TransactionList'
import { CreateTransactionForm } from '@/components/transactions/CreateTransactionForm'
import { TransactionStats } from '@/components/transactions/TransactionStats'

export default function TransactionsPage() {
  return (
    <DashboardLayout title="Transactions">
      <div className="space-y-6">
        {/* Quick Stats */}
        <TransactionStats />

        {/* Create New Transaction Form */}
        <CreateTransactionForm />

        {/* Enhanced Transaction List */}
        <TransactionList />
      </div>
    </DashboardLayout>
  )
}