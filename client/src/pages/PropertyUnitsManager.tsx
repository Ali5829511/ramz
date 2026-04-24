import { Building2 } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';

export default function PropertyUnitsManager() {
  return (
    <DashboardLayout pageTitle="物业单位管理">
      <PageHeader title="物业单位管理" description="管理和组织物业单位" />
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <Building2 size={40} className="mx-auto text-muted-foreground/40 mb-3" />
        <p className="text-sm text-muted-foreground">جاري العمل على هذه الصفحة...</p>
      </div>
    </DashboardLayout>
  );
}
