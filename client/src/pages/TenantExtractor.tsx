import { Database } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';

export default function TenantExtractor() {
  return (
    <DashboardLayout pageTitle="租户提取工具">
      <PageHeader title="租户提取工具" description="租户数据提取" />
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <Database size={40} className="mx-auto text-muted-foreground/40 mb-3" />
        <p className="text-sm text-muted-foreground">جاري العمل على هذه الصفحة...</p>
      </div>
    </DashboardLayout>
  );
}
