/*
 * صفحة إدارة الملاك - رمز الإبداع
 */
import { useMemo } from 'react';
import { Users, Plus, Eye, Phone, Building2 } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import StatCard from '@/components/shared/StatCard';
import { LoadingState, EmptyState } from '@/components/shared/PageStates';
import { Button } from '@/components/ui/button';
import { useEntityData } from '@/hooks/useEntityData';

export default function Owners() {
  const { data: owners, loading } = useEntityData('Owner');

  const model = useMemo(() => {
    const normalized = owners.map((owner: any) => {
      const propertyCount = Number(owner['عدد_العقارات'] || owner.property_count || 0);
      return {
        ...owner,
        _propertyCount: propertyCount,
        _hasPhone: !!(owner['رقم_الجوال'] || owner.phone),
        _name: owner['الاسم'] || owner.name || '—',
      };
    });

    return {
      rows: normalized,
      total: normalized.length,
      withPhone: normalized.filter((o: any) => o._hasPhone).length,
      totalProperties: normalized.reduce((s: number, o: any) => s + o._propertyCount, 0),
      topOwners: [...normalized].sort((a: any, b: any) => b._propertyCount - a._propertyCount).slice(0, 3),
    };
  }, [owners]);

  return (
    <DashboardLayout pageTitle="الملاك">
      <PageHeader title="إدارة الملاك" description={`${model.total} مالك`}>
        <Button size="sm" className="gap-2"><Plus size={16} /> إضافة مالك</Button>
      </PageHeader>

      {loading ? <LoadingState /> : model.total === 0 ? (
        <EmptyState title="لا يوجد ملاك" description="ابدأ بإضافة أول مالك" actionLabel="إضافة مالك" />
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard title="إجمالي الملاك" value={model.total} icon={Users} />
            <StatCard title="بيانات اتصال مكتملة" value={model.withPhone} icon={Phone} />
            <StatCard title="إجمالي العقارات" value={model.totalProperties} icon={Building2} />
            <StatCard title="متوسط عقارات/مالك" value={model.total ? Math.round(model.totalProperties / model.total) : 0} icon={Building2} />
          </div>

          {model.topOwners.length > 0 && (
            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="font-heading text-sm font-semibold text-foreground mb-3">أعلى الملاك بعدد العقارات</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {model.topOwners.map((owner: any) => (
                  <div key={owner.id} className="rounded-md border border-border bg-muted/20 p-3">
                    <p className="text-sm font-medium text-foreground">{owner._name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{owner._propertyCount} عقار</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <DataTable
            columns={[
              {
                key: 'الاسم', label: 'الاسم',
                render: (v, r) => (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                      {(v || r.name || '?')[0]}
                    </div>
                    <span className="font-medium">{v || r.name || '—'}</span>
                  </div>
                )
              },
              { key: 'رقم_الهوية', label: 'رقم الهوية', render: (v, r) => v || r.id_number || '—' },
              {
                key: 'رقم_الجوال', label: 'الجوال',
                render: (v, r) => {
                  const phone = v || r.phone || '';
                  return phone ? <a href={`tel:${phone}`} className="text-primary hover:underline flex items-center gap-1"><Phone size={12} />{phone}</a> : '—';
                }
              },
              { key: 'عدد_العقارات', label: 'العقارات', render: (v, r) => v || r.property_count || '0' },
            ]}
            data={model.rows}
            searchKeys={['الاسم', 'name', 'رقم_الهوية', 'رقم_الجوال']}
            actions={(row) => (
              <button
                title="عرض بيانات المالك"
                aria-label="عرض بيانات المالك"
                className="p-1.5 rounded-md hover:bg-accent text-muted-foreground"
              >
                <Eye size={14} />
              </button>
            )}
          />
        </div>
      )}
    </DashboardLayout>
  );
}
