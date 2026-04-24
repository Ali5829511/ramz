/*
 * نموذج إضافة / تعديل عقار - رمز الإبداع
 * نموذج شامل لإدخال جميع بيانات العقار
 */
import { useState } from 'react';
import { useLocation, Link } from 'wouter';
import {
  Building2, MapPin, FileText, Users, Wrench,
  ArrowLeft, Save, ChevronLeft, ChevronRight, CheckCircle, AlertTriangle
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// خطوات النموذج
const STEPS = [
  { id: 1, label: 'البيانات الأساسية', icon: Building2 },
  { id: 2, label: 'الموقع والعنوان', icon: MapPin },
  { id: 3, label: 'الملكية والصك', icon: FileText },
  { id: 4, label: 'بيانات المالك', icon: Users },
  { id: 5, label: 'المبنى والمرافق', icon: Wrench },
];

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full h-9 px-3 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary";
const selectCls = inputCls;

export default function PropertyForm() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState(1);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dupError, setDupError] = useState('');

  const [form, setForm] = useState({
    // الأساسية
    name: '',
    type: '',
    status: 'نشط',
    featured: false,
    description: '',
    // الموقع
    region: '',
    city: '',
    district: '',
    street: '',
    buildingNo: '',
    postalCode: '',
    nationalAddress: '',
    // الملكية
    deedNo: '',
    deedType: '',
    deedDate: '',
    plotNo: '',
    planNo: '',
    area: '',
    // المالك
    ownerName: '',
    ownerIdNo: '',
    ownerPhone: '',
    ownerEmail: '',
    ownerIban: '',
    managementFee: '',
    // المبنى
    floors: '',
    yearBuilt: '',
    buildingType: '',
    parkingSpaces: '',
    elevator: '',
    generator: '',
    guard: '',
    pool: '',
    gym: '',
  });

  const update = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name.trim()) { setDupError('يجب إدخال اسم العقار'); return; }
    setSaving(true);
    setDupError('');
    // فحص التكرار - هل يوجد عقار بنفس الاسم؟
    if (supabase) {
      const sb = supabase as any;
      const { data: existing } = await sb
        .from('properties')
        .select('id')
        .eq('اسم_العقار', form.name.trim())
        .limit(1);
      if (existing && existing.length > 0) {
        setDupError(`⚠️ يوجد عقار بنفس الاسم "${form.name}" مسبقاً. الرجاء اختيار اسم مختلف.`);
        setSaving(false);
        return;
      }
      const { error } = await sb.from('properties').insert({
        'اسم_العقار': form.name.trim(),
        'نوع_العقار': form.type,
        'المدينة': form.city,
        'العنوان': `${form.district} - ${form.street}`.replace(/^\s*-\s*/, ''),
        'العنوان_الوطني': form.nationalAddress,
        'رقم_الصك': form.deedNo,
        'مساحة_الأرض': form.area ? parseFloat(form.area) : null,
        'عدد_الطوابق': form.floors ? parseInt(form.floors) : null,
        'عقار_مميز': form.featured,
        'الحالة': form.status,
      });
      if (error) { setDupError(`خطأ في الحفظ: ${error.message}`); setSaving(false); return; }
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => { navigate('/properties'); }, 1500);
  };

  const canNext = step < 5;
  const canPrev = step > 1;

  return (
    <DashboardLayout>
      <div className="p-6 max-w-3xl mx-auto space-y-6">

        {/* الرأس */}
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/properties')} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold">إضافة عقار جديد</h1>
            <p className="text-sm text-muted-foreground">أدخل تفاصيل العقار في {STEPS.length} خطوات</p>
          </div>
        </div>

        {/* مؤشر التقدم */}
        <div className="flex items-center gap-0">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const done = s.id < step;
            const active = s.id === step;
            return (
              <div key={s.id} className="flex items-center flex-1">
                <button
                  onClick={() => setStep(s.id)}
                  className={cn(
                    'flex flex-col items-center gap-1 group',
                    active ? 'text-primary' : done ? 'text-green-600' : 'text-muted-foreground'
                  )}
                >
                  <div className={cn(
                    'w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all text-sm font-bold',
                    active ? 'border-primary bg-primary text-white' : done ? 'border-green-500 bg-green-500 text-white' : 'border-border bg-background'
                  )}>
                    {done ? <CheckCircle className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span className="text-[10px] font-medium hidden sm:block whitespace-nowrap">{s.label}</span>
                </button>
                {i < STEPS.length - 1 && (
                  <div className={cn('flex-1 h-0.5 mx-1', done ? 'bg-green-500' : 'bg-border')} />
                )}
              </div>
            );
          })}
        </div>

        {/* محتوى الخطوة */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              {(() => { const Icon = STEPS[step - 1].icon; return <Icon className="w-4 h-4 text-primary" />; })()}
              {STEPS[step - 1].label}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">

            {/* الخطوة 1: البيانات الأساسية */}
            {step === 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Field label="اسم العقار" required>
                    <input className={inputCls} value={form.name} onChange={e => update('name', e.target.value)} placeholder="مثال: عمارة النخيل" />
                  </Field>
                </div>
                <Field label="نوع العقار" required>
                  <select className={selectCls} value={form.type} onChange={e => update('type', e.target.value)}>
                    <option value="">-- اختر --</option>
                    {['سكني', 'تجاري', 'مختلط', 'صناعي', 'زراعي'].map(v => <option key={v}>{v}</option>)}
                  </select>
                </Field>
                <Field label="حالة العقار">
                  <select className={selectCls} value={form.status} onChange={e => update('status', e.target.value)}>
                    {['نشط', 'قيد الإنشاء', 'متوقف', 'للبيع'].map(v => <option key={v}>{v}</option>)}
                  </select>
                </Field>
                <div className="sm:col-span-2">
                  <Field label="الوصف">
                    <textarea
                      className={cn(inputCls, 'h-24 resize-none py-2')}
                      value={form.description}
                      onChange={e => update('description', e.target.value)}
                      placeholder="وصف مختصر للعقار..."
                    />
                  </Field>
                </div>
                <div className="sm:col-span-2 flex items-center gap-2">
                  <input type="checkbox" id="featured" checked={form.featured} onChange={e => update('featured', e.target.checked)} className="w-4 h-4 accent-primary" />
                  <label htmlFor="featured" className="text-sm font-medium cursor-pointer">عقار مميز ⭐</label>
                </div>
              </div>
            )}

            {/* الخطوة 2: الموقع */}
            {step === 2 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="المنطقة الإدارية" required>
                  <select className={selectCls} value={form.region} onChange={e => update('region', e.target.value)}>
                    <option value="">-- اختر المنطقة --</option>
                    {['الرياض', 'مكة المكرمة', 'المدينة المنورة', 'المنطقة الشرقية', 'عسير', 'تبوك', 'حائل', 'القصيم', 'جازان', 'نجران', 'الباحة', 'الجوف', 'الحدود الشمالية'].map(v => <option key={v}>{v}</option>)}
                  </select>
                </Field>
                <Field label="المدينة" required>
                  <input className={inputCls} value={form.city} onChange={e => update('city', e.target.value)} placeholder="مثال: الرياض" />
                </Field>
                <Field label="الحي" required>
                  <input className={inputCls} value={form.district} onChange={e => update('district', e.target.value)} placeholder="مثال: حي النخيل" />
                </Field>
                <Field label="اسم الشارع">
                  <input className={inputCls} value={form.street} onChange={e => update('street', e.target.value)} placeholder="مثال: شارع الملك فهد" />
                </Field>
                <Field label="رقم المبنى">
                  <input className={inputCls} value={form.buildingNo} onChange={e => update('buildingNo', e.target.value)} placeholder="مثال: 2719" />
                </Field>
                <Field label="الرمز البريدي">
                  <input className={inputCls} value={form.postalCode} onChange={e => update('postalCode', e.target.value)} placeholder="مثال: 11564" />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="العنوان الوطني الكامل">
                    <input className={inputCls} value={form.nationalAddress} onChange={e => update('nationalAddress', e.target.value)} placeholder="مثال: NAXL2023 | الرياض 12345-6789" />
                  </Field>
                </div>
              </div>
            )}

            {/* الخطوة 3: الملكية والصك */}
            {step === 3 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="رقم الصك">
                  <input className={inputCls} value={form.deedNo} onChange={e => update('deedNo', e.target.value)} placeholder="رقم صك الملكية" />
                </Field>
                <Field label="نوع الوثيقة">
                  <select className={selectCls} value={form.deedType} onChange={e => update('deedType', e.target.value)}>
                    <option value="">-- اختر --</option>
                    {['صك ملكية', 'حجة استحكام', 'عقد بيع', 'قرار حكومي'].map(v => <option key={v}>{v}</option>)}
                  </select>
                </Field>
                <Field label="تاريخ إصدار الصك">
                  <input type="date" className={inputCls} value={form.deedDate} onChange={e => update('deedDate', e.target.value)} />
                </Field>
                <Field label="رقم القطعة">
                  <input className={inputCls} value={form.plotNo} onChange={e => update('plotNo', e.target.value)} placeholder="رقم القطعة" />
                </Field>
                <Field label="رقم المخطط">
                  <input className={inputCls} value={form.planNo} onChange={e => update('planNo', e.target.value)} placeholder="رقم المخطط" />
                </Field>
                <Field label="المساحة الإجمالية (م²)">
                  <input type="number" className={inputCls} value={form.area} onChange={e => update('area', e.target.value)} placeholder="مثال: 450" />
                </Field>
              </div>
            )}

            {/* الخطوة 4: بيانات المالك */}
            {step === 4 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Field label="اسم المالك الكامل" required>
                    <input className={inputCls} value={form.ownerName} onChange={e => update('ownerName', e.target.value)} placeholder="الاسم الرباعي للمالك" />
                  </Field>
                </div>
                <Field label="رقم الهوية / الإقامة">
                  <input className={inputCls} value={form.ownerIdNo} onChange={e => update('ownerIdNo', e.target.value)} placeholder="10XXXXXXXX" />
                </Field>
                <Field label="رقم الجوال">
                  <input className={inputCls} value={form.ownerPhone} onChange={e => update('ownerPhone', e.target.value)} placeholder="05XXXXXXXX" />
                </Field>
                <Field label="البريد الإلكتروني">
                  <input type="email" className={inputCls} value={form.ownerEmail} onChange={e => update('ownerEmail', e.target.value)} placeholder="owner@example.com" />
                </Field>
                <Field label="رقم الحساب IBAN">
                  <input className={inputCls} value={form.ownerIban} onChange={e => update('ownerIban', e.target.value)} placeholder="SA00 0000 0000 0000 0000 0000" />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="نسبة رسوم الإدارة (%)">
                    <input type="number" className={inputCls} value={form.managementFee} onChange={e => update('managementFee', e.target.value)} placeholder="مثال: 5" min="0" max="100" />
                  </Field>
                </div>
              </div>
            )}

            {/* الخطوة 5: المبنى والمرافق */}
            {step === 5 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="عدد الطوابق">
                  <input type="number" className={inputCls} value={form.floors} onChange={e => update('floors', e.target.value)} placeholder="مثال: 4" min="1" />
                </Field>
                <Field label="سنة البناء">
                  <input type="number" className={inputCls} value={form.yearBuilt} onChange={e => update('yearBuilt', e.target.value)} placeholder="مثال: 2018" min="1900" max="2026" />
                </Field>
                <Field label="نوع المبنى">
                  <select className={selectCls} value={form.buildingType} onChange={e => update('buildingType', e.target.value)}>
                    <option value="">-- اختر --</option>
                    {['عمارة سكنية', 'فيلا', 'برج', 'مجمع', 'محلات', 'مكاتب', 'مستودع'].map(v => <option key={v}>{v}</option>)}
                  </select>
                </Field>
                <Field label="عدد مواقف السيارات">
                  <input type="number" className={inputCls} value={form.parkingSpaces} onChange={e => update('parkingSpaces', e.target.value)} placeholder="مثال: 10" min="0" />
                </Field>
                {/* خيارات المرافق */}
                <div className="sm:col-span-2">
                  <p className="text-sm font-medium mb-2">المرافق المتوفرة:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { key: 'elevator', label: '🛗 مصعد' },
                      { key: 'generator', label: '⚡ مولد كهربائي' },
                      { key: 'guard', label: '🛡️ حراسة أمنية' },
                      { key: 'pool', label: '🏊 مسبح' },
                      { key: 'gym', label: '💪 صالة رياضية' },
                    ].map(({ key, label }) => (
                      <div key={key} className="flex items-center gap-2 p-2 border border-border rounded-lg cursor-pointer hover:bg-muted/30 transition-colors">
                        <input
                          type="checkbox"
                          id={key}
                          checked={!!(form as any)[key]}
                          onChange={e => update(key, e.target.checked)}
                          className="w-4 h-4 accent-primary"
                        />
                        <label htmlFor={key} className="text-sm cursor-pointer">{label}</label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </CardContent>
        </Card>

        {/* أزرار التنقل */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            className="gap-2"
            disabled={!canPrev}
            onClick={() => setStep(s => s - 1)}
          >
            <ChevronRight className="w-4 h-4" />
            السابق
          </Button>

          <span className="text-sm text-muted-foreground">
            الخطوة {step} من {STEPS.length}
          </span>

          {canNext ? (
            <Button className="gap-2" onClick={() => { setDupError(''); setStep(s => s + 1); }}>
              التالي
              <ChevronLeft className="w-4 h-4" />
            </Button>
          ) : (
            <>
              {dupError && (
                <div className="absolute bottom-20 right-0 left-0 mx-6 p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-2 text-red-400 text-sm">
                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{dupError}</span>
                </div>
              )}
              <Button className="gap-2" onClick={handleSubmit} disabled={saved || saving}>
                {saved ? (
                  <><CheckCircle className="w-4 h-4" /> تم الحفظ!</>
                ) : saving ? (
                  <><Save className="w-4 h-4 animate-spin" /> جاري الحفظ...</>
                ) : (
                  <><Save className="w-4 h-4" /> حفظ العقار</>
                )}
              </Button>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
