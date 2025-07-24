"use client"

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { TransactionList } from '@/components/transactions/TransactionList'
import { CreateTransactionForm } from '@/components/transactions/CreateTransactionForm'
import { TransactionStats } from '@/components/transactions/TransactionStats'
import { WalletAlert } from '@/components/ui/WalletAlert'
import { useWeb3 } from '@/contexts/Web3Provider'

export default function TransactionsPage() {
  const { isConnected } = useWeb3();

  if (!isConnected) {
    return (
      <DashboardLayout title="Transactions">
        <WalletAlert 
          title="Connect Wallet to View Transactions"
          message="Connect your wallet to view and manage your transactions."
        />
      </DashboardLayout>
    );
  }

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