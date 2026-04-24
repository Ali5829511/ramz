/*
 * صفحة إدارة الصيانة المتقدمة (Kanban + قائمة) - رمز الإبداع
 */
import { useMemo, useState } from 'react';
import { Wrench, Plus, Clock, CheckCircle, AlertCircle, Eye } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import { LoadingState, EmptyState } from '@/components/shared/PageStates';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useEntityData } from '@/hooks/useEntityData';

type ViewMode = 'kanban' | 'list';

const COLUMNS = [
  { key: 'معلقة', keys: ['معلق', 'pending', 'جديد', 'new'], color: 'border-amber-400', dot: 'bg-amber-400', label: 'معلقة' },
  { key: 'قيد_التنفيذ', keys: ['قيد_التنفيذ', 'in_progress', 'جاري'], color: 'border-blue-400', dot: 'bg-blue-400', label: 'قيد التنفيذ' },
  { key: 'مكتملة', keys: ['مكتمل', 'completed', 'مغلق', 'closed'], color: 'border-green-400', dot: 'bg-green-400', label: 'مكتملة' },
];

export default function MaintenanceManager() {
  const { data: tickets, loading } = useEntityData('Maintenance', '-created_date', 500);
  const [view, setView] = useState<ViewMode>('kanban');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const categories = useMemo(() => {
    const cats = new Set<string>();
    tickets.forEach((t: any) => {
      const cat = t['نوع_الصيانة'] || t.category || t['التصنيف'] || '';
      if (cat) cats.add(cat);
    });
    return ['all', ...Array.from(cats)];
  }, [tickets]);

  const filtered = useMemo(() =>
    categoryFilter === 'all' ? tickets : tickets.filter((t: any) =>
      (t['نوع_الصيانة'] || t.category || t['التصنيف'] || '') === categoryFilter
    )
  , [tickets, categoryFilter]);

  const getColumn = (ticket: any) => {
    const s = ticket['حالة_الطلب'] || ticket.status || '';
    return COLUMNS.find(c => c.keys.some(k => s.includes(k))) || COLUMNS[0];
  };

  const pending = filtered.filter((t: any) => getColumn(t).key === 'معلقة').length;
  const inProgress = filtered.filter((t: any) => getColumn(t).key === 'قيد_التنفيذ').length;
  const done = filtered.filter((t: any) => getColumn(t).key === 'مكتملة').length;

  const priorityBadge = (ticket: any) => {
    const p = ticket['الأولوية'] || ticket.priority || '';
    if (['عاجل', 'urgent', 'high'].includes(p)) return <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-500">عاجل</span>;
    if (['متوسط', 'medium', 'normal'].includes(p)) return <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500">متوسط</span>;
    return null;
  };

  return (
    <DashboardLayout pageTitle="إدارة الصيانة">
      <PageHeader title="إدارة الصيانة" description={`${tickets.length} طلب صيانة`}>
        <div className="flex gap-2">
          <div className="flex gap-1 bg-muted rounded-md p-0.5">
            <button onClick={() => setView('kanban')} className={cn('px-3 py-1 text-xs rounded', view === 'kanban' ? 'bg-background shadow font-semibold' : 'text-muted-foreground')}>كانبان</button>
            <button onClick={() => setView('list')} className={cn('px-3 py-1 text-xs rounded', view === 'list' ? 'bg-background shadow font-semibold' : 'text-muted-foreground')}>قائمة</button>
          </div>
          <Button size="sm" className="gap-2"><Plus size={15} /> بلاغ جديد</Button>
        </div>
      </PageHeader>

      {loading ? <LoadingState /> : tickets.length === 0 ? (
        <EmptyState title="لا توجد طلبات صيانة" description="ابدأ بتسجيل أول بلاغ صيانة" actionLabel="إضافة بلاغ" />
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <StatCard title="معلقة" value={pending} icon={AlertCircle} />
            <StatCard title="قيد التنفيذ" value={inProgress} icon={Clock} />
            <StatCard title="مكتملة" value={done} icon={CheckCircle} />
          </div>

          {/* Category Filter */}
          {categories.length > 2 && (
            <div className="flex gap-1 flex-wrap">
              {categories.map(cat => (
                <button key={cat} onClick={() => setCategoryFilter(cat)} className={cn('px-3 py-1 text-xs rounded-full border', categoryFilter === cat ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary/50')}>
                  {cat === 'all' ? 'الكل' : cat}
                </button>
              ))}
            </div>
          )}

          {view === 'kanban' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {COLUMNS.map(col => {
                const colTickets = filtered.filter((t: any) => getColumn(t).key === col.key);
                return (
                  <div key={col.key} className={cn('rounded-lg border-t-2 bg-muted/20 p-3', col.color)}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className={cn('w-2 h-2 rounded-full', col.dot)} />
                      <h3 className="text-sm font-semibold">{col.label}</h3>
                      <span className="text-xs bg-muted text-muted-foreground px-1.5 rounded-full ml-auto">{colTickets.length}</span>
                    </div>
                    <div className="space-y-2">
                      {colTickets.length === 0 ? (
                        <div className="text-center text-xs text-muted-foreground py-4">لا يوجد</div>
                      ) : colTickets.map((ticket: any) => (
                        <div key={ticket.id} className="rounded-md border border-border bg-card p-3">
                          <div className="flex items-start justify-between gap-1 mb-1">
                            <p className="text-xs font-medium leading-snug">{ticket['وصف_المشكلة'] || ticket.description || '—'}</p>
                            {priorityBadge(ticket)}
                          </div>
                          <p className="text-[10px] text-muted-foreground">{ticket['اسم_العقار'] || ticket.property_name || '—'}</p>
                          {ticket['نوع_الصيانة'] || ticket.category ? (
                            <span className="text-[9px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded mt-1 inline-block">{ticket['نوع_الصيانة'] || ticket.category}</span>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-card divide-y divide-border">
              {filtered.map((ticket: any) => {
                const col = getColumn(ticket);
                return (
                  <div key={ticket.id} className="flex items-center justify-between px-4 py-3 hover:bg-muted/20">
                    <div className="flex items-center gap-3">
                      <div className={cn('w-2 h-2 rounded-full shrink-0', col.dot)} />
                      <div>
                        <p className="text-sm font-medium">{ticket['وصف_المشكلة'] || ticket.description || '—'}</p>
                        <p className="text-xs text-muted-foreground">{ticket['اسم_العقار'] || ticket.property_name || '—'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {priorityBadge(ticket)}
                      <button className="p-1.5 rounded-md hover:bg-accent" aria-label="عرض التفاصيل"><Eye size={13} /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
