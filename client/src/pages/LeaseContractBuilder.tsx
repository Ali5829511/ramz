/*
 * إنشاء عقد جديد - رمز الإبداع
 */
import { useState, useMemo } from 'react';
import { FileText, User, Home, Calendar, DollarSign, CheckCircle, ChevronLeft, ChevronRight, Save, AlertTriangle } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useMultiEntityData } from '@/hooks/useEntityData';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

const STEPS = [
  { key: 'tenant', label: 'المستأجر', icon: User },
  { key: 'unit', label: 'الوحدة', icon: Home },
  { key: 'terms', label: 'الشروط', icon: Calendar },
  { key: 'payment', label: 'الدفعات', icon: DollarSign },
  { key: 'review', label: 'المراجعة', icon: CheckCircle },
];

const today = new Date().toISOString().split('T')[0];
const inYear = new Date(Date.now() + 365 * 86400e3).toISOString().split('T')[0];

const emptyForm = () => ({
  tenant_id: '', tenant_name: '', tenant_phone: '',
  unit_id: '', unit_name: '', property_name: '',
  start_date: today, end_date: inYear,
  monthly_rent: '', deposit: '',
  payment_day: '1', payment_period: 'شهري',
  notes: '',
});

export default function LeaseContractBuilder() {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState(emptyForm());

  const { data, loading } = useMultiEntityData([
    { name: 'Tenant', limit: 500 },
    { name: 'Unit', limit: 2000 },
  ]);
  const tenants = data.Tenant || [];
  const units = (data.Unit || []).filter((u: any) => u['حالة_الوحدة'] === 'شاغرة' || u.status === 'vacant' || !u['حالة_الوحدة']);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const months = useMemo(() => {
    if (!form.start_date || !form.end_date || !form.monthly_rent || form.end_date <= form.start_date) return [];
    const start = new Date(form.start_date);
    const end = new Date(form.end_date);
    const result: string[] = [];
    const cur = new Date(start);
    while (cur <= end && result.length < 120) {
      result.push(cur.toISOString().slice(0, 7));
      cur.setMonth(cur.getMonth() + 1);
    }
    return result;
  }, [form.start_date, form.end_date, form.monthly_rent]);

  const canNext = useMemo(() => {
    if (step === 0) return !!form.tenant_name;
    if (step === 1) return !!form.unit_name;
    if (step === 2) return !!form.start_date && !!form.end_date && form.end_date > form.start_date;
    if (step === 3) return !!form.monthly_rent && parseFloat(form.monthly_rent) > 0;
    return true;
  }, [step, form]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const leaseData = {
        رقم_العقد: `CNT-${Date.now()}`,
        اسم_المستأجر: form.tenant_name,
        رقم_الوحدة: form.unit_name,
        اسم_العقار: form.property_name,
        تاريخ_بداية_العقد: form.start_date,
        تاريخ_نهاية_العقد: form.end_date,
        قيمة_الإيجار_الشهري: parseFloat(form.monthly_rent),
        مبلغ_التأمين: parseFloat(form.deposit || '0'),
        يوم_الدفع: parseInt(form.payment_day),
        فترة_الدفع: form.payment_period,
        حالة_العقد: 'نشط',
        ملاحظات: form.notes,
        created_date: today,
      };
      const { error } = await (supabase as any).from('Lease').insert([leaseData]);
      if (error) throw error;
      setDone(true);
      toast.success('تم إنشاء العقد بنجاح');
    } catch (e: any) {
      toast.error('خطأ: ' + (e.message || 'تعذر الحفظ'));
    } finally {
      setSaving(false);
    }
  };

  if (done) {
    return (
      <DashboardLayout pageTitle="إنشاء عقد جديد">
        <div className="flex flex-col items-center justify-center py-20 gap-4" dir="rtl">
          <div className="w-16 h-16 rounded-full bg-green-500/15 flex items-center justify-center">
            <CheckCircle size={32} className="text-green-400" />
          </div>
          <h2 className="text-xl font-bold text-foreground">تم إنشاء العقد بنجاح!</h2>
          <p className="text-muted-foreground text-sm">{form.tenant_name} — {form.unit_name}</p>
          <div className="flex gap-2 mt-2">
            <Button variant="outline" onClick={() => { setDone(false); setStep(0); setForm(emptyForm()); }}>إنشاء عقد آخر</Button>
            <Button onClick={() => window.history.back()}>العودة</Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout pageTitle="إنشاء عقد جديد">
      <div className="max-w-3xl mx-auto space-y-5" dir="rtl">
        <div className="flex items-center gap-2">
          <FileText size={20} className="text-primary" />
          <h1 className="text-lg font-bold text-foreground">إنشاء عقد إيجار جديد</h1>
        </div>

        {/* Stepper */}
        <div className="flex items-center bg-card border border-border rounded-xl p-3 overflow-x-auto gap-1">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const active = i === step;
            const isDone = i < step;
            return (
              <div key={s.key} className="flex items-center flex-shrink-0">
                <button
                  onClick={() => { if (isDone) setStep(i); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${active ? 'bg-primary text-primary-foreground' : isDone ? 'text-green-400 cursor-pointer hover:bg-green-500/10' : 'text-muted-foreground'}`}
                >
                  {isDone ? <CheckCircle size={14} /> : <Icon size={14} />}
                  {s.label}
                </button>
                {i < STEPS.length - 1 && <ChevronLeft size={14} className="text-muted-foreground mx-1" />}
              </div>
            );
          })}
        </div>

        {loading ? (
          <div className="text-center py-10 text-muted-foreground text-sm">جاري التحميل...</div>
        ) : (
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            {/* Step 0 */}
            {step === 0 && (
              <>
                <h2 className="font-semibold text-foreground">اختيار المستأجر</h2>
                {tenants.length > 0 && (
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">اختر من القائمة</label>
                    <select className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm" value={form.tenant_id} onChange={e => {
                      const t = tenants.find((t: any, i: number) => String(t.id || t['رقم_المستأجر'] || i) === e.target.value) as any;
                      if (t) { set('tenant_id', e.target.value); set('tenant_name', t['اسم_المستأجر'] || t.name || ''); set('tenant_phone', t['رقم_الجوال'] || t.phone || ''); }
                    }}>
                      <option value="">-- اختر مستأجراً --</option>
                      {tenants.map((t: any, i: number) => <option key={i} value={String(t.id || t['رقم_المستأجر'] || i)}>{t['اسم_المستأجر'] || t.name || `مستأجر ${i + 1}`}</option>)}
                    </select>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">اسم المستأجر *</label>
                    <input className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm" value={form.tenant_name} onChange={e => set('tenant_name', e.target.value)} placeholder="أدخل اسم المستأجر" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">رقم الجوال</label>
                    <input className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm" value={form.tenant_phone} onChange={e => set('tenant_phone', e.target.value)} placeholder="05XXXXXXXX" />
                  </div>
                </div>
              </>
            )}

            {/* Step 1 */}
            {step === 1 && (
              <>
                <h2 className="font-semibold text-foreground">اختيار الوحدة</h2>
                {units.length > 0 && (
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">اختر وحدة شاغرة ({units.length} متاحة)</label>
                    <select className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm" value={form.unit_id} onChange={e => {
                      const u = units.find((u: any, i: number) => String(u.id || u['رقم_الوحدة'] || i) === e.target.value) as any;
                      if (u) { set('unit_id', e.target.value); set('unit_name', u['رقم_الوحدة'] || u.unit_number || ''); set('property_name', u['اسم_العقار'] || u.property_name || ''); set('monthly_rent', String(u['قيمة_الإيجار'] || u.rent || '')); }
                    }}>
                      <option value="">-- اختر وحدة --</option>
                      {units.map((u: any, i: number) => <option key={i} value={String(u.id || u['رقم_الوحدة'] || i)}>{u['رقم_الوحدة'] || u.unit_number || `وحدة ${i + 1}`} — {u['اسم_العقار'] || ''}</option>)}
                    </select>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">رقم الوحدة *</label>
                    <input className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm" value={form.unit_name} onChange={e => set('unit_name', e.target.value)} placeholder="A-101" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">اسم العقار</label>
                    <input className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm" value={form.property_name} onChange={e => set('property_name', e.target.value)} placeholder="اسم المبنى أو المجمع" />
                  </div>
                </div>
              </>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <>
                <h2 className="font-semibold text-foreground">مدة العقد</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">تاريخ البدء *</label>
                    <input type="date" className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm" value={form.start_date} onChange={e => set('start_date', e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">تاريخ الانتهاء *</label>
                    <input type="date" className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm" value={form.end_date} onChange={e => set('end_date', e.target.value)} />
                  </div>
                </div>
                {form.start_date && form.end_date && form.end_date > form.start_date ? (
                  <div className="bg-primary/10 border border-primary/20 rounded-lg px-4 py-3 text-sm text-primary">مدة العقد: {Math.round((new Date(form.end_date).getTime() - new Date(form.start_date).getTime()) / (30 * 86400e3))} شهر تقريباً</div>
                ) : form.end_date && form.end_date <= form.start_date ? (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm text-red-400 flex items-center gap-2"><AlertTriangle size={14} />تاريخ الانتهاء يجب أن يكون بعد تاريخ البدء</div>
                ) : null}
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">ملاحظات</label>
                  <textarea rows={3} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm resize-none" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="أي شروط أو ملاحظات خاصة بالعقد" />
                </div>
              </>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <>
                <h2 className="font-semibold text-foreground">شروط الدفع</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">الإيجار الشهري (ر.س) *</label>
                    <input type="number" className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm" value={form.monthly_rent} onChange={e => set('monthly_rent', e.target.value)} placeholder="0.00" min="0" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">مبلغ التأمين (ر.س)</label>
                    <input type="number" className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm" value={form.deposit} onChange={e => set('deposit', e.target.value)} placeholder="0.00" min="0" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">يوم الاستحقاق</label>
                    <select className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm" value={form.payment_day} onChange={e => set('payment_day', e.target.value)}>
                      {Array.from({ length: 28 }, (_, i) => i + 1).map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">فترة الدفع</label>
                    <select className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm" value={form.payment_period} onChange={e => set('payment_period', e.target.value)}>
                      {['شهري', 'ربع سنوي', 'نصف سنوي', 'سنوي'].map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                </div>
                {form.monthly_rent && months.length > 0 && (
                  <div className="bg-muted/50 rounded-lg p-4 space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground mb-2">ملخص الدفعات</p>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">عدد الأشهر</span><span>{months.length}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">الإيجار الشهري</span><span className="text-green-400">{parseFloat(form.monthly_rent).toLocaleString('ar-SA')} ر.س</span></div>
                    <div className="flex justify-between text-sm border-t border-border pt-1.5"><span className="text-muted-foreground">إجمالي العقد</span><span className="font-bold text-primary">{(parseFloat(form.monthly_rent) * months.length).toLocaleString('ar-SA')} ر.س</span></div>
                  </div>
                )}
              </>
            )}

            {/* Step 4 */}
            {step === 4 && (
              <>
                <h2 className="font-semibold text-foreground">مراجعة وتأكيد العقد</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    ['المستأجر', form.tenant_name],
                    ['رقم الجوال', form.tenant_phone || '-'],
                    ['الوحدة', form.unit_name],
                    ['العقار', form.property_name || '-'],
                    ['تاريخ البدء', form.start_date],
                    ['تاريخ الانتهاء', form.end_date],
                    ['مدة العقد', `${months.length} شهر`],
                    ['الإيجار الشهري', `${parseFloat(form.monthly_rent || '0').toLocaleString('ar-SA')} ر.س`],
                    ['التأمين', form.deposit ? `${parseFloat(form.deposit).toLocaleString('ar-SA')} ر.س` : '-'],
                    ['فترة الدفع', form.payment_period],
                    ['يوم الاستحقاق', form.payment_day],
                    ['إجمالي العقد', `${(parseFloat(form.monthly_rent || '0') * months.length).toLocaleString('ar-SA')} ر.س`],
                  ].map(([l, v]) => (
                    <div key={l} className="bg-muted/40 rounded-lg p-3 flex justify-between">
                      <span className="text-xs text-muted-foreground">{l}</span>
                      <span className="text-xs font-medium">{v}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => setStep(s => s - 1)} disabled={step === 0}>
            <ChevronRight size={15} className="ml-1" />السابق
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep(s => s + 1)} disabled={!canNext}>
              التالي<ChevronLeft size={15} className="mr-1" />
            </Button>
          ) : (
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              <Save size={15} />
              {saving ? 'جاري الحفظ...' : 'حفظ العقد'}
            </Button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

