import { ScrollText } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';

export default function Leases() {
  return (
    <DashboardLayout pageTitle="租赁列表">
      <PageHeader title="租赁列表" description="所有租赁的列表" />
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <ScrollText size={40} className="mx-auto text-muted-foreground/40 mb-3" />
        <p className="text-sm text-muted-foreground">جاري العمل على هذه الصفحة...</p>
      </div>
    </DashboardLayout>
  );
}
