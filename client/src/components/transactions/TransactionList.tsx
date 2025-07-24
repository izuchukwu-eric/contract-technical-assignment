'use client';

import React, { useState, useMemo } from 'react';
import { useAllTransactions } from '@/hooks/useContractData';
import { useWeb3 } from '@/contexts/Web3Provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TransactionStatus } from '@/types/contract';
import { formatEther } from 'ethers';
import { 
  Search, 
  Filter, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Eye,
  ExternalLink,
  Calendar,
  AlertCircle,
  MoreHorizontal,
  Copy,
  Activity,
  X
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface TransactionListProps {
  showUserTransactions?: boolean;
}

export const TransactionList: React.FC<TransactionListProps> = ({ 
  showUserTransactions = false 
}) => {
  const { data: transactions, isLoading, error } = useAllTransactions();
  const { address } = useWeb3();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'timestamp' | 'amount'>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

  const filteredTransactions = useMemo(() => {
    if (!transactions) return [];

    let filtered = transactions;

    // Filter by user if needed
    if (showUserTransactions && address) {
      filtered = filtered.filter(tx => 
        tx.from.toLowerCase() === address.toLowerCase() || 
        tx.to.toLowerCase() === address.toLowerCase()
      );
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(tx =>
        tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.id.toString().includes(searchTerm)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(tx => tx.status.toString() === statusFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal, bVal;
      if (sortBy === 'timestamp') {
        aVal = Number(a.timestamp);
        bVal = Number(b.timestamp);
      } else {
        aVal = Number(a.amount);
        bVal = Number(b.amount);
      }
      
      if (sortOrder === 'asc') {
        return aVal - bVal;
      } else {
        return bVal - aVal;
      }
    });

    return filtered;
  }, [transactions, searchTerm, statusFilter, sortBy, sortOrder, showUserTransactions, address]);

  const getStatusColor = (status: number) => {
    switch (status) {
      case TransactionStatus.Completed:
        return "text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100";
      case TransactionStatus.Active:
        return "text-blue-700 bg-blue-50 border-blue-200 hover:bg-blue-100";
      case TransactionStatus.Pending:
        return "text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100";
      case TransactionStatus.Rejected:
        return "text-red-700 bg-red-50 border-red-200 hover:bg-red-100";
      default:
        return "text-gray-700 bg-gray-50 border-gray-200 hover:bg-gray-100";
    }
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case TransactionStatus.Completed: return 'completed';
      case TransactionStatus.Active: return 'active';
      case TransactionStatus.Pending: return 'pending';
      case TransactionStatus.Rejected: return 'rejected';
      default: return 'unknown';
    }
  };

  const formatAddress = (addr: string) => 
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

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

  const handleRowClick = (tx: any) => {
    setSelectedTransaction(tx);
  };

  if (isLoading) {
    return (
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-slate-100">
          <div className="animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-200 rounded-xl" />
              <div>
                <div className="h-6 bg-slate-200 rounded w-40 mb-1" />
                <div className="h-4 bg-slate-200 rounded w-20" />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-0">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="p-6 border-b border-slate-100 last:border-b-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-200 rounded-xl" />
                    <div className="space-y-2">
                      <div className="h-4 bg-slate-200 rounded w-32" />
                      <div className="h-3 bg-slate-200 rounded w-48" />
                    </div>
                  </div>
                  <div className="h-8 bg-slate-200 rounded w-24" />
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
            <p className="text-gray-600">Failed to load transactions</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-slate-100">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-slate-900">
                  {showUserTransactions ? 'My Transactions' : 'All Transactions'}
                </CardTitle>
                <p className="text-sm text-slate-600">({filteredTransactions.length} total)</p>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col lg:flex-row gap-4 pt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search transactions, addresses, or hashes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 bg-white border-slate-200">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="2">Completed</SelectItem>
                  <SelectItem value="0">Pending</SelectItem>
                  <SelectItem value="3">Rejected</SelectItem>
                  <SelectItem value="1">Active</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(value: 'timestamp' | 'amount') => setSortBy(value)}>
                <SelectTrigger className="w-40 bg-white border-slate-200">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="timestamp">Sort by Date</SelectItem>
                  <SelectItem value="amount">Sort by Amount</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                variant="outline" 
                size="sm" 
                className="bg-white border-slate-200"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="space-y-0">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((tx) => {
                const direction = getTransactionDirection(tx);
                return (
                  <div
                    key={Number(tx.id)}
                    onClick={() => handleRowClick(tx)}
                    className="group p-6 hover:bg-gradient-to-r hover:from-slate-50 hover:to-blue-50 transition-all duration-300 border-b border-slate-100 last:border-b-0 cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      {/* Left Section */}
                      <div className="flex items-center gap-4 flex-1">
                        {/* Direction Indicator */}
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

                        {/* Transaction Details */}
                        <div className="space-y-2 flex-1 min-w-0">
                          <div className="flex items-center gap-3 flex-wrap">
                            <Badge className={cn("text-xs font-medium", getStatusColor(tx.status))}>
                              {getStatusText(tx.status)}
                            </Badge>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <span className="font-mono">{formatAddress(tx.from)}</span>
                              →
                              <span className="font-mono">{formatAddress(tx.to)}</span>
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <ExternalLink className="w-3 h-3 text-slate-400" />
                              </div>
                            </div>
                            <p className="text-sm font-medium text-slate-700">{tx.description}</p>
                            <div className="flex items-center gap-4 text-xs text-slate-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(tx.timestamp)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Section */}
                      <div className="flex items-center gap-4">
                        {/* Amount */}
                        <div className="text-right space-y-1">
                          <div className="text-xl font-bold text-slate-900">
                            {formatEther(tx.amount)} ETH
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-slate-500 py-12">
                <Activity className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="font-medium">No transactions found</p>
                <p className="text-sm text-slate-400">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your search or filter criteria'
                    : 'Transactions will appear here once you start using the platform'
                  }
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div 
            className="fixed inset-0" 
            onClick={() => setSelectedTransaction(null)}
            aria-label="Close modal"
          />
          
          <Card className="relative bg-white shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50">
              <CardTitle className="flex items-center justify-between text-slate-900">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Eye className="w-4 h-4 text-white" />
                  </div>
                  Transaction Details
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedTransaction(null)}
                  className="text-slate-600 cursor-pointer hover:text-slate-900 hover:bg-slate-100 rounded-full"
                >
                  <X className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Transaction ID</label>
                    <div className="px-3 py-2 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-sm font-mono text-slate-900">#{Number(selectedTransaction.id)}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Status</label>
                    <div>
                      <Badge className={cn("text-xs font-medium", getStatusColor(selectedTransaction.status))}>
                        {getStatusText(selectedTransaction.status)}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">From Address</label>
                  <div className="px-3 py-2 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-sm font-mono text-slate-900 break-all">{selectedTransaction.from}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">To Address</label>
                  <div className="px-3 py-2 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-sm font-mono text-slate-900 break-all">{selectedTransaction.to}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Amount</label>
                    <div className="px-3 py-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                      <p className="text-sm font-bold text-green-800">
                        {formatEther(selectedTransaction.amount)} ETH
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Created</label>
                    <div className="px-3 py-2 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-sm text-slate-900">{formatDate(selectedTransaction.timestamp)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Description</label>
                  <div className="px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 min-h-[60px]">
                    <p className="text-sm text-slate-900">{selectedTransaction.description}</p>
                  </div>
                </div>
                
                {selectedTransaction.approvalId && Number(selectedTransaction.approvalId) > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Approval ID</label>
                    <div className="px-3 py-2 bg-amber-50 rounded-lg border border-amber-200">
                      <p className="text-sm font-mono text-amber-800">#{Number(selectedTransaction.approvalId)}</p>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <Button
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    onClick={() => {
                      // Add functionality for viewing on explorer
                      console.log('View on explorer:', selectedTransaction);
                    }}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View on Explorer
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}; 