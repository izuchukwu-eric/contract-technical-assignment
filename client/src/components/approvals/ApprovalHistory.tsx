'use client';

import React, { useState, useMemo } from 'react';
import { useApprovalHistory } from '@/hooks/useContractData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ApprovalStatus, ApprovalType } from '@/types/contract';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search,
  AlertCircle,
  FileText,
  User,
  CreditCard,
  History
} from 'lucide-react';

export const ApprovalHistory: React.FC = () => {
  const { data: approvals, isLoading, error } = useApprovalHistory();
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
      filtered = filtered.filter(approval => approval.status.toString() === statusFilter);
    }

    return filtered;
  }, [approvals, searchTerm, statusFilter]);

  const getStatusIcon = (status: number) => {
    switch (status) {
      case ApprovalStatus.Approved:
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case ApprovalStatus.Rejected:
        return <XCircle className="h-4 w-4 text-red-600" />;
      case ApprovalStatus.Pending:
        return <Clock className="h-4 w-4 text-orange-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

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
      case ApprovalStatus.Approved: return 'bg-green-100 text-green-800';
      case ApprovalStatus.Rejected: return 'bg-red-100 text-red-800';
      case ApprovalStatus.Pending: return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getApprovalTypeIcon = (type: number) => {
    switch (type) {
      case ApprovalType.Transaction:
        return <CreditCard className="h-4 w-4 text-blue-600" />;
      case ApprovalType.UserRegistration:
        return <User className="h-4 w-4 text-green-600" />;
      case ApprovalType.RoleUpdate:
        return <FileText className="h-4 w-4 text-purple-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
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

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Approval History</CardTitle>
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
      <Card>
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Approval History
          <span className="text-sm font-normal text-gray-500">
            ({filteredApprovals.length})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search approval history..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="0">Pending</option>
            <option value="1">Approved</option>
            <option value="2">Rejected</option>
          </select>
        </div>

        {/* History List */}
        <div className="space-y-3">
          {filteredApprovals.length > 0 ? (
            filteredApprovals.map((approval) => (
              <div
                key={Number(approval.id)}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      {getApprovalTypeIcon(approval.approvalType)}
                      <span className="font-medium text-sm">
                        #{Number(approval.id)} - {getApprovalTypeText(approval.approvalType)}
                      </span>
                    </div>
                    <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                      Tx #{Number(approval.transactionId)}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-1">
                    <span>Requested by: </span>
                    <span className="font-mono">{formatAddress(approval.requester)}</span>
                  </div>

                  {approval.approver !== '0x0000000000000000000000000000000000000000' && (
                    <div className="text-sm text-gray-600 mb-1">
                      <span>Processed by: </span>
                      <span className="font-mono">{formatAddress(approval.approver)}</span>
                    </div>
                  )}

                  {approval.reason && (
                    <div className="text-sm text-gray-800 mb-1">
                      <span className="text-gray-600">Reason: </span>
                      {approval.reason}
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-500">
                    {formatDate(approval.timestamp)}
                  </p>
                </div>

                <div className="text-right">
                  <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(approval.status)}`}>
                    {getStatusIcon(approval.status)}
                    {getStatusText(approval.status)}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <History className="h-8 w-8 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No approval history found</p>
              <p className="text-sm text-gray-500">Processed approvals will appear here</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}; 