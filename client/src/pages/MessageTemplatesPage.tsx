/*
 * قوالب الرسائل - رمز الإبداع
 * إنشاء وتخصيص وإرسال قوالب WhatsApp / SMS / البريد الإلكتروني
 */
import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  MessageSquare, Send, Edit3, Copy, Plus, Search, CheckCircle,
  Smartphone, Mail, Phone, Star, Trash2, Eye, Save, X,
  RefreshCw, Users, ChevronDown
} from 'lucide-react';

interface MsgTemplate {
  id: number;
  title: string;
  channel: 'whatsapp' | 'sms' | 'email';
  category: string;
  body: string;
  variables: string[];
  favorite: boolean;
  usageCount: number;
}

const VARS_DESC: Record<string, string> = {
  '{{اسم_المستأجر}}': 'اسم المستأجر',
  '{{اسم_العقار}}': 'اسم العقار',
  '{{رقم_الوحدة}}': 'رقم الوحدة',
  '{{المبلغ}}': 'مبلغ الإيجار',
  '{{تاريخ_الاستحقاق}}': 'تاريخ استحقاق الدفعة',
  '{{تاريخ_انتهاء_العقد}}': 'تاريخ انتهاء العقد',
  '{{أيام_المتبقية}}': 'عدد الأيام المتبقية',
  '{{رقم_العقد}}': 'رقم العقد',
  '{{اسم_الشركة}}': 'اسم شركة الإدارة',
  '{{رقم_الجوال}}': 'رقم جوال الشركة',
  '{{موعد_الصيانة}}': 'موعد الصيانة',
  '{{اسم_الفني}}': 'اسم الفني',
};

const DEFAULT_TEMPLATES: MsgTemplate[] = [
  // واتساب
  {
    id: 1, title: 'تذكير استحقاق الإيجار', channel: 'whatsapp', category: 'إيجار', favorite: true, usageCount: 142,
    variables: ['{{اسم_المستأجر}}', '{{اسم_العقار}}', '{{المبلغ}}', '{{تاريخ_الاستحقاق}}', '{{اسم_الشركة}}', '{{رقم_الجوال}}'],
    body: `السلام عليكم ورحمة الله وبركاته 🌟

عزيزنا {{اسم_المستأجر}} حفظك الله،

نُذكّركم بأن دفعة الإيجار الخاصة بوحدتكم في عقار *{{اسم_العقار}}* مستحقة بتاريخ *{{تاريخ_الاستحقاق}}*.

💰 *المبلغ المستحق:* {{المبلغ}} ريال سعودي

يمكنكم السداد عبر:
• تحويل بنكي
• تطبيق أبشر pay
• مراجعة مكتبنا

للاستفسار: {{رقم_الجوال}}
شاكرين تعاونكم 🙏

{{اسم_الشركة}}`,
  },
  {
    id: 2, title: 'إنذار تأخر السداد', channel: 'whatsapp', category: 'تحصيل', favorite: true, usageCount: 89,
    variables: ['{{اسم_المستأجر}}', '{{المبلغ}}', '{{أيام_المتبقية}}', '{{اسم_العقار}}', '{{رقم_الجوال}}'],
    body: `السلام عليكم،

عزيزنا {{اسم_المستأجر}}،

⚠️ نُحيطكم علماً بأن دفعة الإيجار المستحقة بمبلغ *{{المبلغ}} ريال* لم يتم استلامها حتى الآن.

يُرجى تسوية المبلغ خلال *{{أيام_المتبقية}} أيام* من تاريخ هذه الرسالة تجنباً لأي إجراءات نظامية.

للتواصل: {{رقم_الجوال}}

{{اسم_الشركة}}`,
  },
  {
    id: 3, title: 'تجديد عقد الإيجار', channel: 'whatsapp', category: 'عقود', favorite: false, usageCount: 67,
    variables: ['{{اسم_المستأجر}}', '{{رقم_الوحدة}}', '{{اسم_العقار}}', '{{تاريخ_انتهاء_العقد}}', '{{أيام_المتبقية}}', '{{رقم_الجوال}}'],
    body: `السلام عليكم ورحمة الله 🌿

عزيزنا {{اسم_المستأجر}}،

نُهديكم أطيب التحيات ونُذكّركم بأن عقد إيجار وحدتكم *{{رقم_الوحدة}}* في عقار *{{اسم_العقار}}* ينتهي بتاريخ *{{تاريخ_انتهاء_العقد}}*، أي بعد *{{أيام_المتبقية}} يوماً*.

نرجو التواصل معنا لترتيب تجديد العقد وضمان استمرارية إقامتكم.

📞 للتواصل: {{رقم_الجوال}}

مع تقديرنا واحترامنا 🌟`,
  },
  {
    id: 4, title: 'ترحيب مستأجر جديد', channel: 'whatsapp', category: 'تعريفي', favorite: true, usageCount: 54,
    variables: ['{{اسم_المستأجر}}', '{{رقم_الوحدة}}', '{{اسم_العقار}}', '{{اسم_الشركة}}', '{{رقم_الجوال}}'],
    body: `مرحباً بكم في عائلة {{اسم_الشركة}} 🎉

عزيزنا {{اسم_المستأجر}}،

يسعدنا الترحيب بكم مستأجراً كريماً في وحدة *{{رقم_الوحدة}}* بعقار *{{اسم_العقار}}*.

📋 معلومات مهمة:
• في حال وجود أي عطل أو مشكلة يرجى الإبلاغ فوراً
• تواصلوا معنا على: {{رقم_الجوال}}
• ساعات العمل: 8 صباحاً - 5 مساءً

نتمنى لكم إقامة سعيدة ومريحة 🏠

{{اسم_الشركة}}`,
  },
  {
    id: 5, title: 'موعد زيارة الصيانة', channel: 'whatsapp', category: 'صيانة', favorite: false, usageCount: 38,
    variables: ['{{اسم_المستأجر}}', '{{موعد_الصيانة}}', '{{اسم_الفني}}', '{{رقم_الجوال}}'],
    body: `السلام عليكم،

عزيزنا {{اسم_المستأجر}}،

🔧 نُحيطكم علماً بأن الفني المختص سيزور وحدتكم لإجراء أعمال الصيانة المطلوبة.

📅 موعد الزيارة: *{{موعد_الصيانة}}*
👨‍🔧 الفني: {{اسم_الفني}}

يُرجى التأكد من وجود أحد أفراد الأسرة في الموعد المحدد.

للاستفسار: {{رقم_الجوال}}`,
  },
  {
    id: 6, title: 'تأكيد استلام الدفعة', channel: 'whatsapp', category: 'إيجار', favorite: false, usageCount: 198,
    variables: ['{{اسم_المستأجر}}', '{{المبلغ}}', '{{اسم_العقار}}', '{{رقم_الوحدة}}', '{{اسم_الشركة}}'],
    body: `✅ تم استلام دفعتكم

عزيزنا {{اسم_المستأجر}}،

نُؤكد لكم استلام مبلغ *{{المبلغ}} ريال سعودي* كدفعة إيجار الوحدة *{{رقم_الوحدة}}* بعقار *{{اسم_العقار}}*.

شكراً لالتزامكم وحسن تعاملكم 💚

{{اسم_الشركة}}`,
  },
  // SMS
  {
    id: 7, title: 'تذكير استحقاق - SMS', channel: 'sms', category: 'إيجار', favorite: false, usageCount: 76,
    variables: ['{{اسم_المستأجر}}', '{{المبلغ}}', '{{تاريخ_الاستحقاق}}', '{{رقم_الجوال}}'],
    body: `{{اسم_المستأجر}} - تذكير: إيجارك {{المبلغ}} ر.س مستحق {{تاريخ_الاستحقاق}}. للسداد: {{رقم_الجوال}} - رمز ابداء`,
  },
  {
    id: 8, title: 'إنذار تأخر - SMS', channel: 'sms', category: 'تحصيل', favorite: false, usageCount: 43,
    variables: ['{{اسم_المستأجر}}', '{{المبلغ}}', '{{رقم_الجوال}}'],
    body: `{{اسم_المستأجر}} - تأخرت دفعة الإيجار {{المبلغ}} ر.س. تواصل فوراً: {{رقم_الجوال}} - رمز ابداء`,
  },
  // بريد إلكتروني
  {
    id: 9, title: 'إشعار تجديد العقد - بريد', channel: 'email', category: 'عقود', favorite: false, usageCount: 31,
    variables: ['{{اسم_المستأجر}}', '{{رقم_العقد}}', '{{تاريخ_انتهاء_العقد}}', '{{اسم_الشركة}}'],
    body: `الموضوع: إشعار تجديد عقد الإيجار رقم {{رقم_العقد}}

السيد/السيدة {{اسم_المستأجر}} المحترم/ة،

تحية طيبة وبعد،

نُفيدكم بأن عقد الإيجار رقم {{رقم_العقد}} المبرم بيننا وبينكم ينتهي بتاريخ {{تاريخ_انتهاء_العقد}}.

نأمل التواصل معنا قبل 30 يوم من تاريخ الانتهاء لمناقشة إمكانية التجديد والشروط المتعلقة به.

مع وافر الاحترام والتقدير،
{{اسم_الشركة}}`,
  },
  {
    id: 10, title: 'إيصال الدفعة - بريد', channel: 'email', category: 'إيجار', favorite: false, usageCount: 87,
    variables: ['{{اسم_المستأجر}}', '{{المبلغ}}', '{{رقم_العقد}}', '{{اسم_العقار}}', '{{اسم_الشركة}}'],
    body: `الموضوع: تأكيد استلام دفعة الإيجار

السيد/السيدة {{اسم_المستأجر}} المحترم/ة،

يسعدنا إفادتكم باستلام دفعة الإيجار:
- المبلغ: {{المبلغ}} ريال سعودي
- العقار: {{اسم_العقار}}
- رقم العقد: {{رقم_العقد}}

مرفق إيصال الاستلام الرسمي.

مع التقدير،
{{اسم_الشركة}}`,
  },
];

const CHANNEL_CONFIG = {
  whatsapp: { label: 'واتساب', color: 'bg-green-100 text-green-700', icon: MessageSquare, maxChars: 4096 },
  sms: { label: 'رسالة SMS', color: 'bg-blue-100 text-blue-700', icon: Smartphone, maxChars: 160 },
  email: { label: 'بريد إلكتروني', color: 'bg-purple-100 text-purple-700', icon: Mail, maxChars: 10000 },
};

const CATEGORIES_LIST = ['الكل', 'إيجار', 'تحصيل', 'عقود', 'صيانة', 'تعريفي'];

export default function MessageTemplatesPage() {
  const [templates, setTemplates] = useState<MsgTemplate[]>(DEFAULT_TEMPLATES);
  const [search, setSearch] = useState('');
  const [channelFilter, setChannelFilter] = useState<string>('الكل');
  const [catFilter, setCatFilter] = useState('الكل');
  const [editing, setEditing] = useState<MsgTemplate | null>(null);
  const [preview, setPreview] = useState<MsgTemplate | null>(null);
  const [copied, setCopied] = useState<number | null>(null);
  const [testValues, setTestValues] = useState<Record<string, string>>({});

  const filtered = templates.filter(t => {
    const matchSearch = !search || t.title.includes(search) || t.body.includes(search);
    const matchChannel = channelFilter === 'الكل' || t.channel === channelFilter;
    const matchCat = catFilter === 'الكل' || t.category === catFilter;
    return matchSearch && matchChannel && matchCat;
  });

  const toggleFav = (id: number) => setTemplates(prev => prev.map(t => t.id === id ? { ...t, favorite: !t.favorite } : t));

  const copyTemplate = (t: MsgTemplate) => {
    navigator.clipboard.writeText(t.body).catch(() => {});
    setCopied(t.id);
    setTimeout(() => setCopied(null), 2000);
  };

  const getPreviewText = (t: MsgTemplate) => {
    let text = t.body;
    t.variables.forEach(v => {
      text = text.replace(new RegExp(v.replace(/[{}]/g, '\\$&'), 'g'), testValues[v] || v);
    });
    return text;
  };

  const newTemplate = () => setEditing({
    id: Date.now(), title: '', channel: 'whatsapp', category: 'إيجار',
    body: '', variables: [], favorite: false, usageCount: 0,
  });

  const saveTemplate = () => {
    if (!editing) return;
    const vars = Array.from(editing.body.matchAll(/\{\{[^}]+\}\}/g)).map(m => m[0]);
    const updated = { ...editing, variables: Array.from(new Set(vars)) };
    setTemplates(prev => {
      const exists = prev.find(t => t.id === updated.id);
      return exists ? prev.map(t => t.id === updated.id ? updated : t) : [...prev, updated];
    });
    setEditing(null);
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">قوالب الرسائل</h1>
            <p className="text-muted-foreground mt-1">قوالب واتساب وSMS والبريد الإلكتروني</p>
          </div>
          <Button className="gap-2" onClick={newTemplate}>
            <Plus className="w-4 h-4" />
            قالب جديد
          </Button>
        </div>

        {/* إحصائيات */}
        <div className="grid grid-cols-3 gap-4">
          {(['whatsapp', 'sms', 'email'] as const).map(ch => {
            const cfg = CHANNEL_CONFIG[ch];
            const Icon = cfg.icon;
            const count = templates.filter(t => t.channel === ch).length;
            const total = templates.filter(t => t.channel === ch).reduce((s, t) => s + t.usageCount, 0);
            return (
              <Card key={ch} className={`cursor-pointer ${channelFilter === ch ? 'ring-2 ring-primary' : ''}`} onClick={() => setChannelFilter(channelFilter === ch ? 'الكل' : ch)}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${cfg.color}`}><Icon className="w-5 h-5" /></div>
                  <div>
                    <div className="font-bold">{count} قالب</div>
                    <div className="text-xs text-muted-foreground">{cfg.label} • {total} استخدام</div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* فلاتر */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="بحث في القوالب..." className="pr-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-1 flex-wrap">
            {['الكل', 'واتساب', 'SMS', 'بريد'].map((label, i) => {
              const val = ['الكل', 'whatsapp', 'sms', 'email'][i];
              return (
                <Button key={label} variant={channelFilter === val ? 'default' : 'outline'} size="sm" onClick={() => setChannelFilter(val)}>
                  {label}
                </Button>
              );
            })}
          </div>
          <div className="flex gap-1 flex-wrap">
            {CATEGORIES_LIST.map(cat => (
              <Button key={cat} variant={catFilter === cat ? 'default' : 'outline'} size="sm" onClick={() => setCatFilter(cat)}>
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {/* قائمة القوالب */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map(t => {
            const ch = CHANNEL_CONFIG[t.channel];
            const ChIcon = ch.icon;
            const isCopied = copied === t.id;
            return (
              <Card key={t.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className={ch.color} variant="outline">
                        <ChIcon className="w-3 h-3 ml-1" />{ch.label}
                      </Badge>
                      <Badge variant="outline" className="text-xs">{t.category}</Badge>
                      {t.favorite && <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />}
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => toggleFav(t.id)} className="p-1 rounded hover:bg-muted transition-colors">
                        {t.favorite ? <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" /> : <Star className="w-3.5 h-3.5 text-muted-foreground" />}
                      </button>
                      <button onClick={() => setEditing(t)} className="p-1 rounded hover:bg-muted transition-colors">
                        <Edit3 className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                  <CardTitle className="text-sm mt-1">{t.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* معاينة نص مختصر */}
                  <div className="bg-muted/40 rounded-lg p-3 text-xs leading-relaxed text-muted-foreground line-clamp-3 whitespace-pre-line">
                    {t.body}
                  </div>
                  {/* المتغيرات */}
                  <div className="flex flex-wrap gap-1">
                    {t.variables.slice(0, 4).map(v => (
                      <span key={v} className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">{v}</span>
                    ))}
                    {t.variables.length > 4 && <span className="text-[10px] text-muted-foreground">+{t.variables.length - 4} متغير</span>}
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>استُخدم {t.usageCount} مرة</span>
                    <span>{t.body.length} حرف</span>
                  </div>
                  {/* أزرار */}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 text-xs gap-1" onClick={() => { setPreview(t); setTestValues({}); }}>
                      <Eye className="w-3 h-3" />معاينة
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 text-xs gap-1" onClick={() => copyTemplate(t)}>
                      {isCopied ? <CheckCircle className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                      {isCopied ? 'تم النسخ!' : 'نسخ'}
                    </Button>
                    <Button size="sm" className="flex-1 text-xs gap-1">
                      <Send className="w-3 h-3" />إرسال
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* نافذة المعاينة التفاعلية */}
        {preview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setPreview(null)}>
            <div className="bg-background rounded-xl max-w-2xl w-full shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="font-bold">{preview.title}</h2>
                <Button size="sm" variant="ghost" onClick={() => setPreview(null)}><X className="w-4 h-4" /></Button>
              </div>
              <div className="p-5 space-y-4">
                {/* متغيرات الاختبار */}
                <div>
                  <div className="text-sm font-medium mb-2">تعبئة المتغيرات للمعاينة:</div>
                  <div className="grid grid-cols-2 gap-2">
                    {preview.variables.map(v => (
                      <div key={v}>
                        <label className="text-xs text-muted-foreground">{VARS_DESC[v] || v}</label>
                        <Input
                          placeholder={v}
                          value={testValues[v] || ''}
                          onChange={e => setTestValues(prev => ({ ...prev, [v]: e.target.value }))}
                          className="h-8 text-xs mt-0.5"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                {/* معاينة النص */}
                <div>
                  <div className="text-sm font-medium mb-2">معاينة الرسالة:</div>
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm whitespace-pre-wrap text-gray-800 leading-7 min-h-[100px]" dir="rtl">
                    {getPreviewText(preview)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 text-left">{getPreviewText(preview).length} حرف</div>
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1 gap-2" onClick={() => copyTemplate(preview)}>
                    <Copy className="w-4 h-4" />نسخ الرسالة
                  </Button>
                  <Button variant="outline" className="flex-1 gap-2">
                    <Users className="w-4 h-4" />إرسال للمستأجرين
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* نافذة تعديل / إنشاء القالب */}
        {editing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setEditing(null)}>
            <div className="bg-background rounded-xl max-w-xl w-full shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="font-bold">{editing.id && templates.find(t => t.id === editing.id) ? 'تعديل القالب' : 'قالب جديد'}</h2>
                <Button size="sm" variant="ghost" onClick={() => setEditing(null)}><X className="w-4 h-4" /></Button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="text-sm font-medium">عنوان القالب</label>
                  <Input value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} placeholder="مثال: تذكير الإيجار الشهري" className="mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium">القناة</label>
                    <select
                      value={editing.channel}
                      onChange={e => setEditing({ ...editing, channel: e.target.value as any })}
                      className="mt-1 w-full border rounded-md px-3 py-2 text-sm bg-background"
                    >
                      <option value="whatsapp">واتساب</option>
                      <option value="sms">SMS</option>
                      <option value="email">بريد إلكتروني</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">الفئة</label>
                    <select
                      value={editing.category}
                      onChange={e => setEditing({ ...editing, category: e.target.value })}
                      className="mt-1 w-full border rounded-md px-3 py-2 text-sm bg-background"
                    >
                      {['إيجار', 'تحصيل', 'عقود', 'صيانة', 'تعريفي', 'أخرى'].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">نص الرسالة</label>
                  <div className="text-xs text-muted-foreground mt-0.5 mb-1">
                    استخدم المتغيرات: {'{{اسم_المستأجر}}'} {'{{المبلغ}}'} {'{{تاريخ_الاستحقاق}}'} {'{{اسم_العقار}}'}
                  </div>
                  <Textarea
                    value={editing.body}
                    onChange={e => setEditing({ ...editing, body: e.target.value })}
                    placeholder="اكتب نص الرسالة هنا..."
                    rows={8}
                    className="text-sm leading-relaxed"
                    dir="rtl"
                  />
                  <div className="text-xs text-muted-foreground mt-1 text-left">{editing.body.length} / {CHANNEL_CONFIG[editing.channel].maxChars} حرف</div>
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1 gap-2" onClick={saveTemplate}>
                    <Save className="w-4 h-4" />حفظ القالب
                  </Button>
                  <Button variant="outline" onClick={() => setEditing(null)}>إلغاء</Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
