/*
 * تذاكر الصيانة - رمز الإبداع
 */
import React, { useState } from 'react';
import { Wrench, Plus, Search, Filter, Clock, AlertTriangle, CheckCircle2, ChevronDown } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type Priority = 'عاجل' | 'مرتفع' | 'متوسط' | 'منخفض';
type TicketStatus = 'مفتوح' | 'قيد التنفيذ' | 'معلق' | 'مغلق';

interface Ticket {
  id: number;
  title: string;
  description: string;
  tenant: string;
  unit: string;
  property: string;
  category: string;
  priority: Priority;
  status: TicketStatus;
  created: string;
  assigned: string;
}

const CATEGORIES = ['سباكة', 'كهرباء', 'تكييف', 'نجارة', 'دهانات', 'حراسة', 'نظافة', 'أخرى'];
const PRIORITIES: Priority[] = ['عاجل', 'مرتفع', 'متوسط', 'منخفض'];
const STATUSES: TicketStatus[] = ['مفتوح', 'قيد التنفيذ', 'معلق', 'مغلق'];

const priorityColor: Record<Priority, string> = {
  'عاجل': 'text-red-400 bg-red-500/15',
  'مرتفع': 'text-orange-400 bg-orange-500/15',
  'متوسط': 'text-amber-400 bg-amber-500/15',
  'منخفض': 'text-green-400 bg-green-500/15',
};

const statusColor: Record<TicketStatus, string> = {
  'مفتوح': 'text-blue-400 bg-blue-500/15',
  'قيد التنفيذ': 'text-amber-400 bg-amber-500/15',
  'معلق': 'text-muted-foreground bg-muted',
  'مغلق': 'text-green-400 bg-green-500/15',
};

const SAMPLE: Ticket[] = [
  { id: 1, title: 'تسريب مياه في الحمام', description: 'يوجد تسريب في صنبور الحمام منذ يومين', tenant: 'أحمد العمري', unit: 'A-101', property: 'برج النور', category: 'سباكة', priority: 'عاجل', status: 'مفتوح', created: new Date().toISOString().split('T')[0], assigned: '' },
  { id: 2, title: 'خلل في التكييف', description: 'التكييف لا يبرد بالكفاءة المعتادة', tenant: 'سارة الغامدي', unit: 'B-203', property: 'مجمع الياسمين', category: 'تكييف', priority: 'مرتفع', status: 'قيد التنفيذ', created: new Date(Date.now() - 86400e3).toISOString().split('T')[0], assigned: 'محمد الفني' },
  { id: 3, title: 'إصلاح باب المدخل', description: 'باب الغرفة الرئيسية لا يغلق بشكل صحيح', tenant: 'خالد النجدي', unit: 'C-315', property: 'بناية الأمل', category: 'نجارة', priority: 'متوسط', status: 'معلق', created: new Date(Date.now() - 2 * 86400e3).toISOString().split('T')[0], assigned: '' },
  { id: 4, title: 'انقطاع الكهرباء', description: 'انقطاع في إضاءة الممر', tenant: 'نورة القحطاني', unit: 'A-205', property: 'برج النور', category: 'كهرباء', priority: 'مرتفع', status: 'مغلق', created: new Date(Date.now() - 5 * 86400e3).toISOString().split('T')[0], assigned: 'علي الكهربائي' },
];

const today = new Date().toISOString().split('T')[0];
const emptyForm = () => ({ title: '', description: '', tenant: '', unit: '', property: '', category: CATEGORIES[0], priority: 'متوسط' as Priority, status: 'مفتوح' as TicketStatus, assigned: '' });

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>(SAMPLE);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('الكل');
  const [filterPriority, setFilterPriority] = useState('الكل');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Ticket | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm());

  const setF = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const filtered = tickets.filter(t => {
    const match = !search || t.title.includes(search) || t.tenant.includes(search) || t.unit.includes(search);
    const matchStatus = filterStatus === 'الكل' || t.status === filterStatus;
    const matchPriority = filterPriority === 'الكل' || t.priority === filterPriority;
    return match && matchStatus && matchPriority;
  });

  const openNew = () => { setEditing(null); setForm(emptyForm()); setShowForm(true); };
  const openEdit = (t: Ticket) => { setEditing(t); setForm({ title: t.title, description: t.description, tenant: t.tenant, unit: t.unit, property: t.property, category: t.category, priority: t.priority, status: t.status, assigned: t.assigned }); setShowForm(true); };

  const handleSave = () => {
    if (!form.title || !form.tenant) { toast.error('العنوان واسم المستأجر مطلوبان'); return; }
    if (editing) {
      setTickets(list => list.map(t => t.id === editing.id ? { ...editing, ...form } : t));
      toast.success('تم تحديث التذكرة');
    } else {
      setTickets(list => [{ id: Date.now(), created: today, ...form }, ...list]);
      toast.success('تم فتح تذكرة جديدة');
    }
    setShowForm(false);
  };

  const updateStatus = (id: number, status: TicketStatus) => {
    setTickets(list => list.map(t => t.id === id ? { ...t, status } : t));
  };

  const counts = STATUSES.reduce((acc, s) => ({ ...acc, [s]: tickets.filter(t => t.status === s).length }), {} as Record<string, number>);

  return (
    <DashboardLayout pageTitle="تذاكر الصيانة">
      <div className="space-y-5" dir="rtl">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Wrench size={20} className="text-primary" />
            <h1 className="text-lg font-bold">تذاكر الصيانة والدعم</h1>
          </div>
          <Button onClick={openNew} className="gap-2"><Plus size={16} />تذكرة جديدة</Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'مفتوح', value: counts['مفتوح'] || 0, color: 'text-blue-400', icon: AlertTriangle },
            { label: 'قيد التنفيذ', value: counts['قيد التنفيذ'] || 0, color: 'text-amber-400', icon: Clock },
            { label: 'معلق', value: counts['معلق'] || 0, color: 'text-muted-foreground', icon: Clock },
            { label: 'مغلق', value: counts['مغلق'] || 0, color: 'text-green-400', icon: CheckCircle2 },
          ].map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="bg-card border border-border rounded-xl p-3 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg bg-muted flex items-center justify-center ${s.color}`}><Icon size={16} /></div>
                <div>
                  <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input className="w-full bg-muted border border-border rounded-lg pr-8 pl-3 py-2 text-sm" placeholder="بحث عن تذكرة..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <Filter size={14} className="text-muted-foreground" />
            {['الكل', ...STATUSES].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)} className={`px-2.5 py-1 rounded-lg text-xs transition-colors ${filterStatus === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>{s}</button>
            ))}
          </div>
          <div className="flex gap-1 flex-wrap">
            {['الكل', ...PRIORITIES].map(p => (
              <button key={p} onClick={() => setFilterPriority(p)} className={`px-2.5 py-1 rounded-lg text-xs transition-colors ${filterPriority === p ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>{p}</button>
            ))}
          </div>
        </div>

        {/* Tickets */}
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-sm">لا توجد تذاكر</div>
          ) : filtered.map(t => (
            <div key={t.id} className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="flex items-center gap-3 p-4 cursor-pointer" onClick={() => setExpanded(expanded === t.id ? null : t.id)}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-sm text-foreground">{t.title}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColor[t.priority]}`}>{t.priority}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor[t.status]}`}>{t.status}</span>
                    <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{t.category}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{t.tenant} · {t.unit} · {t.property}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground hidden sm:block">{t.created}</span>
                  <ChevronDown size={15} className={`text-muted-foreground transition-transform ${expanded === t.id ? 'rotate-180' : ''}`} />
                </div>
              </div>
              {expanded === t.id && (
                <div className="border-t border-border p-4 space-y-3 bg-muted/20">
                  {t.description && <p className="text-sm text-muted-foreground">{t.description}</p>}
                  <div className="flex flex-wrap gap-2 items-center">
                    {t.assigned && <span className="text-xs text-muted-foreground">مسند إلى: <span className="text-foreground">{t.assigned}</span></span>}
                    <span className="text-xs text-muted-foreground mr-auto">تعيين الحالة:</span>
                    {STATUSES.filter(s => s !== t.status).map(s => (
                      <button key={s} onClick={() => updateStatus(t.id, s)} className={`text-xs px-2 py-1 rounded-lg border ${statusColor[s]} border-current/20`}>{s}</button>
                    ))}
                    <button onClick={() => openEdit(t)} className="text-xs bg-muted px-2 py-1 rounded-lg text-muted-foreground hover:text-foreground">تعديل</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-2xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto" dir="rtl">
              <h2 className="font-semibold">{editing ? 'تعديل التذكرة' : 'تذكرة جديدة'}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="col-span-full">
                  <label className="text-xs text-muted-foreground mb-1 block">عنوان المشكلة *</label>
                  <input className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm" value={form.title} onChange={e => setF('title', e.target.value)} placeholder="وصف موجز للمشكلة" />
                </div>
                <div className="col-span-full">
                  <label className="text-xs text-muted-foreground mb-1 block">التفاصيل</label>
                  <textarea rows={2} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm resize-none" value={form.description} onChange={e => setF('description', e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">المستأجر *</label>
                  <input className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm" value={form.tenant} onChange={e => setF('tenant', e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">رقم الوحدة</label>
                  <input className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm" value={form.unit} onChange={e => setF('unit', e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">الفئة</label>
                  <select className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm" value={form.category} onChange={e => setF('category', e.target.value)}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">الأولوية</label>
                  <select className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm" value={form.priority} onChange={e => setF('priority', e.target.value as Priority)}>
                    {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">الحالة</label>
                  <select className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm" value={form.status} onChange={e => setF('status', e.target.value as TicketStatus)}>
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">مسند إلى</label>
                  <input className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm" value={form.assigned} onChange={e => setF('assigned', e.target.value)} placeholder="اسم الفني" />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowForm(false)}>إلغاء</Button>
                <Button onClick={handleSave}>حفظ</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

