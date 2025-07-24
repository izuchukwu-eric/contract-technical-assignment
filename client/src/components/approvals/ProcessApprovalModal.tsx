'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ApprovalType } from '@/types/contract';
import { formatEther } from 'ethers';
import {
  CheckCircle2,
  XCircle,
  Clock,
  X,
  Loader2,
  AlertTriangle
} from 'lucide-react';

interface ProcessApprovalModalProps {
  approval: any;
  relatedTransaction: any;
  onClose: () => void;
  onProcess: (approvalId: bigint, approved: boolean, reason?: string) => void;
  isProcessing: boolean;
}

export const ProcessApprovalModal: React.FC<ProcessApprovalModalProps> = ({
  approval,
  relatedTransaction,
  onClose,
  onProcess,
  isProcessing
}) => {
  const [reason, setReason] = useState('');
  const [decision, setDecision] = useState<'approve' | 'reject' | null>(null);
  const [error, setError] = useState<string>('');

  const handleSubmit = async () => {
    if (decision && reason.trim()) {
      setError('');
      try {
        await onProcess(approval.id, decision === 'approve', reason.trim());
      } catch (err: any) {
        setError(err.message || 'Failed to process approval');
      }
    }
  };

  return (
    <div className="fixed h-full inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
      <div 
        className="fixed inset-0" 
        onClick={onClose}
        aria-label="Close modal"
      />
      
      <Card className="relative bg-white shadow-2xl max-w-lg w-full max-h-[90vh] overflow-auto">
        <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-amber-50 to-orange-50">
          <CardTitle className="flex items-center justify-between text-slate-900">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-white" />
              </div>
              Process Approval
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="text-slate-600 cursor-pointer hover:text-slate-900 hover:bg-slate-100 rounded-full"
            >
              <X className="w-4 h-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="p-4 bg-slate-50 rounded-lg">
              <h4 className="font-medium mb-3 text-slate-900">Approval Details</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-slate-600">Approval ID:</span>
                  <p className="font-mono">#{Number(approval.id)}</p>
                </div>
                <div>
                  <span className="text-slate-600">Type:</span>
                  <p>{approval.approvalType === ApprovalType.Transaction ? 'Transaction' : 
                      approval.approvalType === ApprovalType.UserRegistration ? 'User Registration' : 'Role Update'}</p>
                </div>
                <div>
                  <span className="text-slate-600">Requester:</span>
                  <p className="font-mono text-xs">{approval.requester.slice(0, 10)}...</p>
                </div>
                <div>
                  <span className="text-slate-600">Created:</span>
                  <p>{new Date(Number(approval.timestamp) * 1000).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {relatedTransaction && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium mb-3 text-slate-900">Transaction Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Amount:</span>
                    <span className="font-semibold">{formatEther(relatedTransaction.amount)} ETH</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">To:</span>
                    <span className="font-mono text-xs">{relatedTransaction.to.slice(0, 10)}...</span>
                  </div>
                  <div>
                    <span className="text-slate-600">Description:</span>
                    <p className="mt-1">{relatedTransaction.description}</p>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-red-700">{error}</span>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-700">Your Decision *</label>
              <div className="flex gap-3">
                <Button
                  variant={decision === 'approve' ? 'default' : 'outline'}
                  onClick={() => {
                    setDecision('approve');
                    setError('');
                  }}
                  className="flex-1 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Approve
                </Button>
                <Button
                  variant={decision === 'reject' ? 'destructive' : 'outline'}
                  onClick={() => {
                    setDecision('reject');
                    setError('');
                  }}
                  className="flex-1 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <XCircle className="h-4 w-4" />
                  Reject
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="reason" className="text-sm font-medium text-slate-700">
                Reason *
              </label>
                              <textarea
                  id="reason"
                  rows={3}
                  value={reason}
                  onChange={(e) => {
                    setReason(e.target.value);
                    setError('');
                  }}
                  placeholder="Enter your reason for this decision..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                />
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-100">
              <Button 
                variant="outline" 
                onClick={onClose} 
                className="flex-1 cursor-pointer"
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!decision || !reason || isProcessing}
                className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `${decision === 'approve' ? 'Approve' : 'Reject'}`
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 