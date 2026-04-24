/*
 * تقرير عقار واحد - رمز الإبداع
 */
import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useMultiEntityData } from '@/hooks/useEntityData';
import { Building2, Home, Users, DollarSign, Wrench, TrendingUp, ChevronDown } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const MONTHS_SHORT = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

export default function PropertySingleReport() {
  const { data, loading } = useMultiEntityData([
    { name: 'Property', limit: 200 },
    { name: 'Unit', limit: 2000 },
    { name: 'Payment', limit: 2000 },
    { name: 'Maintenance', limit: 500 },
    { name: 'Tenant', limit: 500 },
  ]);

  const properties: any[] = data.Property || [];
  const units: any[] = data.Unit || [];
  const payments: any[] = data.Payment || [];
  const maintenance: any[] = data.Maintenance || [];
  const tenants: any[] = data.Tenant || [];

  const [selectedId, setSelectedId] = useState<string>('');
  const selectedProp = properties.find(p => String(p.id) === selectedId) || properties[0];

  const propUnits = units.filter(u => String(u['معرف_العقار'] || u.property_id) === String(selectedProp?.id));
  const propPayments = payments.filter(p => {
    const unitIds = propUnits.map(u => String(u.id));
    return unitIds.includes(String(p['معرف_الوحدة'] || p.unit_id));
  });
  const propMaintenance = maintenance.filter(m => String(m['معرف_العقار'] || m.property_id) === String(selectedProp?.id));

  const totalRevenue = propPayments.filter(p => p['حالة_القسط'] === 'مدفوع' || p['حالة_القسط'] === 'مدفوعة').reduce((s, p) => s + parseFloat(p['مبلغ_الدفعة'] || p['قيمة_القسط'] || 0), 0);
  const occupied = propUnits.filter(u => u['حالة_الوحدة'] === 'مؤجرة').length;
  const occupancyRate = propUnits.length ? Math.round((occupied / propUnits.length) * 100) : 0;

  // Monthly revenue
  const monthlyRevenue = MONTHS_SHORT.map((name, i) => ({
    name: name.slice(0, 3),
    إيرادات: Math.round(propPayments.filter(p => {
      const d = new Date(p['تاريخ_الدفع'] || p.created_at || 0);
      return d.getMonth() === i && (p['حالة_القسط'] === 'مدفوع' || p['حالة_القسط'] === 'مدفوعة');
    }).reduce((s, p) => s + parseFloat(p['مبلغ_الدفعة'] || p['قيمة_القسط'] || 0), 0)),
  }));

  return (
    <DashboardLayout pageTitle="تقرير عقار">
      <div className="space-y-5" dir="rtl">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Building2 size={20} className="text-primary" />
            <h1 className="text-lg font-bold">تقرير عقار مفصّل</h1>
          </div>
          {/* Property Selector */}
          <div className="relative">
            <select
              className="appearance-none bg-muted border border-border rounded-xl px-4 py-2 pl-8 text-sm text-foreground"
              value={selectedId || String(selectedProp?.id || '')}
              onChange={e => setSelectedId(e.target.value)}
            >
              {properties.map(p => (
                <option key={p.id} value={String(p.id)}>{p['اسم_العقار'] || p.name || `عقار ${p.id}`}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10 text-muted-foreground text-sm">جاري التحميل...</div>
        ) : !selectedProp ? (
          <div className="text-center py-10 text-muted-foreground text-sm">لا توجد عقارات</div>
        ) : (
          <>
            {/* Property Info */}
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Building2 size={28} className="text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-foreground">{selectedProp['اسم_العقار'] || selectedProp.name || 'العقار'}</h2>
                  <div className="flex flex-wrap gap-4 mt-1.5 text-xs text-muted-foreground">
                    {selectedProp['المدينة'] && <span>{selectedProp['المدينة']}</span>}
                    {selectedProp['نوع_العقار'] && <span>{selectedProp['نوع_العقار']}</span>}
                    {selectedProp['العنوان'] && <span>{selectedProp['العنوان']}</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'إجمالي الوحدات', value: propUnits.length, icon: Home, color: 'text-blue-400' },
                { label: 'نسبة الإشغال', value: `${occupancyRate}%`, icon: TrendingUp, color: 'text-green-400' },
                { label: 'الإيرادات المحققة', value: `${totalRevenue.toLocaleString('ar-SA')} ر.س`, icon: DollarSign, color: 'text-primary' },
                { label: 'طلبات الصيانة', value: propMaintenance.length, icon: Wrench, color: 'text-amber-400' },
              ].map(k => {
                const Icon = k.icon;
                return (
                  <div key={k.label} className="bg-card border border-border rounded-xl p-4 text-center">
                    <Icon size={18} className={`mx-auto mb-1.5 ${k.color}`} />
                    <p className={`text-lg font-bold ${k.color}`}>{k.value}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{k.label}</p>
                  </div>
                );
              })}
            </div>

            {/* Monthly Revenue */}
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-sm font-semibold mb-4">الإيرادات الشهرية</h3>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={monthlyRevenue}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                  <Area type="monotone" dataKey="إيرادات" stroke="hsl(var(--primary))" fill="url(#revGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Units Table */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="p-4 border-b border-border flex items-center gap-2">
                <Home size={16} className="text-muted-foreground" />
                <h3 className="text-sm font-semibold">وحدات العقار ({propUnits.length})</h3>
              </div>
              {propUnits.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">لا توجد وحدات مسجلة</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">رقم الوحدة</th>
                        <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">النوع</th>
                        <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">الحالة</th>
                        <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">الإيجار</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {propUnits.slice(0, 10).map((u, i) => (
                        <tr key={u.id || i} className="hover:bg-muted/20">
                          <td className="px-4 py-2.5 text-xs font-medium text-foreground">{u['رقم_الوحدة'] || u.unit_number || `${i + 1}`}</td>
                          <td className="px-4 py-2.5 text-xs text-muted-foreground">{u['نوع_الوحدة'] || '—'}</td>
                          <td className="px-4 py-2.5">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${u['حالة_الوحدة'] === 'مؤجرة' ? 'text-green-400 bg-green-500/10' : 'text-amber-400 bg-amber-500/10'}`}>
                              {u['حالة_الوحدة'] || 'شاغرة'}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-xs text-primary font-medium">
                            {u['قيمة_الإيجار'] ? `${parseFloat(u['قيمة_الإيجار']).toLocaleString('ar-SA')} ر.س` : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
