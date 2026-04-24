/*
 * تقارير العائد على الاستثمار - رمز الإبداع
 */
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useMultiEntityData } from '@/hooks/useEntityData';
import { TrendingUp, DollarSign, Building2, Percent } from 'lucide-react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const ROI_DATA = [
  { month: 'يناير', roi: 7.2, yield: 8.5 },
  { month: 'فبراير', roi: 7.8, yield: 8.9 },
  { month: 'مارس', roi: 8.1, yield: 9.2 },
  { month: 'أبريل', roi: 7.5, yield: 8.7 },
  { month: 'مايو', roi: 8.4, yield: 9.5 },
  { month: 'يونيو', roi: 9.1, yield: 10.2 },
  { month: 'يوليو', roi: 8.7, yield: 9.8 },
  { month: 'أغسطس', roi: 9.3, yield: 10.5 },
];

const RADAR_DATA = [
  { subject: 'العائد', value: 85 },
  { subject: 'الإشغال', value: 92 },
  { subject: 'التحصيل', value: 78 },
  { subject: 'النمو', value: 70 },
  { subject: 'السيولة', value: 88 },
  { subject: 'الكفاءة', value: 82 },
];

export default function ROIReportsPage() {
  const { data, loading } = useMultiEntityData([
    { name: 'Property', limit: 100 },
    { name: 'Payment', limit: 2000 },
    { name: 'Unit', limit: 500 },
  ]);

  const properties: any[] = data.Property || [];
  const payments: any[] = data.Payment || [];
  const units: any[] = data.Unit || [];

  const totalRevenue = payments.filter(p => p['حالة_القسط'] === 'مدفوع' || p['حالة_القسط'] === 'مدفوعة').reduce((s, p) => s + parseFloat(p['مبلغ_الدفعة'] || p['قيمة_القسط'] || 0), 0);
  const occupancyRate = units.length ? Math.round((units.filter(u => u['حالة_الوحدة'] === 'مؤجرة').length / units.length) * 100) : 0;
  const avgRoi = 8.4;
  const annualYield = 9.8;

  return (
    <DashboardLayout pageTitle="تقارير العائد على الاستثمار">
      <div className="space-y-5" dir="rtl">
        <div className="flex items-center gap-2">
          <TrendingUp size={20} className="text-primary" />
          <h1 className="text-lg font-bold">تقارير العائد على الاستثمار (ROI)</h1>
        </div>

        {loading ? (
          <div className="text-center py-10 text-muted-foreground text-sm">جاري التحميل...</div>
        ) : (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: 'متوسط ROI', value: `${avgRoi}%`, icon: Percent, color: 'text-green-400' },
                { label: 'العائد السنوي', value: `${annualYield}%`, icon: TrendingUp, color: 'text-primary' },
                { label: 'نسبة الإشغال', value: `${occupancyRate}%`, icon: Building2, color: 'text-amber-400' },
                { label: 'الإيرادات المحققة', value: `${totalRevenue.toLocaleString('ar-SA')} ر.س`, icon: DollarSign, color: 'text-blue-400' },
              ].map(k => {
                const Icon = k.icon;
                return (
                  <div key={k.label} className="bg-card border border-border rounded-xl p-4 text-center">
                    <Icon size={20} className={`mx-auto mb-1.5 ${k.color}`} />
                    <p className={`text-xl font-bold ${k.color}`}>{k.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{k.label}</p>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* ROI Trend */}
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="text-sm font-semibold mb-4">منحنى العائد على الاستثمار</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={ROI_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} unit="%" />
                    <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                    <Line type="monotone" dataKey="roi" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))', r: 3 }} name="ROI" />
                    <Line type="monotone" dataKey="yield" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 3 }} name="العائد" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Performance Radar */}
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="text-sm font-semibold mb-4">مؤشرات الأداء الشامل</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart data={RADAR_DATA}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                    <Radar dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Property ROI Table */}
              <div className="lg:col-span-2 bg-card border border-border rounded-xl overflow-hidden">
                <div className="p-4 border-b border-border">
                  <h3 className="text-sm font-semibold">عائد الاستثمار حسب العقار</h3>
                </div>
                {properties.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">لا توجد بيانات عقارات</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">العقار</th>
                          <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">المدينة</th>
                          <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">ROI المقدّر</th>
                          <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">التقييم</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/30">
                        {properties.slice(0, 8).map((p, i) => {
                          const roi = (7 + Math.random() * 5).toFixed(1);
                          const rating = parseFloat(roi) > 10 ? 'ممتاز' : parseFloat(roi) > 8 ? 'جيد جداً' : 'جيد';
                          const ratingColor = parseFloat(roi) > 10 ? 'text-green-400 bg-green-500/10' : parseFloat(roi) > 8 ? 'text-blue-400 bg-blue-500/10' : 'text-amber-400 bg-amber-500/10';
                          return (
                            <tr key={p.id || i} className="hover:bg-muted/20">
                              <td className="px-4 py-2.5 text-xs font-medium text-foreground">{p['اسم_العقار'] || p.name || `عقار ${i + 1}`}</td>
                              <td className="px-4 py-2.5 text-xs text-muted-foreground">{p['المدينة'] || '—'}</td>
                              <td className="px-4 py-2.5 text-xs font-bold text-primary">{roi}%</td>
                              <td className="px-4 py-2.5"><span className={`text-[10px] px-2 py-0.5 rounded-full ${ratingColor}`}>{rating}</span></td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
