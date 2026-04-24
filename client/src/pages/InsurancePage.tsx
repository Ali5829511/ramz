/*
 * صفحة التأمين على العقارات - رمز الإبداع
 */
import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, CheckCircle, Clock, Plus, FileText, TrendingUp } from 'lucide-react';

const POLICIES = [
  {
    id: 1, policy: 'POL-2024-001', property: 'برج الرياض السكني',
    company: 'شركة التعاونية للتأمين', type: 'شامل',
    start: '2026-01-01', end: '2026-12-31',
    premium: 12000, coverage: 5000000, status: 'نشط',
    deductible: 5000, agent: 'علي الزهراني', phone: '0501234567'
  },
  {
    id: 2, policy: 'POL-2024-002', property: 'مجمع الأندلس التجاري',
    company: 'شركة ملاذ للتأمين', type: 'تجاري',
    start: '2026-03-01', end: '2027-02-28',
    premium: 18000, coverage: 8000000, status: 'نشط',
    deductible: 10000, agent: 'محمد القحطاني', phone: '0509876543'
  },
  {
    id: 3, policy: 'POL-2024-003', property: 'فيلا الواحة',
    company: 'شركة بوبا العربية', type: 'سكني',
    start: '2025-06-01', end: '2026-05-31',
    premium: 8500, coverage: 2000000, status: 'منتهي قريباً',
    deductible: 3000, agent: 'أحمد السالم', phone: '0505678901'
  },
  {
    id: 4, policy: 'POL-2024-004', property: 'مكاتب الإبداع',
    company: 'شركة الراجحي تكافل', type: 'تجاري',
    start: '2024-09-01', end: '2025-08-31',
    premium: 9600, coverage: 3000000, status: 'منتهي',
    deductible: 5000, agent: 'خالد العتيبي', phone: '0554321098'
  },
  {
    id: 5, policy: 'POL-2025-001', property: 'عمارة النور',
    company: 'شركة التعاونية للتأمين', type: 'شامل',
    start: '2025-12-01', end: '2026-11-30',
    premium: 7200, coverage: 2500000, status: 'نشط',
    deductible: 4000, agent: 'علي الزهراني', phone: '0501234567'
  },
];

const CLAIMS = [
  { id: 1, policy: 'POL-2024-001', property: 'برج الرياض السكني', event: 'حريق في المطبخ - شقة 502', date: '2026-02-15', amount: 45000, status: 'مدفوع' },
  { id: 2, policy: 'POL-2024-002', property: 'مجمع الأندلس التجاري', event: 'تلف من فيضان', date: '2026-03-10', amount: 120000, status: 'قيد المعالجة' },
  { id: 3, policy: 'POL-2024-003', property: 'فيلا الواحة', event: 'كسر زجاج', date: '2025-11-20', amount: 3500, status: 'مدفوع' },
];

const STATUS_STYLE: Record<string, string> = {
  'نشط': 'bg-green-100 text-green-700',
  'منتهي قريباً': 'bg-yellow-100 text-yellow-700',
  'منتهي': 'bg-red-100 text-red-700',
};

const CLAIM_STATUS: Record<string, string> = {
  'مدفوع': 'bg-green-100 text-green-700',
  'قيد المعالجة': 'bg-blue-100 text-blue-700',
  'مرفوض': 'bg-red-100 text-red-700',
};

export default function InsurancePage() {
  const [tab, setTab] = useState<'policies' | 'claims'>('policies');
  const totalPremium = POLICIES.reduce((s, p) => s + p.premium, 0);
  const totalCoverage = POLICIES.reduce((s, p) => s + p.coverage, 0);
  const expiringSoon = POLICIES.filter(p => p.status === 'منتهي قريباً').length;
  const activePolicies = POLICIES.filter(p => p.status === 'نشط').length;

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">التأمين على العقارات</h1>
            <p className="text-muted-foreground mt-1">إدارة وثائق التأمين والمطالبات</p>
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            إضافة وثيقة تأمين
          </Button>
        </div>

        {/* إحصائيات */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{activePolicies}</div>
            <div className="text-xs text-muted-foreground mt-1">وثائق نشطة</div>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{expiringSoon}</div>
            <div className="text-xs text-muted-foreground mt-1">تنتهي قريباً</div>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{totalPremium.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground mt-1">إجمالي الأقساط (ر.س)</div>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{(totalCoverage / 1000000).toFixed(1)}م</div>
            <div className="text-xs text-muted-foreground mt-1">إجمالي التغطية (ر.س)</div>
          </CardContent></Card>
        </div>

        {/* تنبيه الوثائق المنتهية قريباً */}
        {expiringSoon > 0 && (
          <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0" />
            <div>
              <div className="font-medium text-yellow-800">تنبيه: وثيقة تأمين تنتهي خلال 30 يوماً</div>
              <div className="text-sm text-yellow-700">يرجى التواصل مع شركة التأمين لتجديد الوثيقة قبل انتهائها</div>
            </div>
          </div>
        )}

        {/* تبويبات */}
        <div className="flex gap-2 border-b pb-2">
          <Button variant={tab === 'policies' ? 'default' : 'ghost'} size="sm" onClick={() => setTab('policies')}>
            <Shield className="w-4 h-4 ml-1" />الوثائق
          </Button>
          <Button variant={tab === 'claims' ? 'default' : 'ghost'} size="sm" onClick={() => setTab('claims')}>
            <FileText className="w-4 h-4 ml-1" />المطالبات
          </Button>
        </div>

        {tab === 'policies' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {POLICIES.map(p => (
              <Card key={p.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base">{p.property}</CardTitle>
                      <div className="text-xs text-muted-foreground">{p.company}</div>
                    </div>
                    <Badge className={STATUS_STYLE[p.status]} variant="outline">{p.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-muted-foreground">رقم الوثيقة: </span><span className="font-mono">{p.policy}</span></div>
                    <div><span className="text-muted-foreground">النوع: </span>{p.type}</div>
                    <div><span className="text-muted-foreground">القسط السنوي: </span><span className="font-bold text-primary">{p.premium.toLocaleString()} ر.س</span></div>
                    <div><span className="text-muted-foreground">التغطية: </span>{p.coverage.toLocaleString()} ر.س</div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-muted-foreground text-xs">{p.start} → {p.end}</span>
                    </div>
                    <div><span className="text-muted-foreground">الوكيل: </span>{p.agent}</div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button variant="outline" size="sm" className="flex-1 text-xs">عرض الوثيقة</Button>
                    <Button variant="outline" size="sm" className="flex-1 text-xs">تجديد</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {tab === 'claims' && (
          <Card>
            <CardHeader><CardTitle>المطالبات التأمينية</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {CLAIMS.map(c => (
                  <div key={c.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/20">
                    <div>
                      <div className="font-medium text-sm">{c.event}</div>
                      <div className="text-xs text-muted-foreground">{c.property} • {c.date}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-bold">{c.amount.toLocaleString()} ر.س</div>
                      </div>
                      <Badge className={CLAIM_STATUS[c.status]} variant="outline">{c.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
