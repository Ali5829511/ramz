/*
 * صفحة التقارير المتقدمة - رمز الإبداع
 * تقارير شاملة: المالية، العقارات، العقود، التحصيل، الصيانة، الملاك
 */
import { useState, useMemo } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts';
import {
  DollarSign, Building2, FileText, Wrench, Users, TrendingUp,
  TrendingDown, Download, Calendar, AlertTriangle, CheckCircle,
  Clock, RefreshCw, BarChart2, Home, ArrowUpRight, ArrowDownRight,
  Filter, Printer, BookOpen, Layers, Receipt, UserCheck, CreditCard,
  Banknote, ClipboardList, PieChart as PieChartIcon, Scale, BookMarked,
  TrendingDown as TrendingDownIcon,
} from 'lucide-react';
import { Link } from 'wouter';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { LoadingState } from '@/components/shared/PageStates';
import { useMultiEntityData } from '@/hooks/useEntityData';
import { Button } from '@/components/ui/button';

/* ─── Helpers ─── */
const fmt = (v: number) => (v || 0).toLocaleString('ar-SA');
const fmtR = (v: number) => `${fmt(v)} ر.س`;
const pct = (n: number, d: number) => (d ? Math.round((n / d) * 100) : 0);

const AR_MONTHS: Record<string, string> = {
  '01': 'يناير', '02': 'فبراير', '03': 'مارس', '04': 'أبريل',
  '05': 'مايو', '06': 'يونيو', '07': 'يوليو', '08': 'أغسطس',
  '09': 'سبتمبر', '10': 'أكتوبر', '11': 'نوفمبر', '12': 'ديسمبر',
};
const monthLabel = (ym: string) => {
  const [y, m] = ym.split('-');
  return `${AR_MONTHS[m] || m} ${y}`;
};

/* ─── Sub-components ─── */
function KpiCard({
  title, value, sub, icon: Icon, color = 'text-primary', trend, trendLabel,
}: {
  title: string; value: string | number; sub?: string;
  icon: React.ElementType; color?: string; trend?: 'up' | 'down'; trendLabel?: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{title}</span>
        <div className={`p-2 rounded-lg bg-current/10`} style={{ background: 'rgba(200,169,81,0.1)' }}>
          <Icon size={16} className={color} />
        </div>
      </div>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      {(sub || trendLabel) && (
        <div className="flex items-center gap-1">
          {trend === 'up' && <ArrowUpRight size={12} className="text-green-400" />}
          {trend === 'down' && <ArrowDownRight size={12} className="text-red-400" />}
          <span className="text-xs text-muted-foreground">{sub || trendLabel}</span>
        </div>
      )}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="h-4 w-1 rounded bg-primary" />
      <h3 className="text-sm font-semibold text-foreground">{children}</h3>
    </div>
  );
}

function ChartCard({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-medium text-foreground">{title}</h4>
        {action}
      </div>
      {children}
    </div>
  );
}

function DataTable({
  headers, rows, emptyMsg = 'لا توجد بيانات',
}: {
  headers: string[]; rows: (string | number)[][]; emptyMsg?: string;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-muted/40 border-b border-border">
            {headers.map((h, i) => (
              <th key={i} className="px-3 py-2.5 text-right font-medium text-muted-foreground">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.length === 0 ? (
            <tr><td colSpan={headers.length} className="px-3 py-6 text-center text-muted-foreground">{emptyMsg}</td></tr>
          ) : (
            rows.map((row, ri) => (
              <tr key={ri} className="hover:bg-muted/20 transition-colors">
                {row.map((cell, ci) => (
                  <td key={ci} className="px-3 py-2.5 text-foreground">{cell}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

/* ─── TABS ─── */
const TABS = [
  { key: 'hub', label: 'مركز التقارير', icon: Layers },
  { key: 'summary', label: 'الملخص', icon: BarChart2 },
  { key: 'financial', label: 'المالية', icon: DollarSign },
  { key: 'properties', label: 'العقارات والوحدات', icon: Building2 },
  { key: 'contracts', label: 'العقود', icon: FileText },
  { key: 'collection', label: 'التحصيل', icon: TrendingUp },
  { key: 'maintenance', label: 'الصيانة', icon: Wrench },
];

const PIE_COLORS = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#6b7280'];

/* ─── CSV export helper ─── */
function exportCSV(headers: string[], rows: (string | number)[][], filename: string) {
  const bom = '\uFEFF';
  const csvContent = bom + [
    headers.join(','),
    ...rows.map(r => r.map(c => `"${c}"`).join(',')),
  ].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `${filename}.csv`; a.click();
  URL.revokeObjectURL(url);
}

/* ═══════════════════════════════════════════════ MAIN PAGE ═══════════════════════════════════════════════ */
export default function AdvancedReports() {
  const [activeTab, setActiveTab] = useState('hub');
  const [period, setPeriod] = useState<'3m' | '6m' | '12m' | 'all'>('12m');

  const { data, loading, reload } = useMultiEntityData([
    { name: 'Payment', sort: '-created_date', limit: 2000 },
    { name: 'Expense', sort: '-created_date', limit: 1000 },
    { name: 'Lease', sort: '-created_date', limit: 1000 },
    { name: 'Tenant', sort: '-created_date', limit: 1000 },
    { name: 'Property', sort: '-created_date', limit: 500 },
    { name: 'Unit', sort: '-created_date', limit: 3000 },
    { name: 'Maintenance', sort: '-created_date', limit: 500 },
  ]);

  /* ─── Period filter ─── */
  const cutoff = useMemo(() => {
    if (period === 'all') return '';
    const months = period === '3m' ? 3 : period === '6m' ? 6 : 12;
    const d = new Date();
    d.setMonth(d.getMonth() - months);
    return d.toISOString().slice(0, 7);
  }, [period]);

  /* ─── Computed stats ─── */
  const stats = useMemo(() => {
    const payments: any[] = data.Payment || [];
    const expenses: any[] = data.Expense || [];
    const leases: any[] = data.Lease || [];
    const tenants: any[] = data.Tenant || [];
    const properties: any[] = data.Property || [];
    const units: any[] = data.Unit || [];
    const maintenance: any[] = data.Maintenance || [];

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const in30 = new Date(now.getTime() + 30 * 86400e3).toISOString().split('T')[0];
    const in60 = new Date(now.getTime() + 60 * 86400e3).toISOString().split('T')[0];
    const in90 = new Date(now.getTime() + 90 * 86400e3).toISOString().split('T')[0];

    const inPeriod = (dateStr: string) => {
      if (!cutoff) return true;
      return dateStr >= cutoff;
    };

    /* ── Payments ── */
    const paidPayments = payments.filter((p: any) => {
      const s = p['حالة_القسط'] || p['حالة_الدفع'] || '';
      return s === 'مدفوع' || s === 'مكتمل';
    });
    const overduePayments = payments.filter((p: any) => {
      const s = p['حالة_القسط'] || p['حالة_الدفع'] || '';
      const due = p['تاريخ_استحقاق_القسط'] || p['تاريخ_استحقاق_الفاتورة'] || '';
      return ['لم_يتم_الدفع', 'مستحق', 'معلق'].includes(s) && due && due < today;
    });
    const pendingPayments = payments.filter((p: any) => {
      const s = p['حالة_القسط'] || p['حالة_الدفع'] || '';
      const due = p['تاريخ_استحقاق_القسط'] || p['تاريخ_استحقاق_الفاتورة'] || '';
      return ['لم_يتم_الدفع', 'مستحق', 'معلق'].includes(s) && (!due || due >= today);
    });

    const totalRevenue = paidPayments.reduce((s: number, p: any) => s + parseFloat(p['مبلغ_الدفعة'] || p['قيمة_القسط'] || 0), 0);
    const totalExpenses = expenses.reduce((s: number, e: any) => s + parseFloat(e.amount || 0), 0);
    const overdueAmount = overduePayments.reduce((s: number, p: any) => s + parseFloat(p['مبلغ_الدفعة'] || p['قيمة_القسط'] || 0), 0);
    const pendingAmount = pendingPayments.reduce((s: number, p: any) => s + parseFloat(p['مبلغ_الدفعة'] || p['قيمة_القسط'] || 0), 0);
    const collectionRate = pct(paidPayments.length, payments.length);

    /* ── Monthly breakdown (last N months based on period) ── */
    const monthlyMap: Record<string, { revenue: number; expenses: number; paid: number; overdue: number }> = {};
    paidPayments.forEach((p: any) => {
      const month = (p['تاريخ_الدفع'] || p.created_date || '').slice(0, 7);
      if (!month || !inPeriod(month)) return;
      if (!monthlyMap[month]) monthlyMap[month] = { revenue: 0, expenses: 0, paid: 0, overdue: 0 };
      monthlyMap[month].revenue += parseFloat(p['مبلغ_الدفعة'] || p['قيمة_القسط'] || 0);
      monthlyMap[month].paid += 1;
    });
    expenses.forEach((e: any) => {
      const month = (e.date || e.created_date || '').slice(0, 7);
      if (!month || !inPeriod(month)) return;
      if (!monthlyMap[month]) monthlyMap[month] = { revenue: 0, expenses: 0, paid: 0, overdue: 0 };
      monthlyMap[month].expenses += parseFloat(e.amount || 0);
    });
    overduePayments.forEach((p: any) => {
      const month = (p['تاريخ_استحقاق_القسط'] || p.created_date || '').slice(0, 7);
      if (!month || !inPeriod(month)) return;
      if (!monthlyMap[month]) monthlyMap[month] = { revenue: 0, expenses: 0, paid: 0, overdue: 0 };
      monthlyMap[month].overdue += 1;
    });
    const monthlyData = Object.keys(monthlyMap).sort().map(m => ({
      month: monthLabel(m),
      key: m,
      revenue: Math.round(monthlyMap[m].revenue),
      expenses: Math.round(monthlyMap[m].expenses),
      net: Math.round(monthlyMap[m].revenue - monthlyMap[m].expenses),
      paid: monthlyMap[m].paid,
      overdue: monthlyMap[m].overdue,
    }));

    /* ── Units & Occupancy ── */
    const totalUnits = units.length;
    const rentedUnits = units.filter((u: any) => u['حالة_الوحدة'] === 'مؤجرة' || u.status === 'occupied').length;
    const vacantUnits = units.filter((u: any) => u['حالة_الوحدة'] === 'شاغرة' || u.status === 'vacant').length;
    const reservedUnits = units.filter((u: any) => u['حالة_الوحدة'] === 'محجوزة' || u.status === 'reserved').length;
    const maintUnits = totalUnits - rentedUnits - vacantUnits - reservedUnits;
    const occupancyRate = pct(rentedUnits, totalUnits);

    /* ── Unit types ── */
    const unitTypeMap: Record<string, number> = {};
    units.forEach((u: any) => {
      const t = u['نوع_الوحدة'] || u.unit_type || 'غير محدد';
      unitTypeMap[t] = (unitTypeMap[t] || 0) + 1;
    });
    const unitTypeData = Object.entries(unitTypeMap).map(([name, value]) => ({ name, value }));

    /* ── Properties by city ── */
    const cityMap: Record<string, number> = {};
    properties.forEach((p: any) => {
      const c = p['المدينة'] || p.city || 'غير محدد';
      cityMap[c] = (cityMap[c] || 0) + 1;
    });
    const cityData = Object.entries(cityMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 8);

    /* ── Leases ── */
    const activeLeases = leases.filter((l: any) => { const s = l['حالة_العقد'] || l.status || ''; return s === 'نشط' || s === 'active'; });
    const expiredLeases = leases.filter((l: any) => { const s = l['حالة_العقد'] || l.status || ''; return s === 'منتهي' || s === 'expired'; });
    const draftLeases = leases.filter((l: any) => { const s = l['حالة_العقد'] || l.status || ''; return s === 'مسودة' || s === 'draft'; });
    const cancelledLeases = leases.filter((l: any) => { const s = l['حالة_العقد'] || l.status || ''; return s === 'ملغي' || s === 'cancelled'; });

    const expiresIn30 = leases.filter((l: any) => {
      const e = l['تاريخ_نهاية_العقد'] || l['تاريخ_انتهاء_الإيجار'] || '';
      const s = l['حالة_العقد'] || l.status || '';
      return (s === 'نشط' || s === 'active') && e >= today && e <= in30;
    });
    const expiresIn60 = leases.filter((l: any) => {
      const e = l['تاريخ_نهاية_العقد'] || l['تاريخ_انتهاء_الإيجار'] || '';
      const s = l['حالة_العقد'] || l.status || '';
      return (s === 'نشط' || s === 'active') && e >= today && e <= in60;
    });
    const expiresIn90 = leases.filter((l: any) => {
      const e = l['تاريخ_نهاية_العقد'] || l['تاريخ_انتهاء_الإيجار'] || '';
      const s = l['حالة_العقد'] || l.status || '';
      return (s === 'نشط' || s === 'active') && e >= today && e <= in90;
    });

    const leaseStatusData = [
      { name: 'نشط', value: activeLeases.length, color: '#10b981' },
      { name: 'منتهي', value: expiredLeases.length, color: '#ef4444' },
      { name: 'مسودة', value: draftLeases.length, color: '#6b7280' },
      { name: 'ملغي', value: cancelledLeases.length, color: '#f59e0b' },
    ].filter(d => d.value > 0);

    /* ── Overdue aging buckets ── */
    const agingBuckets = { lt30: 0, lt60: 0, lt90: 0, gt90: 0 };
    const agingAmounts = { lt30: 0, lt60: 0, lt90: 0, gt90: 0 };
    overduePayments.forEach((p: any) => {
      const due = p['تاريخ_استحقاق_القسط'] || p['تاريخ_استحقاق_الفاتورة'] || '';
      const amount = parseFloat(p['مبلغ_الدفعة'] || p['قيمة_القسط'] || 0);
      if (!due) return;
      const daysPast = Math.floor((Date.now() - new Date(due).getTime()) / 86400e3);
      if (daysPast < 30) { agingBuckets.lt30++; agingAmounts.lt30 += amount; }
      else if (daysPast < 60) { agingBuckets.lt60++; agingAmounts.lt60 += amount; }
      else if (daysPast < 90) { agingBuckets.lt90++; agingAmounts.lt90 += amount; }
      else { agingBuckets.gt90++; agingAmounts.gt90 += amount; }
    });
    const agingData = [
      { name: 'أقل من 30 يوم', count: agingBuckets.lt30, amount: Math.round(agingAmounts.lt30) },
      { name: '30–60 يوم', count: agingBuckets.lt60, amount: Math.round(agingAmounts.lt60) },
      { name: '60–90 يوم', count: agingBuckets.lt90, amount: Math.round(agingAmounts.lt90) },
      { name: 'أكثر من 90 يوم', count: agingBuckets.gt90, amount: Math.round(agingAmounts.gt90) },
    ];

    /* ── Maintenance ── */
    const pendingMaint = maintenance.filter((m: any) => m.status === 'pending').length;
    const inProgressMaint = maintenance.filter((m: any) => m.status === 'in_progress').length;
    const completedMaint = maintenance.filter((m: any) => m.status === 'completed').length;
    const maintByPriority: Record<string, number> = {};
    maintenance.forEach((m: any) => {
      const p = m.priority || 'عادي';
      maintByPriority[p] = (maintByPriority[p] || 0) + 1;
    });
    const maintByCategory: Record<string, number> = {};
    maintenance.forEach((m: any) => {
      const c = m.category || m['نوع_الصيانة'] || 'عام';
      maintByCategory[c] = (maintByCategory[c] || 0) + 1;
    });
    const maintStatusData = [
      { name: 'معلق', value: pendingMaint, color: '#f59e0b' },
      { name: 'قيد التنفيذ', value: inProgressMaint, color: '#3b82f6' },
      { name: 'مكتمل', value: completedMaint, color: '#10b981' },
    ].filter(d => d.value > 0);

    /* ── Payment status pie ── */
    const paymentStatusData = [
      { name: 'مدفوع', value: paidPayments.length, color: '#10b981' },
      { name: 'معلق', value: pendingPayments.length, color: '#f59e0b' },
      { name: 'متأخر', value: overduePayments.length, color: '#ef4444' },
    ].filter(d => d.value > 0);

    return {
      // Financial
      totalRevenue, totalExpenses, netIncome: totalRevenue - totalExpenses,
      monthlyData, collectionRate,
      overdueAmount, pendingAmount,
      paymentCount: payments.length, paidCount: paidPayments.length,
      overdueCount: overduePayments.length, pendingCount: pendingPayments.length,
      paymentStatusData, agingData,
      // Properties
      totalProperties: properties.length, totalUnits, rentedUnits, vacantUnits,
      reservedUnits, maintUnits, occupancyRate,
      unitTypeData, cityData,
      // Contracts
      totalLeases: leases.length, activeLeases: activeLeases.length,
      expiredLeases: expiredLeases.length, draftLeases: draftLeases.length,
      cancelledLeases: cancelledLeases.length,
      expiresIn30: expiresIn30.length, expiresIn60: expiresIn60.length,
      expiresIn90: expiresIn90.length,
      leaseStatusData,
      expiringList: expiresIn60.slice(0, 10),
      // Maintenance
      pendingMaint, inProgressMaint, completedMaint,
      totalMaint: maintenance.length, maintStatusData,
      maintByPriority, maintByCategory,
      // Tenants
      totalTenants: tenants.length,
    };
  }, [data, cutoff]);

  /* ─── Export handlers ─── */
  const handleExportFinancial = () => {
    exportCSV(
      ['الشهر', 'الإيرادات (ر.س)', 'المصروفات (ر.س)', 'الصافي (ر.س)', 'عدد الدفعات'],
      stats.monthlyData.map(m => [m.month, m.revenue, m.expenses, m.net, m.paid]),
      'التقرير_المالي_الشهري',
    );
  };
  const handleExportContracts = () => {
    exportCSV(
      ['الحالة', 'العدد'],
      [
        ['نشط', stats.activeLeases],
        ['منتهي', stats.expiredLeases],
        ['مسودة', stats.draftLeases],
        ['ملغي', stats.cancelledLeases],
      ],
      'تقرير_العقود',
    );
  };

  return (
    <DashboardLayout pageTitle="التقارير المتقدمة">
      <div className="space-y-4" dir="rtl">
        {/* ─── Header ─── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-foreground">التقارير المتقدمة</h1>
            <p className="text-xs text-muted-foreground mt-0.5">تحليل شامل لجميع جوانب إدارة الأملاك</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {/* Period filter */}
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
              {([['3m', '3 أشهر'], ['6m', '6 أشهر'], ['12m', '12 شهر'], ['all', 'الكل']] as const).map(([k, l]) => (
                <button
                  key={k}
                  onClick={() => setPeriod(k)}
                  className={`px-2.5 py-1 rounded-md text-xs transition-all ${period === k ? 'bg-card shadow text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  {l}
                </button>
              ))}
            </div>
            <button onClick={reload} className="flex items-center gap-1 text-xs text-muted-foreground border border-border rounded-lg px-2.5 py-1.5 hover:bg-muted/50">
              <RefreshCw size={12} />
              تحديث
            </button>
            <Link href="/print-center">
              <button className="flex items-center gap-1 text-xs text-muted-foreground border border-border rounded-lg px-2.5 py-1.5 hover:bg-muted/50">
                <Printer size={12} />
                طباعة
              </button>
            </Link>
          </div>
        </div>

        {/* ─── Tabs ─── */}
        <div className="flex gap-1 flex-wrap bg-muted/30 p-1 rounded-xl border border-border overflow-x-auto">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'bg-primary text-primary-foreground shadow'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <Icon size={13} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {loading ? (
          <LoadingState message="جاري تحميل بيانات التقارير..." />
        ) : (
          <>
            {/* ══════════════════════════════════════════════════════════
                TAB: HUB — Reports Center (Simaat-style)
            ══════════════════════════════════════════════════════════ */}
            {activeTab === 'hub' && (
              <div className="space-y-6">
                {/* ── تقارير مالية ── */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-4 w-1 rounded bg-primary" />
                    <h3 className="text-sm font-semibold text-foreground">تقارير مالية</h3>
                    <span className="text-xs text-muted-foreground">المحاسبة والحسابات</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {[
                      { label: 'كشف حساب', desc: 'تقرير تفصيلي بالحركات المالية للحساب', icon: BookOpen, tab: 'financial' },
                      { label: 'ميزان المراجعة', desc: 'ميزان المراجعة (مجاميع/أرصدة)', icon: Scale, tab: 'financial' },
                      { label: 'دليل الحسابات', desc: 'تصدير دليل الحسابات', icon: BookMarked, tab: 'financial' },
                      { label: 'الأستاذ العام', desc: 'عمليات دفتر الأستاذ العام', icon: ClipboardList, tab: 'financial' },
                      { label: 'ملخص دفتر الأستاذ', desc: 'ملخص دفتر الأستاذ', icon: FileText, tab: 'financial' },
                      { label: 'حركة الحسابات', desc: 'الحركات المالية على الحسابات', icon: RefreshCw, tab: 'financial' },
                    ].map(card => (
                      <button
                        key={card.label}
                        onClick={() => setActiveTab(card.tab)}
                        className="group bg-card border border-border rounded-xl p-4 text-right hover:border-primary/40 hover:shadow-md transition-all flex flex-col items-center gap-2"
                      >
                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                          <card.icon size={22} className="text-blue-400 group-hover:text-primary transition-colors" />
                        </div>
                        <p className="text-sm font-semibold text-foreground text-center">{card.label}</p>
                        <p className="text-[11px] text-muted-foreground text-center leading-tight">{card.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* ── تقارير المستأجرين والعقود ── */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-4 w-1 rounded bg-green-500" />
                    <h3 className="text-sm font-semibold text-foreground">تقارير المستأجرين والعقود</h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {[
                      { label: 'الدفعات المستحقة', desc: 'تفاصيل دفعات الأقساط والخدمات المستحقة', icon: CreditCard, tab: 'collection' },
                      { label: 'تفاصيل السداد', desc: 'تقرير عمليات السداد التفصيلي', icon: CheckCircle, tab: 'collection' },
                      { label: 'تحصيل المستأجرين', desc: 'تحصيل المستأجرين لكافة العقود', icon: UserCheck, tab: 'collection' },
                      { label: 'عمولة الأقساط', desc: 'أقساط العقود المستحقة والعمولة', icon: Receipt, tab: 'financial' },
                      { label: 'جميع أرصدة العقود', desc: 'تقرير بجميع المبالغ على عقود الإيجار', icon: FileText, tab: 'contracts' },
                      { label: 'أرصدة العقود النشطة', desc: 'أرصدة وبيانات عقود التأجير القائمة', icon: FileText, tab: 'contracts' },
                      { label: 'كشف بيانات المستأجرين', desc: 'كشف بيانات المستأجرين', icon: Users, tab: 'contracts' },
                      { label: 'كشف حساب مستأجر', desc: 'تقرير تفصيلي بالحركات المالية للحساب', icon: BookOpen, tab: 'collection' },
                      { label: 'العقود المنتهية', desc: 'المتأخرات المالية على عقود الإيجار المنتهية', icon: Clock, tab: 'contracts' },
                      { label: 'عقود المستأجرين', desc: 'ملخص لعقود المستأجرين', icon: FileText, tab: 'contracts' },
                      { label: 'استحقاق العقود', desc: 'استحقاق العقود لفترة زمنية محددة', icon: Calendar, tab: 'contracts' },
                      { label: 'استحقاق المستأجرين', desc: 'استحقاق المستأجرين لكافة العقود', icon: Users, tab: 'contracts' },
                    ].map(card => (
                      <button
                        key={card.label}
                        onClick={() => setActiveTab(card.tab)}
                        className="group bg-card border border-border rounded-xl p-4 text-right hover:border-green-500/40 hover:shadow-md transition-all flex flex-col items-center gap-2"
                      >
                        <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                          <card.icon size={22} className="text-green-400" />
                        </div>
                        <p className="text-sm font-semibold text-foreground text-center">{card.label}</p>
                        <p className="text-[11px] text-muted-foreground text-center leading-tight">{card.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* ── تقارير التشغيل ── */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-4 w-1 rounded bg-amber-500" />
                    <h3 className="text-sm font-semibold text-foreground">تقارير التشغيل</h3>
                    <span className="text-xs text-muted-foreground">العقارات والوحدات والصيانة</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {[
                      { label: 'كشف التحصيل', desc: 'تقرير عمليات السداد (سندات القبض)', icon: Banknote, tab: 'collection' },
                      { label: 'التأمينات المستحقة', desc: 'المبالغ المحجوزة كتأمين لعقود الإيجار', icon: CheckCircle, tab: 'financial' },
                      { label: 'مصاريف الوحدات', desc: 'جميع المبالغ المصروفة على العقارات', icon: TrendingDown, tab: 'financial' },
                      { label: 'كشف الوحدات العقارية', desc: 'كشف الوحدات العقارية', icon: Building2, tab: 'properties' },
                      { label: 'تفاصيل الوحدات', desc: 'كشف لكافة تفاصيل الوحدات العقارية', icon: Home, tab: 'properties' },
                      { label: 'تقرير صيانة الوحدات', desc: 'تقرير صيانة', icon: Wrench, tab: 'maintenance' },
                      { label: 'الضرائب المحصلة', desc: 'ضريبة القيمة المضافة التي تم تحصيلها', icon: Receipt, tab: 'financial' },
                      { label: 'عمولة إدارة الاملاك', desc: 'كشف عمولة إدارة الاملاك المحصلة وضريبتها', icon: DollarSign, tab: 'financial' },
                      { label: 'عمولة السعي', desc: 'كشف العمولة المحصلة من المستأجرين', icon: TrendingUp, tab: 'financial' },
                      { label: 'ملخص العقود', desc: 'ملخص لأقساط عقود المستأجرين', icon: FileText, tab: 'contracts' },
                      { label: 'كشف أوامر الصرف', desc: 'تقرير سندات الصرف', icon: ClipboardList, tab: 'financial' },
                    ].map(card => (
                      <button
                        key={card.label}
                        onClick={() => setActiveTab(card.tab)}
                        className="group bg-card border border-border rounded-xl p-4 text-right hover:border-amber-500/40 hover:shadow-md transition-all flex flex-col items-center gap-2"
                      >
                        <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                          <card.icon size={22} className="text-amber-400" />
                        </div>
                        <p className="text-sm font-semibold text-foreground text-center">{card.label}</p>
                        <p className="text-[11px] text-muted-foreground text-center leading-tight">{card.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* ── تقارير مجمعة (للملاك) ── */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-4 w-1 rounded bg-purple-500" />
                    <h3 className="text-sm font-semibold text-foreground">تقارير مجمعة</h3>
                    <span className="text-xs text-muted-foreground">الملاك والإيرادات والديون</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {[
                      { label: 'تفاصيل الإيرادات', desc: 'كشف الإيرادات بالتفصيل', icon: TrendingUp, tab: 'financial' },
                      { label: 'تفاصيل رصيد المالك', desc: 'كشف لرصيد المالك بالتفصيل', icon: UserCheck, tab: 'financial' },
                      { label: 'إيرادات/ضرائب المالك', desc: 'مجمع إيرادات وضرائب المالك حسب الشهر', icon: Receipt, tab: 'financial' },
                      { label: 'تفاصيل وحدات المالك', desc: 'تفاصيل وحدات المالك', icon: Building2, tab: 'properties' },
                      { label: 'ملخص عقارات المالك', desc: 'ملخص يظهر أهم معلومات العقارات', icon: Home, tab: 'properties' },
                      { label: 'الإيرادات المتوقعة', desc: 'إيراد العقارات المتوقع من أقساط وخدمات', icon: BarChart2, tab: 'financial' },
                      { label: 'الفواتير الضريبية', desc: 'كشف لجميع الفواتير الضريبية', icon: FileText, tab: 'financial' },
                      { label: 'أعمار الديون', desc: 'ملخص المبالغ المستحقة مقسمة إلى مجموعات', icon: Clock, tab: 'collection' },
                      { label: 'تفاصيل الديون بالأعمار', desc: 'تفاصيل المبالغ المستحقة مقسمة إلى مجموعات', icon: AlertTriangle, tab: 'collection' },
                      { label: 'الدخل المتوقع', desc: 'الدخل المتوقع من عمليات التشغيل (عمولات)', icon: DollarSign, tab: 'financial' },
                      { label: 'تقرير تجميعي أرصدة العقود', desc: 'تقرير تجميعي أرصدة العقود', icon: Layers, tab: 'contracts' },
                      { label: 'عقود المستأجرين', desc: 'ملخص لعقود المستأجرين', icon: FileText, tab: 'contracts' },
                    ].map(card => (
                      <button
                        key={card.label}
                        onClick={() => setActiveTab(card.tab)}
                        className="group bg-card border border-border rounded-xl p-4 text-right hover:border-purple-500/40 hover:shadow-md transition-all flex flex-col items-center gap-2"
                      >
                        <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                          <card.icon size={22} className="text-purple-400" />
                        </div>
                        <p className="text-sm font-semibold text-foreground text-center">{card.label}</p>
                        <p className="text-[11px] text-muted-foreground text-center leading-tight">{card.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════
                TAB: SUMMARY
            ══════════════════════════════════════════════════════════ */}
            {activeTab === 'summary' && (
              <div className="space-y-5">
                <SectionTitle>مؤشرات الأداء الرئيسية</SectionTitle>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <KpiCard title="إجمالي الإيرادات" value={fmtR(stats.totalRevenue)} icon={TrendingUp} color="text-green-400" trend="up" trendLabel="المحصّل الكلي" />
                  <KpiCard title="صافي الدخل" value={fmtR(stats.netIncome)} icon={DollarSign} color={stats.netIncome >= 0 ? 'text-green-400' : 'text-red-400'} />
                  <KpiCard title="نسبة الإشغال" value={`${stats.occupancyRate}%`} icon={Home} color="text-blue-400" sub={`${stats.rentedUnits} من ${stats.totalUnits} وحدة`} />
                  <KpiCard title="معدل التحصيل" value={`${stats.collectionRate}%`} icon={CheckCircle} color="text-primary" sub={`${stats.paidCount} من ${stats.paymentCount} دفعة`} />
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <KpiCard title="العقود النشطة" value={stats.activeLeases} icon={FileText} color="text-emerald-400" sub={`من ${stats.totalLeases} عقد إجمالاً`} />
                  <KpiCard title="دفعات متأخرة" value={stats.overdueCount} icon={AlertTriangle} color="text-red-400" sub={fmtR(stats.overdueAmount)} />
                  <KpiCard title="عقود تنتهي (60 يوم)" value={stats.expiresIn60} icon={Clock} color="text-amber-400" sub={`منها ${stats.expiresIn30} خلال 30 يوم`} />
                  <KpiCard title="طلبات صيانة معلقة" value={stats.pendingMaint} icon={Wrench} color="text-orange-400" sub={`${stats.completedMaint} مكتملة`} />
                </div>

                {/* Summary charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <ChartCard title="الإيرادات والمصروفات الشهرية">
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={stats.monthlyData.slice(-6)} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                        <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                        <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} />
                        <Tooltip formatter={(v: number) => fmtR(v)} />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Bar dataKey="revenue" name="الإيرادات" fill="#10b981" radius={[3, 3, 0, 0]} />
                        <Bar dataKey="expenses" name="المصروفات" fill="#ef4444" radius={[3, 3, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartCard>

                  <ChartCard title="توزيع الوحدات">
                    <div className="flex items-center gap-4">
                      <ResponsiveContainer width={160} height={160}>
                        <PieChart>
                          <Pie data={[
                            { name: 'مؤجرة', value: stats.rentedUnits },
                            { name: 'شاغرة', value: stats.vacantUnits },
                            { name: 'محجوزة', value: stats.reservedUnits },
                            { name: 'صيانة', value: stats.maintUnits },
                          ].filter(d => d.value > 0)} dataKey="value" cx="50%" cy="50%" innerRadius={45} outerRadius={65} strokeWidth={0}>
                            {[stats.rentedUnits, stats.vacantUnits, stats.reservedUnits, stats.maintUnits].map((_, i) => (
                              <Cell key={i} fill={PIE_COLORS[i]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="flex-1 space-y-1.5 text-xs">
                        {[
                          { label: 'مؤجرة', value: stats.rentedUnits, color: PIE_COLORS[0] },
                          { label: 'شاغرة', value: stats.vacantUnits, color: PIE_COLORS[1] },
                          { label: 'محجوزة', value: stats.reservedUnits, color: PIE_COLORS[3] },
                          { label: 'صيانة', value: stats.maintUnits, color: PIE_COLORS[2] },
                        ].map(d => (
                          <div key={d.label} className="flex justify-between items-center">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: d.color }} />
                              <span className="text-muted-foreground">{d.label}</span>
                            </div>
                            <span className="font-medium">{fmt(d.value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </ChartCard>
                </div>

                {/* Quick links to sub-reports */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                  {[
                    { label: 'التقرير المالي', tab: 'financial', icon: DollarSign, color: 'text-green-400' },
                    { label: 'تقرير العقارات', tab: 'properties', icon: Building2, color: 'text-blue-400' },
                    { label: 'تقرير العقود', tab: 'contracts', icon: FileText, color: 'text-primary' },
                    { label: 'تقرير التحصيل', tab: 'collection', icon: TrendingUp, color: 'text-amber-400' },
                    { label: 'تقرير الصيانة', tab: 'maintenance', icon: Wrench, color: 'text-orange-400' },
                  ].map(l => (
                    <button
                      key={l.tab}
                      onClick={() => setActiveTab(l.tab)}
                      className="flex flex-col items-center gap-1.5 p-3 bg-card border border-border rounded-xl hover:border-primary/40 transition-all text-center"
                    >
                      <l.icon size={20} className={l.color} />
                      <span className="text-xs text-foreground">{l.label}</span>
                      <ArrowUpRight size={11} className="text-muted-foreground" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════
                TAB: FINANCIAL
            ══════════════════════════════════════════════════════════ */}
            {activeTab === 'financial' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <SectionTitle>التقرير المالي التفصيلي</SectionTitle>
                  <button onClick={handleExportFinancial} className="flex items-center gap-1 text-xs text-primary border border-primary/30 rounded-lg px-2.5 py-1.5 hover:bg-primary/10">
                    <Download size={12} />
                    تصدير CSV
                  </button>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <KpiCard title="إجمالي الإيرادات" value={fmtR(stats.totalRevenue)} icon={TrendingUp} color="text-green-400" />
                  <KpiCard title="إجمالي المصروفات" value={fmtR(stats.totalExpenses)} icon={TrendingDown} color="text-red-400" />
                  <KpiCard title="صافي الدخل" value={fmtR(stats.netIncome)} icon={DollarSign} color={stats.netIncome >= 0 ? 'text-green-400' : 'text-red-400'} />
                  <KpiCard title="عدد الدفعات المستلمة" value={stats.paidCount} icon={CheckCircle} color="text-primary" sub={`من ${stats.paymentCount} دفعة إجمالاً`} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <ChartCard title="الإيرادات والمصروفات الشهرية">
                    <ResponsiveContainer width="100%" height={260}>
                      <AreaChart data={stats.monthlyData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                        <defs>
                          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                        <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                        <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} />
                        <Tooltip formatter={(v: number) => fmtR(v)} />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Area type="monotone" dataKey="revenue" name="الإيرادات" stroke="#10b981" fill="url(#revGrad)" strokeWidth={2} />
                        <Area type="monotone" dataKey="expenses" name="المصروفات" stroke="#ef4444" fill="url(#expGrad)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartCard>

                  <ChartCard title="الصافي الشهري">
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={stats.monthlyData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                        <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                        <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} />
                        <Tooltip formatter={(v: number) => fmtR(v)} />
                        <Bar dataKey="net" name="الصافي" fill="#C8A951" radius={[3, 3, 0, 0]}>
                          {stats.monthlyData.map((entry, i) => (
                            <Cell key={i} fill={entry.net >= 0 ? '#10b981' : '#ef4444'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartCard>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <ChartCard title="حالة الدفعات">
                    <div className="flex items-center gap-3">
                      <ResponsiveContainer width={140} height={140}>
                        <PieChart>
                          <Pie data={stats.paymentStatusData} dataKey="value" cx="50%" cy="50%" innerRadius={42} outerRadius={60} strokeWidth={0}>
                            {stats.paymentStatusData.map((entry, i) => (
                              <Cell key={i} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="flex-1 space-y-1.5 text-xs">
                        {stats.paymentStatusData.map(d => (
                          <div key={d.name} className="flex justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color, display: 'inline-block' }} />
                              <span className="text-muted-foreground">{d.name}</span>
                            </div>
                            <span className="font-medium">{d.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </ChartCard>

                  <div className="lg:col-span-2">
                    <ChartCard title="ملخص الدفعات المتأخرة حسب المدة">
                      <DataTable
                        headers={['الفترة', 'عدد الدفعات', 'المبلغ الإجمالي (ر.س)']}
                        rows={stats.agingData.map(d => [d.name, d.count, fmtR(d.amount)])}
                      />
                    </ChartCard>
                  </div>
                </div>

                {/* Monthly table */}
                <ChartCard title="التفاصيل الشهرية">
                  <DataTable
                    headers={['الشهر', 'الإيرادات', 'المصروفات', 'الصافي', 'دفعات مدفوعة', 'دفعات متأخرة']}
                    rows={stats.monthlyData.map(m => [
                      m.month,
                      fmtR(m.revenue),
                      fmtR(m.expenses),
                      fmtR(m.net),
                      m.paid,
                      m.overdue,
                    ])}
                    emptyMsg="لا توجد بيانات مالية للفترة المحددة"
                  />
                </ChartCard>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════
                TAB: PROPERTIES
            ══════════════════════════════════════════════════════════ */}
            {activeTab === 'properties' && (
              <div className="space-y-5">
                <SectionTitle>تقرير العقارات والوحدات</SectionTitle>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <KpiCard title="إجمالي العقارات" value={stats.totalProperties} icon={Building2} color="text-primary" />
                  <KpiCard title="إجمالي الوحدات" value={stats.totalUnits} icon={Home} color="text-blue-400" />
                  <KpiCard title="نسبة الإشغال" value={`${stats.occupancyRate}%`} icon={TrendingUp} color="text-green-400" sub={`${stats.rentedUnits} مؤجرة`} />
                  <KpiCard title="وحدات شاغرة" value={stats.vacantUnits} icon={AlertTriangle} color="text-amber-400" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <ChartCard title="حالة الوحدات">
                    <div className="flex items-center gap-5">
                      <ResponsiveContainer width={160} height={160}>
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'مؤجرة', value: stats.rentedUnits },
                              { name: 'شاغرة', value: stats.vacantUnits },
                              { name: 'محجوزة', value: stats.reservedUnits },
                              { name: 'صيانة', value: Math.max(0, stats.maintUnits) },
                            ].filter(d => d.value > 0)}
                            dataKey="value" cx="50%" cy="50%" innerRadius={48} outerRadius={68} strokeWidth={0}
                          >
                            {PIE_COLORS.map((color, i) => <Cell key={i} fill={color} />)}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="flex-1 space-y-2 text-sm">
                        {[
                          { label: 'مؤجرة', value: stats.rentedUnits, pct: pct(stats.rentedUnits, stats.totalUnits), color: PIE_COLORS[0] },
                          { label: 'شاغرة', value: stats.vacantUnits, pct: pct(stats.vacantUnits, stats.totalUnits), color: PIE_COLORS[1] },
                          { label: 'محجوزة', value: stats.reservedUnits, pct: pct(stats.reservedUnits, stats.totalUnits), color: PIE_COLORS[3] },
                        ].map(d => (
                          <div key={d.label}>
                            <div className="flex justify-between text-xs mb-1">
                              <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full inline-block" style={{ background: d.color }} />
                                <span className="text-muted-foreground">{d.label}</span>
                              </div>
                              <span className="font-medium">{d.value} ({d.pct}%)</span>
                            </div>
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                              <div className="h-full rounded-full transition-all" style={{ width: `${d.pct}%`, background: d.color }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </ChartCard>

                  <ChartCard title="توزيع أنواع الوحدات">
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={stats.unitTypeData.slice(0, 8)} layout="vertical" margin={{ top: 5, right: 10, left: 60, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                        <XAxis type="number" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} width={60} />
                        <Tooltip />
                        <Bar dataKey="value" name="عدد الوحدات" fill="#C8A951" radius={[0, 3, 3, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartCard>
                </div>

                <ChartCard title="توزيع العقارات حسب المدينة">
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={stats.cityData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} />
                      <Tooltip />
                      <Bar dataKey="value" name="عدد العقارات" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="ملخص الأداء">
                  <DataTable
                    headers={['المقياس', 'القيمة', 'النسبة']}
                    rows={[
                      ['إجمالي العقارات', stats.totalProperties, '-'],
                      ['إجمالي الوحدات', stats.totalUnits, '100%'],
                      ['وحدات مؤجرة', stats.rentedUnits, `${pct(stats.rentedUnits, stats.totalUnits)}%`],
                      ['وحدات شاغرة', stats.vacantUnits, `${pct(stats.vacantUnits, stats.totalUnits)}%`],
                      ['وحدات محجوزة', stats.reservedUnits, `${pct(stats.reservedUnits, stats.totalUnits)}%`],
                      ['نسبة الإشغال', `${stats.occupancyRate}%`, '-'],
                    ]}
                  />
                </ChartCard>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════
                TAB: CONTRACTS
            ══════════════════════════════════════════════════════════ */}
            {activeTab === 'contracts' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <SectionTitle>تقرير العقود والاستحقاقات</SectionTitle>
                  <button onClick={handleExportContracts} className="flex items-center gap-1 text-xs text-primary border border-primary/30 rounded-lg px-2.5 py-1.5 hover:bg-primary/10">
                    <Download size={12} />
                    تصدير
                  </button>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <KpiCard title="إجمالي العقود" value={stats.totalLeases} icon={FileText} color="text-primary" />
                  <KpiCard title="عقود نشطة" value={stats.activeLeases} icon={CheckCircle} color="text-green-400" sub={`${pct(stats.activeLeases, stats.totalLeases)}% من الإجمالي`} />
                  <KpiCard title="تنتهي خلال 30 يوم" value={stats.expiresIn30} icon={Clock} color="text-red-400" />
                  <KpiCard title="تنتهي خلال 60 يوم" value={stats.expiresIn60} icon={Calendar} color="text-amber-400" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <ChartCard title="توزيع حالات العقود">
                    <div className="flex items-center gap-5">
                      <ResponsiveContainer width={160} height={160}>
                        <PieChart>
                          <Pie data={stats.leaseStatusData} dataKey="value" cx="50%" cy="50%" innerRadius={45} outerRadius={68} strokeWidth={0}>
                            {stats.leaseStatusData.map((entry, i) => (
                              <Cell key={i} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="flex-1 space-y-2 text-xs">
                        {stats.leaseStatusData.map(d => (
                          <div key={d.name} className="flex justify-between items-center">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: d.color }} />
                              <span className="text-muted-foreground">{d.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{d.value}</span>
                              <span className="text-muted-foreground">({pct(d.value, stats.totalLeases)}%)</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </ChartCard>

                  <ChartCard title="العقود المنتهية قريباً">
                    <DataTable
                      headers={['الفترة', 'عدد العقود']}
                      rows={[
                        ['تنتهي خلال 30 يوم', stats.expiresIn30],
                        ['تنتهي خلال 60 يوم', stats.expiresIn60],
                        ['تنتهي خلال 90 يوم', stats.expiresIn90],
                      ]}
                    />
                    <div className="mt-3 pt-3 border-t border-border">
                      <Link href="/lease-alerts">
                        <button className="flex items-center gap-1 text-xs text-primary hover:underline">
                          عرض تفاصيل العقود المنتهية
                          <ArrowUpRight size={12} />
                        </button>
                      </Link>
                    </div>
                  </ChartCard>
                </div>

                <ChartCard title="ملخص العقود">
                  <DataTable
                    headers={['الحالة', 'العدد', 'النسبة', 'الإجراء المقترح']}
                    rows={[
                      ['نشط', stats.activeLeases, `${pct(stats.activeLeases, stats.totalLeases)}%`, 'مراقبة الاستحقاق'],
                      ['منتهي', stats.expiredLeases, `${pct(stats.expiredLeases, stats.totalLeases)}%`, 'التجديد أو الإغلاق'],
                      ['مسودة', stats.draftLeases, `${pct(stats.draftLeases, stats.totalLeases)}%`, 'مراجعة وتفعيل'],
                      ['ملغي', stats.cancelledLeases, `${pct(stats.cancelledLeases, stats.totalLeases)}%`, 'تحديث حالة الوحدة'],
                    ]}
                  />
                </ChartCard>

                {/* Expiring leases list */}
                {stats.expiringList.length > 0 && (
                  <ChartCard title="قائمة العقود التي تنتهي خلال 60 يوماً">
                    <DataTable
                      headers={['رقم العقد', 'المستأجر', 'تاريخ الانتهاء', 'الحالة']}
                      rows={(stats.expiringList as any[]).map((l: any) => [
                        l['رقم_العقد'] || l.id || '-',
                        l['اسم_المستأجر'] || l.tenant_name || '-',
                        l['تاريخ_نهاية_العقد'] || l['تاريخ_انتهاء_الإيجار'] || '-',
                        l['حالة_العقد'] || l.status || '-',
                      ])}
                    />
                  </ChartCard>
                )}
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════
                TAB: COLLECTION
            ══════════════════════════════════════════════════════════ */}
            {activeTab === 'collection' && (
              <div className="space-y-5">
                <SectionTitle>تقرير التحصيل والمتأخرات</SectionTitle>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <KpiCard title="معدل التحصيل" value={`${stats.collectionRate}%`} icon={TrendingUp} color={stats.collectionRate >= 80 ? 'text-green-400' : 'text-amber-400'} />
                  <KpiCard title="إجمالي المحصّل" value={fmtR(stats.totalRevenue)} icon={CheckCircle} color="text-green-400" />
                  <KpiCard title="دفعات متأخرة" value={stats.overdueCount} icon={AlertTriangle} color="text-red-400" sub={fmtR(stats.overdueAmount)} />
                  <KpiCard title="دفعات معلقة" value={stats.pendingCount} icon={Clock} color="text-amber-400" sub={fmtR(stats.pendingAmount)} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <ChartCard title="اتجاه التحصيل الشهري">
                    <ResponsiveContainer width="100%" height={240}>
                      <LineChart data={stats.monthlyData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                        <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                        <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} />
                        <Tooltip formatter={(v: number) => fmtR(v)} />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Line type="monotone" dataKey="revenue" name="المحصّل" stroke="#10b981" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartCard>

                  <ChartCard title="تحليل المتأخرات (Aging Analysis)">
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={stats.agingData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                        <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                        <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} />
                        <Tooltip formatter={(v: number, n: string) => [n === 'المبلغ' ? fmtR(v) : v, n]} />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Bar dataKey="count" name="عدد الدفعات" fill="#ef4444" radius={[3, 3, 0, 0]} />
                        <Bar dataKey="amount" name="المبلغ (ر.س)" fill="#f59e0b" radius={[3, 3, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartCard>
                </div>

                <ChartCard title="تقرير تفصيلي للمتأخرات">
                  <DataTable
                    headers={['الفترة', 'عدد الدفعات المتأخرة', 'المبلغ الإجمالي (ر.س)', 'نسبة من إجمالي المتأخرات']}
                    rows={stats.agingData.map(d => [
                      d.name,
                      d.count,
                      fmtR(d.amount),
                      `${pct(d.count, stats.overdueCount)}%`,
                    ])}
                  />
                </ChartCard>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                    <h4 className="text-xs font-medium text-green-400 mb-2">الدفعات المدفوعة</h4>
                    <p className="text-2xl font-bold text-green-400">{stats.paidCount}</p>
                    <p className="text-xs text-muted-foreground mt-1">{fmtR(stats.totalRevenue)}</p>
                  </div>
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                    <h4 className="text-xs font-medium text-amber-400 mb-2">الدفعات المعلقة</h4>
                    <p className="text-2xl font-bold text-amber-400">{stats.pendingCount}</p>
                    <p className="text-xs text-muted-foreground mt-1">{fmtR(stats.pendingAmount)}</p>
                  </div>
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                    <h4 className="text-xs font-medium text-red-400 mb-2">الدفعات المتأخرة</h4>
                    <p className="text-2xl font-bold text-red-400">{stats.overdueCount}</p>
                    <p className="text-xs text-muted-foreground mt-1">{fmtR(stats.overdueAmount)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════
                TAB: MAINTENANCE
            ══════════════════════════════════════════════════════════ */}
            {activeTab === 'maintenance' && (
              <div className="space-y-5">
                <SectionTitle>تقرير الصيانة والمتابعة</SectionTitle>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <KpiCard title="إجمالي الطلبات" value={stats.totalMaint} icon={Wrench} color="text-primary" />
                  <KpiCard title="معلق" value={stats.pendingMaint} icon={Clock} color="text-amber-400" sub={`${pct(stats.pendingMaint, stats.totalMaint)}% من الإجمالي`} />
                  <KpiCard title="قيد التنفيذ" value={stats.inProgressMaint} icon={RefreshCw} color="text-blue-400" />
                  <KpiCard title="مكتمل" value={stats.completedMaint} icon={CheckCircle} color="text-green-400" sub={`${pct(stats.completedMaint, stats.totalMaint)}% إنجاز`} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <ChartCard title="توزيع حالات الصيانة">
                    <div className="flex items-center gap-5">
                      <ResponsiveContainer width={160} height={160}>
                        <PieChart>
                          <Pie data={stats.maintStatusData} dataKey="value" cx="50%" cy="50%" innerRadius={45} outerRadius={68} strokeWidth={0}>
                            {stats.maintStatusData.map((entry, i) => (
                              <Cell key={i} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="flex-1 space-y-2">
                        {stats.maintStatusData.map(d => (
                          <div key={d.name} className="flex justify-between items-center text-xs">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: d.color }} />
                              <span className="text-muted-foreground">{d.name}</span>
                            </div>
                            <span className="font-medium">{d.value} ({pct(d.value, stats.totalMaint)}%)</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </ChartCard>

                  <ChartCard title="توزيع طلبات الصيانة حسب النوع">
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart
                        data={Object.entries(stats.maintByCategory).map(([name, value]) => ({ name, value }))}
                        layout="vertical"
                        margin={{ top: 5, right: 10, left: 60, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                        <XAxis type="number" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} width={60} />
                        <Tooltip />
                        <Bar dataKey="value" name="عدد الطلبات" fill="#f59e0b" radius={[0, 3, 3, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartCard>
                </div>

                <ChartCard title="تفاصيل الأولويات والفئات">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">حسب الأولوية</p>
                      <DataTable
                        headers={['الأولوية', 'العدد']}
                        rows={Object.entries(stats.maintByPriority).map(([k, v]) => [k, v])}
                        emptyMsg="لا توجد بيانات"
                      />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">حسب الفئة</p>
                      <DataTable
                        headers={['الفئة', 'العدد']}
                        rows={Object.entries(stats.maintByCategory).slice(0, 8).map(([k, v]) => [k, v])}
                        emptyMsg="لا توجد بيانات"
                      />
                    </div>
                  </div>
                </ChartCard>

                <div className="flex justify-end">
                  <Link href="/maintenance">
                    <Button variant="outline" size="sm" className="gap-1 text-xs">
                      <Wrench size={13} />
                      إدارة طلبات الصيانة
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
