"use client"

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MetricsCards } from '@/components/dashboard/MetricsCards';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { AnalyticsChart } from '@/components/dashboard/AnalyticsChart';
import { WalletAlert } from '@/components/ui/WalletAlert';
import { useWeb3 } from '@/contexts/Web3Provider';

export default function Home() {
  const { isConnected } = useWeb3();

  if (!isConnected) {
    return (
      <DashboardLayout title="Dashboard">
        <WalletAlert 
          title="Connect Wallet to View Activity"
          message="Connect your wallet to view recent transactions and pending approvals."
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6">
        <MetricsCards />
        <RecentActivity />
        <AnalyticsChart />
      </div>
    </DashboardLayout>
  );
}
