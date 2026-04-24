/*
 * صفحة استيراد البيانات - رمز الإبداع
 */
import { useState } from 'react';
import { Database, Upload, FileText, CheckCircle, AlertCircle, Download } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Step = 'select' | 'upload' | 'preview' | 'done';

const ENTITIES = [
  { key: 'properties', label: 'العقارات', icon: '🏢', fields: ['اسم العقار', 'النوع', 'الموقع', 'عدد الوحدات'] },
  { key: 'tenants', label: 'المستأجرون', icon: '👤', fields: ['الاسم', 'رقم الهوية', 'الجوال', 'الجنسية'] },
  { key: 'owners', label: 'الملاك', icon: '🏠', fields: ['الاسم', 'رقم الهوية', 'الجوال', 'البريد'] },
  { key: 'payments', label: 'الدفعات', icon: '💳', fields: ['رقم العقد', 'المبلغ', 'التاريخ', 'الحالة'] },
  { key: 'contracts', label: 'العقود', icon: '📝', fields: ['رقم العقد', 'اسم المستأجر', 'تاريخ البدء', 'تاريخ الانتهاء'] },
];

export default function DataImport() {
  const [step, setStep] = useState<Step>('select');
  const [selectedEntity, setSelectedEntity] = useState<string>('');
  const [dragging, setDragging] = useState(false);

  return (
    <DashboardLayout pageTitle="استيراد البيانات">
      <PageHeader title="استيراد البيانات" description="رفع ملفات Excel أو CSV لاستيراد البيانات">
        <Button size="sm" variant="outline" className="gap-2"><Download size={15} /> تحميل نموذج</Button>
      </PageHeader>

      <div className="space-y-6">
        {/* Steps Indicator */}
        <div className="flex items-center gap-2">
          {(['select', 'upload', 'preview', 'done'] as Step[]).map((s, i) => {
            const labels = ['اختر النوع', 'رفع الملف', 'المعاينة', 'اكتمل'];
            const stepIndex = ['select', 'upload', 'preview', 'done'].indexOf(step);
            const isCurrent = s === step;
            const isDone = ['select', 'upload', 'preview', 'done'].indexOf(s) < stepIndex;
            return (
              <div key={s} className="flex items-center gap-2">
                <div className={cn('w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors',
                  isCurrent ? 'bg-primary text-primary-foreground' : isDone ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'
                )}>
                  {isDone ? <CheckCircle size={14} /> : i + 1}
                </div>
                <span className={cn('text-xs', isCurrent ? 'font-semibold' : 'text-muted-foreground')}>{labels[i]}</span>
                {i < 3 && <div className="w-8 h-px bg-border" />}
              </div>
            );
          })}
        </div>

        {step === 'select' && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">اختر نوع البيانات التي تريد استيرادها:</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {ENTITIES.map(entity => (
                <button
                  key={entity.key}
                  onClick={() => setSelectedEntity(entity.key)}
                  className={cn('p-4 rounded-lg border text-right transition-all hover:border-primary',
                    selectedEntity === entity.key ? 'border-primary bg-primary/5' : 'border-border bg-card'
                  )}
                >
                  <div className="text-2xl mb-2">{entity.icon}</div>
                  <p className="font-semibold text-sm">{entity.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{entity.fields.join(' • ')}</p>
                </button>
              ))}
            </div>
            <Button disabled={!selectedEntity} onClick={() => setStep('upload')} className="gap-2">
              التالي <span>←</span>
            </Button>
          </div>
        )}

        {step === 'upload' && (
          <div className="space-y-4">
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={e => { e.preventDefault(); setDragging(false); setStep('preview'); }}
              className={cn('border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer',
                dragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
              )}
            >
              <Upload size={40} className="mx-auto mb-3 text-muted-foreground" />
              <p className="font-semibold text-sm">اسحب ملف Excel أو CSV هنا</p>
              <p className="text-xs text-muted-foreground mt-1">أو انقر لاختيار ملف</p>
              <p className="text-xs text-muted-foreground mt-3">الصيغ المدعومة: .xlsx, .xls, .csv</p>
            </div>

            <div className="bg-muted/30 rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm font-semibold mb-2">
                <FileText size={14} className="text-primary" />
                الحقول المطلوبة لـ {ENTITIES.find(e => e.key === selectedEntity)?.label}:
              </div>
              <div className="flex flex-wrap gap-2">
                {ENTITIES.find(e => e.key === selectedEntity)?.fields.map(f => (
                  <span key={f} className="bg-background border border-border text-xs px-2 py-1 rounded">{f}</span>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep('select')}>رجوع</Button>
              <Button onClick={() => setStep('preview')} className="gap-2"><Upload size={14} /> رفع الملف</Button>
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div className="space-y-4">
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3 flex items-center gap-2 text-amber-600 text-sm">
              <AlertCircle size={15} />
              <span>تأكد من صحة البيانات قبل الاستيراد النهائي</span>
            </div>
            <div className="rounded-lg border border-border bg-card p-6 text-center">
              <Database size={40} className="mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">سيظهر هنا معاينة البيانات بعد رفع الملف</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep('upload')}>رجوع</Button>
              <Button onClick={() => setStep('done')} className="gap-2"><CheckCircle size={14} /> تأكيد الاستيراد</Button>
            </div>
          </div>
        )}

        {step === 'done' && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle size={32} className="text-green-500" />
            </div>
            <h3 className="font-heading text-lg font-semibold">تم الاستيراد بنجاح</h3>
            <p className="text-sm text-muted-foreground">تم استيراد البيانات وإضافتها إلى النظام</p>
            <Button onClick={() => { setStep('select'); setSelectedEntity(''); }}>استيراد ملف آخر</Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
