'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserRole } from '@/types/contract';
import {
  Crown,
  Shield,
  Users,
  Eye,
  X,
  Copy
} from 'lucide-react';

interface UserDetailsModalProps {
  user: any;
  onClose: () => void;
}

export const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  user,
  onClose
}) => {
  const getRoleIcon = (role: number) => {
    switch (role) {
      case UserRole.Admin: return Crown;
      case UserRole.Manager: return Shield;
      case UserRole.User: return Users;
      default: return Users;
    }
  };

  const getRoleText = (role: number) => {
    switch (role) {
      case UserRole.Admin: return 'Admin';
      case UserRole.Manager: return 'Manager';
      case UserRole.User: return 'User';
      default: return 'Unknown';
    }
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleCopyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy address:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
      <div 
        className="fixed inset-0" 
        onClick={onClose}
        aria-label="Close modal"
      />
      
      <Card className="relative bg-white shadow-2xl max-w-lg w-full max-h-[90vh] overflow-auto">
        <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-blue-50 to-slate-100">
          <CardTitle className="flex items-center justify-between text-slate-900">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-slate-600 rounded-lg flex items-center justify-center">
                <Eye className="w-4 h-4 text-white" />
              </div>
              User Details
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Name</label>
                <div className="px-3 py-2 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-sm font-medium text-slate-900">{user.name}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">User ID</label>
                <div className="px-3 py-2 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-sm font-mono text-slate-900">#{Number(user.id)}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Wallet Address</label>
              <div className="px-3 py-2 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-mono text-slate-900 break-all flex-1">{user.walletAddress}</p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleCopyAddress(user.walletAddress)}
                    className="h-6 w-6 p-0 cursor-pointer hover:bg-slate-200 transition-colors flex-shrink-0"
                    title="Copy wallet address"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Role</label>
                <div className="px-3 py-2 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-2">
                    <div className="text-slate-600">
                      {React.createElement(getRoleIcon(user.role), { className: "h-4 w-4" })}
                    </div>
                    <span className="text-sm font-medium text-slate-900">{getRoleText(user.role)}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Status</label>
                <div className="px-3 py-2 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-sm font-medium text-slate-900">{user.isActive ? 'Active' : 'Inactive'}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Registration Date</label>
              <div className="px-3 py-2 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-sm text-slate-900">{formatDate(user.createdAt)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 