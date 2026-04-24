/*
 * صفحة لوحة التحليلات - رمز الإبداع
 */
import { BarChart2 } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';

export default function AnalyticsDashboard() {
  return (
    <DashboardLayout pageTitle="لوحة التحليلات">
      <PageHeader title="لوحة التحليلات" description="تحليل شامل للبيانات" />
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <BarChart2 size={40} className="mx-auto text-muted-foreground/40 mb-3" />
        <p className="text-sm text-muted-foreground">جاري العمل على هذه الصفحة...</p>
      </div>
    </DashboardLayout>
  );
}
