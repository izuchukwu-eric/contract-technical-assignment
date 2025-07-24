"use client"

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { TransactionList } from '@/components/transactions/TransactionList'
import { CreateTransactionForm } from '@/components/transactions/CreateTransactionForm'
import { TransactionStats } from '@/components/transactions/TransactionStats'
import { WalletAlert } from '@/components/ui/WalletAlert'
import { useWeb3 } from '@/contexts/Web3Provider'
import { useUser } from '@/hooks/useContractData'

export default function TransactionsPage() {
  const { isConnected, address } = useWeb3();
  const { data: user } = useUser(address || undefined);

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
        <TransactionStats userRole={user?.role} />

        {/* Create New Transaction Form */}
        <CreateTransactionForm />

        {/* Enhanced Transaction List */}
        <TransactionList userRole={user?.role} />
      </div>
    </DashboardLayout>
  )
}