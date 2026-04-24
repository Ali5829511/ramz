/*
 * مركز التنبيهات التلقائية - رمز الإبداع
 * إعداد ومتابعة التنبيهات التلقائية لانتهاء العقود وتأخر الدفعات والصيانة
 */
import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useMultiEntityData } from '@/hooks/useEntityData';
import {
  Bell, BellOff, AlertTriangle, CheckCircle, Clock, Calendar,
  DollarSign, FileText, Wrench, MessageSquare, Settings, Play,
  Pause, RefreshCw, ChevronRight, Send, Eye, Filter, ArrowRight
} from 'lucide-react';

// ================================
// إعدادات التنبيهات
// ================================
interface AlertRule {
  id: string;
  title: string;
  trigger: string;
  channel: 'whatsapp' | 'sms' | 'email' | 'system';
  timing: string;
  enabled: boolean;
  templateId?: number;
  sentCount: number;
  icon: any;
  color: string;
}

const ALERT_RULES: AlertRule[] = [
  {
    id: 'lease_expiry_90', title: 'انتهاء العقد - 90 يوم', icon: FileText, color: 'text-blue-600',
    trigger: 'قبل انتهاء العقد بـ 90 يوم', channel: 'whatsapp', timing: 'تلقائي - يومي 9 صباحاً',
    enabled: true, sentCount: 12,
  },
  {
    id: 'lease_expiry_30', title: 'انتهاء العقد - 30 يوم', icon: FileText, color: 'text-orange-600',
    trigger: 'قبل انتهاء العقد بـ 30 يوم', channel: 'whatsapp', timing: 'تلقائي - يومي 9 صباحاً',
    enabled: true, sentCount: 8,
  },
  {
    id: 'payment_due_3', title: 'استحقاق الدفعة - 3 أيام', icon: DollarSign, color: 'text-green-600',
    trigger: 'قبل تاريخ استحقاق الدفعة بـ 3 أيام', channel: 'whatsapp', timing: 'تلقائي - صباح كل يوم',
    enabled: true, sentCount: 67,
  },
  {
    id: 'payment_overdue_1', title: 'تأخر السداد - اليوم الأول', icon: DollarSign, color: 'text-red-600',
    trigger: 'بعد تاريخ الاستحقاق بيوم واحد', channel: 'whatsapp', timing: 'تلقائي - 10 صباحاً',
    enabled: true, sentCount: 34,
  },
  {
    id: 'payment_overdue_7', title: 'تأخر السداد - 7 أيام', icon: DollarSign, color: 'text-red-700',
    trigger: 'بعد تاريخ الاستحقاق بـ 7 أيام', channel: 'sms', timing: 'تلقائي - 10 صباحاً',
    enabled: true, sentCount: 19,
  },
  {
    id: 'maintenance_scheduled', title: 'تذكير موعد الصيانة', icon: Wrench, color: 'text-purple-600',
    trigger: 'قبل موعد الصيانة المجدولة بيوم', channel: 'whatsapp', timing: 'تلقائي - 8 صباحاً',
    enabled: false, sentCount: 5,
  },
  {
    id: 'birthday', title: 'تهنئة بالميلاد', icon: Bell, color: 'text-pink-600',
    trigger: 'في تاريخ ميلاد المستأجر', channel: 'whatsapp', timing: 'تلقائي - 9 صباحاً',
    enabled: false, sentCount: 3,
  },
  {
    id: 'monthly_report', title: 'تقرير المالك الشهري', icon: FileText, color: 'text-indigo-600',
    trigger: 'أول يوم من كل شهر', channel: 'email', timing: 'شهري - أول الشهر 8 صباحاً',
    enabled: true, sentCount: 6,
  },
  {
    id: 'insurance_expiry', title: 'انتهاء وثيقة التأمين', icon: AlertTriangle, color: 'text-yellow-600',
    trigger: 'قبل انتهاء وثيقة التأمين بـ 30 يوم', channel: 'system', timing: 'تلقائي - يومي',
    enabled: true, sentCount: 2,
  },
];

// ================================
// التنبيهات النشطة الحالية (محسوبة من البيانات)
// ================================
const CHANNEL_BADGE: Record<string, string> = {
  whatsapp: 'bg-green-100 text-green-700',
  sms: 'bg-blue-100 text-blue-700',
  email: 'bg-purple-100 text-purple-700',
  system: 'bg-gray-100 text-gray-700',
};
const CHANNEL_LABEL: Record<string, string> = {
  whatsapp: 'واتساب', sms: 'SMS', email: 'بريد', system: 'نظام',
};

// تاريخ اليوم
const TODAY = new Date();
const addDays = (d: number) => new Date(TODAY.getTime() + d * 86400000).toISOString().split('T')[0];

export default function AlertsCenter() {
  const { data, loading } = useMultiEntityData([
    { name: 'Lease', limit: 500 },
    { name: 'Payment', limit: 500 },
  ]);

  const leases = data.Lease || [];
  const payments = data.Payment || [];

  const [rules, setRules] = useState<AlertRule[]>(ALERT_RULES);
  const [tab, setTab] = useState<'active' | 'rules' | 'history'>('active');
  const [sending, setSending] = useState<string | null>(null);

  // حساب التنبيهات النشطة
  const today = TODAY.toISOString().split('T')[0];
  const in30 = addDays(30);
  const in90 = addDays(90);

  const expiringIn30 = leases.filter(l => {
    const end = l['تاريخ_نهاية_العقد'] || '';
    const status = l['حالة_العقد'] || '';
    return status === 'نشط' && end >= today && end <= in30;
  });
  const expiringIn90 = leases.filter(l => {
    const end = l['تاريخ_نهاية_العقد'] || '';
    const status = l['حالة_العقد'] || '';
    return status === 'نشط' && end > in30 && end <= in90;
  });
  const overduePayments = payments.filter(p => {
    const status = p['حالة_القسط'] || '';
    return status === 'متأخر' || status === 'لم_يتم_الدفع' || status === 'مستحق';
  });
  const totalActive = expiringIn30.length + overduePayments.length + expiringIn90.length;

  const simulateSend = (ruleId: string) => {
    setSending(ruleId);
    setTimeout(() => setSending(null), 2000);
  };

  const toggleRule = (id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  const ACTIVE_ALERTS = [
    ...expiringIn30.map(l => ({
      id: `exp30_${l.id}`, type: 'انتهاء عقد', urgency: 'عالي',
      msg: `عقد ${l['اسم_المستأجر'] || 'مستأجر'} ينتهي ${l['تاريخ_نهاية_العقد']}`,
      icon: FileText, color: 'text-orange-600', bg: 'bg-orange-50',
    })),
    ...overduePayments.map(p => ({
      id: `pay_${p.id}`, type: 'تأخر سداد', urgency: 'عاجل',
      msg: `${p['اسم_المستأجر'] || 'مستأجر'} - ${p['مبلغ_الدفعة'] || p['المبلغ'] || 0} ر.س متأخرة`,
      icon: DollarSign, color: 'text-red-600', bg: 'bg-red-50',
    })),
    ...expiringIn90.map(l => ({
      id: `exp90_${l.id}`, type: 'انتهاء عقد', urgency: 'متوسط',
      msg: `عقد ${l['اسم_المستأجر'] || 'مستأجر'} ينتهي ${l['تاريخ_نهاية_العقد']}`,
      icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50',
    })),
  ];

  const URGENCY_BADGE: Record<string, string> = {
    'عاجل': 'bg-red-100 text-red-700',
    'عالي': 'bg-orange-100 text-orange-700',
    'متوسط': 'bg-yellow-100 text-yellow-700',
    'منخفض': 'bg-green-100 text-green-700',
  };

  // سجل التنبيهات المرسلة (محاكاة)
  const HISTORY = [
    { date: '2026-04-24 09:02', rule: 'استحقاق الدفعة - 3 أيام', recipient: 'أحمد محمد العتيبي', channel: 'whatsapp', status: 'تم الإرسال' },
    { date: '2026-04-24 09:02', rule: 'استحقاق الدفعة - 3 أيام', recipient: 'فهد عبدالله الشمري', channel: 'whatsapp', status: 'تم الإرسال' },
    { date: '2026-04-23 10:05', rule: 'تأخر السداد - اليوم الأول', recipient: 'عمر حسن الزهراني', channel: 'whatsapp', status: 'تم الإرسال' },
    { date: '2026-04-23 10:05', rule: 'تأخر السداد - 7 أيام', recipient: 'عمر حسن الزهراني', channel: 'sms', status: 'تم الإرسال' },
    { date: '2026-04-20 09:00', rule: 'انتهاء العقد - 30 يوم', recipient: 'فهد عبدالله الشمري', channel: 'whatsapp', status: 'تم الإرسال' },
    { date: '2026-04-01 08:00', rule: 'تقرير المالك الشهري', recipient: 'عبدالله بن سعد الراشد', channel: 'email', status: 'تم الإرسال' },
  ];

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Bell className="w-6 h-6 text-primary" />
              مركز التنبيهات التلقائية
            </h1>
            <p className="text-muted-foreground mt-1">إدارة وإرسال التنبيهات التلقائية للمستأجرين والملاك</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Settings className="w-4 h-4" />إعدادات
            </Button>
            <Button className="gap-2">
              <RefreshCw className="w-4 h-4" />تشغيل الآن
            </Button>
          </div>
        </div>

        {/* ملخص */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-red-600">{totalActive}</div>
              <div className="text-xs text-muted-foreground mt-1">تنبيه نشط الآن</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-orange-600">{expiringIn30.length}</div>
              <div className="text-xs text-muted-foreground mt-1">عقد ينتهي خلال 30 يوم</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-yellow-600">{overduePayments.length}</div>
              <div className="text-xs text-muted-foreground mt-1">دفعة متأخرة</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-green-600">{rules.filter(r => r.enabled).length}</div>
              <div className="text-xs text-muted-foreground mt-1">قاعدة تنبيه مفعّلة</div>
            </CardContent>
          </Card>
        </div>

        {/* تبويبات */}
        <div className="flex border-b gap-1">
          {(['active', 'rules', 'history'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            >
              {t === 'active' ? `التنبيهات النشطة (${totalActive})` : t === 'rules' ? 'قواعد التنبيه' : 'سجل الإرسال'}
            </button>
          ))}
        </div>

        {/* تبويب التنبيهات النشطة */}
        {tab === 'active' && (
          <div className="space-y-3">
            {loading && <div className="text-center text-muted-foreground py-8">جاري تحميل البيانات...</div>}
            {!loading && ACTIVE_ALERTS.length === 0 && (
              <div className="text-center py-16">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="text-muted-foreground">لا توجد تنبيهات نشطة - كل شيء على ما يرام!</p>
              </div>
            )}
            {ACTIVE_ALERTS.map(alert => {
              const Icon = alert.icon;
              return (
                <Card key={alert.id} className={`border-r-4 ${alert.urgency === 'عاجل' ? 'border-r-red-500' : alert.urgency === 'عالي' ? 'border-r-orange-500' : 'border-r-blue-500'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${alert.bg}`}>
                          <Icon className={`w-4 h-4 ${alert.color}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{alert.msg}</span>
                            <Badge className={URGENCY_BADGE[alert.urgency]} variant="outline">{alert.urgency}</Badge>
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">{alert.type}</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="gap-1 text-xs">
                          <Eye className="w-3 h-3" />تفاصيل
                        </Button>
                        <Button size="sm" className="gap-1 text-xs">
                          <Send className="w-3 h-3" />إرسال تنبيه
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* تبويب قواعد التنبيه */}
        {tab === 'rules' && (
          <div className="space-y-3">
            {rules.map(rule => {
              const Icon = rule.icon;
              const isRunning = sending === rule.id;
              return (
                <Card key={rule.id} className={!rule.enabled ? 'opacity-60' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${rule.enabled ? 'bg-primary/10' : 'bg-muted'}`}>
                          <Icon className={`w-4 h-4 ${rule.enabled ? rule.color : 'text-muted-foreground'}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{rule.title}</span>
                            <Badge className={CHANNEL_BADGE[rule.channel]} variant="outline">
                              {CHANNEL_LABEL[rule.channel]}
                            </Badge>
                            {rule.enabled
                              ? <Badge className="bg-green-100 text-green-700" variant="outline"><CheckCircle className="w-2.5 h-2.5 ml-1" />نشط</Badge>
                              : <Badge className="bg-gray-100 text-gray-500" variant="outline"><BellOff className="w-2.5 h-2.5 ml-1" />موقف</Badge>
                            }
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {rule.trigger} • {rule.timing} • أُرسل {rule.sentCount} مرة
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm" variant="outline"
                          className="gap-1 text-xs"
                          onClick={() => simulateSend(rule.id)}
                          disabled={!rule.enabled || isRunning}
                        >
                          {isRunning
                            ? <><RefreshCw className="w-3 h-3 animate-spin" />جاري...</>
                            : <><Play className="w-3 h-3" />تشغيل</>
                          }
                        </Button>
                        <button
                          onClick={() => toggleRule(rule.id)}
                          className={`relative w-12 h-6 rounded-full transition-colors ${rule.enabled ? 'bg-primary' : 'bg-gray-300'}`}
                        >
                          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${rule.enabled ? 'right-1' : 'left-1'}`} />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* تبويب سجل الإرسال */}
        {tab === 'history' && (
          <Card>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="p-3 text-right font-medium">التاريخ والوقت</th>
                    <th className="p-3 text-right font-medium">نوع التنبيه</th>
                    <th className="p-3 text-right font-medium">المستلم</th>
                    <th className="p-3 text-right font-medium">القناة</th>
                    <th className="p-3 text-right font-medium">الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {HISTORY.map((h, i) => (
                    <tr key={i} className="border-b hover:bg-muted/20">
                      <td className="p-3 font-mono text-xs text-muted-foreground">{h.date}</td>
                      <td className="p-3">{h.rule}</td>
                      <td className="p-3">{h.recipient}</td>
                      <td className="p-3">
                        <Badge className={CHANNEL_BADGE[h.channel]} variant="outline">{CHANNEL_LABEL[h.channel]}</Badge>
                      </td>
                      <td className="p-3">
                        <Badge className="bg-green-100 text-green-700" variant="outline">
                          <CheckCircle className="w-2.5 h-2.5 ml-1" />{h.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
