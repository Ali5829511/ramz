import { Users } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';

export default function OwnerManagement() {
  return (
    <DashboardLayout pageTitle="业主管理">
      <PageHeader title="业主管理" description="业主信息管理" />
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <Users size={40} className="mx-auto text-muted-foreground/40 mb-3" />
        <p className="text-sm text-muted-foreground">جاري العمل على هذه الصفحة...</p>
      </div>
    </DashboardLayout>
  );
}
