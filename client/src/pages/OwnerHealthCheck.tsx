import { Activity } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';

export default function OwnerHealthCheck() {
  return (
    <DashboardLayout pageTitle="业主健康检查">
      <PageHeader title="业主健康检查" description="业主账户状态检查" />
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <Activity size={40} className="mx-auto text-muted-foreground/40 mb-3" />
        <p className="text-sm text-muted-foreground">جاري العمل على هذه الصفحة...</p>
      </div>
    </DashboardLayout>
  );
}
