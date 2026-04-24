/*
 * صفحة الفواتير - رمز الإبداع
 */
import { useMemo, useState } from 'react';
import { FileText, Plus, CheckCircle, Clock, AlertTriangle, ReceiptText } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import StatCard from '@/components/shared/StatCard';
import { LoadingState, EmptyState } from '@/components/shared/PageStates';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useEntityData } from '@/hooks/useEntityData';

export default function Invoices() {
  const { data: invoices, loading } = useEntityData('Invoice');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      'مدفوعة': 'bg-green-500/10 text-green-400',
      'paid': 'bg-green-500/10 text-green-400',
      'مستحقة': 'bg-amber-500/10 text-amber-400',
      'pending': 'bg-amber-500/10 text-amber-400',
      'متأخرة': 'bg-red-500/10 text-red-400',
      'overdue': 'bg-red-500/10 text-red-400',
    };
    return <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium', map[status] || 'bg-muted text-muted-foreground')}>{status || 'غير محدد'}</span>;
  };

  const view = useMemo(() => {
    const normalize = (status: string) => {
      if (status === 'مدفوعة' || status === 'paid') return 'paid';
      if (status === 'مستحقة' || status === 'pending') return 'pending';
      if (status === 'متأخرة' || status === 'overdue') return 'overdue';
      return 'pending';
    };

    const rows = invoices.map((inv: any) => {
      const statusRaw = inv['الحالة'] || inv.status || '';
      return {
        ...inv,
        _status: normalize(statusRaw),
        _amount: Number(inv['المبلغ'] || inv.amount || 0),
      };
    });

    const paidCount = rows.filter((i: any) => i._status === 'paid').length;
    const pendingCount = rows.filter((i: any) => i._status === 'pending').length;
    const overdueCount = rows.filter((i: any) => i._status === 'overdue').length;
    const totalAmount = rows.reduce((s: number, i: any) => s + i._amount, 0);

    return {
      rows: statusFilter === 'all' ? rows : rows.filter((i: any) => i._status === statusFilter),
      total: rows.length,
      paidCount,
      pendingCount,
      overdueCount,
      totalAmount,
    };
  }, [invoices, statusFilter]);

  return (
    <DashboardLayout pageTitle="الفواتير">
      <PageHeader title="إدارة الفواتير" description={`${view.total} فاتورة`}>
        <Button size="sm" className="gap-2"><Plus size={16} /> إنشاء فاتورة</Button>
      </PageHeader>

      {loading ? <LoadingState /> : view.total === 0 ? (
        <EmptyState title="لا توجد فواتير" description="لم يتم إنشاء أي فواتير بعد" />
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <StatCard title="إجمالي الفواتير" value={view.total} icon={FileText} />
            <StatCard title="مدفوعة" value={view.paidCount} icon={CheckCircle} />
            <StatCard title="مستحقة" value={view.pendingCount} icon={Clock} />
            <StatCard title="متأخرة" value={view.overdueCount} icon={AlertTriangle} />
            <StatCard title="إجمالي القيمة" value={`${view.totalAmount.toLocaleString('ar-SA')} ر.س`} icon={ReceiptText} />
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'الكل' },
              { key: 'paid', label: 'مدفوعة' },
              { key: 'pending', label: 'مستحقة' },
              { key: 'overdue', label: 'متأخرة' },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setStatusFilter(item.key as any)}
                className={cn(
                  'px-3 py-1.5 rounded-md text-xs border transition-colors',
                  statusFilter === item.key
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-muted-foreground border-border hover:bg-accent'
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          <DataTable
            columns={[
              { key: 'رقم_الفاتورة', label: 'رقم الفاتورة', render: (v, r) => v || r.invoice_number || `#${r.id?.slice(-6)}` },
              { key: 'اسم_المستأجر', label: 'المستأجر', render: (v, r) => v || r.tenant_name || '—' },
              { key: 'المبلغ', label: 'المبلغ', render: (v, r) => `${Number(v || r.amount || 0).toLocaleString('ar-SA')} ر.س` },
              { key: 'تاريخ_الاستحقاق', label: 'تاريخ الاستحقاق', render: (v, r) => {
                const date = v || r.due_date;
                return date ? new Date(date).toLocaleDateString('ar-SA') : '—';
              } },
              { key: 'الحالة', label: 'الحالة', render: (v, r) => statusBadge(v || r.status || '') },
            ]}
            data={view.rows}
            searchKeys={['رقم_الفاتورة', 'اسم_المستأجر', 'tenant_name']}
          />
        </div>
      )}
    </DashboardLayout>
  );
}
