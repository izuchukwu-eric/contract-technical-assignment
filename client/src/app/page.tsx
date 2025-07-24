import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MetricsCards } from '@/components/dashboard/MetricsCards';
import { RecentActivity } from '@/components/dashboard/RecentActivity';

export default function Home() {
  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6">
        <MetricsCards />
        <RecentActivity />
      </div>
    </DashboardLayout>
  );
}
