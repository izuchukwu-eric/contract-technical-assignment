'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpDown, Clock, Users, BarChart3, TrendingUp, Activity } from 'lucide-react';
import { useContractMetrics, useUserTransactions, useAllTransactions } from '@/hooks/useContractData';
import { useWeb3 } from '@/contexts/Web3Provider';
import { TransactionStatus, UserRole } from '@/types/contract';
import { WalletAlert } from '@/components/ui/WalletAlert';

interface MetricsCardsProps {
  userRole?: number;
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({ userRole }) => {
  const { address, isConnected } = useWeb3();
  
  // Determine which data source to use based on user role
  const isAdminOrManager = userRole === UserRole.Admin || userRole === UserRole.Manager;
  
  // Always call both hooks but use appropriate data
  const { data: contractMetrics, isLoading: contractLoading, error: contractError } = useContractMetrics();
  const { data: allTransactions, isLoading: allTxLoading } = useAllTransactions();
  const { data: userTransactions, isLoading: userTxLoading } = useUserTransactions(address || undefined);
  
  // Use appropriate transaction data
  const transactions = isAdminOrManager ? allTransactions : userTransactions;
  const transactionsLoading = isAdminOrManager ? allTxLoading : userTxLoading;
  
  // Calculate metrics based on role and data
  const metrics = useMemo(() => {
    if (isAdminOrManager && contractMetrics) {
      // For admin/manager, use contract-wide metrics
      return contractMetrics;
    } else if (!isAdminOrManager && transactions) {
      // For regular users, calculate personal metrics
      const totalTransactions = transactions.length;
      const pendingApprovals = 0; // Regular users can't see approvals
      const completedTransactions = transactions.filter(tx => tx.status === TransactionStatus.Completed).length;
      const activeTransactions = transactions.filter(tx => tx.status === TransactionStatus.Active).length;
      
      return {
        totalTransactions,
        pendingApprovals,
        totalUsers: 1, // Just the current user
        activeDeals: activeTransactions,
      };
    }
    return null;
  }, [isAdminOrManager, contractMetrics, transactions]);
  
  const isLoading = isAdminOrManager ? contractLoading : transactionsLoading;
  const error = isAdminOrManager ? contractError : null;
  
  // Check if wallet is connected
  if (!isConnected) {
    return <WalletAlert />;
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-slate-200 rounded w-24" />
              <div className="h-8 w-8 bg-slate-200 rounded-lg" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-slate-200 rounded w-16 mb-2" />
              <div className="h-3 bg-slate-200 rounded w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="text-center text-slate-500">
              {error ? 'Failed to load metrics' : 'Connect wallet to view metrics'}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get card configurations based on user role
  const getCards = () => {
    if (isAdminOrManager) {
      // Platform-wide metrics for admin/manager
      return [
        {
          title: 'Total Transactions',
          value: metrics.totalTransactions,
          icon: ArrowUpDown,
          description: 'Platform transactions',
          subIcon: TrendingUp,
          gradientBg: 'bg-gradient-to-br from-blue-50 to-blue-100',
          border: 'border-blue-200',
          titleColor: 'text-blue-700',
          valueColor: 'text-blue-900',
          descColor: 'text-blue-600',
          iconBg: 'bg-blue-500',
        },
        {
          title: 'Pending Approvals',
          value: metrics.pendingApprovals,
          icon: Clock,
          description: 'Awaiting approval',
          subIcon: Clock,
          gradientBg: 'bg-gradient-to-br from-amber-50 to-amber-100',
          border: 'border-amber-200',
          titleColor: 'text-amber-700',
          valueColor: 'text-amber-900',
          descColor: 'text-amber-600',
          iconBg: 'bg-amber-500',
        },
        {
          title: 'Active Users',
          value: metrics.totalUsers,
          icon: Users,
          description: 'Registered users',
          subIcon: TrendingUp,
          gradientBg: 'bg-gradient-to-br from-emerald-50 to-emerald-100',
          border: 'border-emerald-200',
          titleColor: 'text-emerald-700',
          valueColor: 'text-emerald-900',
          descColor: 'text-emerald-600',
          iconBg: 'bg-emerald-500',
        },
        {
          title: 'Active Transactions',
          value: metrics.activeDeals,
          icon: BarChart3,
          description: 'Currently active',
          subIcon: Activity,
          gradientBg: 'bg-gradient-to-br from-purple-50 to-purple-100',
          border: 'border-purple-200',
          titleColor: 'text-purple-700',
          valueColor: 'text-purple-900',
          descColor: 'text-purple-600',
          iconBg: 'bg-purple-500',
        },
      ];
    } else {
      // Personal metrics for regular users
      return [
        {
          title: 'My Transactions',
          value: metrics.totalTransactions,
          icon: ArrowUpDown,
          description: 'Your transactions',
          subIcon: TrendingUp,
          gradientBg: 'bg-gradient-to-br from-blue-50 to-blue-100',
          border: 'border-blue-200',
          titleColor: 'text-blue-700',
          valueColor: 'text-blue-900',
          descColor: 'text-blue-600',
          iconBg: 'bg-blue-500',
        },
        {
          title: 'Completed',
          value: transactions?.filter(tx => tx.status === TransactionStatus.Completed).length || 0,
          icon: Clock,
          description: 'Successfully completed',
          subIcon: TrendingUp,
          gradientBg: 'bg-gradient-to-br from-emerald-50 to-emerald-100',
          border: 'border-emerald-200',
          titleColor: 'text-emerald-700',
          valueColor: 'text-emerald-900',
          descColor: 'text-emerald-600',
          iconBg: 'bg-emerald-500',
        },
        {
          title: 'Pending',
          value: transactions?.filter(tx => tx.status === TransactionStatus.Pending).length || 0,
          icon: Clock,
          description: 'Awaiting processing',
          subIcon: Clock,
          gradientBg: 'bg-gradient-to-br from-amber-50 to-amber-100',
          border: 'border-amber-200',
          titleColor: 'text-amber-700',
          valueColor: 'text-amber-900',
          descColor: 'text-amber-600',
          iconBg: 'bg-amber-500',
        },
        {
          title: 'Active Transactions',
          value: metrics.activeDeals,
          icon: BarChart3,
          description: 'Currently active',
          subIcon: Activity,
          gradientBg: 'bg-gradient-to-br from-purple-50 to-purple-100',
          border: 'border-purple-200',
          titleColor: 'text-purple-700',
          valueColor: 'text-purple-900',
          descColor: 'text-purple-600',
          iconBg: 'bg-purple-500',
        },
      ];
    }
  };

  const cards = getCards();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <Card key={index} className={`${card.gradientBg} ${card.border} shadow-lg hover:shadow-xl transition-all duration-300`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`text-sm font-medium ${card.titleColor}`}>
              {card.title}
            </CardTitle>
            <div className={`w-8 h-8 ${card.iconBg} rounded-lg flex items-center justify-center`}>
              <card.icon className="w-4 h-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${card.valueColor}`}>{card.value}</div>
            <p className={`text-xs ${card.descColor} flex items-center gap-1 mt-1`}>
              <card.subIcon className="w-3 h-3" />
              {card.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};