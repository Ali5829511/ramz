import { Bell } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';

export default function LeaseAlertCenter() {
  return (
    <DashboardLayout pageTitle="租赁提醒中心">
      <PageHeader title="租赁提醒中心" description="重要租赁提醒" />
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <Bell size={40} className="mx-auto text-muted-foreground/40 mb-3" />
        <p className="text-sm text-muted-foreground">جاري العمل على هذه الصفحة...</p>
      </div>
    </DashboardLayout>
  );
}
