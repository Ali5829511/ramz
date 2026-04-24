/*
 * إحصائيات العقارات - رمز الإبداع
 */
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useMultiEntityData } from '@/hooks/useEntityData';
import { BarChart2, Building2, Home, TrendingUp, Users, DollarSign, Wrench } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function PropertyStats() {
  const { data, loading } = useMultiEntityData([
    { name: 'Property', limit: 500 },
    { name: 'Unit', limit: 2000 },
    { name: 'Tenant', limit: 500 },
    { name: 'Payment', limit: 1000 },
    { name: 'Maintenance', limit: 500 },
  ]);

  const properties: any[] = data.Property || [];
  const units: any[] = data.Unit || [];
  const tenants: any[] = data.Tenant || [];
  const payments: any[] = data.Payment || [];
  const maintenance: any[] = data.Maintenance || [];

  const totalRevenue = payments.filter(p => p['حالة_القسط'] === 'مدفوع').reduce((s, p) => s + (parseFloat(p['مبلغ_الدفعة'] || p['قيمة_القسط'] || 0)), 0);
  const occupancy = units.length ? Math.round((units.filter(u => u['حالة_الوحدة'] === 'مؤجرة').length / units.length) * 100) : 0;

  // City distribution
  const cityCount: Record<string, number> = {};
  properties.forEach(p => { const c = p['المدينة'] || 'أخرى'; cityCount[c] = (cityCount[c] || 0) + 1; });
  const cityData = Object.entries(cityCount).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 6);

  // Property type distribution
  const typeCount: Record<string, number> = {};
  properties.forEach(p => { const t = p['نوع_العقار'] || 'أخرى'; typeCount[t] = (typeCount[t] || 0) + 1; });
  const typeData = Object.entries(typeCount).map(([name, value]) => ({ name, value })).slice(0, 5);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];

  const kpis = [
    { label: 'إجمالي العقارات', value: properties.length, icon: Building2, color: 'text-primary' },
    { label: 'إجمالي الوحدات', value: units.length, icon: Home, color: 'text-blue-400' },
    { label: 'المستأجرون', value: tenants.length, icon: Users, color: 'text-green-400' },
    { label: 'نسبة الإشغال', value: `${occupancy}%`, icon: TrendingUp, color: 'text-amber-400' },
    { label: 'الإيرادات المحصّلة', value: `${totalRevenue.toLocaleString('ar-SA')} ر.س`, icon: DollarSign, color: 'text-green-400' },
    { label: 'طلبات الصيانة', value: maintenance.length, icon: Wrench, color: 'text-orange-400' },
  ];

  return (
    <DashboardLayout pageTitle="إحصائيات العقارات">
      <div className="space-y-5" dir="rtl">
        <div className="flex items-center gap-2">
          <BarChart2 size={20} className="text-primary" />
          <h1 className="text-lg font-bold">إحصائيات وتحليلات العقارات</h1>
        </div>

        {loading ? (
          <div className="text-center py-10 text-muted-foreground text-sm">جاري التحميل...</div>
        ) : (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {kpis.map(k => {
                const Icon = k.icon;
                return (
                  <div key={k.label} className="bg-card border border-border rounded-xl p-4 text-center">
                    <Icon size={20} className={`mx-auto mb-1.5 ${k.color}`} />
                    <p className={`text-lg font-bold ${k.color}`}>{k.value}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{k.label}</p>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* City Distribution */}
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="text-sm font-semibold mb-4">توزيع العقارات بحسب المدينة</h3>
                {cityData.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">لا توجد بيانات</p>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={cityData} layout="vertical" margin={{ left: 0, right: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} width={70} />
                      <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                      <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 3, 3, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Property Types Pie */}
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="text-sm font-semibold mb-4">توزيع أنواع العقارات</h3>
                {typeData.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">لا توجد بيانات</p>
                ) : (
                  <div className="flex items-center gap-4">
                    <ResponsiveContainer width="50%" height={180}>
                      <PieChart>
                        <Pie data={typeData} dataKey="value" cx="50%" cy="50%" innerRadius={40} outerRadius={70} strokeWidth={0}>
                          {typeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex-1 space-y-1.5">
                      {typeData.map((d, i) => (
                        <div key={d.name} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                            <span className="text-muted-foreground">{d.name}</span>
                          </div>
                          <span className="font-semibold text-foreground">{d.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Units Status */}
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="text-sm font-semibold mb-3">حالة الوحدات</h3>
                <div className="space-y-2">
                  {[['مؤجرة', 'bg-green-500'], ['شاغرة', 'bg-amber-500'], ['محجوزة', 'bg-blue-500'], ['صيانة', 'bg-purple-500']].map(([status, color]) => {
                    const count = units.filter(u => u['حالة_الوحدة'] === status).length;
                    const pct = units.length ? Math.round((count / units.length) * 100) : 0;
                    return (
                      <div key={status}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">{status}</span>
                          <span className="font-medium">{count} ({pct}%)</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Maintenance Status */}
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="text-sm font-semibold mb-3">حالة طلبات الصيانة</h3>
                <div className="space-y-2">
                  {[['pending', 'معلقة', 'bg-amber-500'], ['in_progress', 'قيد التنفيذ', 'bg-blue-500'], ['completed', 'مكتملة', 'bg-green-500']].map(([key, label, color]) => {
                    const count = maintenance.filter(m => m.status === key).length;
                    const pct = maintenance.length ? Math.round((count / maintenance.length) * 100) : 0;
                    return (
                      <div key={key}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">{label}</span>
                          <span className="font-medium">{count} ({pct}%)</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
