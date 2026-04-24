/*
 * صفحة بوابة المستأجر - رمز الإبداع
 */
import { useMemo } from 'react';
import { Users, FileText, DollarSign, Phone, Mail, Eye, CheckCircle, Clock } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import StatCard from '@/components/shared/StatCard';
import { LoadingState, EmptyState } from '@/components/shared/PageStates';
import { cn } from '@/lib/utils';
import { useMultiEntityData } from '@/hooks/useEntityData';

export default function TenantPortal() {
  const { data, loading } = useMultiEntityData([
    { name: 'Tenant', limit: 500 },
    { name: 'Contract', limit: 500 },
    { name: 'Payment', sort: '-created_date', limit: 500 },
  ]);

  const tenants = data.Tenant || [];
  const contracts = data.Contract || [];
  const payments = data.Payment || [];

  const stats = useMemo(() => {
    const active = tenants.filter(t => ['نشط', 'active'].includes(t['حالة_المستأجر'] || t.status || '')).length;
    const pendingPayments = payments.filter(p => ['معلق', 'pending'].includes(p['حالة_القسط'] || p['حالة_الدفع'] || '')).length;
    const activeContracts = contracts.filter(c => ['نشط', 'active'].includes(c['حالة_العقد'] || c.status || '')).length;
    return { total: tenants.length, active, inactive: tenants.length - active, pendingPayments, activeContracts };
  }, [tenants, contracts, payments]);

  const statusBadge = (status: string) => {
    const isActive = ['نشط', 'active'].includes(status);
    return (
      <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 w-fit',
        isActive ? 'bg-green-500/10 text-green-600' : 'bg-muted text-muted-foreground'
      )}>
        {isActive ? <CheckCircle size={10} /> : <Clock size={10} />}
        {isActive ? 'نشط' : 'غير نشط'}
      </span>
    );
  };

  return (
    <DashboardLayout pageTitle="بوابة المستأجر">
      <PageHeader title="بوابة المستأجر" description={`${stats.total} مستأجر في النظام`} />

      {loading ? <LoadingState /> : stats.total === 0 ? (
        <EmptyState title="لا يوجد مستأجرون" description="لم يتم تسجيل أي مستأجر حتى الآن" />
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard title="إجمالي المستأجرين" value={stats.total} icon={Users} />
            <StatCard title="مستأجرون نشطون" value={stats.active} icon={CheckCircle} />
            <StatCard title="عقود نشطة" value={stats.activeContracts} icon={FileText} />
            <StatCard title="دفعات معلقة" value={stats.pendingPayments} icon={DollarSign} />
          </div>

          <DataTable
            columns={[
              {
                key: 'الاسم', label: 'المستأجر',
                render: (v, r) => (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                      {(v || r.name || '?')[0]}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{v || r.name || '—'}</p>
                      <p className="text-xs text-muted-foreground">{r['رقم_الهوية'] || r.id_number || ''}</p>
                    </div>
                  </div>
                )
              },
              { key: 'حالة_المستأجر', label: 'الحالة', render: (v, r) => statusBadge(v || r.status || '') },
              {
                key: 'رقم_الجوال', label: 'الجوال',
                render: (v, r) => {
                  const ph = v || r.phone || '';
                  return ph ? <a href={`tel:${ph}`} className="text-primary hover:underline flex items-center gap-1 text-sm"><Phone size={12} />{ph}</a> : '—';
                }
              },
              { key: 'جهة_العمل', label: 'جهة العمل', render: (v, r) => v || r.employer || r.work_place || '—' },
              { key: 'الجنسية', label: 'الجنسية', render: (v, r) => v || r.nationality || '—' },
            ]}
            data={tenants}
            searchKeys={['الاسم', 'name', 'رقم_الهوية', 'رقم_الجوال', 'phone']}
            actions={() => <button className="p-1.5 rounded-md hover:bg-accent" aria-label="عرض التفاصيل"><Eye size={14} /></button>}
          />
        </div>
      )}
    </DashboardLayout>
  );
}
