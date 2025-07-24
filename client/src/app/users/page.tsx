'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { UserStats } from '@/components/users/UserStats';
import { UserManagement } from '@/components/users/UserManagement';
import { UserSidebar } from '@/components/users/UserSidebar';
import { useUser } from '@/hooks/useContractData';
import { useWeb3 } from '@/contexts/Web3Provider';
import { UserRole } from '@/types/contract';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Lock } from 'lucide-react';
import { WalletAlert } from '@/components/ui/WalletAlert';

export default function UsersPage() {
  const { address, isConnected } = useWeb3();
  const { data: currentUser, isLoading } = useUser(address ?? undefined);

  const isAdmin = currentUser?.role === UserRole.Admin;

  if (!isConnected) {
    return (
      <DashboardLayout title="User Management">
        <WalletAlert 
          title="Connect Wallet to Manage Users"
          message="Connect your wallet to view and manage user accounts and permissions."
        />
      </DashboardLayout>
    );
  }

  if (isLoading) {
    return (
      <DashboardLayout title="User Management">
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-gray-600">Loading user permissions...</p>
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  if (!currentUser) {
    return (
      <DashboardLayout title="User Management">
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                User Not Registered
              </h3>
              <p className="text-gray-600 mb-4">
                Your wallet address is not registered in the system. 
                Please contact an administrator to register your account.
              </p>
              <div className="text-sm text-gray-500">
                <p>Connected Address: <span className="font-mono">{address}</span></p>
              </div>
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  if (!isAdmin) {
    return (
      <DashboardLayout title="User Management">
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <div className="text-center">
              <Lock className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Admin Access Required
              </h3>
              <p className="text-gray-600 mb-4">
                You need administrator privileges to access user management features.
              </p>
              <div className="text-sm text-gray-500">
                <p>Your Role: <span className="font-semibold">
                  {currentUser.role === UserRole.Manager ? 'Manager' : 'User'}
                </span></p>
                <p>Required Role: <span className="font-semibold">Admin</span></p>
              </div>
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="User Management">
      <div className="space-y-6">
        {/* Quick Stats */}
        <UserStats />

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* User Management */}
          <div className="xl:col-span-3">
            <UserManagement isAdmin={isAdmin} />
          </div>

          {/* Sidebar */}
          <UserSidebar isAdmin={isAdmin} />
        </div>
      </div>
    </DashboardLayout>
  );
} 