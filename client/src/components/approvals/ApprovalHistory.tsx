'use client';

import React, { useState, useMemo } from 'react';
import { useApprovalHistory, useAllTransactions } from '@/hooks/useContractData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ApprovalStatus, ApprovalType } from '@/types/contract';
import { formatEther } from 'ethers';
import { cn } from '@/utils/cn';
import { 
  Search,
  AlertCircle,
  FileText,
  User,
  CreditCard,
  History,
} from 'lucide-react';

export const ApprovalHistory: React.FC = () => {
  const { data: approvals, isLoading, error } = useApprovalHistory();
  const { data: transactions } = useAllTransactions();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredApprovals = useMemo(() => {
    if (!approvals) return [];

    let filtered = approvals;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(approval =>
        approval.requester.toLowerCase().includes(searchTerm.toLowerCase()) ||
        approval.approver.toLowerCase().includes(searchTerm.toLowerCase()) ||
        approval.id.toString().includes(searchTerm) ||
        (approval.reason && approval.reason.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      const statusMap: { [key: string]: number } = {
        'pending': ApprovalStatus.Pending,
        'approved': ApprovalStatus.Approved,
        'rejected': ApprovalStatus.Rejected
      };
      filtered = filtered.filter(approval => approval.status === statusMap[statusFilter]);
    }

    return filtered;
  }, [approvals, searchTerm, statusFilter]);

  const getStatusText = (status: number) => {
    switch (status) {
      case ApprovalStatus.Approved: return 'Approved';
      case ApprovalStatus.Rejected: return 'Rejected';
      case ApprovalStatus.Pending: return 'Pending';
      default: return 'Unknown';
    }
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case ApprovalStatus.Approved: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case ApprovalStatus.Rejected: return 'bg-red-100 text-red-700 border-red-200';
      case ApprovalStatus.Pending: return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getApprovalTypeIcon = (type: number) => {
    switch (type) {
      case ApprovalType.Transaction:
        return <CreditCard className="h-4 w-4" />;
      case ApprovalType.UserRegistration:
        return <User className="h-4 w-4" />;
      case ApprovalType.RoleUpdate:
        return <FileText className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getApprovalTypeText = (type: number) => {
    switch (type) {
      case ApprovalType.Transaction: return 'Transaction';
      case ApprovalType.UserRegistration: return 'User Registration';
      case ApprovalType.RoleUpdate: return 'Role Update';
      default: return 'Unknown';
    }
  };

  const getCategoryColor = (type: number) => {
    switch (type) {
      case ApprovalType.Transaction: return 'bg-blue-100 text-blue-700 border-blue-200';
      case ApprovalType.UserRegistration: return 'bg-green-100 text-green-700 border-green-200';
      case ApprovalType.RoleUpdate: return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getRelatedTransaction = (transactionId: bigint) => {
    if (!transactions || !transactionId) return null;
    return transactions.find(tx => tx.id === transactionId);
  };

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) * 1000);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // sekeleton loader
  if (isLoading) {
    return (
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-slate-100">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-slate-600 to-slate-700 rounded-xl flex items-center justify-center">
                <History className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-slate-900">Approval History</CardTitle>
                <div className="h-4 bg-slate-200 rounded w-32 mt-1 animate-pulse" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-9 bg-slate-200 rounded w-40 animate-pulse" />
            </div>
          </div>

          <div className="pt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <div className="h-10 bg-slate-200 rounded-md animate-pulse pl-10" />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="space-y-0">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="p-6 border-b border-slate-100 last:border-b-0 animate-pulse"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 bg-slate-200 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <div className="h-5 bg-slate-200 rounded w-16" />
                        <div className="h-5 bg-slate-200 rounded w-20" />
                        <div className="h-5 bg-slate-200 rounded w-16" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 bg-slate-200 rounded-full" />
                          <div className="h-4 bg-slate-200 rounded w-48" />
                        </div>
                        <div className="h-3 bg-slate-200 rounded w-64" />
                        <div className="flex items-center gap-4">
                          <div className="h-3 bg-slate-200 rounded w-24" />
                          <div className="h-3 bg-slate-200 rounded w-32" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right space-y-1">
                      <div className="h-6 bg-slate-200 rounded w-20" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600">Failed to load approval history</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-slate-100">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-slate-600 to-slate-700 rounded-xl flex items-center justify-center">
              <History className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-slate-900">Approval History</CardTitle>
              <p className="text-sm text-slate-600">({filteredApprovals.length} total approvals)</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 bg-white border-slate-200">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent className='bg-white'>
                <SelectItem value="all" className='cursor-pointer'>All Status</SelectItem>
                <SelectItem value="approved" className='cursor-pointer'>Approved</SelectItem>
                <SelectItem value="rejected" className='cursor-pointer'>Rejected</SelectItem>
                <SelectItem value="pending" className='cursor-pointer'>Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="pt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search approval history..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-slate-200 focus:border-slate-500 focus:ring-slate-500"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="space-y-0">
          {filteredApprovals.length > 0 ? (
            filteredApprovals.map((approval) => {
              const relatedTransaction = getRelatedTransaction(approval.transactionId);
              
              return (
                <div
                  key={Number(approval.id)}
                  className="group p-6 hover:bg-slate-50 transition-all duration-300 border-b border-slate-100 last:border-b-0"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                        {getApprovalTypeIcon(approval.approvalType)}
                      </div>
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-slate-900">#{Number(approval.id)}</h3>
                          <Badge className={cn("text-xs font-medium", getCategoryColor(approval.approvalType))}>
                            {getApprovalTypeText(approval.approvalType)}
                          </Badge>
                          <Badge className={cn("text-xs font-medium", getStatusColor(approval.status))}>
                            {getStatusText(approval.status)}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Avatar className="w-5 h-5">
                              <AvatarFallback className="text-xs bg-slate-200">
                                {approval.requester.slice(2, 4).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span>
                              <span className="font-medium">{formatAddress(approval.requester)}</span> • {getApprovalTypeText(approval.approvalType)}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">
                            {approval.reason || 'No description provided'}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span>Requested: {formatDate(approval.timestamp)}</span>
                            {approval.status === ApprovalStatus.Approved && approval.approver !== '0x0000000000000000000000000000000000000000' && (
                              <span>Approved by: {formatAddress(approval.approver)}</span>
                            )}
                            {approval.status === ApprovalStatus.Rejected && approval.reason && (
                              <span>Rejected: {approval.reason}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right space-y-1">
                        <div className="text-lg font-semibold text-slate-900">
                          {relatedTransaction ? `${formatEther(relatedTransaction.amount)} ETH` : 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12">
              <History className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No approval history found</h3>
              <p className="text-slate-600">Processed approvals will appear here</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}; 