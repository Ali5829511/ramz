/*
 * الصيانة الوقائية - رمز الإبداع
 */
import { useState } from 'react';
import { ShieldCheck, Plus, Calendar, Clock, CheckCircle2, AlertTriangle, Building2, RotateCcw } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type TaskStatus = 'مجدول' | 'مكتمل' | 'متأخر' | 'ملغي';
type Frequency = 'أسبوعي' | 'شهري' | 'ربع سنوي' | 'نصف سنوي' | 'سنوي';

interface PMTask {
  id: number;
  title: string;
  property: string;
  category: string;
  frequency: Frequency;
  nextDue: string;
  lastDone?: string;
  status: TaskStatus;
  assignedTo: string;
  notes: string;
}

const CATEGORIES = ['نظام التكييف', 'السباكة', 'الكهرباء', 'مضخات المياه', 'المصعد', 'الحماية من الحرائق', 'أنظمة الأمن', 'السطح والواجهة', 'المناطق المشتركة'];
const FREQS: Frequency[] = ['أسبوعي', 'شهري', 'ربع سنوي', 'نصف سنوي', 'سنوي'];

const statusColors: Record<TaskStatus, string> = {
  'مجدول': 'text-blue-400 bg-blue-500/15',
  'مكتمل': 'text-green-400 bg-green-500/15',
  'متأخر': 'text-red-400 bg-red-500/15',
  'ملغي': 'text-muted-foreground bg-muted',
};

const addDays = (d: number) => new Date(Date.now() + d * 86400e3).toISOString().split('T')[0];

const SAMPLE: PMTask[] = [
  { id: 1, title: 'فحص وصيانة أنظمة التكييف المركزي', property: 'برج النور', category: 'نظام التكييف', frequency: 'ربع سنوي', nextDue: addDays(15), lastDone: addDays(-75), status: 'مجدول', assignedTo: 'فريق التكييف', notes: 'فحص الفلاتر وتنظيف المكثفات' },
  { id: 2, title: 'فحص نظام إطفاء الحرائق', property: 'مجمع الياسمين', category: 'الحماية من الحرائق', frequency: 'نصف سنوي', nextDue: addDays(-5), lastDone: addDays(-185), status: 'متأخر', assignedTo: 'شركة السلامة', notes: '' },
  { id: 3, title: 'صيانة المصعد الدورية', property: 'برج النور', category: 'المصعد', frequency: 'شهري', nextDue: addDays(8), lastDone: addDays(-22), status: 'مجدول', assignedTo: 'شركة OTIS', notes: 'تشحيم الكابلات وفحص الحساسات' },
  { id: 4, title: 'فحص مضخات المياه', property: 'بناية الأمل', category: 'مضخات المياه', frequency: 'ربع سنوي', nextDue: addDays(30), lastDone: addDays(-60), status: 'مكتمل', assignedTo: 'علي المصلح', notes: '' },
  { id: 5, title: 'صيانة كاميرات المراقبة', property: 'مجمع الياسمين', category: 'أنظمة الأمن', frequency: 'سنوي', nextDue: addDays(120), lastDone: addDays(-245), status: 'مجدول', assignedTo: 'فريق الأمن', notes: '' },
];

export default function PreventiveMaintenanceSystem() {
  const [tasks, setTasks] = useState<PMTask[]>(SAMPLE);
  const [filter, setFilter] = useState('الكل');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', property: '', category: CATEGORIES[0], frequency: 'شهري' as Frequency, nextDue: addDays(30), assignedTo: '', notes: '' });

  const setF = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const filtered = filter === 'الكل' ? tasks : tasks.filter(t => t.status === filter);
  const counts = { 'مجدول': tasks.filter(t => t.status === 'مجدول').length, 'مكتمل': tasks.filter(t => t.status === 'مكتمل').length, 'متأخر': tasks.filter(t => t.status === 'متأخر').length };

  const markDone = (id: number) => {
    setTasks(list => list.map(t => t.id === id ? { ...t, status: 'مكتمل', lastDone: addDays(0) } : t));
    toast.success('تم تسجيل الصيانة كمكتملة');
  };

  const handleAdd = () => {
    if (!form.title || !form.property) { toast.error('العنوان والعقار مطلوبان'); return; }
    setTasks(list => [{ id: Date.now(), ...form, status: 'مجدول' }, ...list]);
    setShowForm(false);
    toast.success('تم إضافة مهمة الصيانة');
  };

  return (
    <DashboardLayout pageTitle="الصيانة الوقائية">
      <div className="space-y-5" dir="rtl">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck size={20} className="text-primary" />
            <h1 className="text-lg font-bold">نظام الصيانة الوقائية</h1>
          </div>
          <Button onClick={() => setShowForm(true)} className="gap-2"><Plus size={16} />إضافة مهمة</Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[{ label: 'مجدول', value: counts['مجدول'], color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { label: 'مكتمل', value: counts['مكتمل'], color: 'text-green-400', bg: 'bg-green-500/10' },
            { label: 'متأخر', value: counts['متأخر'], color: 'text-red-400', bg: 'bg-red-500/10' }].map(s => (
            <div key={s.label} className={`border border-border rounded-xl p-4 text-center ${s.bg}`}>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex gap-1.5">
          {['الكل', 'مجدول', 'متأخر', 'مكتمل', 'ملغي'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${filter === f ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>{f}</button>
          ))}
        </div>

        {/* Tasks */}
        <div className="space-y-3">
          {filtered.map(t => (
            <div key={t.id} className={`bg-card border rounded-xl p-4 ${t.status === 'متأخر' ? 'border-red-500/30' : 'border-border'}`}>
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${statusColors[t.status].split(' ')[1]}`}>
                  {t.status === 'متأخر' ? <AlertTriangle size={18} className="text-red-400" /> : t.status === 'مكتمل' ? <CheckCircle2 size={18} className="text-green-400" /> : <RotateCcw size={18} className="text-blue-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-sm text-foreground">{t.title}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[t.status]}`}>{t.status}</span>
                    <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{t.frequency}</span>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Building2 size={11} />{t.property}</span>
                    <span className="flex items-center gap-1"><Clock size={11} />الموعد القادم: {t.nextDue}</span>
                    {t.lastDone && <span className="flex items-center gap-1"><CheckCircle2 size={11} />آخر تنفيذ: {t.lastDone}</span>}
                  </div>
                  {t.notes && <p className="text-xs text-muted-foreground mt-1 italic">{t.notes}</p>}
                </div>
                {t.status !== 'مكتمل' && (
                  <Button size="sm" variant="outline" className="text-xs h-7 gap-1" onClick={() => markDone(t.id)}>
                    <CheckCircle2 size={12} />تم
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 space-y-4" dir="rtl">
              <h2 className="font-semibold">مهمة صيانة وقائية جديدة</h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2"><label className="text-xs text-muted-foreground mb-1 block">عنوان المهمة *</label><input className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm" value={form.title} onChange={e => setF('title', e.target.value)} /></div>
                <div><label className="text-xs text-muted-foreground mb-1 block">العقار *</label><input className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm" value={form.property} onChange={e => setF('property', e.target.value)} /></div>
                <div><label className="text-xs text-muted-foreground mb-1 block">الفئة</label><select className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm" value={form.category} onChange={e => setF('category', e.target.value)}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></div>
                <div><label className="text-xs text-muted-foreground mb-1 block">التكرار</label><select className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm" value={form.frequency} onChange={e => setF('frequency', e.target.value as Frequency)}>{FREQS.map(f => <option key={f}>{f}</option>)}</select></div>
                <div><label className="text-xs text-muted-foreground mb-1 block">الموعد القادم</label><input type="date" className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm" value={form.nextDue} onChange={e => setF('nextDue', e.target.value)} /></div>
                <div className="col-span-2"><label className="text-xs text-muted-foreground mb-1 block">المسند إلى</label><input className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm" value={form.assignedTo} onChange={e => setF('assignedTo', e.target.value)} /></div>
                <div className="col-span-2"><label className="text-xs text-muted-foreground mb-1 block">ملاحظات</label><textarea rows={2} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm resize-none" value={form.notes} onChange={e => setF('notes', e.target.value)} /></div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowForm(false)}>إلغاء</Button>
                <Button onClick={handleAdd}>إضافة</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
