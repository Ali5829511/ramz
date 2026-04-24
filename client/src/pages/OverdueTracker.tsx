/*
 * صفحة المتأخرات - رمز الإبداع
 */
import { useMemo } from 'react';
import { AlertTriangle, DollarSign, Phone, MessageSquare } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import StatCard from '@/components/shared/StatCard';
import { LoadingState, EmptyState } from '@/components/shared/PageStates';
import { cn } from '@/lib/utils';
import { useEntityData } from '@/hooks/useEntityData';

export default function OverdueTracker() {
  const { data: payments, loading } = useEntityData('Payment');

  const overdue = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return payments.filter(p => {
      const due = p['تاريخ_استحقاق_القسط'] || p['تاريخ_استحقاق_الفاتورة'] || '';
      const status = p['حالة_القسط'] || p['حالة_الدفع'] || '';
      const unpaid = ['لم_يتم_الدفع', 'مستحق', 'معلق'].includes(status);
      return unpaid && due && due < today;
    });
  }, [payments]);

  const totalOverdue = overdue.reduce((s, p) => s + (parseFloat(p['مبلغ_الدفعة'] || p['قيمة_القسط'] || 0)), 0);
  const aging = useMemo(() => {
    const today = Date.now();
    const bucket = { under30: 0, from30to60: 0, over60: 0 };
    overdue.forEach((p: any) => {
      const d = p['تاريخ_استحقاق_القسط'] || p['تاريخ_استحقاق_الفاتورة'] || '';
      if (!d) return;
      const days = Math.floor((today - new Date(d).getTime()) / 86400000);
      if (days < 30) bucket.under30 += 1;
      else if (days <= 60) bucket.from30to60 += 1;
      else bucket.over60 += 1;
    });
    return bucket;
  }, [overdue]);

  const priorityBadge = (days: number) => {
    const style = days > 60
      ? 'bg-red-500/10 text-red-400'
      : days >= 30
        ? 'bg-amber-500/10 text-amber-400'
        : 'bg-blue-500/10 text-blue-400';
    const text = days > 60 ? 'حرج' : days >= 30 ? 'متوسط' : 'منخفض';
    return <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium', style)}>{text}</span>;
  };

  return (
    <DashboardLayout pageTitle="المتأخرات">
      <PageHeader title="متابعة المتأخرات" description={`${overdue.length} دفعة متأخرة`} />

      {loading ? <LoadingState /> : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <StatCard title="عدد المتأخرات" value={overdue.length} icon={AlertTriangle} />
            <StatCard title="إجمالي المبلغ المتأخر" value={`${totalOverdue.toLocaleString('ar-SA')} ر.س`} icon={DollarSign} />
            <StatCard title="أقل من 30 يوم" value={aging.under30} icon={AlertTriangle} />
            <StatCard title="30 - 60 يوم" value={aging.from30to60} icon={AlertTriangle} />
            <StatCard title="أكثر من 60 يوم" value={aging.over60} icon={AlertTriangle} />
          </div>

          {overdue.length > 0 && (
            <div className="rounded-lg border border-border bg-card p-3 text-sm text-muted-foreground">
              يفضّل البدء بالمتعثرات الأعلى أولوية (أكثر من 60 يوم)، ثم التواصل مع بقية الحالات عبر الرسائل والاتصال.
            </div>
          )}

          {overdue.length === 0 ? (
            <EmptyState title="لا توجد متأخرات" description="جميع الدفعات محصلة في وقتها" />
          ) : (
            <DataTable
              columns={[
                { key: 'اسم_المستأجر', label: 'المستأجر', render: (v, r) => v || r.tenant_name || '—' },
                { key: 'اسم_العقار', label: 'العقار', render: (v, r) => v || r.property_name || '—' },
                { key: 'مبلغ_الدفعة', label: 'المبلغ', render: (v, r) => `${Number(v || r['قيمة_القسط'] || 0).toLocaleString('ar-SA')} ر.س` },
                {
                  key: 'تاريخ_استحقاق_القسط', label: 'تاريخ الاستحقاق',
                  render: (v, r) => {
                    const d = v || r['تاريخ_استحقاق_الفاتورة'] || '';
                    if (!d) return '—';
                    const days = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
                    return (
                      <div>
                        <span>{new Date(d).toLocaleDateString('ar-SA')}</span>
                        <span className="text-red-400 text-[10px] block">متأخر {days} يوم</span>
                        <span className="mt-1 inline-block">{priorityBadge(days)}</span>
                      </div>
                    );
                  }
                },
              ]}
              data={overdue}
              searchKeys={['اسم_المستأجر', 'tenant_name', 'اسم_العقار']}
              actions={(row) => (
                <div className="flex gap-1">
                  <button className="p-1.5 rounded-md hover:bg-accent text-muted-foreground" title="اتصال">
                    <Phone size={14} />
                  </button>
                  <button className="p-1.5 rounded-md hover:bg-accent text-muted-foreground" title="رسالة">
                    <MessageSquare size={14} />
                  </button>
                </div>
              )}
            />
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
