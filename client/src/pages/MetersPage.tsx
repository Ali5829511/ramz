/*
 * صفحة عدادات الكهرباء والمياه - رمز الإبداع
 * متابعة قراءات العدادات وفواتير الاستهلاك
 */
import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Zap, Droplets, TrendingUp, TrendingDown, Search, Download, Plus, AlertCircle } from 'lucide-react';

const METERS = [
  { id: 'E-101', unit: 'شقة 101', type: 'كهرباء', lastReading: 4520, currentReading: 4820, prevBill: 145, estBill: 160, status: 'عادي', tenant: 'أحمد العتيبي' },
  { id: 'E-102', unit: 'شقة 102', type: 'كهرباء', lastReading: 3100, currentReading: 3560, prevBill: 180, estBill: 230, status: 'مرتفع', tenant: 'فهد الشمري' },
  { id: 'W-101', unit: 'شقة 101', type: 'ماء', lastReading: 820, currentReading: 845, prevBill: 35, estBill: 38, status: 'عادي', tenant: 'أحمد العتيبي' },
  { id: 'W-102', unit: 'شقة 102', type: 'ماء', lastReading: 990, currentReading: 1045, prevBill: 42, estBill: 55, status: 'مرتفع', tenant: 'فهد الشمري' },
  { id: 'E-103', unit: 'شقة 103', type: 'كهرباء', lastReading: 2200, currentReading: 2410, prevBill: 110, estBill: 105, status: 'عادي', tenant: 'خالد القحطاني' },
  { id: 'W-103', unit: 'شقة 103', type: 'ماء', lastReading: 650, currentReading: 672, prevBill: 28, estBill: 27, status: 'عادي', tenant: 'خالد القحطاني' },
  { id: 'E-201', unit: 'شقة 201', type: 'كهرباء', lastReading: 5100, currentReading: 5102, prevBill: 200, estBill: 5, status: 'تحذير', tenant: 'عمر الزهراني' },
  { id: 'W-201', unit: 'شقة 201', type: 'ماء', lastReading: 1100, currentReading: 1128, prevBill: 45, estBill: 40, status: 'عادي', tenant: 'عمر الزهراني' },
];

const STATUS_STYLE: Record<string, string> = {
  'عادي': 'bg-green-100 text-green-700',
  'مرتفع': 'bg-yellow-100 text-yellow-700',
  'تحذير': 'bg-red-100 text-red-700',
};

export default function MetersPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('الكل');

  const filtered = METERS.filter(m => {
    const matchSearch = m.unit.includes(search) || m.tenant.includes(search) || m.id.includes(search);
    const matchType = typeFilter === 'الكل' || m.type === typeFilter;
    return matchSearch && matchType;
  });

  const totalElec = METERS.filter(m => m.type === 'كهرباء').reduce((s, m) => s + (m.currentReading - m.lastReading), 0);
  const totalWater = METERS.filter(m => m.type === 'ماء').reduce((s, m) => s + (m.currentReading - m.lastReading), 0);
  const alerts = METERS.filter(m => m.status !== 'عادي').length;

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">عدادات الكهرباء والمياه</h1>
            <p className="text-muted-foreground mt-1">متابعة قراءات الاستهلاك الشهرية</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              تصدير
            </Button>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              تسجيل قراءة
            </Button>
          </div>
        </div>

        {/* ملخص */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-50 rounded-lg"><Zap className="w-5 h-5 text-yellow-600" /></div>
                <div>
                  <div className="text-xl font-bold">{totalElec.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">كيلوواط هذا الشهر</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-50 rounded-lg"><Droplets className="w-5 h-5 text-cyan-600" /></div>
                <div>
                  <div className="text-xl font-bold">{totalWater.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">متر مكعب هذا الشهر</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 rounded-lg"><TrendingUp className="w-5 h-5 text-green-600" /></div>
                <div>
                  <div className="text-xl font-bold">{METERS.filter(m => m.type === 'كهرباء').length + METERS.filter(m => m.type === 'ماء').length}</div>
                  <div className="text-xs text-muted-foreground">إجمالي العدادات</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-50 rounded-lg"><AlertCircle className="w-5 h-5 text-red-600" /></div>
                <div>
                  <div className="text-xl font-bold text-red-600">{alerts}</div>
                  <div className="text-xs text-muted-foreground">تنبيهات استهلاك</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* فلاتر */}
        <div className="flex gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="بحث..." className="pr-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          {['الكل', 'كهرباء', 'ماء'].map(t => (
            <Button key={t} variant={typeFilter === t ? 'default' : 'outline'} size="sm" onClick={() => setTypeFilter(t)}>
              {t === 'كهرباء' && <Zap className="w-3 h-3 ml-1" />}
              {t === 'ماء' && <Droplets className="w-3 h-3 ml-1" />}
              {t}
            </Button>
          ))}
        </div>

        {/* جدول العدادات */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="p-3 text-right font-medium">رقم العداد</th>
                    <th className="p-3 text-right font-medium">الوحدة</th>
                    <th className="p-3 text-right font-medium">المستأجر</th>
                    <th className="p-3 text-right font-medium">النوع</th>
                    <th className="p-3 text-right font-medium">القراءة السابقة</th>
                    <th className="p-3 text-right font-medium">القراءة الحالية</th>
                    <th className="p-3 text-right font-medium">الاستهلاك</th>
                    <th className="p-3 text-right font-medium">الفاتورة المتوقعة</th>
                    <th className="p-3 text-right font-medium">الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(meter => {
                    const consumption = meter.currentReading - meter.lastReading;
                    const change = meter.estBill - meter.prevBill;
                    return (
                      <tr key={meter.id} className="border-b hover:bg-muted/20 transition-colors">
                        <td className="p-3 font-mono text-xs">{meter.id}</td>
                        <td className="p-3">{meter.unit}</td>
                        <td className="p-3 text-muted-foreground">{meter.tenant}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-1">
                            {meter.type === 'كهرباء' ? <Zap className="w-3 h-3 text-yellow-500" /> : <Droplets className="w-3 h-3 text-cyan-500" />}
                            {meter.type}
                          </div>
                        </td>
                        <td className="p-3 text-muted-foreground">{meter.lastReading.toLocaleString()}</td>
                        <td className="p-3 font-medium">{meter.currentReading.toLocaleString()}</td>
                        <td className="p-3 font-medium">{consumption.toLocaleString()}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-1">
                            <span className="font-medium">{meter.estBill} ر.س</span>
                            {change > 0
                              ? <TrendingUp className="w-3 h-3 text-red-500" />
                              : <TrendingDown className="w-3 h-3 text-green-500" />
                            }
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge className={STATUS_STYLE[meter.status]} variant="outline">
                            {meter.status}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
