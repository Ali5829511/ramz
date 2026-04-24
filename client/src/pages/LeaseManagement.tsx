import { ClipboardList } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';

export default function LeaseManagement() {
  return (
    <DashboardLayout pageTitle="租赁管理">
      <PageHeader title="租赁管理" description="租赁信息管理" />
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <ClipboardList size={40} className="mx-auto text-muted-foreground/40 mb-3" />
        <p className="text-sm text-muted-foreground">جاري العمل على هذه الصفحة...</p>
      </div>
    </DashboardLayout>
  );
}
