/*
 * صفحة إدارة الفنيين - رمز الإبداع
 */
import { useMemo } from 'react';
import { Wrench, Users, CheckCircle, Clock, Star, Plus, Eye, Phone } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import StatCard from '@/components/shared/StatCard';
import { LoadingState, EmptyState } from '@/components/shared/PageStates';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useMultiEntityData } from '@/hooks/useEntityData';

export default function TechnicianManager() {
  const { data, loading } = useMultiEntityData([
    { name: 'Technician', limit: 200 },
    { name: 'Maintenance', limit: 500 },
  ]);

  const technicians = data.Technician || [];
  const maintenance = data.Maintenance || [];

  const stats = useMemo(() => {
    const active = technicians.filter(t => ['نشط', 'active'].includes(t['حالة_الفني'] || t.status || '')).length;
    const busyIds = new Set(
      maintenance
        .filter(m => !['مكتمل', 'completed'].includes(m['حالة_الطلب'] || m.status || ''))
        .map(m => m['رقم_الفني'] || m.technician_id)
        .filter(Boolean)
    );
    return { total: technicians.length, active, busy: busyIds.size };
  }, [technicians, maintenance]);

  return (
    <DashboardLayout pageTitle="إدارة الفنيين">
      <PageHeader title="إدارة الفنيين" description={`${stats.total} فني مسجل`}>
        <Button size="sm" className="gap-2"><Plus size={16} /> إضافة فني</Button>
      </PageHeader>

      {loading ? <LoadingState /> : stats.total === 0 ? (
        <EmptyState title="لا يوجد فنيون" description="ابدأ بإضافة أول فني" actionLabel="إضافة فني" />
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <StatCard title="إجمالي الفنيين" value={stats.total} icon={Users} />
            <StatCard title="نشطون" value={stats.active} icon={CheckCircle} />
            <StatCard title="مشغولون" value={stats.busy} icon={Clock} />
          </div>

          <DataTable
            columns={[
              {
                key: 'الاسم', label: 'الفني',
                render: (v, r) => (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                      {(v || r.name || '?')[0]}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{v || r.name || '—'}</p>
                      <p className="text-xs text-muted-foreground">{r['التخصص'] || r.specialty || ''}</p>
                    </div>
                  </div>
                )
              },
              {
                key: 'حالة_الفني', label: 'الحالة',
                render: (v, r) => {
                  const s = v || r.status || '';
                  const isActive = ['نشط', 'active'].includes(s);
                  return (
                    <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium', isActive ? 'bg-green-500/10 text-green-600' : 'bg-muted text-muted-foreground')}>
                      {isActive ? 'نشط' : 'غير نشط'}
                    </span>
                  );
                }
              },
              {
                key: 'رقم_الجوال', label: 'الجوال',
                render: (v, r) => {
                  const ph = v || r.phone || '';
                  return ph ? <a href={`tel:${ph}`} className="text-primary hover:underline flex items-center gap-1 text-sm"><Phone size={12} />{ph}</a> : '—';
                }
              },
              { key: 'التخصص', label: 'التخصص', render: (v, r) => v || r.specialty || '—' },
              {
                key: 'التقييم', label: 'التقييم',
                render: (v) => v ? (
                  <div className="flex items-center gap-1">
                    <Star size={12} className="text-amber-400 fill-amber-400" />
                    <span className="text-sm">{v}</span>
                  </div>
                ) : '—'
              },
            ]}
            data={technicians}
            searchKeys={['الاسم', 'name', 'التخصص', 'specialty', 'رقم_الجوال']}
            actions={() => <button className="p-1.5 rounded-md hover:bg-accent" aria-label="عرض التفاصيل"><Eye size={14} /></button>}
          />
        </div>
      )}
    </DashboardLayout>
  );
}
