/*
 * صفحة إدارة المرافق - رمز الإبداع
 * إدارة المصاعد، مواقف السيارات، المسابح، الأمن، وخدمات المبنى
 */
import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Building2, Zap, Droplets, Wind, Shield, Car, Waves,
  Wifi, Thermometer, AlertTriangle, CheckCircle, Clock,
  Settings, Plus, TrendingUp
} from 'lucide-react';

const FACILITIES = [
  {
    id: 1, name: 'المصاعد', icon: Building2, category: 'ميكانيكي',
    status: 'يعمل', health: 92, lastMaintenance: '2026-03-15',
    nextMaintenance: '2026-06-15', count: 4, workingCount: 4,
    color: 'text-blue-600', bg: 'bg-blue-50'
  },
  {
    id: 2, name: 'نظام الكهرباء', icon: Zap, category: 'كهربائي',
    status: 'يعمل', health: 98, lastMaintenance: '2026-04-01',
    nextMaintenance: '2026-07-01', count: 1, workingCount: 1,
    color: 'text-yellow-600', bg: 'bg-yellow-50'
  },
  {
    id: 3, name: 'نظام المياه', icon: Droplets, category: 'سباكة',
    status: 'يحتاج صيانة', health: 74, lastMaintenance: '2026-01-20',
    nextMaintenance: '2026-04-20', count: 1, workingCount: 1,
    color: 'text-cyan-600', bg: 'bg-cyan-50'
  },
  {
    id: 4, name: 'التكييف المركزي', icon: Wind, category: 'ميكانيكي',
    status: 'يعمل', health: 87, lastMaintenance: '2026-02-10',
    nextMaintenance: '2026-05-10', count: 6, workingCount: 5,
    color: 'text-sky-600', bg: 'bg-sky-50'
  },
  {
    id: 5, name: 'نظام الأمن والمراقبة', icon: Shield, category: 'أمني',
    status: 'يعمل', health: 95, lastMaintenance: '2026-03-28',
    nextMaintenance: '2026-06-28', count: 24, workingCount: 23,
    color: 'text-green-600', bg: 'bg-green-50'
  },
  {
    id: 6, name: 'مواقف السيارات', icon: Car, category: 'بنية تحتية',
    status: 'يعمل', health: 100, lastMaintenance: '2026-04-05',
    nextMaintenance: '2026-07-05', count: 120, workingCount: 120,
    color: 'text-indigo-600', bg: 'bg-indigo-50'
  },
  {
    id: 7, name: 'المسبح', icon: Waves, category: 'ترفيه',
    status: 'مغلق للصيانة', health: 45, lastMaintenance: '2026-04-20',
    nextMaintenance: '2026-04-30', count: 1, workingCount: 0,
    color: 'text-teal-600', bg: 'bg-teal-50'
  },
  {
    id: 8, name: 'شبكة الإنترنت', icon: Wifi, category: 'تقني',
    status: 'يعمل', health: 99, lastMaintenance: '2026-04-10',
    nextMaintenance: '2026-07-10', count: 1, workingCount: 1,
    color: 'text-purple-600', bg: 'bg-purple-50'
  },
  {
    id: 9, name: 'نظام التدفئة', icon: Thermometer, category: 'ميكانيكي',
    status: 'يعمل', health: 88, lastMaintenance: '2026-03-01',
    nextMaintenance: '2026-06-01', count: 1, workingCount: 1,
    color: 'text-orange-600', bg: 'bg-orange-50'
  },
];

const MAINTENANCE_SCHEDULE = [
  { facility: 'نظام المياه', date: '2026-04-28', type: 'عاجل', technician: 'محمد السالم' },
  { facility: 'المسبح', date: '2026-04-30', type: 'دوري', technician: 'أحمد العتيبي' },
  { facility: 'التكييف المركزي - وحدة 6', date: '2026-05-05', type: 'إصلاح', technician: 'خالد الشمري' },
  { facility: 'المصاعد - فحص سنوي', date: '2026-06-15', type: 'دوري', technician: 'شركة أوتيس' },
];

const STATUS_COLOR: Record<string, string> = {
  'يعمل': 'bg-green-100 text-green-700',
  'يحتاج صيانة': 'bg-yellow-100 text-yellow-700',
  'مغلق للصيانة': 'bg-red-100 text-red-700',
};

export default function FacilitiesPage() {
  const [filter, setFilter] = useState('الكل');
  const categories = ['الكل', 'ميكانيكي', 'كهربائي', 'سباكة', 'أمني', 'بنية تحتية', 'ترفيه', 'تقني'];

  const filtered = filter === 'الكل' ? FACILITIES : FACILITIES.filter(f => f.category === filter);
  const needsMaintenance = FACILITIES.filter(f => f.health < 80).length;
  const avgHealth = Math.round(FACILITIES.reduce((s, f) => s + f.health, 0) / FACILITIES.length);

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* رأس الصفحة */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">إدارة المرافق</h1>
            <p className="text-muted-foreground mt-1">متابعة وصيانة مرافق المبنى</p>
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            إضافة مرفق
          </Button>
        </div>

        {/* إحصائيات سريعة */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-green-600">{FACILITIES.filter(f => f.status === 'يعمل').length}</div>
              <div className="text-sm text-muted-foreground mt-1">مرفق يعمل</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-yellow-600">{needsMaintenance}</div>
              <div className="text-sm text-muted-foreground mt-1">يحتاج صيانة</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-primary">{avgHealth}%</div>
              <div className="text-sm text-muted-foreground mt-1">متوسط الصحة</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-blue-600">{MAINTENANCE_SCHEDULE.length}</div>
              <div className="text-sm text-muted-foreground mt-1">صيانة مجدولة</div>
            </CardContent>
          </Card>
        </div>

        {/* فلتر الفئات */}
        <div className="flex gap-2 flex-wrap">
          {categories.map(cat => (
            <Button
              key={cat}
              variant={filter === cat ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>

        {/* قائمة المرافق */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(facility => {
            const Icon = facility.icon;
            return (
              <Card key={facility.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${facility.bg}`}>
                        <Icon className={`w-5 h-5 ${facility.color}`} />
                      </div>
                      <div>
                        <CardTitle className="text-base">{facility.name}</CardTitle>
                        <span className="text-xs text-muted-foreground">{facility.category}</span>
                      </div>
                    </div>
                    <Badge className={STATUS_COLOR[facility.status] || ''} variant="outline">
                      {facility.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">مستوى الصحة</span>
                      <span className={facility.health < 80 ? 'text-yellow-600 font-medium' : 'text-green-600 font-medium'}>
                        {facility.health}%
                      </span>
                    </div>
                    <Progress value={facility.health} className="h-2" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      {facility.workingCount}/{facility.count} يعمل
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-blue-500" />
                      {facility.nextMaintenance}
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button variant="outline" size="sm" className="flex-1 text-xs">
                      <Settings className="w-3 h-3 ml-1" />
                      جدول صيانة
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 text-xs">
                      <TrendingUp className="w-3 h-3 ml-1" />
                      سجل
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* جدول الصيانة القادمة */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              الصيانة المجدولة القادمة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {MAINTENANCE_SCHEDULE.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/40">
                  <div>
                    <div className="font-medium text-sm">{item.facility}</div>
                    <div className="text-xs text-muted-foreground">{item.technician}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={item.type === 'عاجل' ? 'destructive' : 'outline'}>
                      {item.type}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{item.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
