"use client"

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ApprovalList } from '@/components/approvals/ApprovalList';
import { ApprovalHistory } from '@/components/approvals/ApprovalHistory';
import { WalletAlert } from '@/components/ui/WalletAlert';
import { useWeb3 } from '@/contexts/Web3Provider';

export default function ApprovalsPage() {
  const { isConnected } = useWeb3();

  if (!isConnected) {
    return (
      <DashboardLayout title="Approvals">
        <WalletAlert 
          title="Connect Wallet to View Approvals"
          message="Connect your wallet to view pending approvals and approval history."
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Approvals">
      <div className="space-y-6">
        <ApprovalList />
        <ApprovalHistory />
      </div>
    </DashboardLayout>
  );
} 