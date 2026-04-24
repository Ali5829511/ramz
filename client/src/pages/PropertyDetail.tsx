/*
 * تفاصيل العقار - رمز الإبداع
 * صفحة شاملة لعرض جميع معلومات العقار والوحدات والعقود
 */
import { useState } from 'react';
import { useLocation, Link } from 'wouter';
import {
  Building2, MapPin, Home, Users, DollarSign, Wrench,
  ArrowLeft, Printer, Edit, Plus, Eye, CheckCircle,
  Clock, AlertCircle, TrendingUp, FileText, Phone,
  Star, Calendar, BarChart3, Settings2
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useMultiEntityData } from '@/hooks/useEntityData';
import { cn } from '@/lib/utils';

// ─── تبويبات الصفحة ───
const TABS = [
  { id: 'overview', label: 'نظرة عامة', icon: Building2 },
  { id: 'units', label: 'الوحدات', icon: Home },
  { id: 'leases', label: 'العقود', icon: FileText },
  { id: 'finance', label: 'المالية', icon: DollarSign },
  { id: 'maintenance', label: 'الصيانة', icon: Wrench },
];

const STATUS_COLORS: Record<string, string> = {
  'مؤجرة': 'bg-green-100 text-green-700 border-green-200',
  'occupied': 'bg-green-100 text-green-700 border-green-200',
  'شاغرة': 'bg-slate-100 text-slate-600 border-slate-200',
  'vacant': 'bg-slate-100 text-slate-600 border-slate-200',
  'صيانة': 'bg-amber-100 text-amber-700 border-amber-200',
  'maintenance': 'bg-amber-100 text-amber-700 border-amber-200',
};

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <Card className={cn('border', color)}>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground font-medium mb-1">{label}</p>
        <p className={cn('text-2xl font-bold', color ? '' : 'text-foreground')}>{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
}

export default function PropertyDetail() {
  const [location] = useLocation();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState('overview');

  // استخراج معرف العقار من URL
  const params = new URLSearchParams(window.location.search);
  const propertyId = params.get('id') || '';

  const { data, loading } = useMultiEntityData([
    { name: 'Property' },
    { name: 'Unit', limit: 500 },
    { name: 'Lease', limit: 500 },
    { name: 'Payment', limit: 500 },
    { name: 'Maintenance', limit: 200 },
    { name: 'Expense', limit: 200 },
  ]);

  const properties = data.Property || [];
  const property = properties.find(p => p.id === propertyId) || properties[0] || null;

  const allUnits = data.Unit || [];
  const allLeases = data.Lease || [];
  const allPayments = data.Payment || [];
  const allMaintenance = data.Maintenance || [];
  const allExpenses = data.Expense || [];

  const propName = property?.['اسم_العقار'] || property?.name || '';

  // بيانات خاصة بهذا العقار
  const units = allUnits.filter(u =>
    u['معرف_العقار'] === property?.id || u['اسم_العقار'] === propName
  );
  const leases = allLeases.filter(l =>
    l['اسم_العقار'] === propName || l['معرف_العقار'] === property?.id
  );
  const payments = allPayments.filter(p => p['اسم_العقار'] === propName);
  const maintenance = allMaintenance.filter(m => m['اسم_العقار'] === propName);
  const expenses = allExpenses.filter(e => e.property_name === propName);

  // إحصاءات
  const totalUnits = units.length;
  const rented = units.filter(u => u['حالة_الوحدة'] === 'مؤجرة' || u.status === 'occupied').length;
  const vacant = units.filter(u => u['حالة_الوحدة'] === 'شاغرة' || u.status === 'vacant').length;
  const maint = units.filter(u => u['حالة_الوحدة'] === 'صيانة' || u.status === 'maintenance').length;
  const occupancy = totalUnits > 0 ? Math.round((rented / totalUnits) * 100) : 0;

  const revenue = payments
    .filter(p => p['حالة_القسط'] === 'مدفوع')
    .reduce((s, p) => s + (Number(p['مبلغ_الدفعة']) || 0), 0);
  const pending = payments
    .filter(p => p['حالة_القسط'] === 'مستحق' || p['حالة_القسط'] === 'لم_يتم_الدفع')
    .reduce((s, p) => s + (Number(p['مبلغ_الدفعة']) || 0), 0);
  const totalExpenses = expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const activeLeases = leases.filter(l => l['حالة_العقد'] === 'نشط');
  const pendingMaint = maintenance.filter(m => m.status === 'pending').length;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (!property) {
    return (
      <DashboardLayout>
        <div className="p-6 text-center py-24">
          <Building2 className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
          <h2 className="text-xl font-bold mb-2">العقار غير موجود</h2>
          <Link href="/properties">
            <Button>العودة للعقارات</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 max-w-6xl mx-auto">

        {/* رأس الصفحة */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/properties')} className="p-2 hover:bg-muted rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="p-2.5 bg-primary/10 rounded-xl">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">{propName}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <MapPin className="w-3 h-3 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {property['المدينة'] || property.city || '—'}
                  {(property['الحي'] || property['العنوان']) ? ` — ${property['الحي'] || property['العنوان']}` : ''}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href={`/property-report?id=${property.id}`}>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Printer className="w-4 h-4" />
                تقرير
              </Button>
            </Link>
            <Button size="sm" className="gap-1.5">
              <Edit className="w-4 h-4" />
              تعديل
            </Button>
          </div>
        </div>

        {/* بطاقات الإحصاء السريع */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-blue-700">{totalUnits}</div>
              <div className="text-xs text-blue-600 mt-0.5 font-medium">الوحدات</div>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-green-700">{occupancy}%</div>
              <div className="text-xs text-green-600 mt-0.5 font-medium">نسبة الإشغال</div>
            </CardContent>
          </Card>
          <Card className="bg-emerald-50 border-emerald-200">
            <CardContent className="p-3 text-center">
              <div className="text-xl font-bold text-emerald-700">{revenue.toLocaleString()}</div>
              <div className="text-xs text-emerald-600 mt-0.5 font-medium">إيرادات (ر.س)</div>
            </CardContent>
          </Card>
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-amber-700">{activeLeases.length}</div>
              <div className="text-xs text-amber-600 mt-0.5 font-medium">عقد نشط</div>
            </CardContent>
          </Card>
          <Card className={pendingMaint > 0 ? "bg-red-50 border-red-200" : "bg-slate-50 border-slate-200"}>
            <CardContent className="p-3 text-center">
              <div className={cn("text-2xl font-bold", pendingMaint > 0 ? "text-red-700" : "text-slate-600")}>{pendingMaint}</div>
              <div className={cn("text-xs mt-0.5 font-medium", pendingMaint > 0 ? "text-red-600" : "text-slate-500")}>صيانة معلقة</div>
            </CardContent>
          </Card>
        </div>

        {/* التبويبات */}
        <div className="border-b border-border flex gap-0 overflow-x-auto">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ─── محتوى التبويبات ─── */}

        {/* نظرة عامة */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 space-y-5">
              {/* البيانات الأساسية */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-primary" /> البيانات الأساسية
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                      { label: 'نوع العقار', val: property['نوع_العقار'] || property.type || '—' },
                      { label: 'حالة العقار', val: property['حالة_العقار'] || 'نشط' },
                      { label: 'عدد الطوابق', val: property['عدد_الطوابق'] || '—' },
                      { label: 'سنة البناء', val: property['سنة_البناء'] || '—' },
                      { label: 'المساحة', val: property['المساحة'] ? `${property['المساحة']} م²` : '—' },
                      { label: 'رقم الصك', val: property['رقم_الصك'] || '—' },
                    ].map(f => (
                      <div key={f.label} className="border-b border-dashed border-border pb-2">
                        <p className="text-xs text-muted-foreground mb-0.5">{f.label}</p>
                        <p className="text-sm font-semibold">{f.val}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* بار الإشغال */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-primary" /> حالة الوحدات
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">معدل الإشغال</span>
                    <span className="text-lg font-bold text-primary">{occupancy}%</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${occupancy}%` }} />
                  </div>
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    <div className="text-center p-2 bg-green-50 rounded-lg border border-green-200">
                      <div className="text-lg font-bold text-green-700">{rented}</div>
                      <div className="text-xs text-green-600">مؤجرة</div>
                    </div>
                    <div className="text-center p-2 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="text-lg font-bold text-slate-600">{vacant}</div>
                      <div className="text-xs text-slate-500">شاغرة</div>
                    </div>
                    <div className="text-center p-2 bg-amber-50 rounded-lg border border-amber-200">
                      <div className="text-lg font-bold text-amber-700">{maint}</div>
                      <div className="text-xs text-amber-600">صيانة</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-5">
              {/* بيانات المالك */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" /> بيانات المالك
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-lg">
                      {(property['اسم_المالك'] || 'م').charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{property['اسم_المالك'] || '—'}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Phone className="w-3 h-3" />{property['جوال_المالك'] || '—'}
                      </p>
                    </div>
                  </div>
                  {property['نسبة_الإدارة'] && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">رسوم الإدارة</span>
                      <span className="font-semibold">{property['نسبة_الإدارة']}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* الملخص المالي */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-primary" /> الملخص المالي
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">إيرادات محصَّلة</span>
                    <span className="font-semibold text-green-600">{revenue.toLocaleString()} ر.س</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">إيرادات معلقة</span>
                    <span className="font-semibold text-amber-600">{pending.toLocaleString()} ر.س</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">المصروفات</span>
                    <span className="font-semibold text-red-600">{totalExpenses.toLocaleString()} ر.س</span>
                  </div>
                  <div className="border-t border-border pt-2 flex justify-between text-sm">
                    <span className="font-medium">صافي الدخل</span>
                    <span className="font-bold text-primary">{(revenue - totalExpenses).toLocaleString()} ر.س</span>
                  </div>
                </CardContent>
              </Card>

              {/* روابط سريعة */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">روابط سريعة</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[
                    { label: 'إضافة وحدة', icon: Plus, href: `/property-form?id=${property.id}&tab=units` },
                    { label: 'إنشاء عقد', icon: FileText, href: '/contracts' },
                    { label: 'طلب صيانة', icon: Wrench, href: '/maintenance' },
                    { label: 'طباعة التقرير', icon: Printer, href: `/property-report?id=${property.id}` },
                  ].map(link => (
                    <Link key={link.label} href={link.href}>
                      <button className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-muted text-sm text-right transition-colors">
                        <link.icon className="w-4 h-4 text-primary" />
                        {link.label}
                      </button>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* الوحدات */}
        {activeTab === 'units' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">الوحدات ({totalUnits} وحدة)</h2>
              <Button size="sm" className="gap-1.5">
                <Plus className="w-4 h-4" /> إضافة وحدة
              </Button>
            </div>
            {units.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Home className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>لا توجد وحدات مسجلة لهذا العقار</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {units.map((unit, i) => {
                  const status = unit['حالة_الوحدة'] || unit.status || 'شاغرة';
                  const lease = leases.find(l =>
                    l['اسم_الوحدة'] === (unit['اسم_الوحدة'] || unit['رقم_الوحدة'])
                  );
                  return (
                    <Card key={unit.id || i} className="hover:shadow-sm transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-sm">
                            {unit['اسم_الوحدة'] || unit['رقم_الوحدة'] || `وحدة ${i + 1}`}
                          </h3>
                          <Badge variant="outline" className={cn('text-xs', STATUS_COLORS[status])}>
                            {status}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-xs text-muted-foreground">
                          {unit['نوع_الوحدة'] && <p>النوع: {unit['نوع_الوحدة']}</p>}
                          {unit['المساحة'] && <p>المساحة: {unit['المساحة']} م²</p>}
                          {lease && (
                            <p className="text-green-600 font-medium mt-1">
                              المستأجر: {lease['اسم_المستأجر']}
                            </p>
                          )}
                          {lease && (
                            <p>الإيجار: {Number(lease['قيمة_الإيجار']).toLocaleString()} ر.س/سنة</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* العقود */}
        {activeTab === 'leases' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">العقود ({leases.length})</h2>
              <Link href="/contracts">
                <Button size="sm" variant="outline" className="gap-1.5">
                  <Eye className="w-4 h-4" /> إدارة العقود
                </Button>
              </Link>
            </div>
            {leases.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>لا توجد عقود لهذا العقار</p>
              </div>
            ) : (
              <div className="space-y-2">
                {leases.map((lease, i) => {
                  const statusClasses: Record<string, string> = {
                    'نشط': 'bg-green-100 text-green-700',
                    'منتهي': 'bg-slate-100 text-slate-600',
                    'ملغي': 'bg-red-100 text-red-700',
                  };
                  const status = lease['حالة_العقد'] || '—';
                  const endDate = lease['تاريخ_نهاية_العقد'];
                  const daysLeft = endDate ? Math.ceil((new Date(endDate).getTime() - Date.now()) / 86400000) : null;
                  return (
                    <Card key={lease.id || i} className="hover:shadow-sm transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-sm">{lease['اسم_المستأجر'] || '—'}</span>
                              <Badge variant="outline" className={cn('text-xs', statusClasses[status])}>
                                {status}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground space-y-0.5">
                              <p>رقم العقد: {lease['رقم_العقد'] || '—'}</p>
                              <p>الوحدة: {lease['اسم_الوحدة'] || '—'}</p>
                              <p>
                                {lease['تاريخ_بداية_العقد']} — {lease['تاريخ_نهاية_العقد']}
                              </p>
                            </div>
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-bold text-primary">
                              {Number(lease['قيمة_الإيجار'] || 0).toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground">ر.س/سنة</p>
                            {daysLeft !== null && daysLeft < 60 && daysLeft > 0 && (
                              <p className="text-xs text-amber-600 font-medium mt-1">
                                ⚠️ {daysLeft} يوم متبقي
                              </p>
                            )}
                            {daysLeft !== null && daysLeft <= 0 && status === 'نشط' && (
                              <p className="text-xs text-red-600 font-medium mt-1">⛔ منتهي</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* المالية */}
        {activeTab === 'finance' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <p className="text-xs text-green-600 font-medium mb-1">إجمالي الإيرادات</p>
                  <p className="text-2xl font-bold text-green-700">{revenue.toLocaleString()} <span className="text-sm">ر.س</span></p>
                </CardContent>
              </Card>
              <Card className="bg-red-50 border-red-200">
                <CardContent className="p-4">
                  <p className="text-xs text-red-600 font-medium mb-1">المصروفات</p>
                  <p className="text-2xl font-bold text-red-700">{totalExpenses.toLocaleString()} <span className="text-sm">ر.س</span></p>
                </CardContent>
              </Card>
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <p className="text-xs text-blue-600 font-medium mb-1">صافي الدخل</p>
                  <p className="text-2xl font-bold text-blue-700">{(revenue - totalExpenses).toLocaleString()} <span className="text-sm">ر.س</span></p>
                </CardContent>
              </Card>
            </div>

            {/* سجل الدفعات */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">سجل الدفعات</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {payments.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground text-sm">لا توجد دفعات مسجلة</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-right px-4 py-2.5 font-medium text-muted-foreground text-xs">المستأجر</th>
                          <th className="text-right px-4 py-2.5 font-medium text-muted-foreground text-xs">المبلغ</th>
                          <th className="text-right px-4 py-2.5 font-medium text-muted-foreground text-xs">التاريخ</th>
                          <th className="text-right px-4 py-2.5 font-medium text-muted-foreground text-xs">الحالة</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments.map((p, i) => {
                          const statusClasses: Record<string, string> = {
                            'مدفوع': 'text-green-600',
                            'مستحق': 'text-amber-600',
                            'لم_يتم_الدفع': 'text-red-600',
                          };
                          return (
                            <tr key={p.id || i} className="border-t border-border hover:bg-muted/20">
                              <td className="px-4 py-2.5">{p['اسم_المستأجر'] || '—'}</td>
                              <td className="px-4 py-2.5 font-medium">{Number(p['مبلغ_الدفعة'] || 0).toLocaleString()} ر.س</td>
                              <td className="px-4 py-2.5 text-muted-foreground">{p['تاريخ_الدفع'] || p['تاريخ_استحقاق_القسط'] || '—'}</td>
                              <td className={cn('px-4 py-2.5 font-medium', statusClasses[p['حالة_القسط']] || '')}>
                                {p['حالة_القسط'] || '—'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* الصيانة */}
        {activeTab === 'maintenance' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">طلبات الصيانة ({maintenance.length})</h2>
              <Link href="/maintenance">
                <Button size="sm" variant="outline" className="gap-1.5">
                  <Plus className="w-4 h-4" /> إضافة طلب
                </Button>
              </Link>
            </div>
            {maintenance.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Wrench className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>لا توجد طلبات صيانة</p>
              </div>
            ) : (
              <div className="space-y-2">
                {maintenance.map((req, i) => {
                  const statusMap: Record<string, { label: string; cls: string; icon: any }> = {
                    pending: { label: 'معلق', cls: 'bg-red-100 text-red-700', icon: Clock },
                    in_progress: { label: 'جاري', cls: 'bg-amber-100 text-amber-700', icon: AlertCircle },
                    completed: { label: 'منجز', cls: 'bg-green-100 text-green-700', icon: CheckCircle },
                  };
                  const s = statusMap[req.status] || { label: req.status, cls: 'bg-muted text-muted-foreground', icon: Clock };
                  const Icon = s.icon;
                  const priorityMap: Record<string, string> = { high: 'عالية', medium: 'متوسطة', low: 'منخفضة' };
                  return (
                    <Card key={req.id || i} className="hover:shadow-sm transition-shadow">
                      <CardContent className="p-4 flex items-start gap-3">
                        <div className={cn('p-2 rounded-lg', s.cls.replace('text-', 'bg-').replace('-700', '-100').replace('-600', '-100'))}>
                          <Icon className={cn('w-4 h-4', s.cls.split(' ')[1])} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-medium text-sm">{req['عنوان_الطلب'] || 'طلب صيانة'}</span>
                            <Badge variant="outline" className={cn('text-xs', s.cls)}>{s.label}</Badge>
                          </div>
                          <div className="text-xs text-muted-foreground space-x-reverse space-x-3 flex gap-3">
                            <span>الوحدة: {req['اسم_الوحدة'] || '—'}</span>
                            <span>الأولوية: {priorityMap[req.priority] || req.priority || '—'}</span>
                            <span>{req.created_date || '—'}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}

