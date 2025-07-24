'use client';

import React, { useState } from 'react';
import { useAllUsers, useAllTransactions } from '@/hooks/useContractData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserRole, TransactionStatus } from '@/types/contract';
import { formatEther } from 'ethers';
import { 
  Activity, 
  TrendingUp, 
  ArrowRightLeft, 
  Users,
  Calendar,
  AlertCircle,
  BarChart3
} from 'lucide-react';

export const UserActivity: React.FC = () => {
  const { data: users, isLoading: usersLoading } = useAllUsers();
  const { data: transactions, isLoading: transactionsLoading } = useAllTransactions();

  const isLoading = usersLoading || transactionsLoading;

  const getActivityMetrics = () => {
    if (!users || !transactions) return null;

    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Recent activity counts
    const recentTransactions = transactions.filter(tx => 
      new Date(Number(tx.timestamp) * 1000) >= lastWeek
    );

    const recentUsers = users.filter(user => 
      new Date(Number(user.createdAt) * 1000) >= lastWeek
    );

    // User engagement data
    const userActivity = users.map(user => {
      const userTransactions = transactions.filter(tx => 
        tx.from.toLowerCase() === user.walletAddress.toLowerCase() ||
        tx.to.toLowerCase() === user.walletAddress.toLowerCase()
      );

      const totalVolume = userTransactions.reduce((sum, tx) => 
        sum + Number(formatEther(tx.amount)), 0
      );

      const recentActivity = userTransactions.filter(tx => 
        new Date(Number(tx.timestamp) * 1000) >= lastMonth
      ).length;

      return {
        ...user,
        transactionCount: userTransactions.length,
        totalVolume,
        recentActivity,
        lastActive: userTransactions.length > 0 
          ? Math.max(...userTransactions.map(tx => Number(tx.timestamp)))
          : Number(user.createdAt)
      };
    }).sort((a, b) => b.recentActivity - a.recentActivity);

    // Role distribution
    const roleDistribution = {
      [UserRole.User]: users.filter(u => u.role === UserRole.User).length,
      [UserRole.Manager]: users.filter(u => u.role === UserRole.Manager).length,
      [UserRole.Admin]: users.filter(u => u.role === UserRole.Admin).length,
    };

    // Transaction status distribution
    const statusDistribution = {
      [TransactionStatus.Pending]: transactions.filter(tx => tx.status === TransactionStatus.Pending).length,
      [TransactionStatus.Active]: transactions.filter(tx => tx.status === TransactionStatus.Active).length,
      [TransactionStatus.Completed]: transactions.filter(tx => tx.status === TransactionStatus.Completed).length,
      [TransactionStatus.Rejected]: transactions.filter(tx => tx.status === TransactionStatus.Rejected).length,
    };

    return {
      recentTransactions: recentTransactions.length,
      recentUsers: recentUsers.length,
      totalVolume: transactions.reduce((sum, tx) => sum + Number(formatEther(tx.amount)), 0),
      activeUsers: users.filter(u => u.isActive).length,
      userActivity,
      roleDistribution,
      statusDistribution,
    };
  };

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getRoleName = (role: number) => {
    switch (role) {
      case UserRole.User: return 'User';
      case UserRole.Manager: return 'Manager';
      case UserRole.Admin: return 'Admin';
      default: return 'Unknown';
    }
  };

  const getRoleColor = (role: number) => {
    switch (role) {
      case UserRole.User: return 'text-blue-600';
      case UserRole.Manager: return 'text-green-600';
      case UserRole.Admin: return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-5 bg-gray-200 rounded w-32" />
            </CardHeader>
            <CardContent>
              <div className="h-24 bg-gray-200 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const metrics = getActivityMetrics();

  if (!metrics) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No activity data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Activity Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Recent Transactions</p>
                <p className="text-2xl font-bold">{metrics.recentTransactions}</p>
                <p className="text-xs text-gray-500">Last 7 days</p>
              </div>
              <ArrowRightLeft className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">New Users</p>
                <p className="text-2xl font-bold">{metrics.recentUsers}</p>
                <p className="text-xs text-gray-500">Last 7 days</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Volume</p>
                <p className="text-2xl font-bold">{metrics.totalVolume.toFixed(2)}</p>
                <p className="text-xs text-gray-500">ETH</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-2xl font-bold">{metrics.activeUsers}</p>
                <p className="text-xs text-gray-500">Currently active</p>
              </div>
              <Activity className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Active Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Most Active Users
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {metrics.userActivity.slice(0, 5).map((user) => (
              <div
                key={user.walletAddress}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{user.name}</span>
                    <span className={`text-xs ${getRoleColor(user.role)}`}>
                      {getRoleName(user.role)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600">
                    <span className="font-mono">{formatAddress(user.walletAddress)}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Last active: {formatDate(user.lastActive)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">
                    {user.recentActivity} txs
                  </div>
                  <div className="text-xs text-gray-500">
                    {user.totalVolume.toFixed(2)} ETH
                  </div>
                </div>
              </div>
            ))}
            {metrics.userActivity.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                No user activity yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Role Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              User Roles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 bg-blue-500 rounded-full" />
                  <span className="text-sm font-medium">Users</span>
                </div>
                <span className="text-sm font-semibold">{metrics.roleDistribution[UserRole.User]}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 bg-green-500 rounded-full" />
                  <span className="text-sm font-medium">Managers</span>
                </div>
                <span className="text-sm font-semibold">{metrics.roleDistribution[UserRole.Manager]}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 bg-purple-500 rounded-full" />
                  <span className="text-sm font-medium">Admins</span>
                </div>
                <span className="text-sm font-semibold">{metrics.roleDistribution[UserRole.Admin]}</span>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium mb-3">Transaction Status</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Pending</span>
                  <span className="font-medium">{metrics.statusDistribution[TransactionStatus.Pending]}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Active</span>
                  <span className="font-medium">{metrics.statusDistribution[TransactionStatus.Active]}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Completed</span>
                  <span className="font-medium">{metrics.statusDistribution[TransactionStatus.Completed]}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Rejected</span>
                  <span className="font-medium">{metrics.statusDistribution[TransactionStatus.Rejected]}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}; 