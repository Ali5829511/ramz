import { Wrench } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function TenantMaintenancePortal() {
  return (
    <DashboardLayout>
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <Wrench size={40} className="mx-auto text-muted-foreground/40 mb-3" />
        <p className="text-sm text-muted-foreground">جاري العمل على هذه الصفحة...</p>
      </div>
    </DashboardLayout>
  );
}
