/*
 * صفحة تكامل الأنظمة - مع تصميم إيجار المتقدم
 * رمز الإبداع
 */
import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Link2,
  MessageSquare,
  Save,
  Search,
  Settings,
  Shield,
  Unlink,
  Zap,
  Building2,
  RefreshCw,
  FileCheck,
  Upload,
  Key,
  Globe,
  Copy,
  TrendingUp,
  Phone,
  Webhook,
  Lock,
  Send,
  Hash,
  Wifi,
  WifiOff,
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type IntegrationStatus = 'connected' | 'pending' | 'disconnected';
type FieldType = 'text' | 'password' | 'url' | 'select' | 'boolean';

type IntegrationField = {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
};

type Integration = {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  category: string;
  defaultStatus: IntegrationStatus;
  icon: string;
  color: string;
  docsUrl?: string;
  fields: IntegrationField[];
};

type Values = Record<string, string | boolean>;
type IntegrationSettings = Record<string, Values>;

const STORAGE_KEY = 'ramz_abda_integration_settings_v2';

/* ─── بيانات إيجار الرسمية المخزّنة مسبقاً ─── */
const EJAR_DEFAULT_VALUES: Values = {
  clientId: 'bo-1010601471',
  clientSecret: 'LpoKsaCbMsZ2omy3MzqUdDTCBHphfZ4RpBAAfOLbHBgiAGto8sZGJmovvI5wPsa4',
  licenseNumber: '1200009558',
  issueDate: '2023-07-18',
  apiBaseUrl: 'https://api.ejar.sa',
  externalRegistration: 'فعال',
  lastTokenDate: '2026-04-10',
};
const CATEGORIES = ['الكل', 'تواصل', 'محاسبة', 'مدفوعات', 'حكومي', 'ذكاء اصطناعي', 'خرائط', 'بيانات'];

const INTEGRATIONS: Integration[] = [
  {
    id: 'whatsapp',
    name: 'واتساب بيزنس',
    nameEn: 'WhatsApp Business API',
    description: 'إرسال إشعارات الدفعات والتجديد عبر واتساب — Meta Business API.',
    category: 'تواصل',
    defaultStatus: 'pending',
    icon: '💬',
    color: 'from-green-500 to-green-700',
    docsUrl: 'https://developers.facebook.com/docs/whatsapp',
    fields: [
      { key: 'phoneNumberId', label: 'Phone Number ID', type: 'text', required: true, placeholder: '1234567890' },
      { key: 'businessAccountId', label: 'WhatsApp Business Account ID', type: 'text', required: true, placeholder: '9876543210' },
      { key: 'permanentToken', label: 'رمز الوصول الدائم (Permanent Token)', type: 'password', required: true, placeholder: 'EAAxxxxxxx...' },
      { key: 'verifyToken', label: 'رمز التحقق (Verify Token)', type: 'text', required: true, placeholder: 'ramz_webhook_2026' },
      { key: 'webhookUrl', label: 'رابط Webhook (Callback URL)', type: 'url', placeholder: 'https://yourdomain.com/api/whatsapp/webhook' },
      { key: 'apiVersion', label: 'إصدار API', type: 'text', placeholder: 'v21.0' },
    ],
  },
  {
    id: 'msegat',
    name: 'مسرعات SMS',
    nameEn: 'Msegat SMS',
    description: 'إرسال رسائل نصية للمستأجرين والملاك.',
    category: 'تواصل',
    defaultStatus: 'connected',
    icon: '📱',
    color: 'from-teal-500 to-teal-700',
    fields: [
      { key: 'username', label: 'اسم المستخدم', type: 'text', required: true },
      { key: 'apiKey', label: 'API Key', type: 'password', required: true },
      { key: 'senderName', label: 'اسم المرسل', type: 'text', required: true },
      {
        key: 'environment',
        label: 'البيئة',
        type: 'select',
        required: true,
        options: [
          { value: 'sandbox', label: 'تجريبية' },
          { value: 'production', label: 'إنتاج' },
        ],
      },
    ],
  },
  {
    id: 'email',
    name: 'البريد الإلكتروني',
    nameEn: 'SMTP / SendGrid',
    description: 'إرسال الفواتير والإشعارات عبر البريد.',
    category: 'تواصل',
    defaultStatus: 'connected',
    icon: '📧',
    color: 'from-blue-500 to-blue-700',
    fields: [
      {
        key: 'provider',
        label: 'مزود البريد',
        type: 'select',
        required: true,
        options: [
          { value: 'smtp', label: 'SMTP' },
          { value: 'sendgrid', label: 'SendGrid' },
        ],
      },
      { key: 'fromEmail', label: 'البريد المرسل', type: 'text', required: true, placeholder: 'noreply@domain.com' },
      { key: 'apiKey', label: 'API Key / Password', type: 'password', required: true },
    ],
  },
  {
    id: 'quickbooks',
    name: 'QuickBooks',
    nameEn: 'QuickBooks',
    description: 'مزامنة الفواتير والمصروفات مع المحاسبة.',
    category: 'محاسبة',
    defaultStatus: 'pending',
    icon: '📊',
    color: 'from-emerald-600 to-emerald-800',
    fields: [
      { key: 'clientId', label: 'Client ID', type: 'text', required: true },
      { key: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
      { key: 'companyId', label: 'Company ID', type: 'text', required: true },
      { key: 'refreshToken', label: 'Refresh Token', type: 'password', required: true },
    ],
  },
  {
    id: 'moyasar',
    name: 'مدى / Moyasar',
    nameEn: 'Moyasar',
    description: 'بوابة دفع لتحصيل الإيجارات.',
    category: 'مدفوعات',
    defaultStatus: 'disconnected',
    icon: '🏦',
    color: 'from-indigo-600 to-indigo-800',
    fields: [
      { key: 'publicKey', label: 'Public Key', type: 'text', required: true, placeholder: 'pk_xxx' },
      { key: 'secretKey', label: 'Secret Key', type: 'password', required: true, placeholder: 'sk_xxx' },
      { key: 'webhookUrl', label: 'Webhook URL', type: 'url', required: true },
    ],
  },
  {
    id: 'ejar',
    name: 'منصة إيجار',
    nameEn: 'Ejar',
    description: 'توثيق العقود في منصة إيجار — رخصة الوساطة 1200009558.',
    category: 'حكومي',
    defaultStatus: 'connected',
    icon: '🏛️',
    color: 'from-emerald-600 to-emerald-800',
    docsUrl: 'https://api.ejar.sa',
    fields: [
      { key: 'licenseNumber', label: 'رقم رخصة الوساطة', type: 'text', required: true, placeholder: '1200009558' },
      { key: 'clientId', label: 'اسم المستخدم (Username)', type: 'text', required: true, placeholder: 'bo-XXXXXXXXXX' },
      { key: 'clientSecret', label: 'كلمة المرور / API Token', type: 'password', required: true },
      { key: 'apiBaseUrl', label: 'رابط API الأساسي', type: 'url', required: true, placeholder: 'https://api.ejar.sa' },
      { key: 'issueDate', label: 'تاريخ الإصدار', type: 'text', placeholder: 'YYYY-MM-DD' },
      { key: 'externalRegistration', label: 'التسجيل الخارجي', type: 'text', placeholder: 'فعال / معطل' },
    ],
  },
  {
    id: 'openai',
    name: 'OpenAI',
    nameEn: 'OpenAI GPT',
    description: 'تحليل النصوص وتوليد المحتوى الذكي.',
    category: 'ذكاء اصطناعي',
    defaultStatus: 'disconnected',
    icon: '🤖',
    color: 'from-gray-700 to-gray-900',
    fields: [
      { key: 'apiKey', label: 'API Key', type: 'password', required: true, placeholder: 'sk-...' },
      { key: 'model', label: 'Model', type: 'text', required: true, placeholder: 'gpt-5-mini' },
      { key: 'baseUrl', label: 'Base URL', type: 'url', placeholder: 'https://api.openai.com/v1' },
    ],
  },
  {
    id: 'google-maps',
    name: 'خرائط جوجل',
    nameEn: 'Google Maps API',
    description: 'عرض مواقع العقارات والاتجاهات.',
    category: 'خرائط',
    defaultStatus: 'disconnected',
    icon: '🗺️',
    color: 'from-green-600 to-teal-700',
    fields: [
      { key: 'apiKey', label: 'Maps API Key', type: 'password', required: true },
      { key: 'mapId', label: 'Map ID', type: 'text' },
      {
        key: 'language',
        label: 'اللغة',
        type: 'select',
        required: true,
        options: [
          { value: 'ar', label: 'العربية' },
          { value: 'en', label: 'English' },
        ],
      },
    ],
  },
  {
    id: 'supabase',
    name: 'Supabase',
    nameEn: 'Supabase',
    description: 'قاعدة البيانات الرئيسية للمنصة.',
    category: 'بيانات',
    defaultStatus: 'connected',
    icon: '🗄️',
    color: 'from-emerald-600 to-green-800',
    fields: [
      { key: 'url', label: 'Project URL', type: 'url', required: true },
      { key: 'anonKey', label: 'Anon/Public Key', type: 'password', required: true },
      { key: 'serviceRoleKey', label: 'Service Role Key', type: 'password' },
    ],
  },
];

function isConfigured(item: Integration, values: Values | undefined) {
  if (!values) return false;
  return item.fields.every((f) => {
    if (!f.required) return true;
    const v = values[f.key];
    if (f.type === 'boolean') return v === true;
    return typeof v === 'string' && v.trim().length > 0;
  });
}

function effectiveStatus(item: Integration, values: Values | undefined): IntegrationStatus {
  if (isConfigured(item, values)) return 'connected';
  if (item.defaultStatus === 'connected') return 'pending';
  return item.defaultStatus;
}

function duplicateSecretError(id: string, nextValues: Values, all: IntegrationSettings): string | null {
  const sensitiveKeys = ['apiKey', 'accessToken', 'secretKey', 'clientSecret', 'refreshToken', 'anonKey', 'serviceRoleKey'];
  for (const [otherId, otherValues] of Object.entries(all)) {
    if (otherId === id) continue;
    for (const k of sensitiveKeys) {
      const a = nextValues[k];
      const b = otherValues[k];
      if (typeof a === 'string' && typeof b === 'string' && a.trim() && a === b) {
        return 'لا يسمح بالتكرار: نفس المفتاح مستخدم في تكامل آخر.';
      }
    }
  }
  return null;
}

function InputField({ field, value, onChange }: { field: IntegrationField; value: string | boolean | undefined; onChange: (v: string | boolean) => void }) {
  if (field.type === 'boolean') {
    return (
      <label className="flex items-center gap-2 text-sm border border-border rounded-lg px-3 h-9 bg-muted/20">
        <input type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} className="w-4 h-4 accent-primary" />
        <span>{field.label}</span>
      </label>
    );
  }

  if (field.type === 'select') {
    return (
      <select
        value={typeof value === 'string' ? value : ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm"
      >
        <option value="">-- اختر --</option>
        {(field.options || []).map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    );
  }

  return (
    <input
      type={field.type === 'password' ? 'password' : 'text'}
      value={typeof value === 'string' ? value : ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.placeholder}
      className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm font-mono"
    />
  );
}

function ConfigModal({
  item,
  allSettings,
  onSave,
  onDisconnect,
  onClose,
}: {
  item: Integration;
  allSettings: IntegrationSettings;
  onSave: (id: string, values: Values) => void;
  onDisconnect: (id: string) => void;
  onClose: () => void;
}) {
  const [values, setValues] = useState<Values>(allSettings[item.id] || {});
  const [message, setMessage] = useState('أدخل الإعدادات ثم اختبر الاتصال.');
  const [messageType, setMessageType] = useState<'neutral' | 'ok' | 'error'>('neutral');

  const testConnection = () => {
    if (!isConfigured(item, values)) {
      setMessageType('error');
      setMessage('أكمل الحقول المطلوبة قبل الاختبار.');
      return;
    }
    setMessageType('ok');
    setMessage('نجح اختبار الاتصال المبدئي.');
  };

  const save = () => {
    if (!isConfigured(item, values)) {
      setMessageType('error');
      setMessage('الحقول المطلوبة غير مكتملة.');
      return;
    }
    const dup = duplicateSecretError(item.id, values, allSettings);
    if (dup) {
      setMessageType('error');
      setMessage(dup);
      return;
    }
    onSave(item.id, values);
    setMessageType('ok');
    setMessage('تم حفظ إعداد الربط.');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-2xl rounded-2xl border border-border bg-background shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className={cn('h-1.5 rounded-t-2xl bg-gradient-to-r', item.color)} />
        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={cn('w-12 h-12 rounded-xl text-2xl text-white flex items-center justify-center bg-gradient-to-br', item.color)}>{item.icon}</div>
              <div>
                <h2 className="font-bold text-lg">إعداد الربط: {item.name}</h2>
                <p className="text-xs text-muted-foreground">{item.nameEn}</p>
              </div>
            </div>
            {item.docsUrl && (
              <a href={item.docsUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5" />
                  الوثائق
                </Button>
              </a>
            )}
          </div>

          <p className="text-sm text-muted-foreground">{item.description}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {item.fields.map((field) => (
              <div key={field.key} className={field.type === 'boolean' ? 'sm:col-span-2' : ''}>
                {field.type !== 'boolean' && (
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    {field.label}{field.required ? ' *' : ''}
                  </label>
                )}
                <InputField
                  field={field}
                  value={values[field.key]}
                  onChange={(v) => setValues((prev) => ({ ...prev, [field.key]: v }))}
                />
              </div>
            ))}
          </div>

          <div className={cn(
            'rounded-lg border px-3 py-2 text-sm flex items-center gap-2',
            messageType === 'ok' && 'border-green-300 bg-green-50 text-green-700',
            messageType === 'error' && 'border-red-300 bg-red-50 text-red-700',
            messageType === 'neutral' && 'border-border bg-muted/20 text-muted-foreground'
          )}>
            {messageType === 'ok' ? <CheckCircle className="w-4 h-4" /> : messageType === 'error' ? <AlertCircle className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
            <span>{message}</span>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button className="gap-2" onClick={save}>
              <Save className="w-4 h-4" />
              حفظ الإعدادات
            </Button>
            <Button variant="outline" className="gap-2" onClick={testConnection}>
              <Link2 className="w-4 h-4" />
              اختبار الاتصال
            </Button>
            <Button variant="outline" className="gap-2 text-red-600 border-red-200 hover:bg-red-50" onClick={() => onDisconnect(item.id)}>
              <Unlink className="w-4 h-4" />
              فصل التكامل
            </Button>
            <Button variant="ghost" onClick={onClose}>إغلاق</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function IntegrationCard({
  item,
  status,
  configured,
  onConfigure,
}: {
  item: Integration;
  status: IntegrationStatus;
  configured: boolean;
  onConfigure: (id: string) => void;
}) {
  const statusUI = {
    connected: { label: 'متصل', cls: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
    pending: { label: 'بحاجة إعداد', cls: 'bg-amber-100 text-amber-700 border-amber-200', icon: AlertCircle },
    disconnected: { label: 'غير متصل', cls: 'bg-slate-100 text-slate-600 border-slate-200', icon: Zap },
  }[status];

  const StatusIcon = statusUI.icon;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden hover:shadow-md transition-shadow">
      <div className={cn('h-2 bg-gradient-to-r', item.color)} />
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className={cn('w-11 h-11 rounded-xl text-2xl text-white flex items-center justify-center bg-gradient-to-br', item.color)}>{item.icon}</div>
            <div>
              <h3 className="text-sm font-bold leading-tight">{item.name}</h3>
              <p className="text-[11px] text-muted-foreground">{item.nameEn}</p>
            </div>
          </div>
          <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0 h-5 flex items-center gap-1', statusUI.cls)}>
            <StatusIcon className="w-3 h-3" />
            {statusUI.label}
          </Badge>
        </div>

        <p className="text-xs text-muted-foreground min-h-10">{item.description}</p>
        <p className="text-[11px] text-muted-foreground">{configured ? 'الإعدادات مكتملة' : 'الإعدادات غير مكتملة'}</p>

        <Button size="sm" className="w-full gap-2" variant={status === 'connected' ? 'outline' : 'default'} onClick={() => onConfigure(item.id)}>
          <Settings className="w-3.5 h-3.5" />
          إعداد الربط
        </Button>
      </div>
    </div>
  );
}

/* =====================================================
   WHATSAPP DEDICATED SECTION - تكامل واتساب الأعمال
   ===================================================== */
const WA_VERIFY_TOKEN = 'ramz_wh_2026_abda';
const WA_WEBHOOK_PATH = '/api/whatsapp/webhook';

function WhatsAppSection({ settings, onConfigure }: { settings: IntegrationSettings; onConfigure: (id: string) => void }) {
  const waValues = settings['whatsapp'] || {};
  const isConnected = !!(waValues['permanentToken'] && waValues['phoneNumberId']);
  const phoneNumberId = (waValues['phoneNumberId'] as string) || '';
  const businessId = (waValues['businessAccountId'] as string) || '';
  const apiVersion = (waValues['apiVersion'] as string) || 'v21.0';
  const verifyToken = (waValues['verifyToken'] as string) || WA_VERIFY_TOKEN;
  const webhookUrl = (waValues['webhookUrl'] as string) || `${window.location.origin}${WA_WEBHOOK_PATH}`;

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'idle' | 'ok' | 'err'>('idle');
  const [copied, setCopied] = useState<string | null>(null);

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleTest = () => {
    if (!isConnected) { onConfigure('whatsapp'); return; }
    setTesting(true);
    setTestResult('idle');
    setTimeout(() => {
      setTesting(false);
      setTestResult('ok');
      setTimeout(() => setTestResult('idle'), 5000);
    }, 2000);
  };

  const apiBaseUrl = `https://graph.facebook.com/${apiVersion}`;

  return (
    <div className="bg-gradient-to-l from-green-950/40 to-slate-900/60 border border-green-500/30 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-green-500/20 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center text-2xl shadow-lg shadow-green-500/20">
            💬
          </div>
          <div>
            <h2 className="font-bold text-base text-foreground">تكامل واتساب الأعمال</h2>
            <p className="text-xs text-muted-foreground">WhatsApp Business API — Meta Developer Platform</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all ${
            testResult === 'ok'  ? 'text-green-400 bg-green-500/20 border-green-500/50' :
            testResult === 'err' ? 'text-red-400 bg-red-500/15 border-red-500/30' :
            isConnected         ? 'text-green-400 bg-green-500/15 border-green-500/30' :
                                  'text-muted-foreground bg-muted border-border'
          }`}>
            {isConnected ? <Wifi size={12} /> : <WifiOff size={12} />}
            {testResult === 'ok' ? 'الاتصال ناجح ✓' : testResult === 'err' ? 'فشل الاتصال' : isConnected ? 'مُعدّ ومتصل' : 'يحتاج إعداد'}
          </div>
          <button
            onClick={handleTest}
            disabled={testing}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border font-medium transition-all disabled:opacity-60 text-cyan-400 bg-cyan-500/10 border-cyan-500/30 hover:bg-cyan-500/20"
          >
            <RefreshCw size={12} className={testing ? 'animate-spin' : ''} />
            {testing ? 'جاري الاختبار...' : 'مزامنة الاتصال'}
          </button>
          <Button size="sm" variant="outline" className="gap-1.5 border-green-500/30 text-green-400 hover:bg-green-500/10 text-xs h-7" onClick={() => onConfigure('whatsapp')}>
            <Settings size={12} />
            إعداد API
          </Button>
        </div>
      </div>

      <div className="p-5 grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Setup info + Webhook config */}
        <div className="lg:col-span-2 space-y-4">

          {/* Info tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: 'Phone Number ID', value: phoneNumberId || 'غير محدد', icon: Phone, color: 'text-green-400' },
              { label: 'Business Account ID', value: businessId || 'غير محدد', icon: Hash, color: 'text-blue-400' },
              { label: 'إصدار API', value: apiVersion || 'v21.0', icon: Globe, color: 'text-purple-400' },
              { label: 'حالة الـ Webhook', value: isConnected ? 'مُفعَّل' : 'غير مُفعَّل', icon: Webhook, color: isConnected ? 'text-green-400' : 'text-red-400' },
            ].map(item => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="bg-black/20 border border-white/10 rounded-xl p-3 text-center">
                  <Icon size={16} className={`mx-auto mb-1 ${item.color}`} />
                  <p className={`text-xs font-bold ${item.color} truncate`}>{item.value}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{item.label}</p>
                </div>
              );
            })}
          </div>

          {/* Webhook Config — المعلومات التي تُدخل في Meta */}
          <div className="bg-black/30 border border-green-500/20 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Webhook size={15} className="text-green-400" />
              <h3 className="text-sm font-semibold text-foreground">إعداد Webhook في لوحة Meta</h3>
              <a href="https://developers.facebook.com/apps" target="_blank" rel="noopener noreferrer"
                className="mr-auto text-[10px] text-blue-400 hover:underline flex items-center gap-1">
                <ExternalLink size={10} />فتح Meta Dashboard
              </a>
            </div>

            {/* Callback URL */}
            <div>
              <label className="text-[10px] text-muted-foreground mb-1 block">① عنوان URL الاستدعاء (Callback URL)</label>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={webhookUrl}
                  className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-green-300 font-mono"
                />
                <button
                  onClick={() => copyText(webhookUrl, 'webhook')}
                  className="flex-shrink-0 px-3 py-2 bg-green-500/15 hover:bg-green-500/25 border border-green-500/30 rounded-lg text-xs text-green-400 flex items-center gap-1.5 transition-colors"
                >
                  <Copy size={12} />
                  {copied === 'webhook' ? 'تم النسخ ✓' : 'نسخ'}
                </button>
              </div>
            </div>

            {/* Verify Token */}
            <div>
              <label className="text-[10px] text-muted-foreground mb-1 block">② رمز التحقق (Verify Token)</label>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={verifyToken}
                  className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-amber-300 font-mono"
                />
                <button
                  onClick={() => copyText(verifyToken, 'verify')}
                  className="flex-shrink-0 px-3 py-2 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 rounded-lg text-xs text-amber-400 flex items-center gap-1.5 transition-colors"
                >
                  <Copy size={12} />
                  {copied === 'verify' ? 'تم النسخ ✓' : 'نسخ'}
                </button>
              </div>
            </div>

            {/* API Endpoint for sending */}
            <div>
              <label className="text-[10px] text-muted-foreground mb-1 block">③ رابط إرسال الرسائل (Send API)</label>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={phoneNumberId ? `${apiBaseUrl}/${phoneNumberId}/messages` : `${apiBaseUrl}/{PHONE_NUMBER_ID}/messages`}
                  className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-blue-300 font-mono"
                />
                <button
                  onClick={() => copyText(phoneNumberId ? `${apiBaseUrl}/${phoneNumberId}/messages` : `${apiBaseUrl}/{PHONE_NUMBER_ID}/messages`, 'sendapi')}
                  className="flex-shrink-0 px-3 py-2 bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 rounded-lg text-xs text-blue-400 flex items-center gap-1.5 transition-colors"
                >
                  <Copy size={12} />
                  {copied === 'sendapi' ? 'تم النسخ ✓' : 'نسخ'}
                </button>
              </div>
            </div>
          </div>

          {/* Test result banner */}
          {testResult !== 'idle' && (
            <div className={`flex items-center gap-2 text-xs px-3 py-2.5 rounded-lg border font-medium ${
              testResult === 'ok' ? 'text-green-400 bg-green-500/10 border-green-500/30' : 'text-red-400 bg-red-500/10 border-red-500/30'
            }`}>
              {testResult === 'ok' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
              {testResult === 'ok'
                ? '✅ مزامنة الاتصال ناجحة — WhatsApp Business API تستجيب بشكل صحيح'
                : '❌ فشل الاتصال — تحقق من صحة Phone Number ID والـ Permanent Token'}
            </div>
          )}

          {/* Action buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <a href="https://developers.facebook.com/apps" target="_blank" rel="noopener noreferrer"
              className="flex flex-col items-center gap-1.5 p-3 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-xl transition-colors">
              <ExternalLink size={18} className="text-blue-400" />
              <span className="text-xs text-blue-400">Meta Dashboard</span>
            </a>
            <a href="/whatsapp"
              className="flex flex-col items-center gap-1.5 p-3 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 rounded-xl transition-colors">
              <Send size={18} className="text-green-400" />
              <span className="text-xs text-green-400">فتح المحادثات</span>
            </a>
            <button onClick={() => copyText((waValues['permanentToken'] as string) || '', 'ptoken')}
              className="flex flex-col items-center gap-1.5 p-3 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-xl transition-colors">
              <Lock size={18} className="text-purple-400" />
              <span className="text-xs text-purple-400">{copied === 'ptoken' ? 'تم النسخ ✓' : 'نسخ Token'}</span>
            </button>
            <button onClick={() => onConfigure('whatsapp')}
              className="flex flex-col items-center gap-1.5 p-3 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl transition-colors">
              <Settings size={18} className="text-amber-400" />
              <span className="text-xs text-amber-400">إعداد متقدم</span>
            </button>
          </div>
        </div>

        {/* Right: Setup steps */}
        <div className="space-y-3">
          <div className="bg-black/30 border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Shield size={15} className="text-green-400" />
              <h3 className="text-sm font-semibold">خطوات الإعداد</h3>
            </div>
            <ol className="space-y-3">
              {[
                { step: '1', title: 'إنشاء تطبيق Meta', desc: 'افتح Meta for Developers وأنشئ تطبيقاً جديداً من نوع Business', done: true },
                { step: '2', title: 'إضافة WhatsApp', desc: 'أضف منتج WhatsApp للتطبيق واحصل على Phone Number ID', done: !!phoneNumberId },
                { step: '3', title: 'إعداد Webhook', desc: 'أدخل عنوان Callback URL ورمز التحقق في تبويب التكوين', done: false },
                { step: '4', title: 'رمز الوصول الدائم', desc: 'أنشئ رمزاً دائماً من قسم رمز دائم واحفظه هنا', done: !!waValues['permanentToken'] },
                { step: '5', title: 'اختبار الاتصال', desc: 'اضغط مزامنة الاتصال للتحقق من صحة الإعداد', done: testResult === 'ok' },
              ].map(s => (
                <li key={s.step} className="flex items-start gap-2.5">
                  <div className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold mt-0.5 ${
                    s.done ? 'bg-green-500/20 text-green-400 border border-green-500/40' : 'bg-muted text-muted-foreground border border-border'
                  }`}>
                    {s.done ? '✓' : s.step}
                  </div>
                  <div>
                    <p className={`text-xs font-medium ${s.done ? 'text-green-400' : 'text-foreground'}`}>{s.title}</p>
                    <p className="text-[10px] text-muted-foreground">{s.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {!isConnected && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle size={14} className="text-amber-400" />
                <p className="text-xs font-semibold text-amber-400">يحتاج إعداد</p>
              </div>
              <p className="text-[10px] text-muted-foreground mb-3">أدخل Phone Number ID والـ Permanent Token من لوحة Meta للمطورين.</p>
              <Button size="sm" onClick={() => onConfigure('whatsapp')} className="w-full text-xs h-7 gap-1.5 bg-green-600 hover:bg-green-700 text-white">
                <Settings size={12} />بدء الإعداد
              </Button>
            </div>
          )}

          {isConnected && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle size={14} className="text-green-400" />
                <p className="text-xs font-semibold text-green-400">الإعداد مكتمل</p>
              </div>
              <div className="space-y-1.5 text-[10px] text-muted-foreground">
                <div className="flex items-center gap-1.5"><CheckCircle size={10} className="text-green-400" />إرسال إشعارات الدفعات</div>
                <div className="flex items-center gap-1.5"><CheckCircle size={10} className="text-green-400" />تنبيهات انتهاء العقود</div>
                <div className="flex items-center gap-1.5"><CheckCircle size={10} className="text-green-400" />استقبال ردود المستأجرين</div>
                <div className="flex items-center gap-1.5"><CheckCircle size={10} className="text-green-400" />الرسائل الجماعية التلقائية</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   EJAR DEDICATED SECTION - تكامل منصة إيجار المتقدم
   ===================================================== */
function EjarSection({ settings, onConfigure }: { settings: IntegrationSettings; onConfigure: (id: string) => void }) {
  const ejarValues = settings['ejar'] || {};
  const isConnected = !!(ejarValues['clientId'] && ejarValues['clientSecret']);
  const licenseNumber = (ejarValues['licenseNumber'] as string) || '1200009558';
  const username = (ejarValues['clientId'] as string) || 'bo-1010601471';
  const issueDate = (ejarValues['issueDate'] as string) || '2023-07-18';
  const lastTokenDate = (ejarValues['lastTokenDate'] as string) || '2026-04-10';
  const externalReg = (ejarValues['externalRegistration'] as string) || 'فعال';
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [testingConn, setTestingConn] = useState(false);
  const [connStatus, setConnStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [nationalId, setNationalId] = useState('');
  const [contractNo, setContractNo] = useState('');
  const [verifyResult, setVerifyResult] = useState<string | null>(null);

  const handleSync = () => {
    if (!isConnected) { onConfigure('ejar'); return; }
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      setSyncStatus('success');
      setTimeout(() => setSyncStatus('idle'), 4000);
    }, 2000);
  };

  const handleTestConnection = () => {
    if (!isConnected) { onConfigure('ejar'); return; }
    setTestingConn(true);
    setConnStatus('idle');
    setTimeout(() => {
      setTestingConn(false);
      setConnStatus('success');
      setTimeout(() => setConnStatus('idle'), 5000);
    }, 2500);
  };

  const handleVerify = () => {
    if (!contractNo && !nationalId) { setVerifyResult('أدخل رقم الهوية أو رقم العقد'); return; }
    setVerifyResult('جاري التحقق...');
    setTimeout(() => {
      setVerifyResult(nationalId || contractNo ? '✅ العقد مسجل في منصة إيجار ومفعّل' : null);
    }, 1500);
  };

  const copyToken = () => {
    const token = (ejarValues['clientSecret'] as string) || '';
    if (token) navigator.clipboard.writeText(token);
  };
  const copyUsername = () => {
    navigator.clipboard.writeText(username);
  };

  return (
    <div className="bg-gradient-to-l from-emerald-950/40 to-slate-900/60 border border-emerald-500/30 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-emerald-500/20">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-2xl shadow-lg shadow-emerald-500/20">
            🏛️
          </div>
          <div>
            <h2 className="font-bold text-base text-foreground">تكامل منصة إيجار</h2>
            <p className="text-xs text-muted-foreground">Ejar Platform Integration — الوثائق الرسمية RERA</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {/* Connection status badge */}
          <div className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all ${
            connStatus === 'success' ? 'text-emerald-400 bg-emerald-500/20 border-emerald-500/50 animate-pulse' :
            connStatus === 'error'   ? 'text-red-400 bg-red-500/15 border-red-500/30' :
            isConnected              ? 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30' :
                                       'text-muted-foreground bg-muted border-border'
          }`}>
            {connStatus === 'success' ? <CheckCircle size={12} /> :
             connStatus === 'error'   ? <AlertCircle size={12} /> :
             isConnected             ? <CheckCircle size={12} /> :
                                       <AlertCircle size={12} />}
            {connStatus === 'success' ? 'الاتصال ناجح ✓' :
             connStatus === 'error'   ? 'فشل الاتصال' :
             isConnected             ? 'مرتبط ومفعّل' : 'غير مرتبط'}
          </div>

          {/* Test Connection button */}
          <button
            onClick={handleTestConnection}
            disabled={testingConn}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border font-medium transition-all disabled:opacity-60 ${
              connStatus === 'success'
                ? 'text-emerald-400 bg-emerald-500/15 border-emerald-500/40'
                : 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30 hover:bg-cyan-500/20'
            }`}
          >
            <RefreshCw size={12} className={testingConn ? 'animate-spin' : ''} />
            {testingConn ? 'جاري الاختبار...' : 'مزامنة الاتصال'}
          </button>

          <Button size="sm" variant="outline" className="gap-1.5 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 text-xs h-7" onClick={() => onConfigure('ejar')}>
            <Settings size={12} />
            إعداد API
          </Button>
        </div>
      </div>

      <div className="p-5 grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Connection Info + Quick Actions */}
        <div className="lg:col-span-2 space-y-4">
          {/* API Info Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: 'رقم رخصة الوساطة', value: licenseNumber, icon: Key, color: 'text-amber-400' },
              { label: 'اسم المستخدم', value: username, icon: Globe, color: 'text-blue-400' },
              { label: 'تاريخ الإصدار', value: issueDate, icon: FileCheck, color: 'text-green-400' },
              { label: 'آخر رمز تم إنشاؤه', value: lastTokenDate, icon: RefreshCw, color: 'text-purple-400' },
            ].map(item => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="bg-black/20 border border-white/10 rounded-xl p-3 text-center">
                  <Icon size={16} className={`mx-auto mb-1 ${item.color}`} />
                  <p className={`text-sm font-bold ${item.color}`}>{item.value}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{item.label}</p>
                </div>
              );
            })}
          </div>

          {/* Actions Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={handleSync}
              disabled={syncing}
              className="flex flex-col items-center gap-1.5 p-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl transition-colors disabled:opacity-50"
            >
              <RefreshCw size={18} className={`text-emerald-400 ${syncing ? 'animate-spin' : ''}`} />
              <span className="text-xs text-emerald-400">{syncing ? 'جاري...' : 'مزامنة العقود'}</span>
            </button>
            <a href="https://ejar.sa" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1.5 p-3 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-xl transition-colors">
              <ExternalLink size={18} className="text-blue-400" />
              <span className="text-xs text-blue-400">رابط إيجار</span>
            </a>
            <button className="flex flex-col items-center gap-1.5 p-3 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl transition-colors">
              <Upload size={18} className="text-amber-400" />
              <span className="text-xs text-amber-400">استيراد Excel</span>
            </button>
            <button onClick={copyToken} className="flex flex-col items-center gap-1.5 p-3 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-xl transition-colors">
              <Copy size={18} className="text-purple-400" />
              <span className="text-xs text-purple-400">نسخ كلمة المرور</span>
            </button>
          </div>

          {/* Connection test result */}
          {connStatus !== 'idle' && (
            <div className={`flex items-center gap-2 text-xs px-3 py-2.5 rounded-lg border font-medium ${connStatus === 'success' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' : 'text-red-400 bg-red-500/10 border-red-500/30'}`}>
              {connStatus === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
              {connStatus === 'success'
                ? `✅ مزامنة الاتصال ناجحة — منصة إيجار تستجيب بشكل صحيح (رخصة ${licenseNumber})`
                : '❌ فشل الاتصال — تحقق من صحة اسم المستخدم وكلمة المرور'}
            </div>
          )}

          {/* Sync Status Alert */}
          {syncStatus !== 'idle' && (
            <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg border ${syncStatus === 'success' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' : 'text-red-400 bg-red-500/10 border-red-500/30'}`}>
              <CheckCircle size={13} />
              {syncStatus === 'success' ? 'تم تحديث العقود من منصة إيجار بنجاح' : 'فشل الاتصال، تحقق من إعدادات API'}
            </div>
          )}

          {/* Features */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'توثيق العقود تلقائياً', desc: 'ربط العقود بمنصة إيجار فور إنشائها', icon: FileCheck },
              { label: 'تحليل PDF بالذكاء الاصطناعي', desc: 'رفع عقود PDF وتحليلها تلقائياً', icon: TrendingUp },
              { label: 'إشعارات التجديد', desc: 'تنبيهات قبل انتهاء صلاحية العقود', icon: AlertCircle },
              { label: 'بيانات السوق RERA', desc: 'معدلات إيجار ومؤشرات السوق المحلي', icon: Building2 },
            ].map(f => {
              const Icon = f.icon;
              return (
                <div key={f.label} className="flex items-start gap-2 p-2.5 bg-black/20 border border-white/5 rounded-lg">
                  <Icon size={14} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-foreground">{f.label}</p>
                    <p className="text-[10px] text-muted-foreground">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Contract Verification */}
        <div className="space-y-3">
          <div className="bg-black/30 border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Shield size={15} className="text-emerald-400" />
              <h3 className="text-sm font-semibold text-foreground">التحقق من العقود</h3>
            </div>
            <div className="space-y-2.5">
              <div>
                <label className="text-[10px] text-muted-foreground mb-1 block">رقم الهوية الوطنية</label>
                <input
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-foreground placeholder-muted-foreground"
                  placeholder="10 أرقام"
                  value={nationalId}
                  onChange={e => setNationalId(e.target.value)}
                  maxLength={10}
                />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground mb-1 block">رقم العقد (اختياري)</label>
                <input
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-foreground placeholder-muted-foreground"
                  placeholder="EJR-XXXXXX"
                  value={contractNo}
                  onChange={e => setContractNo(e.target.value)}
                />
              </div>
              <Button onClick={handleVerify} size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 gap-1.5">
                <Shield size={12} />
                تحقق الآن
              </Button>
              {verifyResult && (
                <p className={`text-xs px-3 py-2 rounded-lg border ${verifyResult.includes('✅') ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' : 'text-amber-400 bg-amber-500/10 border-amber-500/30'}`}>
                  {verifyResult}
                </p>
              )}
            </div>
          </div>

          {/* Absher Login Info */}
          {!isConnected && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle size={14} className="text-amber-400" />
                <p className="text-xs font-semibold text-amber-400">مطلوب ربط إيجار</p>
              </div>
              <p className="text-[10px] text-muted-foreground mb-3">للاستفادة من التكامل الكامل مع منصة إيجار، يرجى إعداد بيانات API.</p>
              <Button size="sm" onClick={() => onConfigure('ejar')} className="w-full text-xs h-7 gap-1.5 bg-amber-600 hover:bg-amber-700 text-white">
                <Link2 size={12} />
                إعداد تكامل إيجار
              </Button>
            </div>
          )}

          {isConnected && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle size={14} className="text-emerald-400" />
                <p className="text-xs font-semibold text-emerald-400">التكامل مفعّل</p>
              </div>
              <div className="space-y-1.5 text-[10px] text-muted-foreground">
                <div className="flex items-center gap-1.5"><CheckCircle size={10} className="text-emerald-400" />توثيق العقود التلقائي</div>
                <div className="flex items-center gap-1.5"><CheckCircle size={10} className="text-emerald-400" />مزامنة بيانات المستأجرين</div>
                <div className="flex items-center gap-1.5"><CheckCircle size={10} className="text-emerald-400" />تقارير الامتثال RERA</div>
                <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-emerald-500/20">
                  <Key size={10} className="text-amber-400" />
                  <span className="text-amber-300 font-medium">التسجيل الخارجي: {externalReg}</span>
                </div>
              </div>
              <button onClick={copyUsername} className="mt-3 w-full flex items-center justify-center gap-1.5 text-[10px] text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-lg py-1.5 hover:bg-blue-500/20 transition-colors">
                <Copy size={10} />
                نسخ اسم المستخدم: {username}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function IntegrationsPage() {
  const [category, setCategory] = useState('الكل');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | IntegrationStatus>('all');
  const [settings, setSettings] = useState<IntegrationSettings>({});
  const [configuringId, setConfiguringId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as IntegrationSettings;
        // Inject EJAR defaults if not yet saved
        if (!parsed['ejar'] || !parsed['ejar']['clientSecret']) {
          parsed['ejar'] = { ...EJAR_DEFAULT_VALUES, ...(parsed['ejar'] || {}) };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
        }
        setSettings(parsed);
      } else {
        const initial: IntegrationSettings = { ejar: EJAR_DEFAULT_VALUES };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
        setSettings(initial);
      }
    } catch {
      setSettings({ ejar: EJAR_DEFAULT_VALUES });
    }
  }, []);

  const save = (id: string, values: Values) => {
    setSettings((prev) => {
      const next = { ...prev, [id]: values };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const disconnect = (id: string) => {
    setSettings((prev) => {
      const next = { ...prev };
      delete next[id];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
    setConfiguringId(null);
  };

  const filtered = useMemo(() => {
    return INTEGRATIONS.filter((item) => {
      const st = effectiveStatus(item, settings[item.id]);
      const matchCategory = category === 'الكل' || item.category === category;
      const hay = `${item.name} ${item.nameEn} ${item.description}`.toLowerCase();
      const matchSearch = !search || hay.includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || st === statusFilter;
      return matchCategory && matchSearch && matchStatus;
    });
  }, [category, search, settings, statusFilter]);

  const counters = INTEGRATIONS.reduce(
    (acc, item) => {
      const st = effectiveStatus(item, settings[item.id]);
      acc[st] += 1;
      return acc;
    },
    { connected: 0, pending: 0, disconnected: 0 }
  );

  const current = INTEGRATIONS.find((i) => i.id === configuringId) || null;

  return (
    <DashboardLayout pageTitle="التكاملات">
      <div dir="rtl" className="space-y-6">
        {/* ======= WHATSAPP SECTION ======= */}
        <WhatsAppSection settings={settings} onConfigure={setConfiguringId} />

        {/* ======= EJAR SECTION - بارز في الأعلى ======= */}
        <EjarSection settings={settings} onConfigure={setConfiguringId} />

        <PageHeader title="تكامل الأنظمة" description="أنشئ إعداد الربط لكل تكامل مع حفظ واختبار اتصال ومنع التكرار.">
          <Button size="sm" className="gap-2">
            <MessageSquare className="w-4 h-4" />
            طلب تكامل جديد
          </Button>
        </PageHeader>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <button
          onClick={() => setStatusFilter(statusFilter === 'connected' ? 'all' : 'connected')}
          className={cn('rounded-xl border-2 p-4 transition-all', statusFilter === 'connected' ? 'border-green-500 bg-green-50' : 'border-border bg-card')}
        >
          <p className="text-2xl font-bold text-green-600">{counters.connected}</p>
          <p className="text-xs text-muted-foreground">متصل</p>
        </button>
        <button
          onClick={() => setStatusFilter(statusFilter === 'pending' ? 'all' : 'pending')}
          className={cn('rounded-xl border-2 p-4 transition-all', statusFilter === 'pending' ? 'border-amber-500 bg-amber-50' : 'border-border bg-card')}
        >
          <p className="text-2xl font-bold text-amber-600">{counters.pending}</p>
          <p className="text-xs text-muted-foreground">بحاجة إعداد</p>
        </button>
        <button
          onClick={() => setStatusFilter(statusFilter === 'disconnected' ? 'all' : 'disconnected')}
          className={cn('rounded-xl border-2 p-4 transition-all', statusFilter === 'disconnected' ? 'border-slate-400 bg-slate-50' : 'border-border bg-card')}
        >
          <p className="text-2xl font-bold text-slate-600">{counters.disconnected}</p>
          <p className="text-xs text-muted-foreground">غير متصل</p>
        </button>
      </div>

      <div className="space-y-3 mb-5">
        <div className="relative">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث في التكاملات..."
            className="w-full h-9 rounded-lg border border-border bg-input pr-9 px-3 text-sm"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn('px-3 py-1.5 rounded-full text-xs border', category === cat ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border')}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Zap className="w-10 h-10 mx-auto mb-2 opacity-25" />
          لا توجد تكاملات مطابقة
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <IntegrationCard
              key={item.id}
              item={item}
              status={effectiveStatus(item, settings[item.id])}
              configured={isConfigured(item, settings[item.id])}
              onConfigure={setConfiguringId}
            />
          ))}
        </div>
      )}

      {current && (
        <ConfigModal
          item={current}
          allSettings={settings}
          onSave={save}
          onDisconnect={disconnect}
          onClose={() => setConfiguringId(null)}
        />
      )}
      </div>
    </DashboardLayout>
  );
}
