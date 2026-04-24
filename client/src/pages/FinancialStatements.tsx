/*
 * صفحة الكشوف المالية - رمز الإبداع
 */
import { useMemo, useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Download, Printer, FileText } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import { LoadingState } from '@/components/shared/PageStates';
import { Button } from '@/components/ui/button';
import { useMultiEntityData } from '@/hooks/useEntityData';

const fmt = (v: number) => `${(v || 0).toLocaleString('ar-SA')} ر.س`;

export default function FinancialStatements() {
  const { data, loading } = useMultiEntityData([
    { name: 'Payment', sort: '-created_date', limit: 2000 },
    { name: 'Expense', sort: '-created_date', limit: 1000 },
  ]);

  const payments = data.Payment || [];
  const expenses = data.Expense || [];
  const [year, setYear] = useState(new Date().getFullYear().toString());

  const stats = useMemo(() => {
    const paid = payments.filter(p => {
      const s = p['حالة_القسط'] || p['حالة_الدفع'] || '';
      const d = p['تاريخ_الدفع'] || p.created_date || '';
      return (s === 'مدفوع' || s === 'مكتمل') && d.startsWith(year);
    });

    const filteredExp = expenses.filter(e => (e.date || e.created_date || '').startsWith(year));

    const totalRevenue = paid.reduce((s, p) => s + parseFloat(p['مبلغ_الدفعة'] || p['قيمة_القسط'] || 0), 0);
    const totalExpenses = filteredExp.reduce((s, e) => s + parseFloat(e.amount || 0), 0);

    // Monthly breakdown
    const monthlyMap: Record<string, { revenue: number; expenses: number }> = {};
    for (let m = 1; m <= 12; m++) {
      const key = `${year}-${String(m).padStart(2, '0')}`;
      monthlyMap[key] = { revenue: 0, expenses: 0 };
    }

    paid.forEach(p => {
      const month = (p['تاريخ_الدفع'] || p.created_date || '').slice(0, 7);
      if (monthlyMap[month]) monthlyMap[month].revenue += parseFloat(p['مبلغ_الدفعة'] || p['قيمة_القسط'] || 0);
    });

    filteredExp.forEach(e => {
      const month = (e.date || e.created_date || '').slice(0, 7);
      if (monthlyMap[month]) monthlyMap[month].expenses += parseFloat(e.amount || 0);
    });

    const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    const monthly = Object.entries(monthlyMap).map(([key, v], idx) => ({
      key,
      label: monthNames[idx],
      ...v,
      net: v.revenue - v.expenses,
    }));

    return { totalRevenue, totalExpenses, net: totalRevenue - totalExpenses, monthly };
  }, [payments, expenses, year]);

  const availableYears = useMemo(() => {
    const years = new Set<string>();
    [...payments, ...expenses].forEach(r => {
      const d = (r['تاريخ_الدفع'] || r.created_date || r.date || '').slice(0, 4);
      if (d && d.match(/^\d{4}$/)) years.add(d);
    });
    years.add(new Date().getFullYear().toString());
    return Array.from(years).sort().reverse();
  }, [payments, expenses]);

  return (
    <DashboardLayout pageTitle="الكشوف المالية">
      <PageHeader title="الكشوف المالية" description={`السنة المالية ${year}`}>
        <div className="flex gap-2">
          <select
            value={year}
            onChange={e => setYear(e.target.value)}
            className="bg-muted text-sm rounded-md px-3 py-1.5 border border-border"
            aria-label="اختر السنة"
          >
            {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <Button size="sm" variant="outline" className="gap-2"><Download size={15} /> تصدير</Button>
          <Button size="sm" variant="outline" className="gap-2"><Printer size={15} /> طباعة</Button>
        </div>
      </PageHeader>

      {loading ? <LoadingState /> : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <StatCard title="إجمالي الإيرادات" value={fmt(stats.totalRevenue)} icon={TrendingUp} />
            <StatCard title="إجمالي المصروفات" value={fmt(stats.totalExpenses)} icon={TrendingDown} />
            <StatCard title="صافي الربح" value={fmt(stats.net)} icon={DollarSign} />
          </div>

          {/* Monthly Table */}
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center gap-2">
              <FileText size={15} className="text-primary" />
              <h3 className="font-heading text-sm font-semibold">الكشف الشهري</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-right px-4 py-2 font-medium text-muted-foreground">الشهر</th>
                    <th className="text-right px-4 py-2 font-medium text-muted-foreground">الإيرادات</th>
                    <th className="text-right px-4 py-2 font-medium text-muted-foreground">المصروفات</th>
                    <th className="text-right px-4 py-2 font-medium text-muted-foreground">صافي الربح</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {stats.monthly.map(row => (
                    <tr key={row.key} className="hover:bg-muted/20">
                      <td className="px-4 py-2.5 font-medium">{row.label}</td>
                      <td className="px-4 py-2.5 text-green-600">{row.revenue > 0 ? fmt(row.revenue) : '—'}</td>
                      <td className="px-4 py-2.5 text-red-500">{row.expenses > 0 ? fmt(row.expenses) : '—'}</td>
                      <td className={`px-4 py-2.5 font-semibold ${row.net >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {row.revenue > 0 || row.expenses > 0 ? fmt(row.net) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-muted/30 font-semibold">
                    <td className="px-4 py-2.5">الإجمالي</td>
                    <td className="px-4 py-2.5 text-green-600">{fmt(stats.totalRevenue)}</td>
                    <td className="px-4 py-2.5 text-red-500">{fmt(stats.totalExpenses)}</td>
                    <td className={`px-4 py-2.5 ${stats.net >= 0 ? 'text-green-600' : 'text-red-500'}`}>{fmt(stats.net)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
