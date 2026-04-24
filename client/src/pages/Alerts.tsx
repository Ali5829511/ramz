/*
 * صفحة التنبيهات - رمز الإبداع
 */
import { useMemo, useState } from 'react';
import { Bell, DollarSign, Wrench, FileText, Clock, CheckCircle, BellOff } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import { LoadingState } from '@/components/shared/PageStates';
import { cn } from '@/lib/utils';
import { useMultiEntityData } from '@/hooks/useEntityData';

type AlertItem = { id: string; type: 'payment' | 'maintenance' | 'contract'; title: string; subtitle: string; priority: 'urgent' | 'normal'; date?: string };

export default function Alerts() {
  const { data, loading } = useMultiEntityData([
    { name: 'Payment', sort: '-created_date', limit: 200 },
    { name: 'Maintenance', sort: '-created_date', limit: 100 },
    { name: 'Contract', sort: '-created_date', limit: 100 },
  ]);

  const [filter, setFilter] = useState<'all' | 'urgent' | 'payment' | 'maintenance' | 'contract'>('all');

  const allAlerts = useMemo<AlertItem[]>(() => {
    const alerts: AlertItem[] = [];

    // Late payments
    (data.Payment || []).forEach((p: any) => {
      const status = p['حالة_القسط'] || p['حالة_الدفع'] || '';
      if (['متأخر', 'overdue', 'late'].includes(status)) {
        const amount = parseFloat(p['مبلغ_الدفعة'] || p['قيمة_القسط'] || 0);
        alerts.push({
          id: p.id || Math.random().toString(),
          type: 'payment',
          title: `دفعة متأخرة: ${amount.toLocaleString('ar-SA')} ر.س`,
          subtitle: p['اسم_العقار'] || p['اسم_المستأجر'] || p.property_name || '—',
          priority: 'urgent',
          date: p['تاريخ_الاستحقاق'] || p.due_date,
        });
      }
    });

    // Pending maintenance
    (data.Maintenance || []).forEach((m: any) => {
      const status = m['حالة_الطلب'] || m.status || '';
      if (!['مكتمل', 'completed'].includes(status)) {
        alerts.push({
          id: m.id || Math.random().toString(),
          type: 'maintenance',
          title: m['وصف_المشكلة'] || m.description || 'طلب صيانة معلق',
          subtitle: m['اسم_العقار'] || m.property_name || '—',
          priority: status === 'عاجل' || status === 'urgent' ? 'urgent' : 'normal',
          date: m.created_date,
        });
      }
    });

    // Expiring contracts
    (data.Contract || []).forEach((c: any) => {
      const endDate = c['تاريخ_انتهاء_العقد'] || c.end_date || '';
      if (endDate) {
        const daysLeft = Math.ceil((new Date(endDate).getTime() - Date.now()) / 86400000);
        if (daysLeft >= 0 && daysLeft <= 30) {
          alerts.push({
            id: c.id || Math.random().toString(),
            type: 'contract',
            title: `عقد ينتهي خلال ${daysLeft} يوم`,
            subtitle: c['اسم_المستأجر'] || c.tenant_name || c['رقم_العقد'] || '—',
            priority: daysLeft <= 7 ? 'urgent' : 'normal',
            date: endDate,
          });
        }
      }
    });

    return alerts.sort((a, b) => (a.priority === 'urgent' ? -1 : 1));
  }, [data]);

  const filtered = useMemo(() => {
    if (filter === 'all') return allAlerts;
    if (filter === 'urgent') return allAlerts.filter(a => a.priority === 'urgent');
    return allAlerts.filter(a => a.type === filter);
  }, [allAlerts, filter]);

  const urgentCount = allAlerts.filter(a => a.priority === 'urgent').length;
  const paymentCount = allAlerts.filter(a => a.type === 'payment').length;
  const maintCount = allAlerts.filter(a => a.type === 'maintenance').length;
  const contractCount = allAlerts.filter(a => a.type === 'contract').length;

  const icon = (type: AlertItem['type']) => {
    if (type === 'payment') return <DollarSign size={15} className="text-red-500" />;
    if (type === 'maintenance') return <Wrench size={15} className="text-amber-500" />;
    return <FileText size={15} className="text-blue-500" />;
  };

  return (
    <DashboardLayout pageTitle="لوحة التنبيهات">
      <PageHeader title="لوحة التنبيهات" description={`${allAlerts.length} تنبيه نشط`} />

      {loading ? <LoadingState /> : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard title="تنبيهات عاجلة" value={urgentCount} icon={Bell} />
            <StatCard title="دفعات متأخرة" value={paymentCount} icon={DollarSign} />
            <StatCard title="صيانة معلقة" value={maintCount} icon={Wrench} />
            <StatCard title="عقود تنتهي قريباً" value={contractCount} icon={FileText} />
          </div>

          <div className="flex gap-1 flex-wrap bg-muted rounded-md p-0.5 w-fit">
            {([['all', 'الكل'], ['urgent', 'عاجل'], ['payment', 'دفعات'], ['maintenance', 'صيانة'], ['contract', 'عقود']] as const).map(([key, label]) => (
              <button key={key} onClick={() => setFilter(key)} className={cn('px-3 py-1 text-xs rounded transition-colors', filter === key ? 'bg-background shadow font-semibold' : 'text-muted-foreground')}>
                {label}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <BellOff size={40} className="text-muted-foreground/40" />
              <p className="text-muted-foreground text-sm">لا توجد تنبيهات في هذا القسم</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map(a => (
                <div key={a.id} className={cn('flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors hover:bg-muted/30',
                  a.priority === 'urgent' ? 'border-red-500/20 bg-red-500/5' : 'border-border bg-card'
                )}>
                  <div className="shrink-0">{icon(a.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{a.title}</p>
                    <p className="text-xs text-muted-foreground">{a.subtitle}</p>
                  </div>
                  {a.date && <span className="text-xs text-muted-foreground shrink-0">{new Date(a.date).toLocaleDateString('ar-SA')}</span>}
                  {a.priority === 'urgent' && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 font-medium shrink-0">عاجل</span>
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
