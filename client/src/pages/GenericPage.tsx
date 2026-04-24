/*
 * صفحة تشغيلية عامة - رمز الإبداع
 * تُستخدم كبديل عملي للصفحات التي لم تُفصل بالكامل بعد
 */
import { CheckCircle2, Construction, FileText, Wrench } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';

interface GenericPageProps {
  title: string;
  description?: string;
  icon?: React.ElementType;
}

export default function GenericPage({ title, description, icon: Icon = Construction }: GenericPageProps) {
  const checklist = [
    'تحديث البيانات الأساسية للقسم',
    'مراجعة السجلات المفتوحة والمتأخرة',
    'تنفيذ إجراء سريع (إضافة/تعديل/تصدير)',
    'توثيق الملاحظات التشغيلية اليومية',
  ];

  return (
    <DashboardLayout pageTitle={title}>
      <PageHeader title={title} description={description} />
      <div className="space-y-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Icon size={22} className="text-primary" />
            </div>
            <div>
              <h3 className="font-heading text-base font-semibold text-foreground">{title}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                تم تفعيل نسخة تشغيلية لهذه الصفحة لتسريع العمل حتى اكتمال البناء التفصيلي.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 size={16} className="text-green-600" />
              <p className="text-sm font-medium text-foreground">حالة القسم</p>
            </div>
            <p className="text-xs text-muted-foreground">جاهز للتشغيل الأساسي</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText size={16} className="text-primary" />
              <p className="text-sm font-medium text-foreground">المخرجات</p>
            </div>
            <p className="text-xs text-muted-foreground">تقارير وسجلات قابلة للمراجعة</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Wrench size={16} className="text-amber-600" />
              <p className="text-sm font-medium text-foreground">التطوير القادم</p>
            </div>
            <p className="text-xs text-muted-foreground">تفاصيل متقدمة قيد التحضير</p>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <h4 className="font-heading text-sm font-semibold text-foreground mb-3">قائمة تشغيل سريعة</h4>
          <div className="space-y-2">
            {checklist.map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-foreground">
                <CheckCircle2 size={14} className="text-primary" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
