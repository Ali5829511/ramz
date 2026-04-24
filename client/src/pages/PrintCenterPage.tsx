/*
 * مركز الطباعة - رمز الإبداع
 */
import { useState } from 'react';
import { Printer, FileText, Download, Eye, FileCheck, Building2, Users, DollarSign, Wrench, BarChart2, CheckSquare } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface PrintTemplate {
  id: string;
  name: string;
  icon: any;
  category: string;
  description: string;
  fields: string[];
}

const TEMPLATES: PrintTemplate[] = [
  { id: 'lease-contract', name: 'عقد إيجار', icon: FileText, category: 'عقود', description: 'طباعة عقد الإيجار الرسمي بالتوقيعات', fields: ['اسم المستأجر', 'رقم الوحدة', 'الفترة'] },
  { id: 'receipt', name: 'إيصال دفع', icon: FileCheck, category: 'مالي', description: 'إيصال دفع قسط الإيجار الرسمي', fields: ['المستأجر', 'المبلغ', 'التاريخ', 'طريقة الدفع'] },
  { id: 'property-report', name: 'تقرير عقار', icon: Building2, category: 'تقارير', description: 'تقرير شامل عن العقار والوحدات والإيرادات', fields: ['اسم العقار', 'الفترة الزمنية'] },
  { id: 'tenant-statement', name: 'كشف حساب مستأجر', icon: Users, category: 'مالي', description: 'كشف حساب مفصّل لمستأجر محدد', fields: ['اسم المستأجر', 'الفترة'] },
  { id: 'financial-report', name: 'تقرير مالي', icon: DollarSign, category: 'تقارير', description: 'تقرير الإيرادات والمصروفات لفترة محددة', fields: ['الفترة الزمنية', 'نوع التقرير'] },
  { id: 'maintenance-report', name: 'تقرير صيانة', icon: Wrench, category: 'تقارير', description: 'تقرير طلبات الصيانة ومستوى الخدمة', fields: ['الفترة', 'العقار'] },
  { id: 'summary-report', name: 'تقرير ملخص عام', icon: BarChart2, category: 'تقارير', description: 'ملخص شامل للأداء التشغيلي', fields: ['الفترة الزمنية'] },
  { id: 'notice-letter', name: 'خطاب إشعار', icon: FileText, category: 'خطابات', description: 'خطاب إشعار رسمي للمستأجر', fields: ['المستأجر', 'موضوع الإشعار', 'التاريخ'] },
  { id: 'eviction-notice', name: 'إشعار إخلاء', icon: FileText, category: 'خطابات', description: 'إشعار إخلاء رسمي وفق الأنظمة', fields: ['المستأجر', 'تاريخ الإخلاء', 'السبب'] },
];

const CATEGORIES = ['الكل', 'عقود', 'مالي', 'تقارير', 'خطابات'];

const RECENT_PRINTS = [
  { doc: 'عقد إيجار - سارة الغامدي', date: 'منذ 10 دقائق', pages: 3 },
  { doc: 'إيصال دفع #5021', date: 'منذ ساعة', pages: 1 },
  { doc: 'تقرير مالي - يوليو 2024', date: 'أمس', pages: 5 },
  { doc: 'كشف حساب - أحمد العمري', date: 'قبل يومين', pages: 2 },
];

export default function PrintCenterPage() {
  const [filter, setFilter] = useState('الكل');
  const [selected, setSelected] = useState<PrintTemplate | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [copies, setCopies] = useState(1);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  const filtered = TEMPLATES.filter(t => filter === 'الكل' || t.category === filter);

  const openTemplate = (t: PrintTemplate) => {
    setSelected(t);
    setFormData({});
    setCopies(1);
  };

  const handlePrint = () => {
    const missing = selected?.fields.filter(f => !formData[f]);
    if (missing && missing.length > 0) {
      toast.error(`يرجى إدخال: ${missing.join(', ')}`);
      return;
    }
    toast.success(`جاري إعداد ${selected?.name} (${copies} نسخة)...`);
    setTimeout(() => {
      toast.success('تم إرسال المستند للطابعة');
      setSelected(null);
    }, 1500);
  };

  const handleDownload = () => {
    toast.success('جاري تحميل ملف PDF...');
  };

  return (
    <DashboardLayout pageTitle="مركز الطباعة">
      <div className="space-y-5" dir="rtl">
        <div className="flex items-center gap-2">
          <Printer size={20} className="text-primary" />
          <h1 className="text-lg font-bold">مركز الطباعة والتصدير</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-4">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => setFilter(c)} className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${filter === c ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>{c}</button>
              ))}
            </div>

            {/* Templates Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filtered.map(t => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => openTemplate(t)}
                    className={`text-right p-4 border rounded-xl hover:border-primary/40 hover:bg-primary/5 transition-all group ${selected?.id === t.id ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                        <Icon size={18} className="text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-foreground">{t.name}</p>
                          <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{t.category}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {t.fields.map(f => <span key={f} className="text-[10px] bg-muted/70 px-1.5 py-0.5 rounded text-muted-foreground">{f}</span>)}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            {/* Print Panel */}
            {selected ? (
              <div className="bg-card border border-border rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Printer size={16} className="text-primary" />
                  <h3 className="font-semibold text-sm">{selected.name}</h3>
                </div>

                <div className="space-y-3">
                  {selected.fields.map(field => (
                    <div key={field}>
                      <label className="text-xs text-muted-foreground mb-1 block">{field}</label>
                      <input
                        className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm"
                        value={formData[field] || ''}
                        onChange={e => setFormData(d => ({ ...d, [field]: e.target.value }))}
                        placeholder={field}
                      />
                    </div>
                  ))}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">عدد النسخ</label>
                      <input type="number" min="1" max="50" className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm" value={copies} onChange={e => setCopies(Math.max(1, parseInt(e.target.value) || 1))} />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">الاتجاه</label>
                      <select className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm" value={orientation} onChange={e => setOrientation(e.target.value as 'portrait' | 'landscape')}>
                        <option value="portrait">طولي</option>
                        <option value="landscape">عرضي</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleDownload} variant="outline" className="flex-1 gap-1.5 text-xs h-8"><Download size={13} />PDF</Button>
                  <Button onClick={handlePrint} className="flex-1 gap-1.5 text-xs h-8"><Printer size={13} />طباعة</Button>
                </div>

                <button onClick={() => setSelected(null)} className="w-full text-xs text-muted-foreground hover:text-foreground">إلغاء</button>
              </div>
            ) : (
              <div className="bg-card border border-border border-dashed rounded-xl p-8 text-center">
                <Printer size={32} className="mx-auto text-muted-foreground/30 mb-2" />
                <p className="text-xs text-muted-foreground">اختر قالباً للطباعة</p>
              </div>
            )}

            {/* Recent Prints */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="p-3 border-b border-border">
                <h3 className="text-sm font-semibold">آخر المطبوعات</h3>
              </div>
              <div className="divide-y divide-border/30">
                {RECENT_PRINTS.map((r, i) => (
                  <div key={i} className="flex items-center gap-2.5 p-3">
                    <CheckSquare size={14} className="text-green-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{r.doc}</p>
                      <p className="text-[10px] text-muted-foreground">{r.date} · {r.pages} صفحة</p>
                    </div>
                    <button className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground">
                      <Download size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
