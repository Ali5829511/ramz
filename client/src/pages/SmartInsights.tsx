/*
 * صفحة المقترحات الذكية - رمز الإبداع
 * تحليلات ذكية وتوصيات بناءً على البيانات الفعلية
 */
import { useMemo } from 'react';
import { Zap, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock, Home, DollarSign, Users } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import { useMultiEntityData } from '@/hooks/useEntityData';
import { cn } from '@/lib/utils';

const fmt = (v: number) => (v || 0).toLocaleString('ar-SA');

export default function SmartInsights() {
  const { data, loading } = useMultiEntityData([
    { name: 'Property', limit: 500 },
    { name: 'Unit', limit: 2000 },
    { name: 'Lease', limit: 500 },
    { name: 'Payment', limit: 1000 },
    { name: 'Tenant', limit: 500 },
  ]);

  const insights = useMemo(() => {
    const properties = data.Property || [];
    const units = data.Unit || [];
    const leases = data.Lease || [];
    const payments = data.Payment || [];
    const tenants = data.Tenant || [];
    const now = new Date();
    const in30 = new Date(now.getTime() + 30 * 86400000);
    const in60 = new Date(now.getTime() + 60 * 86400000);

    const totalUnits = units.length;
    const occupiedUnits = units.filter(u => (u['حالة_الوحدة'] || '') === 'مؤجرة').length;
    const vacantUnits = units.filter(u => (u['حالة_الوحدة'] || '') === 'شاغرة').length;
    const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

    const activeLeases = leases.filter(l => l['حالة_العقد'] === 'نشط');
    const expiringLeases = activeLeases.filter(l => {
      const d = l['تاريخ_نهاية_العقد'];
      if (!d) return false;
      const end = new Date(d);
      return end <= in60 && end >= now;
    });
    const expiringSoon = activeLeases.filter(l => {
      const d = l['تاريخ_نهاية_العقد'];
      if (!d) return false;
      const end = new Date(d);
      return end <= in30 && end >= now;
    });

    const overduePayments = payments.filter(p => ['لم_يتم_الدفع', 'متأخر', 'مستحق'].includes(p['حالة_القسط'] || ''));
    const overdueAmount = overduePayments.reduce((s: number, p: any) => s + (parseFloat(p['مبلغ_الدفعة'] || 0)), 0);

    const paidPayments = payments.filter(p => ['مدفوع', 'مكتمل'].includes(p['حالة_القسط'] || ''));
    const collectionRate = payments.length > 0 ? Math.round((paidPayments.length / payments.length) * 100) : 0;

    // نسبة الإشغال لكل عقار
    const propOccupancy = properties.map(prop => {
      const propUnits = units.filter(u => u['اسم_العقار'] === prop['اسم_العقار']);
      const occ = propUnits.filter(u => u['حالة_الوحدة'] === 'مؤجرة').length;
      return {
        name: prop['اسم_العقار'],
        total: propUnits.length,
        occupied: occ,
        rate: propUnits.length > 0 ? Math.round((occ / propUnits.length) * 100) : 0,
      };
    }).filter(p => p.total > 0).sort((a, b) => b.rate - a.rate);

    const topProps = propOccupancy.slice(0, 5);
    const lowOccProps = propOccupancy.filter(p => p.rate < 60).slice(0, 3);

    return {
      occupancyRate, vacantUnits, occupiedUnits, totalUnits,
      expiringLeases: expiringLeases.length,
      expiringSoon: expiringSoon.length,
      overduePayments: overduePayments.length,
      overdueAmount,
      collectionRate,
      topProps,
      lowOccProps,
      totalTenants: tenants.filter(t => t['حالة_المستأجر'] === 'نشط' || t['حالة_المستأجر'] === 'active').length,
    };
  }, [data]);

  const cards = [
    {
      title: 'نسبة الإشغال',
      value: `${insights.occupancyRate}%`,
      sub: `${insights.occupiedUnits} من ${insights.totalUnits} وحدة مؤجرة`,
      icon: Home,
      color: insights.occupancyRate >= 80 ? 'text-green-400' : insights.occupancyRate >= 60 ? 'text-amber-400' : 'text-red-400',
      bg: insights.occupancyRate >= 80 ? 'bg-green-500/10' : insights.occupancyRate >= 60 ? 'bg-amber-500/10' : 'bg-red-500/10',
      trend: insights.occupancyRate >= 80 ? 'ممتاز' : insights.occupancyRate >= 60 ? 'متوسط' : 'يحتاج اهتمام',
    },
    {
      title: 'معدل التحصيل',
      value: `${insights.collectionRate}%`,
      sub: `${insights.overduePayments} دفعة متأخرة`,
      icon: DollarSign,
      color: insights.collectionRate >= 90 ? 'text-green-400' : insights.collectionRate >= 70 ? 'text-amber-400' : 'text-red-400',
      bg: insights.collectionRate >= 90 ? 'bg-green-500/10' : insights.collectionRate >= 70 ? 'bg-amber-500/10' : 'bg-red-500/10',
      trend: insights.collectionRate >= 90 ? 'ممتاز' : 'يحتاج متابعة',
    },
    {
      title: 'عقود تنتهي قريباً',
      value: insights.expiringLeases,
      sub: `${insights.expiringSoon} خلال 30 يوم`,
      icon: Clock,
      color: insights.expiringLeases > 5 ? 'text-red-400' : insights.expiringLeases > 0 ? 'text-amber-400' : 'text-green-400',
      bg: insights.expiringLeases > 5 ? 'bg-red-500/10' : 'bg-amber-500/10',
      trend: insights.expiringLeases > 0 ? 'يتطلب تجديد' : 'لا يوجد',
    },
    {
      title: 'المبالغ المتأخرة',
      value: `${fmt(insights.overdueAmount)} ر.س`,
      sub: `من ${insights.overduePayments} دفعة`,
      icon: AlertTriangle,
      color: insights.overdueAmount > 0 ? 'text-red-400' : 'text-green-400',
      bg: insights.overdueAmount > 0 ? 'bg-red-500/10' : 'bg-green-500/10',
      trend: insights.overdueAmount > 0 ? 'يحتاج تحصيل' : 'لا توجد',
    },
  ];

  const recommendations = [
    insights.vacantUnits > 0 && {
      type: 'warning',
      icon: Home,
      title: `${insights.vacantUnits} وحدة شاغرة`,
      desc: 'يُنصح بمراجعة أسعار الإيجار وتفعيل حملة تسويق',
    },
    insights.expiringSoon > 0 && {
      type: 'urgent',
      icon: Clock,
      title: `${insights.expiringSoon} عقود تنتهي خلال 30 يوماً`,
      desc: 'تواصل مع المستأجرين لتجديد العقود وتفادي الشواغر',
    },
    insights.overduePayments > 0 && {
      type: 'urgent',
      icon: DollarSign,
      title: `${insights.overduePayments} دفعة متأخرة بقيمة ${fmt(insights.overdueAmount)} ر.س`,
      desc: 'أرسل تذكيرات للمستأجرين المتأخرين واتخذ الإجراءات اللازمة',
    },
    insights.collectionRate >= 90 && {
      type: 'success',
      icon: CheckCircle,
      title: 'معدل تحصيل ممتاز',
      desc: `${insights.collectionRate}% من الدفعات تم تحصيلها في الوقت المحدد`,
    },
    insights.occupancyRate >= 85 && {
      type: 'success',
      icon: TrendingUp,
      title: 'نسبة إشغال عالية',
      desc: `${insights.occupancyRate}% — يمكن النظر في رفع أسعار الإيجار عند التجديد`,
    },
  ].filter(Boolean);

  return (
    <DashboardLayout pageTitle="المقترحات الذكية">
      <PageHeader title="المقترحات الذكية" description="تحليلات فورية وتوصيات بناءً على بيانات العقارات" />

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <div className="text-center space-y-2">
            <Zap className="w-10 h-10 mx-auto animate-pulse" />
            <p>جاري تحليل البيانات...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((c) => {
              const Icon = c.icon;
              return (
                <div key={c.title} className={cn('rounded-xl border border-border p-4 space-y-2', c.bg)}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{c.title}</span>
                    <Icon className={cn('w-4 h-4', c.color)} />
                  </div>
                  <div className={cn('text-2xl font-bold', c.color)}>{c.value}</div>
                  <div className="text-xs text-muted-foreground">{c.sub}</div>
                  <div className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full inline-block', c.bg, c.color)}>{c.trend}</div>
                </div>
              );
            })}
          </div>

          {/* التوصيات */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h2 className="font-semibold flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              التوصيات والتنبيهات
            </h2>
            {recommendations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="w-10 h-10 mx-auto mb-2 text-green-400" />
                <p>لا توجد توصيات حالياً — الوضع ممتاز!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {(recommendations as any[]).map((r, i) => {
                  const Icon = r.icon;
                  const isUrgent = r.type === 'urgent';
                  const isSuccess = r.type === 'success';
                  return (
                    <div key={i} className={cn(
                      'flex gap-3 items-start p-3 rounded-lg border',
                      isUrgent ? 'border-red-500/30 bg-red-500/5' : isSuccess ? 'border-green-500/30 bg-green-500/5' : 'border-amber-500/30 bg-amber-500/5'
                    )}>
                      <Icon className={cn('w-5 h-5 mt-0.5 flex-shrink-0', isUrgent ? 'text-red-400' : isSuccess ? 'text-green-400' : 'text-amber-400')} />
                      <div>
                        <p className={cn('font-medium text-sm', isUrgent ? 'text-red-400' : isSuccess ? 'text-green-400' : 'text-amber-400')}>{r.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{r.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* أداء العقارات */}
          {insights.topProps.length > 0 && (
            <div className="grid lg:grid-cols-2 gap-4">
              <div className="rounded-xl border border-border bg-card p-5 space-y-4">
                <h2 className="font-semibold flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  أعلى عقارات إشغالاً
                </h2>
                <div className="space-y-3">
                  {insights.topProps.map((p, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium truncate max-w-[180px]">{p.name}</span>
                        <span className={cn('font-bold', p.rate >= 80 ? 'text-green-400' : 'text-amber-400')}>{p.rate}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className={cn('h-full rounded-full transition-all', p.rate >= 80 ? 'bg-green-500' : 'bg-amber-500')} style={{ width: `${p.rate}%` }} />
                      </div>
                      <p className="text-xs text-muted-foreground">{p.occupied} / {p.total} وحدة مؤجرة</p>
                    </div>
                  ))}
                </div>
              </div>

              {insights.lowOccProps.length > 0 && (
                <div className="rounded-xl border border-border bg-card p-5 space-y-4">
                  <h2 className="font-semibold flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-red-400" />
                    عقارات تحتاج اهتمام (إشغال أقل من 60%)
                  </h2>
                  <div className="space-y-3">
                    {insights.lowOccProps.map((p, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium truncate max-w-[180px]">{p.name}</span>
                          <span className="font-bold text-red-400">{p.rate}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-red-500 transition-all" style={{ width: `${p.rate}%` }} />
                        </div>
                        <p className="text-xs text-muted-foreground">{p.occupied} / {p.total} وحدة مؤجرة — {p.total - p.occupied} شاغرة</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
