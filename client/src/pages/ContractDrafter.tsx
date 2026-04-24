import { PenTool } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';

export default function ContractDrafter() {
  return (
    <DashboardLayout pageTitle="合同起草人">
      <PageHeader title="合同起草人" description="协助起草合同" />
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <PenTool size={40} className="mx-auto text-muted-foreground/40 mb-3" />
        <p className="text-sm text-muted-foreground">جاري العمل على هذه الصفحة...</p>
      </div>
    </DashboardLayout>
  );
}
