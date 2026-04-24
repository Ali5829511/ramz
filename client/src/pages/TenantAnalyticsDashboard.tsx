/*
 * تحليلات المستأجرين - رمز الإبداع
 */
import { useMemo } from 'react';
import { Users, UserCheck, UserX, TrendingUp, DollarSign, Home, Star } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import { useMultiEntityData } from '@/hooks/useEntityData';
import { cn } from '@/lib/utils';

const fmt = (v: number) => (v || 0).toLocaleString('ar-SA');

export default function TenantAnalyticsDashboard() {
  const { data, loading } = useMultiEntityData([
    { name: 'Tenant', limit: 1000 },
    { name: 'Lease', limit: 500 },
    { name: 'Payment', limit: 1000 },
  ]);

  const stats = useMemo(() => {
    const tenants = data.Tenant || [];
    const leases = data.Lease || [];
    const payments = data.Payment || [];

    const active = tenants.filter(t => ['نشط', 'active'].includes(t['حالة_المستأجر'] || '')).length;
    const inactive = tenants.length - active;

    // توزيع حسب العقار
    const byProp: Record<string, number> = {};
    tenants.forEach(t => {
      const p = t['العقار'] || t['اسم_العقار'] || 'غير محدد';
      byProp[p] = (byProp[p] || 0) + 1;
    });
    const propDist = Object.entries(byProp).sort((a, b) => b[1] - a[1]).slice(0, 8);

    // معدل الدفع لكل مستأجر
    const payByTenant: Record<string, { paid: number; total: number }> = {};
    payments.forEach(p => {
      const name = p['اسم_المستأجر'] || '';
      if (!name) return;
      if (!payByTenant[name]) payByTenant[name] = { paid: 0, total: 0 };
      payByTenant[name].total++;
      if (['مدفوع', 'مكتمل'].includes(p['حالة_القسط'] || '')) payByTenant[name].paid++;
    });

    const goodPayers = Object.values(payByTenant).filter(v => v.total > 0 && (v.paid / v.total) >= 0.9).length;
    const badPayers = Object.values(payByTenant).filter(v => v.total > 0 && (v.paid / v.total) < 0.7).length;

    // إجمالي الإيرادات من المستأجرين
    const totalRevenue = payments
      .filter(p => ['مدفوع', 'مكتمل'].includes(p['حالة_القسط'] || ''))
      .reduce((s: number, p: any) => s + parseFloat(p['مبلغ_الدفعة'] || 0), 0);

    // متوسط الإيجار
    const avgRent = leases.filter(l => l['قيمة_الإيجار']).length > 0
      ? leases.reduce((s: number, l: any) => s + parseFloat(l['قيمة_الإيجار'] || 0), 0) / leases.filter(l => l['قيمة_الإيجار']).length
      : 0;

    return { active, inactive, total: tenants.length, propDist, goodPayers, badPayers, totalRevenue, avgRent };
  }, [data]);

  return (
    <DashboardLayout pageTitle="تحليلات المستأجرين">
      <PageHeader title="تحليلات المستأجرين" description="إحصائيات وتوزيع المستأجرين" />

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Users className="w-8 h-8 animate-pulse" />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="إجمالي المستأجرين" value={stats.total} icon={Users} />
            <StatCard title="مستأجرون نشطون" value={stats.active} icon={UserCheck} />
            <StatCard title="مستأجرون غير نشطين" value={stats.inactive} icon={UserX} />
            <StatCard title="متوسط قيمة الإيجار" value={`${fmt(Math.round(stats.avgRent))} ر.س`} icon={DollarSign} />
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            {/* توزيع المستأجرين حسب العقار */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              <h2 className="font-semibold flex items-center gap-2">
                <Home className="w-4 h-4 text-primary" />
                توزيع المستأجرين حسب العقار
              </h2>
              <div className="space-y-3">
                {stats.propDist.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">لا توجد بيانات</p>
                ) : stats.propDist.map(([name, count]) => {
                  const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                  return (
                    <div key={name} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="truncate max-w-[200px]">{name}</span>
                        <span className="font-bold text-primary">{count} ({pct}%)</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* سلوك الدفع */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              <h2 className="font-semibold flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400" />
                تصنيف المستأجرين بحسب الدفع
              </h2>
              <div className="space-y-4">
                <div className={cn('flex items-center gap-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20')}>
                  <UserCheck className="w-8 h-8 text-green-400" />
                  <div>
                    <p className="text-2xl font-bold text-green-400">{stats.goodPayers}</p>
                    <p className="text-xs text-muted-foreground">ملتزمون بالدفع (90%+)</p>
                  </div>
                </div>
                <div className={cn('flex items-center gap-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20')}>
                  <UserX className="w-8 h-8 text-red-400" />
                  <div>
                    <p className="text-2xl font-bold text-red-400">{stats.badPayers}</p>
                    <p className="text-xs text-muted-foreground">غير منتظمين في الدفع (أقل من 70%)</p>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-muted/40 border border-border">
                  <p className="text-sm font-medium">إجمالي الإيرادات المحصّلة</p>
                  <p className="text-2xl font-bold text-primary mt-1">{fmt(Math.round(stats.totalRevenue))} ر.س</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
