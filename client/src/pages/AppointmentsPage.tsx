/*
 * المواعيد - رمز الإبداع
 */
import React, { useState } from 'react';
import { Calendar, Plus, Clock, User, Phone, MapPin, CheckCircle, XCircle, Filter, Search } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type AppointmentStatus = 'مجدول' | 'مكتمل' | 'ملغي' | 'قيد الانتظار';

interface Appointment {
  id: number;
  title: string;
  client: string;
  phone: string;
  date: string;
  time: string;
  location: string;
  type: string;
  status: AppointmentStatus;
  notes: string;
}

const TYPES = ['عرض وحدة', 'توقيع عقد', 'صيانة', 'متابعة', 'استفسار', 'اجتماع'];
const STATUSES: AppointmentStatus[] = ['مجدول', 'مكتمل', 'ملغي', 'قيد الانتظار'];

const statusColors: Record<AppointmentStatus, string> = {
  'مجدول': 'text-blue-400 bg-blue-500/15',
  'مكتمل': 'text-green-400 bg-green-500/15',
  'ملغي': 'text-red-400 bg-red-500/15',
  'قيد الانتظار': 'text-amber-400 bg-amber-500/15',
};

const SAMPLE: Appointment[] = [
  { id: 1, title: 'عرض شقة 101', client: 'أحمد محمد العمري', phone: '0501234567', date: new Date().toISOString().split('T')[0], time: '10:00', location: 'برج النور - الدور 5', type: 'عرض وحدة', status: 'مجدول', notes: '' },
  { id: 2, title: 'توقيع عقد', client: 'سارة علي الغامدي', phone: '0557654321', date: new Date().toISOString().split('T')[0], time: '13:30', location: 'المكتب الرئيسي', type: 'توقيع عقد', status: 'مجدول', notes: 'إحضار الهوية الوطنية' },
  { id: 3, title: 'صيانة تكييف', client: 'خالد يوسف النجدي', phone: '0565432109', date: new Date(Date.now() - 86400e3).toISOString().split('T')[0], time: '09:00', location: 'شقة 202 - مبنى الأمل', type: 'صيانة', status: 'مكتمل', notes: '' },
  { id: 4, title: 'استفسار عن سكن', client: 'نورة سعد القحطاني', phone: '0508765432', date: new Date(Date.now() + 86400e3).toISOString().split('T')[0], time: '11:00', location: 'الفرع الشمالي', type: 'استفسار', status: 'قيد الانتظار', notes: '' },
  { id: 5, title: 'متابعة مستأجر', client: 'عبدالله فهد الشمري', phone: '0542345678', date: new Date(Date.now() + 2 * 86400e3).toISOString().split('T')[0], time: '14:00', location: 'اتصال هاتفي', type: 'متابعة', status: 'مجدول', notes: 'متابعة تجديد العقد' },
];

const today = new Date().toISOString().split('T')[0];

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>(SAMPLE);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('الكل');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Appointment | null>(null);
  const [form, setForm] = useState({ title: '', client: '', phone: '', date: today, time: '10:00', location: '', type: TYPES[0], status: 'مجدول' as AppointmentStatus, notes: '' });

  const setF = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const filtered = appointments.filter(a => {
    const matchSearch = !search || a.title.includes(search) || a.client.includes(search);
    const matchStatus = filterStatus === 'الكل' || a.status === filterStatus;
    return matchSearch && matchStatus;
  }).sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));

  const openNew = () => { setEditing(null); setForm({ title: '', client: '', phone: '', date: today, time: '10:00', location: '', type: TYPES[0], status: 'مجدول', notes: '' }); setShowForm(true); };
  const openEdit = (a: Appointment) => { setEditing(a); setForm({ title: a.title, client: a.client, phone: a.phone, date: a.date, time: a.time, location: a.location, type: a.type, status: a.status, notes: a.notes }); setShowForm(true); };

  const handleSave = () => {
    if (!form.title || !form.client) { toast.error('عنوان الموعد واسم العميل مطلوبان'); return; }
    if (editing) {
      setAppointments(list => list.map(a => a.id === editing.id ? { ...editing, ...form } : a));
      toast.success('تم تعديل الموعد');
    } else {
      setAppointments(list => [...list, { id: Date.now(), ...form }]);
      toast.success('تم إضافة الموعد');
    }
    setShowForm(false);
  };

  const updateStatus = (id: number, status: AppointmentStatus) => {
    setAppointments(list => list.map(a => a.id === id ? { ...a, status } : a));
    toast.success(`تم تحديث الحالة إلى: ${status}`);
  };

  const stats = STATUSES.reduce((acc, s) => ({ ...acc, [s]: appointments.filter(a => a.status === s).length }), {} as Record<string, number>);
  const todayCount = appointments.filter(a => a.date === today).length;

  return (
    <DashboardLayout pageTitle="إدارة المواعيد">
      <div className="space-y-5" dir="rtl">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Calendar size={20} className="text-primary" />
            <h1 className="text-lg font-bold">إدارة المواعيد</h1>
          </div>
          <Button onClick={openNew} className="gap-2"><Plus size={16} />موعد جديد</Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: 'مواعيد اليوم', value: todayCount, color: 'text-primary' },
            { label: 'مجدول', value: stats['مجدول'] || 0, color: 'text-blue-400' },
            { label: 'قيد الانتظار', value: stats['قيد الانتظار'] || 0, color: 'text-amber-400' },
            { label: 'مكتمل', value: stats['مكتمل'] || 0, color: 'text-green-400' },
            { label: 'ملغي', value: stats['ملغي'] || 0, color: 'text-red-400' },
          ].map(s => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-3 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input className="w-full bg-muted border border-border rounded-lg pr-8 pl-3 py-2 text-sm" placeholder="بحث عن موعد أو عميل..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex items-center gap-1.5">
            <Filter size={14} className="text-muted-foreground" />
            {['الكل', ...STATUSES].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterStatus === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>{s}</button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-sm">لا توجد مواعيد</div>
          ) : filtered.map(a => (
            <div key={a.id} className="bg-card border border-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-lg font-bold ${a.date === today ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'}`}>
                {new Date(a.date).getDate()}
                <span className="text-[10px] mr-0.5">{new Date(a.date).toLocaleDateString('ar-SA', { month: 'short' })}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-sm text-foreground">{a.title}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[a.status]}`}>{a.status}</span>
                  <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{a.type}</span>
                </div>
                <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><User size={11} />{a.client}</span>
                  {a.phone && <span className="flex items-center gap-1"><Phone size={11} />{a.phone}</span>}
                  <span className="flex items-center gap-1"><Clock size={11} />{a.time}</span>
                  {a.location && <span className="flex items-center gap-1"><MapPin size={11} />{a.location}</span>}
                </div>
                {a.notes && <p className="text-xs text-muted-foreground mt-1 italic">{a.notes}</p>}
              </div>
              <div className="flex gap-1 flex-wrap sm:flex-col">
                {a.status !== 'مكتمل' && (
                  <button onClick={() => updateStatus(a.id, 'مكتمل')} className="text-xs flex items-center gap-1 text-green-400 hover:text-green-300 bg-green-500/10 px-2 py-1 rounded-lg">
                    <CheckCircle size={12} />مكتمل
                  </button>
                )}
                {a.status !== 'ملغي' && (
                  <button onClick={() => updateStatus(a.id, 'ملغي')} className="text-xs flex items-center gap-1 text-red-400 hover:text-red-300 bg-red-500/10 px-2 py-1 rounded-lg">
                    <XCircle size={12} />إلغاء
                  </button>
                )}
                <button onClick={() => openEdit(a)} className="text-xs text-muted-foreground hover:text-foreground bg-muted px-2 py-1 rounded-lg">تعديل</button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-2xl w-full max-w-lg p-6 space-y-4" dir="rtl">
              <h2 className="font-semibold text-foreground">{editing ? 'تعديل الموعد' : 'موعد جديد'}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="col-span-full">
                  <label className="text-xs text-muted-foreground mb-1 block">عنوان الموعد *</label>
                  <input className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm" value={form.title} onChange={e => setF('title', e.target.value)} placeholder="عرض وحدة، توقيع عقد..." />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">اسم العميل *</label>
                  <input className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm" value={form.client} onChange={e => setF('client', e.target.value)} placeholder="الاسم الكامل" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">رقم الجوال</label>
                  <input className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm" value={form.phone} onChange={e => setF('phone', e.target.value)} placeholder="05XXXXXXXX" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">التاريخ</label>
                  <input type="date" className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm" value={form.date} onChange={e => setF('date', e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">الوقت</label>
                  <input type="time" className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm" value={form.time} onChange={e => setF('time', e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">نوع الموعد</label>
                  <select className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm" value={form.type} onChange={e => setF('type', e.target.value)}>
                    {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">الحالة</label>
                  <select className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm" value={form.status} onChange={e => setF('status', e.target.value as AppointmentStatus)}>
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="col-span-full">
                  <label className="text-xs text-muted-foreground mb-1 block">الموقع</label>
                  <input className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm" value={form.location} onChange={e => setF('location', e.target.value)} placeholder="العنوان أو اسم المكان" />
                </div>
                <div className="col-span-full">
                  <label className="text-xs text-muted-foreground mb-1 block">ملاحظات</label>
                  <textarea rows={2} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm resize-none" value={form.notes} onChange={e => setF('notes', e.target.value)} />
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

