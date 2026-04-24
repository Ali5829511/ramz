import { Clock } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';

export default function LeaseReminderAutomation() {
  return (
    <DashboardLayout pageTitle="租赁提醒自动化">
      <PageHeader title="租赁提醒自动化" description="自动提醒系统" />
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <Clock size={40} className="mx-auto text-muted-foreground/40 mb-3" />
        <p className="text-sm text-muted-foreground">جاري العمل على هذه الصفحة...</p>
      </div>
    </DashboardLayout>
  );
}
