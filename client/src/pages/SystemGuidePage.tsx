/*
 * دليل استخدام النظام - رمز الإبداع
 */
import { useState } from 'react';
import { BookOpen, ChevronDown, ChevronLeft, Search, Play, CheckCircle, ExternalLink, FileText, Users, Building2, DollarSign, Wrench, BarChart2, Settings } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';

interface Section {
  id: string;
  title: string;
  icon: any;
  color: string;
  topics: { title: string; content: string; steps?: string[] }[];
}

const SECTIONS: Section[] = [
  {
    id: 'properties',
    title: 'إدارة العقارات',
    icon: Building2,
    color: 'text-blue-400',
    topics: [
      {
        title: 'إضافة عقار جديد',
        content: 'يمكنك إضافة عقارات بسهولة من خلال قسم العقارات في لوحة التحكم.',
        steps: ['اضغط على "العقارات" في القائمة الجانبية', 'اضغط على زر "إضافة عقار"', 'أدخل بيانات العقار (الاسم، النوع، المدينة، الموقع)', 'أضف الوحدات داخل العقار', 'احفظ البيانات'],
      },
      {
        title: 'إدارة الوحدات',
        content: 'كل عقار يحتوي على وحدات يمكن تأجيرها بشكل منفصل.',
        steps: ['افتح العقار من القائمة', 'اضغط "الوحدات"', 'أضف وحدة جديدة مع تفاصيلها', 'حدد حالة الوحدة (شاغرة/مؤجرة)'],
      },
    ],
  },
  {
    id: 'contracts',
    title: 'عقود الإيجار',
    icon: FileText,
    color: 'text-green-400',
    topics: [
      {
        title: 'إنشاء عقد إيجار',
        content: 'منشئ العقود يرشدك خطوة بخطوة لإنشاء عقد إيجار متكامل.',
        steps: ['انتقل إلى "منشئ العقود"', 'اختر المستأجر من القائمة', 'اختر الوحدة المراد تأجيرها', 'حدد تواريخ بداية ونهاية الإيجار', 'أضف شروط الدفع والأقساط', 'راجع العقد وقم بحفظه'],
      },
      {
        title: 'تكامل منصة إيجار',
        content: 'يمكن ربط عقودك مع منصة إيجار الحكومية السعودية.',
        steps: ['اذهب إلى "التكاملات"', 'فعّل تكامل إيجار', 'أدخل بيانات رخصة الوساطة', 'ابدأ مزامنة العقود تلقائياً'],
      },
    ],
  },
  {
    id: 'payments',
    title: 'الدفعات والمالية',
    icon: DollarSign,
    color: 'text-amber-400',
    topics: [
      {
        title: 'تتبع المدفوعات',
        content: 'تابع جميع الدفعات الواردة والمستحقة من شاشة واحدة.',
        steps: ['افتح قسم "الدفعات"', 'اعرض الدفعات المستحقة اليوم', 'سجّل دفعة جديدة بالنقر على "إضافة دفعة"', 'أرفق إيصال الدفع إن وجد'],
      },
      {
        title: 'التقارير المالية',
        content: 'احصل على تقارير شاملة عن الإيرادات والمصروفات.',
        steps: ['انتقل إلى "التقارير المتقدمة"', 'اختر تبويب "التقارير المالية"', 'حدد الفترة الزمنية', 'اطبع أو صدّر التقرير'],
      },
    ],
  },
  {
    id: 'maintenance',
    title: 'الصيانة',
    icon: Wrench,
    color: 'text-orange-400',
    topics: [
      {
        title: 'طلبات الصيانة',
        content: 'استقبل وتتبع طلبات صيانة المستأجرين بكفاءة.',
        steps: ['اذهب إلى "الصيانة"', 'اعرض الطلبات حسب الأولوية', 'كلّف فنياً للطلب', 'تابع الحالة حتى الإغلاق'],
      },
      {
        title: 'الصيانة الوقائية',
        content: 'جدوّل مهام الصيانة الدورية لمنع الأعطال.',
        steps: ['افتح "الصيانة الوقائية"', 'أضف مهمة صيانة دورية', 'حدد التكرار (شهري/ربع سنوي...)', 'تلقَّ تنبيهات عند اقتراب الموعد'],
      },
    ],
  },
  {
    id: 'reports',
    title: 'التقارير والإحصائيات',
    icon: BarChart2,
    color: 'text-purple-400',
    topics: [
      {
        title: 'لوحة التحكم',
        content: 'تعرض لوحة التحكم ملخصاً شاملاً لأداء محفظتك العقارية.',
        steps: ['الصفحة الرئيسية = لوحة التحكم', 'شاهد نسبة الإشغال والإيرادات', 'راقب التنبيهات والعقود المنتهية', 'اضغط على أي بطاقة للتفاصيل'],
      },
    ],
  },
  {
    id: 'settings',
    title: 'الإعدادات والتكاملات',
    icon: Settings,
    color: 'text-muted-foreground',
    topics: [
      {
        title: 'إعداد الحساب',
        content: 'خصّص النظام ليناسب احتياجاتك.',
        steps: ['اذهب إلى "الإعدادات"', 'أضف بيانات شركتك ولوغوها', 'فعّل الإشعارات والتنبيهات', 'اضبط بيانات IBAN للاستلام'],
      },
      {
        title: 'التكاملات الخارجية',
        content: 'ربط النظام مع منصات خارجية متعددة.',
        steps: ['افتح "التكاملات"', 'اختر المنصة (إيجار / واتساب / سيمات...)', 'أدخل بيانات API', 'اختبر الاتصال'],
      },
    ],
  },
];

export default function SystemGuidePage() {
  const [search, setSearch] = useState('');
  const [openSection, setOpenSection] = useState<string | null>('properties');
  const [openTopic, setOpenTopic] = useState<string | null>(null);

  const filtered = SECTIONS.map(s => ({
    ...s,
    topics: s.topics.filter(t => !search || t.title.includes(search) || t.content.includes(search)),
  })).filter(s => !search || s.topics.length > 0 || s.title.includes(search));

  return (
    <DashboardLayout pageTitle="دليل النظام">
      <div className="space-y-5 max-w-4xl" dir="rtl">
        <div className="flex items-center gap-2">
          <BookOpen size={20} className="text-primary" />
          <h1 className="text-lg font-bold">دليل استخدام النظام</h1>
        </div>

        {/* Hero */}
        <div className="bg-gradient-to-l from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-foreground mb-1">مرحباً بك في رمز الإبداع</h2>
          <p className="text-sm text-muted-foreground">هذا الدليل يساعدك على إتقان استخدام نظام إدارة العقارات بسرعة وكفاءة.</p>
          <div className="flex flex-wrap gap-3 mt-4">
            {[{ label: 'عقارات', icon: Building2 }, { label: 'عقود', icon: FileText }, { label: 'مستأجرون', icon: Users }, { label: 'دفعات', icon: DollarSign }].map(item => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-center gap-1.5 bg-card border border-border rounded-lg px-3 py-1.5">
                  <Icon size={13} className="text-primary" />
                  <span className="text-xs text-muted-foreground">{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input className="w-full bg-muted border border-border rounded-xl pr-9 pl-4 py-2.5 text-sm" placeholder="ابحث في الدليل..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* Sections */}
        <div className="space-y-3">
          {filtered.map(section => {
            const Icon = section.icon;
            const isOpen = openSection === section.id;
            return (
              <div key={section.id} className="bg-card border border-border rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenSection(isOpen ? null : section.id)}
                  className="w-full flex items-center gap-3 p-4 hover:bg-muted/20 transition-colors"
                >
                  <Icon size={18} className={section.color} />
                  <span className="flex-1 text-sm font-semibold text-right">{section.title}</span>
                  <span className="text-xs text-muted-foreground">{section.topics.length} موضوع</span>
                  {isOpen ? <ChevronDown size={16} className="text-muted-foreground" /> : <ChevronLeft size={16} className="text-muted-foreground" />}
                </button>

                {isOpen && (
                  <div className="border-t border-border divide-y divide-border/30">
                    {section.topics.map(topic => {
                      const topicKey = `${section.id}-${topic.title}`;
                      const isTopicOpen = openTopic === topicKey;
                      return (
                        <div key={topic.title}>
                          <button
                            onClick={() => setOpenTopic(isTopicOpen ? null : topicKey)}
                            className="w-full flex items-center gap-3 px-5 py-3 hover:bg-muted/20 transition-colors"
                          >
                            <Play size={12} className="text-primary flex-shrink-0" />
                            <span className="flex-1 text-sm text-right">{topic.title}</span>
                            {isTopicOpen ? <ChevronDown size={14} className="text-muted-foreground" /> : <ChevronLeft size={14} className="text-muted-foreground" />}
                          </button>
                          {isTopicOpen && (
                            <div className="px-5 pb-4">
                              <p className="text-xs text-muted-foreground mb-3">{topic.content}</p>
                              {topic.steps && (
                                <ol className="space-y-2">
                                  {topic.steps.map((step, i) => (
                                    <li key={i} className="flex items-start gap-2.5">
                                      <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                                      <span className="text-xs text-foreground">{step}</span>
                                    </li>
                                  ))}
                                </ol>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Help Banner */}
        <div className="bg-muted border border-border rounded-xl p-4 flex items-center gap-3">
          <CheckCircle size={18} className="text-green-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium">تحتاج مساعدة إضافية؟</p>
            <p className="text-xs text-muted-foreground">تواصل مع الدعم الفني عبر WhatsApp أو فتح تذكرة دعم</p>
          </div>
          <a href="/tickets" className="flex items-center gap-1 text-xs text-primary hover:underline">
            <ExternalLink size={12} />فتح تذكرة
          </a>
        </div>
      </div>
    </DashboardLayout>
  );
}
