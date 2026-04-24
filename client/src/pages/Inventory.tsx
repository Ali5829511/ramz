/*
 * صفحة المخزون - رمز الإبداع
 */
import { useMemo, useState } from 'react';
import { Database, Package, AlertTriangle, CheckCircle, Plus, Eye } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import StatCard from '@/components/shared/StatCard';
import { LoadingState, EmptyState } from '@/components/shared/PageStates';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useEntityData } from '@/hooks/useEntityData';

export default function Inventory() {
  const { data: items, loading } = useEntityData('Inventory');
  const [filter, setFilter] = useState<'all' | 'low' | 'ok'>('all');

  const stats = useMemo(() => {
    const lowStock = items.filter(i => {
      const qty = parseFloat(i['الكمية'] || i.quantity || 0);
      const min = parseFloat(i['الحد_الأدنى'] || i.min_quantity || 5);
      return qty <= min;
    });
    return { total: items.length, lowStock: lowStock.length, ok: items.length - lowStock.length };
  }, [items]);

  const filtered = useMemo(() => {
    if (filter === 'low') return items.filter(i => {
      const qty = parseFloat(i['الكمية'] || i.quantity || 0);
      const min = parseFloat(i['الحد_الأدنى'] || i.min_quantity || 5);
      return qty <= min;
    });
    if (filter === 'ok') return items.filter(i => {
      const qty = parseFloat(i['الكمية'] || i.quantity || 0);
      const min = parseFloat(i['الحد_الأدنى'] || i.min_quantity || 5);
      return qty > min;
    });
    return items;
  }, [items, filter]);

  return (
    <DashboardLayout pageTitle="إدارة المخزون">
      <PageHeader title="إدارة المخزون" description={`${stats.total} صنف مسجل`}>
        <Button size="sm" className="gap-2"><Plus size={16} /> إضافة صنف</Button>
      </PageHeader>

      {loading ? <LoadingState /> : stats.total === 0 ? (
        <EmptyState title="المخزون فارغ" description="ابدأ بإضافة أصناف المخزون" actionLabel="إضافة صنف" />
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <StatCard title="إجمالي الأصناف" value={stats.total} icon={Package} />
            <StatCard title="مخزون منخفض" value={stats.lowStock} icon={AlertTriangle} />
            <StatCard title="مخزون كافٍ" value={stats.ok} icon={CheckCircle} />
          </div>

          {stats.lowStock > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3 flex items-center gap-2 text-amber-600 text-sm">
              <AlertTriangle size={15} />
              <span>{stats.lowStock} أصناف وصلت للحد الأدنى وتحتاج إعادة طلب</span>
            </div>
          )}

          <div className="flex gap-1 bg-muted rounded-md p-0.5 w-fit">
            {(['all', 'low', 'ok'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} className={cn('px-3 py-1 text-xs rounded transition-colors', filter === f ? 'bg-background shadow font-semibold' : 'text-muted-foreground')}>
                {f === 'all' ? 'الكل' : f === 'low' ? 'منخفض' : 'كافٍ'}
              </button>
            ))}
          </div>

          <DataTable
            columns={[
              { key: 'اسم_الصنف', label: 'الصنف', render: (v, r) => v || r.name || r.item_name || '—' },
              { key: 'الفئة', label: 'الفئة', render: (v, r) => v || r.category || '—' },
              {
                key: 'الكمية', label: 'الكمية',
                render: (v, r) => {
                  const qty = parseFloat(v || r.quantity || 0);
                  const min = parseFloat(r['الحد_الأدنى'] || r.min_quantity || 5);
                  return (
                    <span className={cn('font-semibold', qty <= min ? 'text-amber-500' : 'text-green-500')}>{qty}</span>
                  );
                }
              },
              { key: 'وحدة_القياس', label: 'الوحدة', render: (v, r) => v || r.unit || '—' },
              { key: 'الحد_الأدنى', label: 'الحد الأدنى', render: (v, r) => v || r.min_quantity || '5' },
              {
                key: 'السعر', label: 'السعر',
                render: (v) => v ? `${parseFloat(v).toLocaleString('ar-SA')} ر.س` : '—'
              },
            ]}
            data={filtered}
            searchKeys={['اسم_الصنف', 'name', 'الفئة', 'category']}
            actions={() => <button className="p-1.5 rounded-md hover:bg-accent" aria-label="عرض التفاصيل"><Eye size={14} /></button>}
          />
        </div>
      )}
    </DashboardLayout>
  );
}
