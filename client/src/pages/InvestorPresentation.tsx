/*
 * صفحة عرض المستثمرين - رمز الإبداع
 */
import { PresentationIcon as Presentation } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';

export default function InvestorPresentation() {
  return (
    <DashboardLayout pageTitle="عرض المستثمرين">
      <PageHeader title="عرض المستثمرين" description="عرض شامل للاستثمارات" />
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <Presentation size={40} className="mx-auto text-muted-foreground/40 mb-3" />
        <p className="text-sm text-muted-foreground">جاري العمل على هذه الصفحة...</p>
      </div>
    </DashboardLayout>
  );
}
