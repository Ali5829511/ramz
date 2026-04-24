/*
 * بحث السوق العقاري - رمز الإبداع
 */
import { useState } from 'react';
import { Search, TrendingUp, TrendingDown, BarChart2, MapPin, DollarSign, Home, Building2 } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const CITY_DATA = [
  { city: 'الرياض', avgRent: 48000, occupancy: 94, priceGrowth: 8.2, units: 1200 },
  { city: 'جدة', avgRent: 42000, occupancy: 91, priceGrowth: 6.5, units: 980 },
  { city: 'الدمام', avgRent: 38000, occupancy: 88, priceGrowth: 5.1, units: 620 },
  { city: 'مكة المكرمة', avgRent: 55000, occupancy: 96, priceGrowth: 11.3, units: 450 },
  { city: 'المدينة المنورة', avgRent: 36000, occupancy: 85, priceGrowth: 4.8, units: 380 },
  { city: 'الخبر', avgRent: 40000, occupancy: 89, priceGrowth: 5.9, units: 290 },
];

const TREND_DATA = [
  { month: 'يناير', سكني: 42000, تجاري: 85000, مكتبي: 65000 },
  { month: 'فبراير', سكني: 43500, تجاري: 87000, مكتبي: 66000 },
  { month: 'مارس', سكني: 44000, تجاري: 88500, مكتبي: 67500 },
  { month: 'أبريل', سكني: 45200, تجاري: 90000, مكتبي: 68000 },
  { month: 'مايو', سكني: 46800, تجاري: 92000, مكتبي: 70000 },
  { month: 'يونيو', سكني: 48000, تجاري: 95000, مكتبي: 72000 },
  { month: 'يوليو', سكني: 47500, تجاري: 93000, مكتبي: 71500 },
  { month: 'أغسطس', سكني: 49000, تجاري: 96000, مكتبي: 73000 },
];

const INSIGHTS = [
  { title: 'ارتفاع الطلب في الرياض', desc: 'ارتفعت معدلات الإشغال في شمال الرياض بنسبة 12% مقارنة بالعام الماضي', icon: TrendingUp, color: 'text-green-400' },
  { title: 'انخفاض المكاتب التجارية', desc: 'تشهد المكاتب التجارية في جدة انخفاضاً بسبب التحول للعمل عن بُعد', icon: TrendingDown, color: 'text-red-400' },
  { title: 'الفلل السكنية الأعلى طلباً', desc: 'الطلب على الفلل المستقلة ارتفع 23% بعد برنامج سكني الجديد', icon: Home, color: 'text-blue-400' },
  { title: 'نمو منطقة الدمام', desc: 'تشهد المنطقة الشرقية نمواً استثنارياً في الوحدات السكنية والتجارية', icon: Building2, color: 'text-amber-400' },
];

export default function MarketResearchPage() {
  const [selectedCity, setSelectedCity] = useState('الرياض');
  const [propertyType, setPropertyType] = useState('سكني');

  const city = CITY_DATA.find(c => c.city === selectedCity) || CITY_DATA[0];

  return (
    <DashboardLayout pageTitle="بحث السوق العقاري">
      <div className="space-y-5" dir="rtl">
        <div className="flex items-center gap-2">
          <Search size={20} className="text-primary" />
          <h1 className="text-lg font-bold">بحث وتحليل السوق العقاري</h1>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <div className="flex gap-1">
            {CITY_DATA.map(c => (
              <button key={c.city} onClick={() => setSelectedCity(c.city)} className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${selectedCity === c.city ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>{c.city}</button>
            ))}
          </div>
        </div>

        {/* City Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'متوسط الإيجار السنوي', value: `${city.avgRent.toLocaleString('ar-SA')} ر.س`, icon: DollarSign, color: 'text-primary' },
            { label: 'نسبة الإشغال', value: `${city.occupancy}%`, icon: BarChart2, color: 'text-green-400' },
            { label: 'نمو الأسعار', value: `${city.priceGrowth}%`, icon: TrendingUp, color: 'text-amber-400' },
            { label: 'إجمالي الوحدات', value: `${city.units.toLocaleString()} وحدة`, icon: Home, color: 'text-blue-400' },
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* City Comparison */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold mb-4">مقارنة الإيجار بين المدن (ر.س/سنوي)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={CITY_DATA} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis type="category" dataKey="city" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} width={90} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} formatter={(v: number) => [`${v.toLocaleString('ar-SA')} ر.س`, 'متوسط الإيجار']} />
                <Bar dataKey="avgRent" fill="hsl(var(--primary))" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Rent Trend */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">اتجاه الإيجارات حسب النوع</h3>
              <div className="flex gap-1">
                {['سكني', 'تجاري', 'مكتبي'].map(t => (
                  <button key={t} onClick={() => setPropertyType(t)} className={`px-2 py-1 rounded text-[10px] ${propertyType === t ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{t}</button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={TREND_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey={propertyType} stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3, fill: 'hsl(var(--primary))' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Occupancy Table */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border flex items-center gap-2">
              <MapPin size={16} className="text-muted-foreground" />
              <h3 className="text-sm font-semibold">نسب الإشغال بالمدن</h3>
            </div>
            <div className="p-4 space-y-3">
              {CITY_DATA.map(c => (
                <div key={c.city}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{c.city}</span>
                    <span className="font-medium text-foreground">{c.occupancy}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${c.occupancy}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Market Insights */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="text-sm font-semibold">تحليلات السوق</h3>
            </div>
            <div className="divide-y divide-border/30">
              {INSIGHTS.map(insight => {
                const Icon = insight.icon;
                return (
                  <div key={insight.title} className="p-3 flex items-start gap-2.5">
                    <Icon size={16} className={`${insight.color} flex-shrink-0 mt-0.5`} />
                    <div>
                      <p className="text-xs font-medium text-foreground">{insight.title}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{insight.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
