/*
 * لوحة التحكم الرئيسية - رمز الإبداع
 * Layout inspired by EJAR platform: donut charts, activity feed, important updates
 */
import { useMemo } from 'react';
import { Link } from 'wouter';
import {
  Building2, Users, DollarSign, Wrench, TrendingUp,
  AlertTriangle, Clock, CheckCircle, ArrowUpLeft,
  RefreshCw, Calendar, Home as HomeIcon, FileText, Info,
  PlusCircle, ChevronLeft, ChevronRight, Percent,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { LoadingState } from '@/components/shared/PageStates';
import { useMultiEntityData } from '@/hooks/useEntityData';
import { Button } from '@/components/ui/button';

const fmt = (v: number) => (v || 0).toLocaleString('ar-SA');
const fmtCurrency = (v: number) => `${fmt(v)} ر.س`;

/* ─── Donut chart with centered label ─── */
function DonutChart({ data, total, label }: { data: { name: string; value: number; color: string }[]; total: number; label?: string }) {
  return (
    <div className="relative w-36 h-36 mx-auto">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data.filter(d => d.value > 0)} dataKey="value" cx="50%" cy="50%" innerRadius={44} outerRadius={62} strokeWidth={0} startAngle={90} endAngle={-270}>
            {data.filter(d => d.value > 0).map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(v: number, n: string) => [fmt(v), n]} />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-xl font-bold text-foreground">{fmt(total)}</span>
        {label && <span className="text-[10px] text-muted-foreground mt-0.5">{label}</span>}
      </div>
    </div>
  );
}

/* ─── Legend row ─── */
function LegendItem({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-2 py-0.5">
      <div className="flex items-center gap-1.5">
        <span className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <span className="text-xs font-medium text-foreground">{fmt(value)}</span>
    </div>
  );
}

/* ─── Section card ─── */
function SectionCard({ title, subtitle, href, children }: { title: string; subtitle?: string; href?: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-foreground text-sm">{title}</h3>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
        {href && (
          <Link href={href}>
            <button className="flex items-center gap-1 text-xs text-primary hover:underline">
              <span>عرض الكل</span>
              <ArrowUpLeft size={12} />
            </button>
          </Link>
        )}
      </div>
      {children}
    </div>
  );
}

export default function Dashboard() {
  const { data, loading, isDemo, reload } = useMultiEntityData([
    { name: 'Payment', sort: '-created_date', limit: 1000 },
    { name: 'Maintenance', sort: '-created_date', limit: 200 },
    { name: 'Lease', sort: '-created_date', limit: 500 },
    { name: 'Tenant', sort: '-created_date', limit: 500 },
    { name: 'Property', sort: '-created_date', limit: 200 },
    { name: 'Unit', sort: '-created_date', limit: 2000 },
    { name: 'Expense', sort: '-created_date', limit: 500 },
  ]);

  const stats = useMemo(() => {
    const payments = data.Payment || [];
    const maintenance = data.Maintenance || [];
    const leases = data.Lease || [];
    const tenants = data.Tenant || [];
    const properties = data.Property || [];
    const units = data.Unit || [];
    const expenses = data.Expense || [];

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const thisMonth = now.toISOString().slice(0, 7);
    const in60 = new Date(now.getTime() + 60 * 86400000).toISOString().split('T')[0];
    const in30 = new Date(now.getTime() + 30 * 86400000).toISOString().split('T')[0];

    // Revenue
    const monthlyRevenue = payments
      .filter((p: any) => {
        const d = p['تاريخ_الدفع'] || p.created_date || '';
        const paid = p['حالة_القسط'] === 'مدفوع' || p['حالة_الدفع'] === 'مكتمل';
        return paid && d.startsWith(thisMonth);
      })
      .reduce((s: number, p: any) => s + (parseFloat(p['مبلغ_الدفعة'] || p['قيمة_القسط'] || 0)), 0);

    const totalRevenue = payments
      .filter((p: any) => p['حالة_القسط'] === 'مدفوع' || p['حالة_الدفع'] === 'مكتمل')
      .reduce((s: number, p: any) => s + (parseFloat(p['مبلغ_الدفعة'] || p['قيمة_القسط'] || 0)), 0);

    // Expenses
    const monthlyExpenses = expenses
      .filter((e: any) => (e.date || '').startsWith(thisMonth))
      .reduce((s: number, e: any) => s + (parseFloat(e.amount) || 0), 0);

    // Overdue
    const overdue = payments.filter((p: any) => {
      const due = p['تاريخ_استحقاق_القسط'] || p['تاريخ_استحقاق_الفاتورة'] || '';
      const status = p['حالة_القسط'] || p['حالة_الدفع'] || '';
      const unpaid = ['لم_يتم_الدفع', 'مستحق', 'معلق'].includes(status);
      return unpaid && due && due < today;
    });
    const overdueAmount = overdue.reduce((s: number, p: any) => s + (parseFloat(p['مبلغ_الدفعة'] || p['قيمة_القسط'] || 0)), 0);

    // Pending payments (not yet due)
    const pendingPayments = payments.filter((p: any) => {
      const status = p['حالة_القسط'] || p['حالة_الدفع'] || '';
      return ['لم_يتم_الدفع', 'مستحق', 'معلق'].includes(status);
    });
    const pendingAmount = pendingPayments.reduce((s: number, p: any) => s + (parseFloat(p['مبلغ_الدفعة'] || p['قيمة_القسط'] || 0)), 0);

    // Expiring leases
    const expiringLeases30 = leases.filter((l: any) => {
      const end = l['تاريخ_انتهاء_الإيجار'] || l['تاريخ_نهاية_العقد'] || '';
      const status = l['حالة_العقد'] || l.status || '';
      const active = status === 'نشط' || status === 'active';
      return active && end && end >= today && end <= in30;
    });
    const expiringLeases60 = leases.filter((l: any) => {
      const end = l['تاريخ_انتهاء_الإيجار'] || l['تاريخ_نهاية_العقد'] || '';
      const status = l['حالة_العقد'] || l.status || '';
      const active = status === 'نشط' || status === 'active';
      return active && end && end >= today && end <= in60;
    });

    // Pending maintenance
    const pendingMaint = maintenance.filter((m: any) => m.status === 'pending' || m.status === 'in_progress');
    const completedMaint = maintenance.filter((m: any) => m.status === 'completed');

    // Occupancy
    const totalUnits = units.length;
    const rentedUnits = units.filter((u: any) => u['حالة_الوحدة'] === 'مؤجرة' || u.status === 'occupied').length;
    const vacantUnits = units.filter((u: any) => u['حالة_الوحدة'] === 'شاغرة' || u.status === 'vacant').length;
    const reservedUnits = units.filter((u: any) => u['حالة_الوحدة'] === 'محجوزة' || u.status === 'reserved').length;
    const maintenanceUnits = totalUnits - rentedUnits - vacantUnits - reservedUnits;
    const occupancy = totalUnits ? Math.round((rentedUnits / totalUnits) * 100) : 0;

    // Leases by status
    const activeLeases = leases.filter((l: any) => {
      const s = l['حالة_العقد'] || l.status || '';
      return s === 'نشط' || s === 'active';
    });
    const expiredLeases = leases.filter((l: any) => {
      const s = l['حالة_العقد'] || l.status || '';
      return s === 'منتهي' || s === 'expired';
    });
    const draftLeases = leases.filter((l: any) => {
      const s = l['حالة_العقد'] || l.status || '';
      return s === 'مسودة' || s === 'draft';
    });
    const cancelledLeases = leases.filter((l: any) => {
      const s = l['حالة_العقد'] || l.status || '';
      return s === 'ملغي' || s === 'cancelled';
    });

    // Recent payments (last 8)
    const recentPayments = [...payments]
      .sort((a: any, b: any) => {
        const da = a['تاريخ_الدفع'] || a.created_date || '';
        const db = b['تاريخ_الدفع'] || b.created_date || '';
        return db.localeCompare(da);
      })
      .slice(0, 8);

    // Recent leases (last 5)
    const recentLeases = [...leases]
      .sort((a: any, b: any) => {
        const da = a['تاريخ_بداية_العقد'] || a.created_date || '';
        const db = b['تاريخ_بداية_العقد'] || b.created_date || '';
        return db.localeCompare(da);
      })
      .slice(0, 5);

    return {
      totalProperties: properties.length,
      totalUnits,
      rentedUnits,
      vacantUnits,
      reservedUnits,
      maintenanceUnits,
      occupancy,
      totalTenants: tenants.length,
      totalLeases: leases.length,
      activeLeases: activeLeases.length,
      expiredLeases: expiredLeases.length,
      draftLeases: draftLeases.length,
      cancelledLeases: cancelledLeases.length,
      monthlyRevenue,
      totalRevenue,
      monthlyExpenses,
      netIncome: monthlyRevenue - monthlyExpenses,
      overdueCount: overdue.length,
      overdueAmount,
      pendingCount: pendingPayments.length,
      pendingAmount,
      expiringLeases30: expiringLeases30.length,
      expiringLeases60: expiringLeases60.length,
      pendingMaint: pendingMaint.length,
      completedMaint: completedMaint.length,
      recentPayments,
      recentLeases,
      monthlyRevenueChart: (() => {
        const MONTHS = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
        const year = now.getFullYear();
        return MONTHS.map((name, i) => {
          const key = `${year}-${String(i + 1).padStart(2, '0')}`;
          const rev = payments
            .filter((p: any) => {
              const d = p['تاريخ_الدفع'] || p.created_date || '';
              return d.startsWith(key) && (p['حالة_القسط'] === 'مدفوع' || p['حالة_الدفع'] === 'مكتمل');
            })
            .reduce((s: number, p: any) => s + parseFloat(p['مبلغ_الدفعة'] || p['قيمة_القسط'] || 0), 0);
          return { name: name.slice(0, 3), إيرادات: Math.round(rev) };
        });
      })(),
    };
  }, [data]);

  const hasData = stats && (stats.totalProperties > 0 || stats.totalUnits > 0 || stats.totalTenants > 0);

  return (
    <DashboardLayout pageTitle="لوحة التحكم">
      {loading ? (
        <LoadingState message="جاري تحميل بيانات لوحة التحكم..." />
      ) : (
        <div className="space-y-4" dir="rtl">
          {/* Demo Banner */}
          {isDemo && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary/10 border border-primary/20 text-sm text-primary">
              <Info size={16} />
              <span>يتم عرض بيانات تجريبية. قم بتوصيل قاعدة البيانات لعرض بياناتك الحقيقية.</span>
            </div>
          )}

          {/* Alert banners */}
          {stats && stats.expiringLeases30 > 0 && (
            <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center gap-2 text-sm text-amber-400">
                <Clock size={15} />
                <span>لديك <strong>{stats.expiringLeases30}</strong> عقد ينتهي خلال 30 يوماً</span>
              </div>
              <Link href="/lease-alerts">
                <button className="text-xs text-amber-400 hover:underline">تحقق الآن</button>
              </Link>
            </div>
          )}
          {stats && stats.overdueCount > 0 && (
            <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <div className="flex items-center gap-2 text-sm text-red-400">
                <AlertTriangle size={15} />
                <span>لديك <strong>{stats.overdueCount}</strong> دفعة متأخرة بقيمة {fmtCurrency(stats.overdueAmount)}</span>
              </div>
              <Link href="/overdue-tracker">
                <button className="text-xs text-red-400 hover:underline">متابعة</button>
              </Link>
            </div>
          )}

          {/* Page header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground">لوحة المعلومات</h1>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <Calendar size={11} />
                {new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={reload} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded border border-border">
                <RefreshCw size={12} />
                <span>تحديث</span>
              </button>
              <Link href="/lease-builder">
                <Button size="sm" className="gap-1 text-xs">
                  <PlusCircle size={14} />
                  تسجيل عقد
                </Button>
              </Link>
            </div>
          </div>

          {!hasData ? (
            <div className="text-center py-20 text-muted-foreground">
              <Building2 size={48} className="mx-auto mb-4 opacity-20" />
              <p className="text-sm">لا توجد بيانات لعرضها</p>
              <Button onClick={reload} variant="outline" size="sm" className="mt-4">إعادة المحاولة</Button>
            </div>
          ) : (
            <>
              {/* ─── Row 0: KPI Cards ─── */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                  { label: 'العقارات', value: stats.totalProperties, icon: Building2, color: 'text-primary', bg: 'bg-primary/10', href: '/properties' },
                  { label: 'الوحدات', value: stats.totalUnits, icon: HomeIcon, color: 'text-blue-400', bg: 'bg-blue-500/10', href: '/units' },
                  { label: 'المستأجرون', value: stats.totalTenants, icon: Users, color: 'text-cyan-400', bg: 'bg-cyan-500/10', href: '/tenants' },
                  { label: 'العقود النشطة', value: stats.activeLeases, icon: FileText, color: 'text-green-400', bg: 'bg-green-500/10', href: '/contracts' },
                  { label: 'الإشغال', value: `${stats.occupancy}%`, icon: Percent, color: 'text-emerald-400', bg: 'bg-emerald-500/10', href: '/unit-status' },
                  { label: 'إيرادات الشهر', value: fmtCurrency(stats.monthlyRevenue), icon: DollarSign, color: 'text-yellow-400', bg: 'bg-yellow-500/10', href: '/financial-reports' },
                ].map(k => (
                  <Link key={k.href} href={k.href}>
                    <div className={`bg-card border border-border rounded-xl p-4 flex flex-col items-center gap-2 hover:border-primary/40 transition-colors cursor-pointer`}>
                      <div className={`w-9 h-9 rounded-full ${k.bg} flex items-center justify-center`}>
                        <k.icon size={18} className={k.color} />
                      </div>
                      <p className={`text-base font-bold ${k.color}`}>{k.value}</p>
                      <p className="text-[10px] text-muted-foreground text-center">{k.label}</p>
                    </div>
                  </Link>
                ))}
              </div>

              {/* ─── Revenue Trend Chart ─── */}
              <SectionCard title="منحنى الإيرادات الشهرية" subtitle={`${new Date().getFullYear()}`} href="/financial-summary">
                <ResponsiveContainer width="100%" height={160}>
                  <AreaChart data={stats.monthlyRevenueChart} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, fontSize: 11 }}
                      formatter={(v: number) => [fmtCurrency(v), 'الإيرادات']}
                    />
                    <Area type="monotone" dataKey="إيرادات" stroke="#10b981" strokeWidth={2} fill="url(#revGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </SectionCard>

              {/* ─── Row 1: Contracts + Units donut charts ─── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Contracts Card */}
                <SectionCard title="العقود" subtitle="تحليل العقود" href="/leases">
                  <div className="flex items-center gap-6">
                    <DonutChart
                      total={stats.totalLeases}
                      label="العقود"
                      data={[
                        { name: 'نشط', value: stats.activeLeases, color: '#10b981' },
                        { name: 'منتهي', value: stats.expiredLeases, color: '#ef4444' },
                        { name: 'مسودة', value: stats.draftLeases, color: '#6b7280' },
                        { name: 'ملغي', value: stats.cancelledLeases, color: '#f59e0b' },
                      ]}
                    />
                    <div className="flex-1 space-y-1.5">
                      <LegendItem color="#10b981" label="نشط" value={stats.activeLeases} />
                      <LegendItem color="#ef4444" label="منتهي" value={stats.expiredLeases} />
                      <LegendItem color="#6b7280" label="مسودة" value={stats.draftLeases} />
                      <LegendItem color="#f59e0b" label="ملغي" value={stats.cancelledLeases} />
                      <div className="border-t border-border pt-1.5 mt-1.5">
                        <LegendItem color="transparent" label="تنتهي خلال 60 يوم" value={stats.expiringLeases60} />
                      </div>
                    </div>
                  </div>
                </SectionCard>

                {/* Units Card */}
                <SectionCard title="الوحدات" subtitle="تحليل الوحدات" href="/units">
                  <div className="flex items-center gap-6">
                    <DonutChart
                      total={stats.totalUnits}
                      label="الوحدات"
                      data={[
                        { name: 'مؤجرة', value: stats.rentedUnits, color: '#10b981' },
                        { name: 'شاغرة', value: stats.vacantUnits, color: '#f59e0b' },
                        { name: 'محجوزة', value: stats.reservedUnits, color: '#3b82f6' },
                        { name: 'صيانة', value: stats.maintenanceUnits > 0 ? stats.maintenanceUnits : 0, color: '#8b5cf6' },
                      ]}
                    />
                    <div className="flex-1 space-y-1.5">
                      <LegendItem color="#10b981" label="مؤجرة" value={stats.rentedUnits} />
                      <LegendItem color="#f59e0b" label="شاغرة" value={stats.vacantUnits} />
                      <LegendItem color="#3b82f6" label="محجوزة" value={stats.reservedUnits} />
                      {stats.maintenanceUnits > 0 && <LegendItem color="#8b5cf6" label="صيانة" value={stats.maintenanceUnits} />}
                      <div className="border-t border-border pt-1.5 mt-1.5">
                        <LegendItem color="transparent" label={`نسبة الإشغال`} value={stats.occupancy} />
                      </div>
                    </div>
                  </div>
                </SectionCard>
              </div>

              {/* ─── Row 2: Revenue + Alerts ─── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Revenue Card */}
                <SectionCard title="ملخص الإيرادات" subtitle="الإيرادات والمدفوعات" href="/financial-reports">
                  <div className="space-y-3">
                    {/* Revenue arc visual */}
                    <div className="flex items-center gap-4">
                      <div className="relative w-28 h-28 flex-shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={[
                              { value: stats.monthlyRevenue || 1, name: 'محصّل' },
                              { value: Math.max(0, stats.pendingAmount - (stats.monthlyRevenue || 0)), name: 'متبقي' },
                            ]} dataKey="value" cx="50%" cy="50%" innerRadius={38} outerRadius={52} strokeWidth={0} startAngle={90} endAngle={-270}>
                              <Cell fill="#10b981" />
                              <Cell fill="#374151" />
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                          <span className="text-xs font-bold text-green-400">{fmtCurrency(stats.monthlyRevenue)}</span>
                          <span className="text-[9px] text-muted-foreground">هذا الشهر</span>
                        </div>
                      </div>
                      <div className="flex-1 space-y-2">
                        <div>
                          <p className="text-xs text-muted-foreground">إجمالي المحصّل</p>
                          <p className="text-base font-bold text-green-400">{fmtCurrency(stats.totalRevenue)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">دفعات معلقة</p>
                          <p className="text-base font-bold text-amber-400">{fmtCurrency(stats.pendingAmount)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">صافي هذا الشهر</p>
                          <p className={`text-base font-bold ${stats.netIncome >= 0 ? 'text-green-400' : 'text-red-400'}`}>{fmtCurrency(stats.netIncome)}</p>
                        </div>
                      </div>
                    </div>
                    {/* Mini stat row */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border">
                      {[
                        { label: 'المستأجرون', value: stats.totalTenants, icon: Users, color: 'text-blue-400' },
                        { label: 'العقارات', value: stats.totalProperties, icon: Building2, color: 'text-primary' },
                        { label: 'الإشغال', value: `${stats.occupancy}%`, icon: HomeIcon, color: 'text-green-400' },
                      ].map(s => (
                        <div key={s.label} className="text-center">
                          <s.icon size={16} className={`mx-auto mb-1 ${s.color}`} />
                          <p className={`text-sm font-bold ${s.color}`}>{s.value}</p>
                          <p className="text-[10px] text-muted-foreground">{s.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </SectionCard>

                {/* Alerts Card */}
                <SectionCard title="التنبيهات والمهام" subtitle="يحتاج متابعة فورية">
                  <div className="space-y-2.5">
                    {[
                      { label: 'دفعات متأخرة', value: stats.overdueCount, sub: fmtCurrency(stats.overdueAmount), color: 'bg-red-500/10 text-red-400 border-red-500/20', icon: AlertTriangle, href: '/overdue-tracker' },
                      { label: 'عقود تنتهي (60 يوم)', value: stats.expiringLeases60, sub: `منها ${stats.expiringLeases30} خلال 30 يوم`, color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: Clock, href: '/lease-alerts' },
                      { label: 'طلبات صيانة معلقة', value: stats.pendingMaint, sub: `${stats.completedMaint} مكتملة`, color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: Wrench, href: '/maintenance' },
                      { label: 'وحدات شاغرة', value: stats.vacantUnits, sub: `${stats.occupancy}% إشغال`, color: 'bg-purple-500/10 text-purple-400 border-purple-500/20', icon: HomeIcon, href: '/units' },
                    ].map(alert => (
                      <Link key={alert.href} href={alert.href}>
                        <div className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:brightness-110 transition-all ${alert.color}`}>
                          <div className="flex items-center gap-2.5">
                            <alert.icon size={15} />
                            <div>
                              <p className="text-xs font-medium">{alert.label}</p>
                              <p className="text-[10px] opacity-70">{alert.sub}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold">{alert.value}</span>
                            <ChevronLeft size={14} className="opacity-60" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </SectionCard>
              </div>

              {/* ─── Row 3: Important Updates + Recent Activities ─── */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Important Updates: recent leases */}
                <SectionCard title="تحديثات مهمة" subtitle="الاتفاقيات والعقود التي تحتاج إجراءات" href="/leases">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border text-muted-foreground">
                          <th className="text-right pb-2 font-medium">رقم العقد</th>
                          <th className="text-right pb-2 font-medium">المستأجر</th>
                          <th className="text-right pb-2 font-medium">تاريخ الانتهاء</th>
                          <th className="text-right pb-2 font-medium">الحالة</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(stats.recentLeases as any[]).map((lease: any, i: number) => {
                          const status = lease['حالة_العقد'] || lease.status || '';
                          const statusColors: Record<string, string> = {
                            'نشط': 'text-green-400',
                            'active': 'text-green-400',
                            'منتهي': 'text-red-400',
                            'expired': 'text-red-400',
                            'مسودة': 'text-gray-400',
                            'draft': 'text-gray-400',
                            'ملغي': 'text-amber-400',
                            'cancelled': 'text-amber-400',
                          };
                          return (
                            <tr key={i} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                              <td className="py-2 text-primary font-medium">{lease['رقم_العقد'] || lease.id || '-'}</td>
                              <td className="py-2 text-foreground">{lease['اسم_المستأجر'] || lease.tenant_name || '-'}</td>
                              <td className="py-2 text-muted-foreground">{lease['تاريخ_نهاية_العقد'] || lease['تاريخ_انتهاء_الإيجار'] || '-'}</td>
                              <td className={`py-2 font-medium ${statusColors[status] || 'text-muted-foreground'}`}>{status || '-'}</td>
                            </tr>
                          );
                        })}
                        {(stats.recentLeases as any[]).length === 0 && (
                          <tr><td colSpan={4} className="py-6 text-center text-muted-foreground">لا توجد عقود</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  {/* Pagination hint */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border">
                    <span>1 - {Math.min(5, (stats.recentLeases as any[]).length)} من {stats.totalLeases}</span>
                    <div className="flex gap-1">
                      <button className="p-1 rounded border border-border hover:bg-muted/30"><ChevronRight size={12} /></button>
                      <button className="p-1 rounded border border-border hover:bg-muted/30"><ChevronLeft size={12} /></button>
                    </div>
                  </div>
                </SectionCard>

                {/* Recent Activities: recent payments */}
                <SectionCard title="الأنشطة الأخيرة" subtitle="قائمة بجميع الأنشطة في مكتبك" href="/payments">
                  <div className="space-y-2">
                    {(stats.recentPayments as any[]).map((p: any, i: number) => {
                      const status = p['حالة_القسط'] || p['حالة_الدفع'] || '';
                      const paid = status === 'مدفوع' || status === 'مكتمل';
                      const amount = parseFloat(p['مبلغ_الدفعة'] || p['قيمة_القسط'] || '0');
                      const date = p['تاريخ_الدفع'] || p['تاريخ_استحقاق_القسط'] || p.created_date || '';
                      const tenant = p['اسم_المستأجر'] || p.tenant_name || 'مستأجر';
                      return (
                        <div key={i} className="flex items-center gap-3 py-2 border-b border-border/40 last:border-0">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${paid ? 'bg-green-500/15' : 'bg-red-500/15'}`}>
                            {paid
                              ? <CheckCircle size={14} className="text-green-400" />
                              : <AlertTriangle size={14} className="text-red-400" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-foreground truncate">
                              {paid ? 'تم استلام دفعة' : 'دفعة معلقة'} — {tenant}
                            </p>
                            <p className="text-[10px] text-muted-foreground">{date}</p>
                          </div>
                          <div className="text-left flex-shrink-0">
                            <p className={`text-xs font-bold ${paid ? 'text-green-400' : 'text-red-400'}`}>{fmtCurrency(amount)}</p>
                          </div>
                        </div>
                      );
                    })}
                    {(stats.recentPayments as any[]).length === 0 && (
                      <div className="text-center py-8 text-muted-foreground text-xs">لا توجد أنشطة حديثة</div>
                    )}
                  </div>
                  {/* Pagination hint */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border">
                    <span>1 - {Math.min(8, (stats.recentPayments as any[]).length)} من {stats.pendingCount + stats.overdueCount}</span>
                    <div className="flex gap-1">
                      <button className="p-1 rounded border border-border hover:bg-muted/30"><ChevronRight size={12} /></button>
                      <button className="p-1 rounded border border-border hover:bg-muted/30"><ChevronLeft size={12} /></button>
                    </div>
                  </div>
                </SectionCard>
              </div>

              {/* ─── Row 4: Quick Links ─── */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {[
                  { label: 'إضافة عقار', path: '/property-form', icon: Building2 },
                  { label: 'إنشاء عقد', path: '/lease-builder', icon: FileText },
                  { label: 'تسجيل دفعة', path: '/payments', icon: DollarSign },
                  { label: 'طلب صيانة', path: '/maintenance', icon: Wrench },
                  { label: 'التقارير', path: '/financial-reports', icon: TrendingUp },
                  { label: 'الإعدادات', path: '/settings', icon: CheckCircle },
                ].map(link => (
                  <Link key={link.path} href={link.path}>
                    <div className="bg-card border border-border rounded-lg p-3 text-center card-hover cursor-pointer hover:border-primary/40 transition-colors">
                      <link.icon size={20} className="mx-auto mb-1.5 text-primary" />
                      <span className="text-xs text-foreground">{link.label}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
