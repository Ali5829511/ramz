/*
 * صفحة إعداد قاعدة البيانات - رمز الإبداع
 * تساعد المستخدم في ربط Supabase بشكل صحيح
 */
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Database, CheckCircle, XCircle, AlertTriangle, ExternalLink, Copy, RefreshCw } from 'lucide-react';
import { supabase, SUPABASE_CONNECTED } from '@/lib/supabaseClient';

const STEPS = [
  {
    step: 1,
    title: 'الحصول على مفتاح Supabase الصحيح',
    desc: 'افتح إعدادات مشروعك في Supabase واحصل على مفتاح anon الصحيح',
    link: 'https://supabase.com/dashboard/project/nqpoktshudssuglgxmvp/settings/api',
    linkText: 'فتح إعدادات Supabase API',
    detail: 'انتقل إلى: Settings → API → "anon public" - المفتاح يبدأ بـ eyJ...',
    code: 'VITE_SUPABASE_URL=https://nqpoktshudssuglgxmvp.supabase.co\nVITE_SUPABASE_ANON_KEY=eyJ[انسخ المفتاح هنا من Supabase]',
  },
  {
    step: 2,
    title: 'تحديث ملف .env',
    desc: 'افتح ملف .env في جذر المشروع وضع المفتاح الصحيح',
    detail: 'الملف موجود في: ramz-abda-platform/.env',
    code: null,
  },
  {
    step: 3,
    title: 'إنشاء الجداول وإضافة البيانات',
    desc: 'شغّل ملف supabase-schema.sql في محرر SQL في Supabase',
    link: 'https://supabase.com/dashboard/project/nqpoktshudssuglgxmvp/sql',
    linkText: 'فتح محرر SQL في Supabase',
    detail: 'افتح الملف supabase-schema.sql ثم انسخ محتواه كاملاً والصقه في SQL Editor',
    code: null,
  },
  {
    step: 4,
    title: 'إعادة تشغيل التطبيق',
    desc: 'بعد تحديث .env أعد تشغيل الخادم لتفعيل المتغيرات الجديدة',
    detail: 'في Terminal: اضغط Ctrl+C ثم شغّل: npm run dev',
    code: 'npm run dev',
  },
];

export default function DatabaseSetupPage() {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<null | { ok: boolean; msg: string }>(null);

  const testConnection = async () => {
    setTesting(true);
    setTestResult(null);
    if (!supabase) {
      setTestResult({ ok: false, msg: 'المفتاح غير صحيح أو غير موجود في ملف .env' });
      setTesting(false);
      return;
    }
    try {
      const { data, error } = await supabase.from('properties').select('id').limit(1);
      if (error) {
        setTestResult({ ok: false, msg: `خطأ من Supabase: ${error.message}` });
      } else {
        setTestResult({ ok: true, msg: `الاتصال ناجح! وجد ${data?.length || 0} عقار في قاعدة البيانات` });
      }
    } catch (e: any) {
      setTestResult({ ok: false, msg: e.message });
    }
    setTesting(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 max-w-3xl">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Database className="w-6 h-6 text-primary" />
            إعداد قاعدة البيانات
          </h1>
          <p className="text-muted-foreground mt-1">ربط التطبيق بـ Supabase للعمل بالبيانات الحقيقية</p>
        </div>

        {/* حالة الاتصال الحالية */}
        <Card className={SUPABASE_CONNECTED ? 'border-green-200 bg-green-50/50' : 'border-yellow-200 bg-yellow-50/50'}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {SUPABASE_CONNECTED
                  ? <CheckCircle className="w-6 h-6 text-green-600" />
                  : <AlertTriangle className="w-6 h-6 text-yellow-600" />
                }
                <div>
                  <div className={`font-bold ${SUPABASE_CONNECTED ? 'text-green-800' : 'text-yellow-800'}`}>
                    {SUPABASE_CONNECTED ? 'Supabase متصل' : 'يعمل بالبيانات التجريبية'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {SUPABASE_CONNECTED
                      ? 'التطبيق يقرأ ويكتب البيانات من Supabase'
                      : 'المفتاح في .env غير صحيح - اتبع الخطوات أدناه للربط'}
                  </div>
                </div>
              </div>
              <Button onClick={testConnection} disabled={testing} variant="outline" size="sm" className="gap-2">
                <RefreshCw className={`w-4 h-4 ${testing ? 'animate-spin' : ''}`} />
                اختبار الاتصال
              </Button>
            </div>
            {testResult && (
              <div className={`mt-3 p-3 rounded-lg text-sm ${testResult.ok ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {testResult.ok ? <CheckCircle className="w-4 h-4 inline ml-1" /> : <XCircle className="w-4 h-4 inline ml-1" />}
                {testResult.msg}
              </div>
            )}
          </CardContent>
        </Card>

        {/* مشكلة المفتاح الحالي */}
        {!SUPABASE_CONNECTED && (
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-700 flex items-center gap-2 text-base">
                <XCircle className="w-5 h-5" />
                مشكلة المفتاح الحالي
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                المفتاح الحالي في <code className="bg-muted px-1 rounded">.env</code> يبدأ بـ <code className="bg-red-50 text-red-600 px-1 rounded">sb_publishable_</code> وهو مفتاح Base44 وليس Supabase.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                مفاتيح Supabase دائماً تبدأ بـ <code className="bg-green-50 text-green-600 px-1 rounded">eyJ...</code> وهي رموز JWT.
              </p>
            </CardContent>
          </Card>
        )}

        {/* خطوات الإعداد */}
        <div className="space-y-4">
          <h2 className="font-bold text-lg">خطوات الإعداد</h2>
          {STEPS.map((s) => (
            <Card key={s.step}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
                    {s.step}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="font-medium">{s.title}</div>
                    <div className="text-sm text-muted-foreground">{s.desc}</div>
                    <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">{s.detail}</div>
                    {s.code && (
                      <div className="relative">
                        <pre className="bg-gray-900 text-green-400 text-xs p-3 rounded-lg overflow-x-auto">{s.code}</pre>
                        <Button
                          size="sm" variant="ghost"
                          className="absolute top-1 left-1 h-7 text-xs text-gray-400 hover:text-white"
                          onClick={() => copyToClipboard(s.code!)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                    {s.link && (
                      <a href={s.link} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="gap-2">
                          <ExternalLink className="w-3 h-3" />
                          {s.linkText}
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
