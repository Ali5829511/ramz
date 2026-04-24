import { FileCheck } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';

export default function EContractBuilder() {
  return (
    <DashboardLayout pageTitle="电子合同构建器">
      <PageHeader title="电子合同构建器" description="构建电子合同" />
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <FileCheck size={40} className="mx-auto text-muted-foreground/40 mb-3" />
        <p className="text-sm text-muted-foreground">جاري العمل على هذه الصفحة...</p>
      </div>
    </DashboardLayout>
  );
}
