/*
 * صفحة الأرشيف - رمز الإبداع
 */
import { useMemo, useState } from 'react';
import { Archive, FileText, DollarSign, Wrench, Search } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import { LoadingState } from '@/components/shared/PageStates';
import { cn } from '@/lib/utils';
import { useMultiEntityData } from '@/hooks/useEntityData';

type Category = 'all' | 'contracts' | 'payments' | 'maintenance';

export default function ArchivePage() {
  const { data, loading } = useMultiEntityData([
    { name: 'Contract', sort: '-created_date', limit: 500 },
    { name: 'Payment', sort: '-created_date', limit: 500 },
    { name: 'Maintenance', sort: '-created_date', limit: 300 },
  ]);

  const contracts = data.Contract || [];
  const payments = data.Payment || [];
  const maintenance = data.Maintenance || [];

  const [category, setCategory] = useState<Category>('all');
  const [search, setSearch] = useState('');

  const archivedContracts = contracts.filter(c => ['منتهي', 'expired', 'ملغى', 'cancelled'].includes(c['حالة_العقد'] || c.status || ''));
  const archivedPayments = payments.filter(p => ['مدفوع', 'مكتمل', 'paid'].includes(p['حالة_القسط'] || p['حالة_الدفع'] || ''));
  const archivedMaint = maintenance.filter(m => ['مكتمل', 'completed', 'مغلق'].includes(m['حالة_الطلب'] || m.status || ''));

  const allItems = useMemo(() => {
    const items = [
      ...archivedContracts.map(c => ({ ...c, _type: 'contracts' as Category, _label: `عقد: ${c['اسم_المستأجر'] || c.tenant_name || c['رقم_العقد'] || '—'}`, _date: c['تاريخ_انتهاء_العقد'] || c.end_date || c.created_date })),
      ...archivedPayments.map(p => ({ ...p, _type: 'payments' as Category, _label: `دفعة: ${parseFloat(p['مبلغ_الدفعة'] || p['قيمة_القسط'] || 0).toLocaleString('ar-SA')} ر.س`, _date: p['تاريخ_الدفع'] || p.created_date })),
      ...archivedMaint.map(m => ({ ...m, _type: 'maintenance' as Category, _label: `صيانة: ${m['وصف_المشكلة'] || m.description || '—'}`, _date: m.created_date })),
    ];
    return items.sort((a, b) => new Date(b._date || 0).getTime() - new Date(a._date || 0).getTime());
  }, [archivedContracts, archivedPayments, archivedMaint]);

  const filtered = useMemo(() => {
    let list = category === 'all' ? allItems : allItems.filter(i => i._type === category);
    if (search) list = list.filter(i => i._label.toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [allItems, category, search]);

  const typeIcon = (type: Category) => {
    if (type === 'payments') return <DollarSign size={13} className="text-green-500" />;
    if (type === 'maintenance') return <Wrench size={13} className="text-amber-500" />;
    return <FileText size={13} className="text-blue-500" />;
  };

  const typeLabel = (type: Category) => {
    if (type === 'payments') return 'دفعة';
    if (type === 'maintenance') return 'صيانة';
    return 'عقد';
  };

  return (
    <DashboardLayout pageTitle="الأرشيف">
      <PageHeader title="الأرشيف" description={`${allItems.length} سجل محفوظ`} />

      {loading ? <LoadingState /> : (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <StatCard title="عقود منتهية" value={archivedContracts.length} icon={FileText} />
            <StatCard title="دفعات مكتملة" value={archivedPayments.length} icon={DollarSign} />
            <StatCard title="صيانة مكتملة" value={archivedMaint.length} icon={Wrench} />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex gap-1 bg-muted rounded-md p-0.5">
              {(['all', 'contracts', 'payments', 'maintenance'] as Category[]).map(c => (
                <button key={c} onClick={() => setCategory(c)} className={cn('px-3 py-1 text-xs rounded', category === c ? 'bg-background shadow font-semibold' : 'text-muted-foreground')}>
                  {c === 'all' ? 'الكل' : c === 'contracts' ? 'عقود' : c === 'payments' ? 'دفعات' : 'صيانة'}
                </button>
              ))}
            </div>
            <div className="relative flex-1 min-w-48">
              <Search size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="بحث في الأرشيف..."
                className="w-full bg-muted text-sm rounded-md pr-8 pl-3 py-1.5 border border-border focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center py-16 gap-3">
              <Archive size={40} className="text-muted-foreground/30" />
              <p className="text-muted-foreground text-sm">لا توجد سجلات في هذا القسم</p>
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-card divide-y divide-border">
              {filtered.map((item, i) => (
                <div key={item.id || i} className="flex items-center justify-between px-4 py-3 hover:bg-muted/20">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-md bg-muted">{typeIcon(item._type)}</div>
                    <div>
                      <p className="text-sm font-medium">{item._label}</p>
                      <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded">{typeLabel(item._type)}</span>
                    </div>
                  </div>
                  {item._date && (
                    <span className="text-xs text-muted-foreground">
                      {new Date(item._date).toLocaleDateString('ar-SA')}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
