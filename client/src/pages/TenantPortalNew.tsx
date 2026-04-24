import { LogIn } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';

export default function TenantPortalNew() {
  return (
    <DashboardLayout pageTitle="租户门户">
      <PageHeader title="租户门户" description="租户自服务门户" />
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <LogIn size={40} className="mx-auto text-muted-foreground/40 mb-3" />
        <p className="text-sm text-muted-foreground">جاري العمل على هذه الصفحة...</p>
      </div>
    </DashboardLayout>
  );
}
