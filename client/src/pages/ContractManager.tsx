import { FileText } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';

export default function ContractManager() {
  return (
    <DashboardLayout pageTitle="合同管理">
      <PageHeader title="合同管理" description="所有合同的管理" />
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <FileText size={40} className="mx-auto text-muted-foreground/40 mb-3" />
        <p className="text-sm text-muted-foreground">جاري العمل على هذه الصفحة...</p>
      </div>
    </DashboardLayout>
  );
}
