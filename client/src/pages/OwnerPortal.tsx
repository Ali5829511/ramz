/*
 * صفحة بوابة المالك - رمز الإبداع
 */
import { useMemo } from 'react';
import { UserCheck, Building2, DollarSign, FileText, Phone, Mail, Eye } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import StatCard from '@/components/shared/StatCard';
import { LoadingState, EmptyState } from '@/components/shared/PageStates';
import { useMultiEntityData } from '@/hooks/useEntityData';

const fmt = (v: number) => `${(v || 0).toLocaleString('ar-SA')} ر.س`;

export default function OwnerPortal() {
  const { data, loading } = useMultiEntityData([
    { name: 'Owner', limit: 200 },
    { name: 'Property', limit: 500 },
    { name: 'Payment', sort: '-created_date', limit: 500 },
  ]);

  const owners = data.Owner || [];
  const properties = data.Property || [];
  const payments = data.Payment || [];

  const stats = useMemo(() => {
    const totalRevenue = payments
      .filter(p => ['مدفوع', 'مكتمل'].includes(p['حالة_القسط'] || p['حالة_الدفع'] || ''))
      .reduce((s, p) => s + parseFloat(p['مبلغ_الدفعة'] || p['قيمة_القسط'] || 0), 0);

    const withPhone = owners.filter(o => o['رقم_الجوال'] || o.phone).length;

    return { total: owners.length, propertyCount: properties.length, totalRevenue, withPhone };
  }, [owners, properties, payments]);

  return (
    <DashboardLayout pageTitle="بوابة المالك">
      <PageHeader title="بوابة المالك" description={`${stats.total} مالك مسجل`} />

      {loading ? <LoadingState /> : stats.total === 0 ? (
        <EmptyState title="لا يوجد ملاك" description="لم يتم تسجيل أي مالك حتى الآن" actionLabel="إضافة مالك" />
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard title="إجمالي الملاك" value={stats.total} icon={UserCheck} />
            <StatCard title="إجمالي العقارات" value={stats.propertyCount} icon={Building2} />
            <StatCard title="إجمالي الإيرادات" value={fmt(stats.totalRevenue)} icon={DollarSign} />
            <StatCard title="جهات الاتصال المكتملة" value={stats.withPhone} icon={Phone} />
          </div>

          <DataTable
            columns={[
              {
                key: 'الاسم', label: 'المالك',
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
              {
                key: 'رقم_الجوال', label: 'الجوال',
                render: (v, r) => {
                  const ph = v || r.phone || '';
                  return ph ? <a href={`tel:${ph}`} className="text-primary hover:underline flex items-center gap-1 text-sm"><Phone size={12} />{ph}</a> : '—';
                }
              },
              {
                key: 'البريد_الإلكتروني', label: 'البريد',
                render: (v, r) => {
                  const em = v || r.email || '';
                  return em ? <a href={`mailto:${em}`} className="text-primary hover:underline flex items-center gap-1 text-sm"><Mail size={12} />{em}</a> : '—';
                }
              },
              { key: 'عدد_العقارات', label: 'العقارات', render: (v, r) => <span className="font-semibold">{v || r.property_count || '0'}</span> },
              {
                key: 'bank_account', label: 'الحساب البنكي',
                render: (v, r) => (v || r['رقم_الحساب'] || r['رقم_الايبان']) ? (
                  <span className="text-xs bg-green-500/10 text-green-600 px-2 py-0.5 rounded-full">مسجل</span>
                ) : <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">غير مسجل</span>
              },
            ]}
            data={owners}
            searchKeys={['الاسم', 'name', 'رقم_الهوية', 'رقم_الجوال', 'phone']}
            actions={() => <button className="p-1.5 rounded-md hover:bg-accent" aria-label="عرض التفاصيل"><Eye size={14} /></button>}
          />
        </div>
      )}
    </DashboardLayout>
  );
}
