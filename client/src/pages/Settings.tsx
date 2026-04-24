/*
 * صفحة الإعدادات - رمز الإبداع
 */
import { useState } from 'react';
import { Building2, Bell, Shield, Database, Palette, Download, Upload } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const TABS = [
  { key: 'general', label: 'عام', icon: Building2 },
  { key: 'notifications', label: 'الإشعارات', icon: Bell },
  { key: 'security', label: 'الأمان', icon: Shield },
  { key: 'data', label: 'البيانات', icon: Database },
  { key: 'appearance', label: 'المظهر', icon: Palette },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general');
  const [language, setLanguage] = useState('ar');
  const [timezone, setTimezone] = useState('Asia/Riyadh');

  return (
    <DashboardLayout pageTitle="الإعدادات">
      <PageHeader title="الإعدادات" description="إدارة إعدادات النظام" />

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Tabs */}
        <div className="lg:w-56 flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                title={`تبويب ${tab.label}`}
                aria-label={`تبويب ${tab.label}`}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors',
                  activeTab === tab.key
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 bg-card border border-border rounded-lg p-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h3 className="font-heading text-base font-semibold text-foreground">الإعدادات العامة</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-foreground mb-1.5">اسم الشركة</label>
                  <input
                    type="text"
                    defaultValue="شركة رمز الإبداع لإدارة الأملاك"
                    title="اسم الشركة"
                    aria-label="اسم الشركة"
                    className="w-full h-10 px-3 rounded-lg bg-input border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm text-foreground mb-1.5">البريد الإلكتروني</label>
                  <input
                    type="email"
                    defaultValue="info@ramzabdae.com"
                    title="البريد الإلكتروني"
                    aria-label="البريد الإلكتروني"
                    className="w-full h-10 px-3 rounded-lg bg-input border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm text-foreground mb-1.5">رقم الهاتف</label>
                  <input
                    type="tel"
                    defaultValue="920013517"
                    title="رقم الهاتف"
                    aria-label="رقم الهاتف"
                    className="w-full h-10 px-3 rounded-lg bg-input border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm text-foreground mb-1.5">العنوان</label>
                  <input
                    type="text"
                    defaultValue="المملكة العربية السعودية"
                    title="العنوان"
                    aria-label="العنوان"
                    className="w-full h-10 px-3 rounded-lg bg-input border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-foreground mb-1.5">اللغة الافتراضية</label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      title="اللغة الافتراضية"
                      aria-label="اللغة الافتراضية"
                      className="w-full h-10 px-3 rounded-lg bg-input border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="ar">العربية</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-foreground mb-1.5">المنطقة الزمنية</label>
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      title="المنطقة الزمنية"
                      aria-label="المنطقة الزمنية"
                      className="w-full h-10 px-3 rounded-lg bg-input border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="Asia/Riyadh">Asia/Riyadh</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </div>
                </div>
                <Button size="sm">حفظ التغييرات</Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="rounded-lg border border-border p-3 bg-muted/20">
                  <p className="text-xs text-muted-foreground">حالة الترخيص</p>
                  <p className="text-sm font-semibold text-foreground mt-1">نشط</p>
                </div>
                <div className="rounded-lg border border-border p-3 bg-muted/20">
                  <p className="text-xs text-muted-foreground">آخر نسخة احتياطية</p>
                  <p className="text-sm font-semibold text-foreground mt-1">اليوم 02:00 ص</p>
                </div>
                <div className="rounded-lg border border-border p-3 bg-muted/20">
                  <p className="text-xs text-muted-foreground">بيئة التشغيل</p>
                  <p className="text-sm font-semibold text-foreground mt-1">Production</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className="font-heading text-base font-semibold text-foreground">إعدادات الإشعارات</h3>
              <div className="space-y-3">
                {[
                  'إشعارات الدفعات المتأخرة',
                  'إشعارات انتهاء العقود',
                  'إشعارات طلبات الصيانة',
                  'إشعارات المستأجرين الجدد',
                  'التقارير الأسبوعية',
                ].map(item => (
                  <label key={item} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <span className="text-sm text-foreground">{item}</span>
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded accent-primary" />
                  </label>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <h3 className="font-heading text-base font-semibold text-foreground">الأمان والخصوصية</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-foreground mb-1.5">كلمة المرور الحالية</label>
                  <input type="password" title="كلمة المرور الحالية" aria-label="كلمة المرور الحالية" className="w-full h-10 px-3 rounded-lg bg-input border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm text-foreground mb-1.5">كلمة المرور الجديدة</label>
                  <input type="password" title="كلمة المرور الجديدة" aria-label="كلمة المرور الجديدة" className="w-full h-10 px-3 rounded-lg bg-input border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
                <Button size="sm">تحديث كلمة المرور</Button>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-6">
              <h3 className="font-heading text-base font-semibold text-foreground">إدارة البيانات</h3>
              <div className="space-y-3">
                <div className="p-4 rounded-lg bg-muted/30">
                  <h4 className="text-sm font-medium text-foreground mb-1">تصدير البيانات</h4>
                  <p className="text-xs text-muted-foreground mb-3">تصدير جميع بيانات النظام بصيغة Excel أو CSV</p>
                  <Button variant="outline" size="sm" className="gap-1.5"><Download size={14} /> تصدير البيانات</Button>
                </div>
                <div className="p-4 rounded-lg bg-muted/30">
                  <h4 className="text-sm font-medium text-foreground mb-1">استيراد البيانات</h4>
                  <p className="text-xs text-muted-foreground mb-3">استيراد بيانات من ملف Excel أو CSV</p>
                  <Button variant="outline" size="sm" className="gap-1.5"><Upload size={14} /> استيراد البيانات</Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <h3 className="font-heading text-base font-semibold text-foreground">المظهر</h3>
              <p className="text-sm text-muted-foreground">
                المظهر الحالي يعتمد نمطاً فاتحاً فاخراً بخلفية بيضاء ولمسات ذهبية متناسقة مع الهوية.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button title="اختيار النمط الفاتح الذهبي" aria-label="اختيار النمط الفاتح الذهبي" className="h-16 rounded-lg border-2 border-primary bg-background text-xs text-foreground">فاتح ذهبي</button>
                <button title="اختيار النمط المحايد" aria-label="اختيار النمط المحايد" className="h-16 rounded-lg border border-border bg-muted/30 text-xs text-muted-foreground">محايد</button>
                <button title="اختيار النمط عالي التباين" aria-label="اختيار النمط عالي التباين" className="h-16 rounded-lg border border-border bg-muted/30 text-xs text-muted-foreground">عالي التباين</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
