/*
 * الفواتير التلقائية - رمز الإبداع
 * توليد فواتير تلقائية من العقود النشطة
 */
import React, { useMemo, useState } from 'react';
import { FileText, CheckCircle, Clock, AlertTriangle, Send } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import { useMultiEntityData } from '@/hooks/useEntityData';
import { supabase } from '@/lib/supabaseClient';
import { cn } from '@/lib/utils';

const fmt = (v: number) => (v || 0).toLocaleString('ar-SA');

export default function AutoInvoicing() {
  const { data, loading, reload } = useMultiEntityData([
    { name: 'Lease', limit: 500 },
    { name: 'Invoice', limit: 500 },
  ]);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(0);
  const [error, setError] = useState('');

  const activeLeases = useMemo(() => {
    const leases = data.Lease || [];
    const invoices = data.Invoice || [];
    const now = new Date();
    const thisMonth = now.toISOString().slice(0, 7);

    return leases
      .filter(l => l['حالة_العقد'] === 'نشط')
      .map(l => {
        const hasInvoice = invoices.some(inv =>
          inv['اسم_العميل'] === l['اسم_المستأجر'] &&
          (inv['تاريخ_الفاتورة'] || '').startsWith(thisMonth)
        );
        return { ...l, hasInvoice };
      });
  }, [data]);

  const pending = activeLeases.filter(l => !l.hasInvoice);
  const done = activeLeases.filter(l => l.hasInvoice);

  const generateInvoices = async () => {
    if (!supabase) {
      setError('قاعدة البيانات غير متصلة');
      return;
    }
    setGenerating(true);
    setError('');
    const now = new Date();
    const thisMonth = now.toISOString().slice(0, 7);
    const dueDate = `${thisMonth}-${now.getDate().toString().padStart(2, '0')}`;
    let count = 0;

    for (const lease of pending) {
      const invNum = `INV-${thisMonth}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
      const { error: err } = await (supabase as any).from('invoices').insert({
        'رقم_الفاتورة': invNum,
        'اسم_العميل': lease['اسم_المستأجر'],
        'اسم_العقار': lease['اسم_العقار'],
        'المبلغ': parseFloat(lease['قيمة_الإيجار'] || 0),
        'تاريخ_الفاتورة': dueDate,
        'تاريخ_الاستحقاق': dueDate,
        'حالة_الفاتورة': 'غير_مدفوعة',
        'تفاصيل': `إيجار شهر ${now.toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' })} — عقد ${lease['رقم_العقد'] || ''}`,
      });
      if (!err) count++;
    }

    setGenerated(count);
    setGenerating(false);
    reload();
  };

  return (
    <DashboardLayout pageTitle="الفواتير التلقائية">
      <PageHeader
        title="الفواتير التلقائية"
        description={`${activeLeases.length} عقد نشط — ${pending.length} فاتورة لم تُنشأ بعد`}
      />

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <FileText className="w-8 h-8 animate-pulse" />
        </div>
      ) : (
        <div className="space-y-5">
          {/* إحصائيات */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-border bg-card p-4">
              <FileText className="w-5 h-5 text-primary mb-1" />
              <p className="text-2xl font-bold">{activeLeases.length}</p>
              <p className="text-xs text-muted-foreground">عقد نشط</p>
            </div>
            <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4">
              <Clock className="w-5 h-5 text-red-400 mb-1" />
              <p className="text-2xl font-bold text-red-400">{pending.length}</p>
              <p className="text-xs text-muted-foreground">بدون فاتورة هذا الشهر</p>
            </div>
            <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-4">
              <CheckCircle className="w-5 h-5 text-green-400 mb-1" />
              <p className="text-2xl font-bold text-green-400">{done.length}</p>
              <p className="text-xs text-muted-foreground">صدرت الفاتورة</p>
            </div>
          </div>

          {/* زر التوليد */}
          {pending.length > 0 && (
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="font-semibold">توليد {pending.length} فاتورة تلقائياً</p>
                <p className="text-sm text-muted-foreground mt-1">سيتم إنشاء فواتير شهر {new Date().toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' })} لجميع العقود النشطة</p>
              </div>
              <button
                onClick={generateInvoices}
                disabled={generating || !supabase}
                className={cn(
                  'flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all',
                  generating ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'bg-primary text-primary-foreground hover:bg-primary/90'
                )}
              >
                <Send className="w-4 h-4" />
                {generating ? 'جاري التوليد...' : 'توليد الفواتير'}
              </button>
            </div>
          )}

          {generated > 0 && (
            <div className="rounded-lg bg-green-500/10 border border-green-500/30 p-3 flex items-center gap-2 text-green-400">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">تم توليد {generated} فاتورة بنجاح</span>
            </div>
          )}
          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3 flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* قائمة العقود المعلقة */}
          {pending.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-5 space-y-3">
              <h2 className="font-semibold flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                عقود بدون فاتورة هذا الشهر
              </h2>
              <div className="divide-y divide-border">
                {pending.map((l: any, i: number) => (
                  <div key={i} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium">{l['اسم_المستأجر'] || '—'}</p>
                      <p className="text-xs text-muted-foreground">{l['اسم_العقار']} • عقد {l['رقم_العقد'] || i + 1}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">{fmt(parseFloat(l['قيمة_الإيجار'] || 0))} ر.س</p>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400">لم تصدر</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
