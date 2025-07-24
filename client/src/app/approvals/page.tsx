import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ApprovalList } from '@/components/approvals/ApprovalList';
import { ApprovalHistory } from '@/components/approvals/ApprovalHistory';

export default function ApprovalsPage() {
  return (
    <DashboardLayout title="Approvals">
      <div className="space-y-6">
        <ApprovalList />
        <ApprovalHistory />
      </div>
    </DashboardLayout>
  );
} 