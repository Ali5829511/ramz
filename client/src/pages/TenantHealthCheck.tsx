import { Zap } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';

export default function TenantHealthCheck() {
  return (
    <DashboardLayout pageTitle="租户健康检查">
      <PageHeader title="租户健康检查" description="租户账户状态" />
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <Zap size={40} className="mx-auto text-muted-foreground/40 mb-3" />
        <p className="text-sm text-muted-foreground">جاري العمل على هذه الصفحة...</p>
      </div>
    </DashboardLayout>
  );
}
