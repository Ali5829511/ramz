/*
 * الجدول الزمني للدفعات - رمز الإبداع
 */
import React, { useMemo, useState } from 'react';
import { Calendar, CheckCircle, Clock, AlertTriangle, DollarSign, Filter } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import { useEntityData } from '@/hooks/useEntityData';
import { cn } from '@/lib/utils';

const fmt = (v: number) => (v || 0).toLocaleString('ar-SA');

export default function PaymentTimeline() {
  const { data: payments, loading } = useEntityData('Payment');
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');

  const grouped = useMemo(() => {
    const filtered = payments.filter(p => {
      const status = p['حالة_القسط'] || '';
      if (filter === 'paid') return ['مدفوع', 'مكتمل'].includes(status);
      if (filter === 'pending') return ['مستحق', 'معلق'].includes(status);
      if (filter === 'overdue') return ['لم_يتم_الدفع', 'متأخر'].includes(status);
      return true;
    });

    const byMonth: Record<string, typeof payments> = {};
    filtered.forEach(p => {
      const d = p['تاريخ_الدفع'] || p['تاريخ_استحقاق_القسط'] || p['created_date'] || '';
      const month = d ? d.slice(0, 7) : 'غير محدد';
      if (!byMonth[month]) byMonth[month] = [];
      byMonth[month].push(p);
    });

    return Object.entries(byMonth).sort((a, b) => b[0].localeCompare(a[0]));
  }, [payments, filter]);

  const totals = useMemo(() => {
    const paid = payments.filter(p => ['مدفوع', 'مكتمل'].includes(p['حالة_القسط'] || ''));
    const pending = payments.filter(p => ['مستحق', 'معلق'].includes(p['حالة_القسط'] || ''));
    const overdue = payments.filter(p => ['لم_يتم_الدفع', 'متأخر'].includes(p['حالة_القسط'] || ''));
    return {
      paid: paid.length,
      paidAmt: paid.reduce((s, p: any) => s + parseFloat(p['مبلغ_الدفعة'] || 0), 0),
      pending: pending.length,
      pendingAmt: pending.reduce((s, p: any) => s + parseFloat(p['مبلغ_الدفعة'] || 0), 0),
      overdue: overdue.length,
      overdueAmt: overdue.reduce((s, p: any) => s + parseFloat(p['مبلغ_الدفعة'] || 0), 0),
    };
  }, [payments]);

  const statusInfo = (status: string) => {
    if (['مدفوع', 'مكتمل'].includes(status)) return { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10', label: 'مدفوع' };
    if (['مستحق', 'معلق'].includes(status)) return { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'مستحق' };
    return { icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10', label: 'متأخر' };
  };

  const monthName = (m: string) => {
    if (m === 'غير محدد') return m;
    try {
      const [y, mo] = m.split('-');
      return new Date(parseInt(y), parseInt(mo) - 1).toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' });
    } catch { return m; }
  };

  return (
    <DashboardLayout pageTitle="الجدول الزمني للدفعات">
      <PageHeader title="الجدول الزمني للدفعات" description={`${payments.length} دفعة`} />

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Calendar className="w-8 h-8 animate-pulse" />
        </div>
      ) : (
        <div className="space-y-5">
          {/* الإحصائيات */}
          <div className="grid grid-cols-3 gap-3">
            <button onClick={() => setFilter(filter === 'paid' ? 'all' : 'paid')}
              className={cn('rounded-xl border p-4 text-right transition-all', filter === 'paid' ? 'border-green-500 bg-green-500/10' : 'border-border bg-card hover:border-green-500/50')}>
              <CheckCircle className="w-5 h-5 text-green-400 mb-1" />
              <p className="text-xl font-bold text-green-400">{totals.paid}</p>
              <p className="text-xs text-muted-foreground">مدفوعة</p>
              <p className="text-sm font-medium mt-1">{fmt(Math.round(totals.paidAmt))} ر.س</p>
            </button>
            <button onClick={() => setFilter(filter === 'pending' ? 'all' : 'pending')}
              className={cn('rounded-xl border p-4 text-right transition-all', filter === 'pending' ? 'border-amber-500 bg-amber-500/10' : 'border-border bg-card hover:border-amber-500/50')}>
              <Clock className="w-5 h-5 text-amber-400 mb-1" />
              <p className="text-xl font-bold text-amber-400">{totals.pending}</p>
              <p className="text-xs text-muted-foreground">مستحقة</p>
              <p className="text-sm font-medium mt-1">{fmt(Math.round(totals.pendingAmt))} ر.س</p>
            </button>
            <button onClick={() => setFilter(filter === 'overdue' ? 'all' : 'overdue')}
              className={cn('rounded-xl border p-4 text-right transition-all', filter === 'overdue' ? 'border-red-500 bg-red-500/10' : 'border-border bg-card hover:border-red-500/50')}>
              <AlertTriangle className="w-5 h-5 text-red-400 mb-1" />
              <p className="text-xl font-bold text-red-400">{totals.overdue}</p>
              <p className="text-xs text-muted-foreground">متأخرة</p>
              <p className="text-sm font-medium mt-1">{fmt(Math.round(totals.overdueAmt))} ر.س</p>
            </button>
          </div>

          {filter !== 'all' && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="w-4 h-4" />
              <span>الفلتر النشط: {filter === 'paid' ? 'مدفوعة' : filter === 'pending' ? 'مستحقة' : 'متأخرة'}</span>
              <button onClick={() => setFilter('all')} className="text-primary hover:underline">إلغاء الفلتر</button>
            </div>
          )}

          {/* الجدول الزمني */}
          <div className="space-y-6">
            {grouped.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">لا توجد دفعات</div>
            ) : grouped.map(([month, rows]) => {
              const monthPaid = rows.filter(p => ['مدفوع', 'مكتمل'].includes(p['حالة_القسط'] || ''));
              const monthTotal = rows.reduce((s: number, p: any) => s + parseFloat(p['مبلغ_الدفعة'] || 0), 0);
              return (
                <div key={month}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-px flex-1 bg-border" />
                    <div className="flex items-center gap-2 bg-muted/50 rounded-full px-3 py-1">
                      <Calendar className="w-3 h-3 text-primary" />
                      <span className="text-xs font-medium">{monthName(month)}</span>
                      <span className="text-xs text-muted-foreground">({rows.length} دفعة — {fmt(Math.round(monthTotal))} ر.س)</span>
                    </div>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                  <div className="space-y-2">
                    {rows.map((p: any, i: number) => {
                      const s = statusInfo(p['حالة_القسط'] || '');
                      const Icon = s.icon;
                      return (
                        <div key={i} className={cn('flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors')}>
                          <div className={cn('w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0', s.bg)}>
                            <Icon className={cn('w-4 h-4', s.color)} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium truncate">{p['اسم_المستأجر'] || '—'}</span>
                              <span className={cn('text-[10px] px-2 py-0.5 rounded-full', s.bg, s.color)}>{s.label}</span>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">{p['اسم_العقار'] || ''} {p['رقم_العقد'] ? `• عقد ${p['رقم_العقد']}` : ''}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-bold text-sm">{fmt(parseFloat(p['مبلغ_الدفعة'] || 0))} ر.س</p>
                            <p className="text-xs text-muted-foreground">{p['تاريخ_الدفع'] || p['تاريخ_استحقاق_القسط'] || ''}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
