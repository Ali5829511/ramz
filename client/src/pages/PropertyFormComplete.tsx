import { FileText } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';

export default function PropertyFormComplete() {
  return (
    <DashboardLayout pageTitle="完整物业表单">
      <PageHeader title="完整物业表单" description="完整的物业信息表单" />
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <FileText size={40} className="mx-auto text-muted-foreground/40 mb-3" />
        <p className="text-sm text-muted-foreground">جاري العمل على هذه الصفحة...</p>
      </div>
    </DashboardLayout>
  );
}
