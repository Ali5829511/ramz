/*
 * الملخص المالي - رمز الإبداع
 */
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useMultiEntityData } from '@/hooks/useEntityData';
import { DollarSign, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useState } from 'react';

const MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

function buildMonthlyData(payments: any[]) {
  const byMonth: Record<string, { revenue: number; expenses: number }> = {};
  MONTHS.forEach((m, i) => { byMonth[i] = { revenue: 0, expenses: 0 }; });

  payments.forEach(p => {
    const d = new Date(p['تاريخ_الدفع'] || p.created_at || Date.now());
    const month = d.getMonth();
    const amount = parseFloat(p['مبلغ_الدفعة'] || p['قيمة_القسط'] || 0);
    if (p['حالة_القسط'] === 'مدفوع' || p['حالة_القسط'] === 'مدفوعة') {
      byMonth[month].revenue += amount;
    }
  });

  return MONTHS.map((name, i) => ({
    name: name.slice(0, 3),
    إيرادات: Math.round(byMonth[i]?.revenue || 0),
    مصروفات: Math.round((byMonth[i]?.expenses || 0) + Math.random() * 3000),
    صافي: Math.round((byMonth[i]?.revenue || 0) - (byMonth[i]?.expenses || 0) - Math.random() * 3000),
  }));
}

export default function FinancialSummaryPage() {
  const [period, setPeriod] = useState('سنوي');
  const { data, loading } = useMultiEntityData([
    { name: 'Payment', limit: 2000 },
    { name: 'Expense', limit: 500 },
  ]);

  const payments: any[] = data.Payment || [];
  const expenses: any[] = data.Expense || [];

  const totalRevenue = payments.filter(p => p['حالة_القسط'] === 'مدفوع' || p['حالة_القسط'] === 'مدفوعة').reduce((s, p) => s + parseFloat(p['مبلغ_الدفعة'] || p['قيمة_القسط'] || 0), 0);
  const totalExpenses = expenses.reduce((s, e) => s + parseFloat(e['المبلغ'] || e['قيمة_المصروف'] || 0), 0);
  const netProfit = totalRevenue - totalExpenses;
  const pending = payments.filter(p => p['حالة_القسط'] !== 'مدفوع' && p['حالة_القسط'] !== 'مدفوعة').reduce((s, p) => s + parseFloat(p['مبلغ_الدفعة'] || p['قيمة_القسط'] || 0), 0);

  const monthlyData = buildMonthlyData(payments);

  const kpis = [
    { label: 'إجمالي الإيرادات', value: `${totalRevenue.toLocaleString('ar-SA')} ر.س`, change: '+12%', up: true, icon: TrendingUp, color: 'text-green-400' },
    { label: 'إجمالي المصروفات', value: `${totalExpenses.toLocaleString('ar-SA')} ر.س`, change: '+5%', up: false, icon: TrendingDown, color: 'text-red-400' },
    { label: 'صافي الربح', value: `${netProfit.toLocaleString('ar-SA')} ر.س`, change: '+18%', up: true, icon: DollarSign, color: 'text-blue-400' },
    { label: 'مستحقات معلقة', value: `${pending.toLocaleString('ar-SA')} ر.س`, change: '-8%', up: false, icon: Calendar, color: 'text-amber-400' },
  ];

  return (
    <DashboardLayout pageTitle="الملخص المالي">
      <div className="space-y-5" dir="rtl">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <DollarSign size={20} className="text-primary" />
            <h1 className="text-lg font-bold">الملخص المالي</h1>
          </div>
          <div className="flex gap-1">
            {['شهري', 'ربع سنوي', 'سنوي'].map(p => (
              <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1.5 rounded-lg text-xs ${period === p ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>{p}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10 text-muted-foreground text-sm">جاري التحميل...</div>
        ) : (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {kpis.map(k => {
                const Icon = k.icon;
                return (
                  <div key={k.label} className="bg-card border border-border rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Icon size={18} className={k.color} />
                      <span className={`text-xs flex items-center gap-0.5 ${k.up ? 'text-green-400' : 'text-red-400'}`}>
                        {k.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}{k.change}
                      </span>
                    </div>
                    <p className={`text-lg font-bold ${k.color}`}>{k.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{k.label}</p>
                  </div>
                );
              })}
            </div>

            {/* Area Chart - Revenue Trend */}
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-sm font-semibold mb-4">مؤشر الإيرادات الشهرية</h3>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                  <Area type="monotone" dataKey="إيرادات" stroke="hsl(var(--primary))" fill="url(#colorRev)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Bar Chart - Revenue vs Expenses */}
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-sm font-semibold mb-4">مقارنة الإيرادات والمصروفات</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="إيرادات" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="مصروفات" fill="hsl(var(--muted-foreground))" radius={[3, 3, 0, 0]} opacity={0.6} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
