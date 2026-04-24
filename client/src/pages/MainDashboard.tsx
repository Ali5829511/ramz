/*
 * صفحة لوحة التحكم الرئيسية - رمز الإبداع
 */
import { Home } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';

export default function MainDashboard() {
  return (
    <DashboardLayout pageTitle="لوحة التحكم الرئيسية">
      <PageHeader title="لوحة التحكم الرئيسية" description="نظرة عامة شاملة على النظام" />
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <Home size={40} className="mx-auto text-muted-foreground/40 mb-3" />
        <p className="text-sm text-muted-foreground">جاري العمل على هذه الصفحة...</p>
      </div>
    </DashboardLayout>
  );
}
