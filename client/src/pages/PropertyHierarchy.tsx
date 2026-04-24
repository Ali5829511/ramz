import { Network } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';

export default function PropertyHierarchy() {
  return (
    <DashboardLayout pageTitle="物业层级">
      <PageHeader title="物业层级" description="物业组织结构" />
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <Network size={40} className="mx-auto text-muted-foreground/40 mb-3" />
        <p className="text-sm text-muted-foreground">جاري العمل على هذه الصفحة...</p>
      </div>
    </DashboardLayout>
  );
}
