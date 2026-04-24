import { BarChart3 } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';

export default function UnitStatusDashboard() {
  return (
    <DashboardLayout pageTitle="单位状态仪表板">
      <PageHeader title="单位状态仪表板" description="单位状态监控" />
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <BarChart3 size={40} className="mx-auto text-muted-foreground/40 mb-3" />
        <p className="text-sm text-muted-foreground">جاري العمل على هذه الصفحة...</p>
      </div>
    </DashboardLayout>
  );
}
