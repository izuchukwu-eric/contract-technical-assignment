'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRecentTransactions, useRecentApprovals } from '@/hooks/useContractData';
import { TransactionStatus, ApprovalStatus } from '@/types/contract';
import { formatEther } from 'ethers';
import { ArrowUpDown, Clock, CheckCircle2, XCircle, ArrowUpRight, ArrowDownLeft, ExternalLink, Calendar } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useWeb3 } from '@/contexts/Web3Provider';
import { Badge } from '../ui/badge';

export const RecentActivity: React.FC = () => {
  const { address } = useWeb3();
  const { data: transactions, isLoading: txLoading } = useRecentTransactions();
  const { data: approvals, isLoading: approvalLoading } = useRecentApprovals();

  const getStatusColor = (status: number, type: 'transaction' | 'approval') => {
    if (type === 'transaction') {
      switch (status) {
        case TransactionStatus.Completed: return 'bg-green-100 text-green-800';
        case TransactionStatus.Active: return 'bg-blue-100 text-blue-800';
        case TransactionStatus.Pending: return 'bg-amber-100 text-amber-800';
        case TransactionStatus.Rejected: return 'bg-red-100 text-red-800';
        default: return 'bg-slate-100 text-slate-800';
      }
    } else {
      switch (status) {
        case ApprovalStatus.Approved: return 'text-green-600 bg-green-50';
        case ApprovalStatus.Pending: return 'text-amber-600 bg-amber-50';
        case ApprovalStatus.Rejected: return 'text-red-600 bg-red-50';
        default: return 'text-slate-600 bg-slate-50';
      }
    }
  };

  const getStatusText = (status: number, type: 'transaction' | 'approval') => {
    if (type === 'transaction') {
      switch (status) {
        case TransactionStatus.Completed: return 'completed';
        case TransactionStatus.Active: return 'active';
        case TransactionStatus.Pending: return 'pending';
        case TransactionStatus.Rejected: return 'rejected';
        default: return 'unknown';
      }
    } else {
      switch (status) {
        case ApprovalStatus.Approved: return 'approved';
        case ApprovalStatus.Pending: return 'pending';
        case ApprovalStatus.Rejected: return 'rejected';
        default: return 'unknown';
      }
    }
  };

  const formatAddress = (address: string) => 
    `${address.slice(0, 6)}...${address.slice(-4)}`;

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) * 1000);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} mins ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} hours ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)} days ago`;
    }
  };

  const getTransactionDirection = (tx: any) => {
    if (!address) return 'outgoing';
    return tx.to.toLowerCase() === address.toLowerCase() ? 'incoming' : 'outgoing';
  };

  const getRelatedTransaction = (transactionId: bigint) => {
    if (!transactions || !transactionId) return null;
    return transactions.find(tx => tx.id === transactionId);
  };

  if (txLoading || approvalLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="animate-pulse border-0 shadow-sm">
            <CardHeader>
              <div className="h-5 bg-slate-200 rounded w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <div className="space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-24" />
                    <div className="h-3 bg-slate-200 rounded w-32" />
                  </div>
                  <div className="h-4 bg-slate-200 rounded w-16" />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Recent Transactions */}
      <Card className="xl:col-span-2 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <ArrowUpDown className="w-4 h-4 text-white" />
              </div>
              <CardTitle className="text-lg font-semibold text-slate-900">Recent Transactions</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-0">
            {transactions && transactions.length > 0 ? (
              transactions.map((tx) => {
                const direction = getTransactionDirection(tx);
                return (
                  <div
                    key={Number(tx.id)}
                    className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-b-0"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center",
                          direction === "incoming"
                            ? "bg-emerald-100 text-emerald-600"
                            : "bg-blue-100 text-blue-600",
                        )}
                      >
                        {direction === "incoming" ? (
                          <ArrowDownLeft className="w-4 h-4" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-900">
                            {formatAddress(tx.from)} → {formatAddress(tx.to)}
                          </span>
                          <Button variant="ghost" size="sm" className="h-4 w-4 p-0 cursor-pointer">
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        </div>
                        <p className="text-xs text-slate-600">{tx.description}</p>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(tx.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="text-lg font-semibold text-slate-900">
                        {formatEther(tx.amount)} ETH
                      </div>
                      <Badge className={cn("text-xs font-medium", getStatusColor(tx.status, 'transaction'))}>
                        {getStatusText(tx.status, 'transaction')}
                      </Badge>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-slate-500 py-12">
                <ArrowUpDown className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="font-medium">No recent transactions</p>
                <p className="text-sm text-slate-400">Transactions will appear here once you start using the platform</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pending Approvals */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-white" />
            </div>
            <CardTitle className="text-lg font-semibold text-slate-900">Pending Approvals</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-0">
            {approvals && approvals.length > 0 ? (
              approvals.map((approval) => {
                const relatedTransaction = getRelatedTransaction(approval.transactionId);

                return (
                  <div
                    key={Number(approval.id)}
                    className="p-4 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-b-0"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h4 className="text-sm font-medium text-slate-900">
                            Transaction #{Number(approval.transactionId)}
                          </h4>
                          <p className="text-xs text-slate-600">
                            Requested by {formatAddress(approval.requester)}
                          </p>
                          <p className="text-xs text-slate-500">
                            {approval.reason}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        {relatedTransaction && (
                          <span className="text-sm font-semibold text-slate-900">
                            {formatEther(relatedTransaction.amount)} ETH
                          </span>
                        )}
                        <span className="text-xs text-slate-500">{formatDate(approval.timestamp)}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1 text-white cursor-pointer bg-emerald-600 hover:bg-emerald-700">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-red-600 cursor-pointer border-red-200 hover:bg-red-50 bg-transparent"
                        >
                          <XCircle className="w-3 h-3 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-center text-slate-500 py-12">
                <Clock className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="font-medium">No pending approvals</p>
                <p className="text-sm text-slate-400">Approval requests will appear here</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};