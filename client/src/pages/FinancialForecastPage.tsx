/*
 * صفحة التنبؤ المالي - رمز الإبداع
 */
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, BarChart2, ArrowUpRight, ArrowDownRight, Target } from 'lucide-react';

const MONTHLY_FORECAST = [
  { month: 'مايو 2026', income: 68000, expenses: 28000, net: 40000, occupancy: 87 },
  { month: 'يونيو 2026', income: 72000, expenses: 25000, net: 47000, occupancy: 91 },
  { month: 'يوليو 2026', income: 75000, expenses: 30000, net: 45000, occupancy: 93 },
  { month: 'أغسطس 2026', income: 78000, expenses: 32000, net: 46000, occupancy: 95 },
  { month: 'سبتمبر 2026', income: 76000, expenses: 28000, net: 48000, occupancy: 94 },
  { month: 'أكتوبر 2026', income: 80000, expenses: 27000, net: 53000, occupancy: 96 },
];

const PROPERTY_FORECAST = [
  { property: 'برج الرياض السكني', currentIncome: 24000, projectedIncome: 28000, growth: 16.7, occupancy: 88, vacantUnits: 5 },
  { property: 'مجمع الأندلس التجاري', currentIncome: 20000, projectedIncome: 22000, growth: 10, occupancy: 83, vacantUnits: 2 },
  { property: 'فيلا الواحة', currentIncome: 10000, projectedIncome: 10000, growth: 0, occupancy: 100, vacantUnits: 0 },
  { property: 'عمارة النور', currentIncome: 6000, projectedIncome: 8500, growth: 41.7, occupancy: 55, vacantUnits: 9 },
  { property: 'مكاتب الإبداع', currentIncome: 15000, projectedIncome: 16500, growth: 10, occupancy: 100, vacantUnits: 0 },
  { property: 'شقق الربيع', currentIncome: 7000, projectedIncome: 9000, growth: 28.6, occupancy: 75, vacantUnits: 6 },
];

const KPI_DATA = [
  { label: 'الإيرادات السنوية المتوقعة', value: '954,000', unit: 'ر.س', trend: '+18%', positive: true },
  { label: 'صافي الربح المتوقع', value: '612,000', unit: 'ر.س', trend: '+22%', positive: true },
  { label: 'متوسط نسبة الإشغال', value: '92%', unit: '', trend: '+5%', positive: true },
  { label: 'العائد على الاستثمار', value: '8.4%', unit: '', trend: '+1.2%', positive: true },
];

export default function FinancialForecastPage() {
  const totalProjected = MONTHLY_FORECAST.reduce((s, m) => s + m.net, 0);
  const maxNet = Math.max(...MONTHLY_FORECAST.map(m => m.net));

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">التنبؤ المالي</h1>
          <p className="text-muted-foreground mt-1">توقعات الإيرادات والمصروفات للأشهر القادمة</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {KPI_DATA.map((kpi, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground mb-1">{kpi.label}</div>
                <div className="text-xl font-bold">{kpi.value} <span className="text-sm font-normal">{kpi.unit}</span></div>
                <div className={`flex items-center gap-1 text-xs mt-1 ${kpi.positive ? 'text-green-600' : 'text-red-600'}`}>
                  {kpi.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {kpi.trend} عن العام الماضي
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* رسم بياني - توقعات شهرية */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-primary" />
              التوقعات المالية الشهرية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {MONTHLY_FORECAST.map((m, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{m.month}</span>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span className="text-green-600">+{m.income.toLocaleString()}</span>
                      <span className="text-red-500">-{m.expenses.toLocaleString()}</span>
                      <span className="font-bold text-foreground">{m.net.toLocaleString()} ر.س</span>
                    </div>
                  </div>
                  <div className="flex gap-1 h-4">
                    <div
                      className="bg-green-200 rounded-sm"
                      style={{ width: `${(m.income / 80000) * 60}%` }}
                    />
                    <div
                      className="bg-primary rounded-sm"
                      style={{ width: `${(m.net / maxNet) * 40}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-4 mt-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1"><div className="w-3 h-3 bg-green-200 rounded-sm" />الإيرادات</div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 bg-primary rounded-sm" />صافي الربح</div>
            </div>
            <div className="mt-3 p-3 bg-primary/10 rounded-lg">
              <div className="text-sm font-medium">المجموع المتوقع للـ 6 أشهر القادمة</div>
              <div className="text-2xl font-bold text-primary mt-1">{totalProjected.toLocaleString()} ر.س</div>
            </div>
          </CardContent>
        </Card>

        {/* توقعات حسب العقار */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              التوقعات حسب العقار
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="p-3 text-right font-medium">العقار</th>
                    <th className="p-3 text-right font-medium">الدخل الحالي</th>
                    <th className="p-3 text-right font-medium">الدخل المتوقع</th>
                    <th className="p-3 text-right font-medium">نمو متوقع</th>
                    <th className="p-3 text-right font-medium">الإشغال</th>
                    <th className="p-3 text-right font-medium">وحدات شاغرة</th>
                  </tr>
                </thead>
                <tbody>
                  {PROPERTY_FORECAST.map((p, i) => (
                    <tr key={i} className="border-b hover:bg-muted/20">
                      <td className="p-3 font-medium">{p.property}</td>
                      <td className="p-3 text-muted-foreground">{p.currentIncome.toLocaleString()} ر.س</td>
                      <td className="p-3 font-bold text-primary">{p.projectedIncome.toLocaleString()} ر.س</td>
                      <td className="p-3">
                        <div className={`flex items-center gap-1 ${p.growth > 0 ? 'text-green-600' : 'text-muted-foreground'}`}>
                          {p.growth > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {p.growth > 0 ? '+' : ''}{p.growth}%
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-muted rounded-full h-2 max-w-[80px]">
                            <div className="bg-primary rounded-full h-2" style={{ width: `${p.occupancy}%` }} />
                          </div>
                          <span>{p.occupancy}%</span>
                        </div>
                      </td>
                      <td className="p-3">
                        {p.vacantUnits > 0
                          ? <Badge variant="outline" className="bg-yellow-50 text-yellow-700">{p.vacantUnits} وحدة</Badge>
                          : <Badge variant="outline" className="bg-green-50 text-green-700">ممتلئ</Badge>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* توصيات */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5 text-green-600" />توصيات لتحسين الأداء المالي</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { title: 'تأجير الوحدات الشاغرة في عمارة النور', impact: 'زيادة إيرادات بـ 24,000 ر.س/سنة', priority: 'عالي' },
                { title: 'مراجعة أسعار إيجار شقق الربيع (أقل من السوق بـ 12%)', impact: 'زيادة إيرادات بـ 16,800 ر.س/سنة', priority: 'متوسط' },
                { title: 'تقديم عروض للتجديد المبكر للمستأجرين الحاليين', impact: 'تقليل معدل الشواغر بـ 30%', priority: 'متوسط' },
                { title: 'تحسين عمارة النور وتحديث مرافقها', impact: 'زيادة الإشغال من 55% إلى 85%', priority: 'عالي' },
              ].map((rec, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                  <div className="mt-1">
                    <ArrowUpRight className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{rec.title}</div>
                    <div className="text-xs text-green-600 mt-1">{rec.impact}</div>
                  </div>
                  <Badge variant="outline" className={rec.priority === 'عالي' ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'}>
                    {rec.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
