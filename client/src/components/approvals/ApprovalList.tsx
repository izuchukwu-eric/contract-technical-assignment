'use client';

import React, { useState, useMemo } from 'react';
import { usePendingApprovals, useProcessApproval, useAllTransactions } from '@/hooks/useContractData';
import { useWeb3 } from '@/contexts/Web3Provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ApprovalStatus, ApprovalType } from '@/types/contract';
import { formatEther } from 'ethers';
import { cn } from '@/utils/cn';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  Search,
  AlertCircle,
  FileText,
  User,
  CreditCard,
  CheckCircle2,
  RefreshCw,
  Filter,
  ArrowUpRight,
  Calendar,
  ExternalLink,
} from 'lucide-react';

interface ProcessApprovalModalProps {
  approval: any;
  relatedTransaction: any;
  onClose: () => void;
  onProcess: (approvalId: bigint, approved: boolean, reason?: string) => void;
  isProcessing: boolean;
}

const ProcessApprovalModal: React.FC<ProcessApprovalModalProps> = ({
  approval,
  relatedTransaction,
  onClose,
  onProcess,
  isProcessing
}) => {
  const [reason, setReason] = useState('');
  const [decision, setDecision] = useState<'approve' | 'reject' | null>(null);

  const handleSubmit = () => {
    if (decision) {
      onProcess(approval.id, decision === 'approve', reason);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Process Approval</h3>
          <Button variant="outline" size="sm" onClick={onClose}>×</Button>
        </div>

        <div className="space-y-4 mb-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-3">Approval Details</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600">ID:</span>
                <p className="font-mono">#{Number(approval.id)}</p>
              </div>
              <div>
                <span className="text-gray-600">Type:</span>
                <p>{approval.approvalType === ApprovalType.Transaction ? 'Transaction' : 
                    approval.approvalType === ApprovalType.UserRegistration ? 'User Registration' : 'Role Update'}</p>
              </div>
              <div>
                <span className="text-gray-600">Requester:</span>
                <p className="font-mono text-xs">{approval.requester.slice(0, 10)}...</p>
              </div>
              <div>
                <span className="text-gray-600">Created:</span>
                <p>{new Date(Number(approval.timestamp) * 1000).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {relatedTransaction && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium mb-3">Related Transaction</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-semibold">{formatEther(relatedTransaction.amount)} ETH</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">To:</span>
                  <span className="font-mono text-xs">{relatedTransaction.to.slice(0, 10)}...</span>
                </div>
                <div>
                  <span className="text-gray-600">Description:</span>
                  <p className="mt-1">{relatedTransaction.description}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">Your Decision *</label>
            <div className="flex gap-3">
              <Button
                variant={decision === 'approve' ? 'default' : 'outline'}
                onClick={() => setDecision('approve')}
                className="flex-1 flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Approve
              </Button>
              <Button
                variant={decision === 'reject' ? 'destructive' : 'outline'}
                onClick={() => setDecision('reject')}
                className="flex-1 flex items-center gap-2"
              >
                <XCircle className="h-4 w-4" />
                Reject
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="reason" className="text-sm font-medium text-gray-700">
              Reason (optional)
            </label>
            <textarea
              id="reason"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter your reason for this decision..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!decision || isProcessing}
            className="flex-1"
          >
            {isProcessing ? 'Processing...' : `${decision === 'approve' ? 'Approve' : 'Reject'}`}
          </Button>
        </div>
      </div>
    </div>
  );
};

export const ApprovalList: React.FC = () => {
  const { data: approvals, isLoading, error } = usePendingApprovals();
  const { data: transactions } = useAllTransactions();
  const { address } = useWeb3();
  const processApprovalMutation = useProcessApproval();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApproval, setSelectedApproval] = useState<any>(null);
  const [processingModal, setProcessingModal] = useState<any>(null);
  const [selectedApprovals, setSelectedApprovals] = useState<string[]>([]);
  const [priorityFilter, setPriorityFilter] = useState('all');

  const filteredApprovals = useMemo(() => {
    if (!approvals) return [];

    return approvals.filter(approval =>
      approval.requester.toLowerCase().includes(searchTerm.toLowerCase()) ||
      approval.id.toString().includes(searchTerm) ||
      (approval.reason && approval.reason.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [approvals, searchTerm]);

  const getApprovalTypeIcon = (type: number) => {
    switch (type) {
      case ApprovalType.Transaction:
        return <CreditCard className="h-5 w-5" />;
      case ApprovalType.UserRegistration:
        return <User className="h-5 w-5" />;
      case ApprovalType.RoleUpdate:
        return <FileText className="h-5 w-5" />;
      default:
        return <AlertCircle className="h-5 w-5" />;
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

  const getPriorityColor = (type: number) => {
    switch (type) {
      case ApprovalType.Transaction: return 'bg-red-100 text-red-700 border-red-200';
      case ApprovalType.UserRegistration: return 'bg-blue-100 text-blue-700 border-blue-200';
      case ApprovalType.RoleUpdate: return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getCategoryColor = (type: number) => {
    switch (type) {
      case ApprovalType.Transaction: return 'bg-purple-100 text-purple-700 border-purple-200';
      case ApprovalType.UserRegistration: return 'bg-green-100 text-green-700 border-green-200';
      case ApprovalType.RoleUpdate: return 'bg-orange-100 text-orange-700 border-orange-200';
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

  const handleProcessApproval = async (approvalId: bigint, approved: boolean, reason?: string) => {
    try {
      await processApprovalMutation.mutateAsync({ approvalId, approved, reason });
      setProcessingModal(null);
    } catch (error) {
      console.error('Failed to process approval:', error);
    }
  };

  const handleBulkApprove = async () => {
    // Implementation for bulk approve
    console.log('Bulk approving:', selectedApprovals);
  };

  const handleApprove = (approvalId: string) => {
    const approval = filteredApprovals.find(a => a.id.toString() === approvalId);
    if (approval) {
      const relatedTransaction = getRelatedTransaction(approval.transactionId);
      setProcessingModal({ approval, relatedTransaction });
    }
  };

  const handleReject = (approvalId: string) => {
    const approval = filteredApprovals.find(a => a.id.toString() === approvalId);
    if (approval) {
      const relatedTransaction = getRelatedTransaction(approval.transactionId);
      setProcessingModal({ approval, relatedTransaction });
    }
  };

  if (isLoading) {
    return (
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-amber-50 to-orange-50">
          <CardTitle>Loading Pending Approvals...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-32" />
                    <div className="h-3 bg-gray-200 rounded w-48" />
                  </div>
                  <div className="h-8 bg-gray-200 rounded w-24" />
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
            <p className="text-gray-600">Failed to load approvals</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-amber-50 to-orange-50">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-slate-900">Pending Approvals</CardTitle>
                <p className="text-sm text-slate-600">({filteredApprovals.length} awaiting review)</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {selectedApprovals.length > 0 && (
                <Button onClick={handleBulkApprove} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Approve Selected ({selectedApprovals.length})
                </Button>
              )}
              <Button variant="ghost" size="sm">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col lg:flex-row gap-4 pt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search approvals, addresses, or descriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white border-slate-200 focus:border-amber-500 focus:ring-amber-500"
              />
            </div>

            <div className="flex gap-3">
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-40 bg-white border-slate-200">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="transaction">Transaction</SelectItem>
                  <SelectItem value="user">User Registration</SelectItem>
                  <SelectItem value="role">Role Update</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="sm" className="bg-white border-slate-200">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="space-y-0">
            {filteredApprovals.length > 0 ? (
              filteredApprovals.map((approval) => {
                const relatedTransaction = getRelatedTransaction(approval.transactionId);
                const isTransaction = approval.approvalType === ApprovalType.Transaction;
                
                return (
                  <div
                    key={Number(approval.id)}
                    className="group p-6 hover:bg-gradient-to-r hover:from-slate-50 hover:to-amber-50 transition-all duration-300 border-b border-slate-100 last:border-b-0"
                  >
                    <div className="space-y-4">
                      {/* Header Row */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <input
                            type="checkbox"
                            className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                            onChange={(e) => {
                              const approvalId = approval.id.toString();
                              if (e.target.checked) {
                                setSelectedApprovals([...selectedApprovals, approvalId]);
                              } else {
                                setSelectedApprovals(selectedApprovals.filter((id) => id !== approvalId));
                              }
                            }}
                          />
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                "w-12 h-12 rounded-xl flex items-center justify-center shadow-sm",
                                isTransaction
                                  ? "bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600"
                                  : "bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-600"
                              )}
                            >
                              {getApprovalTypeIcon(approval.approvalType)}
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-3">
                                <h3 className="font-bold text-lg text-slate-900">#{Number(approval.id)}</h3>
                                <Badge className={cn("text-xs font-medium", getPriorityColor(approval.approvalType))}>
                                  {isTransaction ? 'High' : 'Medium'} priority
                                </Badge>
                                <Badge className={cn("text-xs font-medium", getCategoryColor(approval.approvalType))}>
                                  {getApprovalTypeText(approval.approvalType)}
                                </Badge>
                              </div>
                              <p className="text-sm font-medium text-slate-700">
                                {relatedTransaction?.description || getApprovalTypeText(approval.approvalType)}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="text-right space-y-1">
                          <div className="text-xl font-bold text-slate-900">
                            {relatedTransaction ? `${formatEther(relatedTransaction.amount)} ETH` : 'N/A'}
                          </div>
                          <div className="text-sm text-slate-600">
                            {relatedTransaction ? `~$${(parseFloat(formatEther(relatedTransaction.amount)) * 2000).toFixed(2)}` : ''}
                          </div>
                        </div>
                      </div>

                      {/* Details Row */}
                      <div className="ml-16 space-y-3">
                        <div className="flex items-center gap-6 text-sm text-slate-600">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-6 h-6">
                              <AvatarFallback className="text-xs bg-slate-200">
                                {approval.requester.slice(2, 4).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span>
                              <span className="font-medium">{formatAddress(approval.requester)}</span>
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(approval.timestamp)}</span>
                          </div>
                        </div>

                        {relatedTransaction && (
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <span className="font-mono">{formatAddress(approval.requester)}</span>
                            <ArrowUpRight className="w-3 h-3" />
                            <span className="font-mono">{formatAddress(relatedTransaction.to)}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                          </div>
                        )}

                        <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg">
                          {approval.reason || 'No description provided'}
                        </p>

                        <div className="flex justify-end">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-slate-600 border-slate-200 hover:bg-slate-50 bg-transparent"
                              onClick={() => setSelectedApproval(approval)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Details
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReject(approval.id.toString())}
                              className="text-red-600 border-red-200 hover:bg-red-50"
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleApprove(approval.id.toString())}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                              <CheckCircle2 className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No pending approvals</h3>
                <p className="text-slate-600">All approvals have been processed</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Processing Modal */}
      {processingModal && (
        <ProcessApprovalModal
          approval={processingModal.approval}
          relatedTransaction={processingModal.relatedTransaction}
          onClose={() => setProcessingModal(null)}
          onProcess={handleProcessApproval}
          isProcessing={processApprovalMutation.isPending}
        />
      )}

      {/* Details Modal */}
      {selectedApproval && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Approval Details</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedApproval(null)}
              >×</Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">ID</label>
                <p className="text-sm">#{Number(selectedApproval.id)}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Type</label>
                <div className="flex items-center gap-2">
                  {getApprovalTypeIcon(selectedApproval.approvalType)}
                  <span className="text-sm">{getApprovalTypeText(selectedApproval.approvalType)}</span>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Requester</label>
                <p className="text-sm font-mono">{selectedApproval.requester}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Transaction ID</label>
                <p className="text-sm">#{Number(selectedApproval.transactionId)}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Created</label>
                <p className="text-sm">{formatDate(selectedApproval.timestamp)}</p>
              </div>
              
              {selectedApproval.reason && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Reason</label>
                  <p className="text-sm">{selectedApproval.reason}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}; 