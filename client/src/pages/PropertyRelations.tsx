import { Layers } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';

export default function PropertyRelations() {
  return (
    <DashboardLayout pageTitle="物业关系">
      <PageHeader title="物业关系" description="物业关系管理" />
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <Layers size={40} className="mx-auto text-muted-foreground/40 mb-3" />
        <p className="text-sm text-muted-foreground">جاري العمل على هذه الصفحة...</p>
      </div>
    </DashboardLayout>
  );
}
