'use client';

import React, { useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  DollarSign,
  XCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useContractMetrics, useAllTransactions, useUserTransactions } from '@/hooks/useContractData';
import { TransactionStatus, UserRole } from '@/types/contract';
import { useWeb3 } from '@/contexts/Web3Provider';
import { WalletAlert } from '@/components/ui/WalletAlert';
import { formatEther } from 'ethers';
import { cn } from "@/utils/cn";

interface TransactionStatsProps {
  userRole?: number;
}

export const TransactionStats: React.FC<TransactionStatsProps> = ({ userRole }) => {
  const { address, isConnected } = useWeb3();
  const { data: contractMetrics, isLoading: metricsLoading } = useContractMetrics();
  
  // Determine which data source to use based on user role
  const isAdminOrManager = userRole === UserRole.Admin || userRole === UserRole.Manager;
  
  // Always call both hooks but use appropriate data
  const { data: allTransactions, isLoading: allLoading } = useAllTransactions();
  const { data: userTransactions, isLoading: userLoading } = useUserTransactions(address || undefined);
  
  // Use the appropriate data source
  const transactions = isAdminOrManager ? allTransactions : userTransactions;
  const transactionsLoading = isAdminOrManager ? allLoading : userLoading;
  
  // Check if wallet is connected
  if (!isConnected) {
    return <WalletAlert />;
  }

  const quickStats = useMemo(() => {
    if (!contractMetrics || !transactions) {
      return [
        {
          title: "Total Volume",
          value: "0.0 ETH",
          usdValue: "$0.00",
          change: "0%",
          trend: "neutral",
          icon: DollarSign,
          color: "blue",
        },
        {
          title: "Pending",
          value: "0",
          subtitle: "Transactions",
          change: "0",
          trend: "neutral",
          icon: Clock,
          color: "amber",
        },
        {
          title: "Completed",
          value: "0",
          subtitle: "Transactions",
          change: "0",
          trend: "neutral",
          icon: CheckCircle2,
          color: "emerald",
        },
        {
          title: "Rejected",
          value: "0",
          subtitle: "Transactions",
          change: "0",
          trend: "neutral",
          icon: XCircle,
          color: "red",
        },
      ];
    }

    // Calculate total volume from all transactions
    const totalVolume = transactions.reduce((sum, tx) => {
      return sum + parseFloat(formatEther(tx.amount));
    }, 0);

    // Count transactions by status
    const pendingCount = transactions.filter(tx => tx.status === TransactionStatus.Pending).length;
    const completedCount = transactions.filter(tx => tx.status === TransactionStatus.Completed).length;
    const rejectedCount = transactions.filter(tx => tx.status === TransactionStatus.Rejected).length;

    return [
      {
        title: "Total Volume",
        value: `${totalVolume.toFixed(1)} ETH`,
        subtitle: "Transactions",
        change: totalVolume > 0 ? "+100%" : "0%",
        trend: totalVolume > 0 ? "up" : "neutral",
        icon: DollarSign,
        color: "blue",
      },
      {
        title: "Pending",
        value: pendingCount.toString(),
        subtitle: "Transactions",
        change: pendingCount > 0 ? `+${pendingCount}` : "0",
        trend: pendingCount > 0 ? "up" : "neutral",
        icon: Clock,
        color: "amber",
      },
      {
        title: "Completed",
        value: completedCount.toString(),
        subtitle: "Transactions",
        change: completedCount > 0 ? `+${completedCount}` : "0",
        trend: completedCount > 0 ? "up" : "neutral",
        icon: CheckCircle2,
        color: "emerald",
      },
      {
        title: "Rejected",
        value: rejectedCount.toString(),
        subtitle: "Transactions",
        change: rejectedCount > 0 ? `+${rejectedCount}` : "0",
        trend: rejectedCount > 0 ? "down" : "neutral",
        icon: XCircle,
        color: "red",
      },
    ];
  }, [contractMetrics, transactions]);

  const getStatColor = (color: string) => {
    switch (color) {
      case "blue":
        return "from-blue-50 to-blue-100 border-blue-200 text-blue-700";
      case "amber":
        return "from-amber-50 to-amber-100 border-amber-200 text-amber-700";
      case "emerald":
        return "from-emerald-50 to-emerald-100 border-emerald-200 text-emerald-700";
      case "purple":
        return "from-purple-50 to-purple-100 border-purple-200 text-purple-700";
      case "red":
        return "from-red-50 to-red-100 border-red-200 text-red-700";
      default:
        return "from-gray-50 to-gray-100 border-gray-200 text-gray-700";
    }
  };

  const isLoading = metricsLoading || transactionsLoading;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {quickStats.map((stat, index) => (
        <Card
          key={index}
          className={cn(
            "bg-gradient-to-br border shadow-lg hover:shadow-xl transition-all duration-300",
            getStatColor(stat.color),
          )}
        >
          <CardContent className="p-6">
            {isLoading ? (
              <div className="animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-4 bg-white/30 rounded w-20" />
                    <div className="h-6 bg-white/30 rounded w-16" />
                    <div className="h-3 bg-white/30 rounded w-12" />
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-xl" />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium opacity-80">{stat.title}</p>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold">{stat.value}</p>
                    {/* {stat.usdValue && <p className="text-sm opacity-70">{stat.usdValue}</p>} */}
                    {stat.subtitle && <p className="text-sm opacity-70">{stat.subtitle}</p>}
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    {stat.trend === "up" && <TrendingUp className="w-3 h-3 text-emerald-600" />}
                    {stat.trend === "down" && <TrendingDown className="w-3 h-3 text-red-600" />}
                    <span
                      className={cn(
                        stat.trend === "up" && "text-emerald-600",
                        stat.trend === "down" && "text-red-600",
                        stat.trend === "neutral" && "text-gray-600",
                      )}
                    >
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}; 