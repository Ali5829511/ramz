/*
 * التوقيع الإلكتروني - رمز الإبداع
 */
import { useState } from 'react';
import { PenLine, Send, CheckCircle, Clock, FileText, User, Mail, RefreshCw, Eye } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type DocStatus = 'في انتظار التوقيع' | 'موقع' | 'منتهي الصلاحية' | 'مرفوض';

interface SignDoc {
  id: number;
  title: string;
  recipient: string;
  email: string;
  docType: string;
  sentAt: string;
  signedAt?: string;
  status: DocStatus;
  expiresAt: string;
}

const statusColors: Record<DocStatus, string> = {
  'في انتظار التوقيع': 'text-amber-400 bg-amber-500/15',
  'موقع': 'text-green-400 bg-green-500/15',
  'منتهي الصلاحية': 'text-red-400 bg-red-500/15',
  'مرفوض': 'text-red-400 bg-red-500/15',
};

const addDays = (days: number) => new Date(Date.now() + days * 86400e3).toISOString().split('T')[0];

const SAMPLE: SignDoc[] = [
  { id: 1, title: 'عقد إيجار - شقة A-101', recipient: 'أحمد محمد العمري', email: 'ahmed@email.com', docType: 'عقد إيجار', sentAt: addDays(-2), status: 'في انتظار التوقيع', expiresAt: addDays(5) },
  { id: 2, title: 'تجديد عقد - شقة B-203', recipient: 'سارة علي الغامدي', email: 'sarah@email.com', docType: 'تجديد عقد', sentAt: addDays(-5), signedAt: addDays(-3), status: 'موقع', expiresAt: addDays(25) },
  { id: 3, title: 'عقد صيانة - فريق التقنية', recipient: 'خالد النجدي', email: 'khalid@email.com', docType: 'عقد خدمات', sentAt: addDays(-10), status: 'منتهي الصلاحية', expiresAt: addDays(-1) },
  { id: 4, title: 'بروتوكول تسليم - وحدة C-315', recipient: 'نورة القحطاني', email: 'noura@email.com', docType: 'محضر تسليم', sentAt: addDays(-1), status: 'في انتظار التوقيع', expiresAt: addDays(6) },
];

const DOC_TYPES = ['عقد إيجار', 'تجديد عقد', 'عقد خدمات', 'محضر تسليم', 'إشعار إخلاء', 'وثيقة أخرى'];

export default function ESignatureManager() {
  const [docs, setDocs] = useState<SignDoc[]>(SAMPLE);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<string>('الكل');
  const [form, setForm] = useState({ title: '', recipient: '', email: '', docType: DOC_TYPES[0], days: '7' });

  const setF = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const filtered = filter === 'الكل' ? docs : docs.filter(d => d.status === filter);

  const sendDoc = () => {
    if (!form.title || !form.recipient || !form.email) { toast.error('يرجى ملء جميع الحقول'); return; }
    const newDoc: SignDoc = {
      id: Date.now(), title: form.title, recipient: form.recipient, email: form.email,
      docType: form.docType, sentAt: addDays(0), status: 'في انتظار التوقيع',
      expiresAt: addDays(parseInt(form.days) || 7),
    };
    setDocs(d => [newDoc, ...d]);
    setShowForm(false);
    setForm({ title: '', recipient: '', email: '', docType: DOC_TYPES[0], days: '7' });
    toast.success('تم إرسال طلب التوقيع بنجاح');
  };

  const resend = (id: number) => {
    setDocs(d => d.map(doc => doc.id === id ? { ...doc, sentAt: addDays(0), expiresAt: addDays(7), status: 'في انتظار التوقيع' } : doc));
    toast.success('تم إعادة إرسال طلب التوقيع');
  };

  const counts = { موقع: docs.filter(d => d.status === 'موقع').length, 'في انتظار التوقيع': docs.filter(d => d.status === 'في انتظار التوقيع').length, 'منتهي الصلاحية': docs.filter(d => d.status === 'منتهي الصلاحية').length };

  return (
    <DashboardLayout pageTitle="التوقيع الإلكتروني">
      <div className="space-y-5" dir="rtl">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <PenLine size={20} className="text-primary" />
            <h1 className="text-lg font-bold">إدارة التوقيع الإلكتروني</h1>
          </div>
          <Button onClick={() => setShowForm(true)} className="gap-2"><Send size={15} />إرسال طلب توقيع</Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'موقعة', value: counts['موقع'], color: 'text-green-400' },
            { label: 'في انتظار التوقيع', value: counts['في انتظار التوقيع'], color: 'text-amber-400' },
            { label: 'منتهية الصلاحية', value: counts['منتهي الصلاحية'], color: 'text-red-400' },
          ].map(s => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex gap-1.5 flex-wrap">
          {['الكل', 'في انتظار التوقيع', 'موقع', 'منتهي الصلاحية'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === f ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>{f}</button>
          ))}
        </div>

        {/* List */}
        <div className="space-y-3">
          {filtered.map(d => (
            <div key={d.id} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${d.status === 'موقع' ? 'bg-green-500/15 text-green-400' : 'bg-primary/10 text-primary'}`}>
                  <FileText size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-sm text-foreground">{d.title}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[d.status]}`}>{d.status}</span>
                    <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{d.docType}</span>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><User size={11} />{d.recipient}</span>
                    <span className="flex items-center gap-1"><Mail size={11} />{d.email}</span>
                    <span className="flex items-center gap-1"><Clock size={11} />أُرسل: {d.sentAt}</span>
                    {d.signedAt && <span className="flex items-center gap-1"><CheckCircle size={11} className="text-green-400" />وُقّع: {d.signedAt}</span>}
                    <span className={`flex items-center gap-1 ${d.expiresAt < addDays(0) ? 'text-red-400' : ''}`}>ينتهي: {d.expiresAt}</span>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <button className="text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground bg-muted px-2 py-1.5 rounded-lg">
                    <Eye size={12} />عرض
                  </button>
                  {d.status !== 'موقع' && (
                    <button onClick={() => resend(d.id)} className="text-xs flex items-center gap-1 text-primary hover:text-primary/80 bg-primary/10 px-2 py-1.5 rounded-lg">
                      <RefreshCw size={12} />إعادة إرسال
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-sm mb-4">كيف يعمل التوقيع الإلكتروني؟</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {[
              { step: '1', title: 'رفع الوثيقة', desc: 'ارفع العقد أو الوثيقة المراد توقيعها' },
              { step: '2', title: 'إرسال الطلب', desc: 'أرسل رابط التوقيع عبر البريد الإلكتروني' },
              { step: '3', title: 'توقيع الطرف الآخر', desc: 'يوقع المستلم إلكترونياً عبر الرابط' },
              { step: '4', title: 'الحصول على النسخة', desc: 'تلقى نسخة موقعة من الوثيقة تلقائياً' },
            ].map(s => (
              <div key={s.step} className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground flex-shrink-0">{s.step}</div>
                <div>
                  <p className="text-sm font-medium text-foreground">{s.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 space-y-4" dir="rtl">
              <h2 className="font-semibold">إرسال طلب توقيع جديد</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">عنوان الوثيقة *</label>
                  <input className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm" value={form.title} onChange={e => setF('title', e.target.value)} placeholder="مثال: عقد إيجار شقة A-101" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">نوع الوثيقة</label>
                  <select className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm" value={form.docType} onChange={e => setF('docType', e.target.value)}>
                    {DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">اسم المستلم *</label>
                  <input className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm" value={form.recipient} onChange={e => setF('recipient', e.target.value)} placeholder="الاسم الكامل" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">البريد الإلكتروني *</label>
                  <input type="email" className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm" value={form.email} onChange={e => setF('email', e.target.value)} placeholder="email@example.com" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">مدة الصلاحية (أيام)</label>
                  <select className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm" value={form.days} onChange={e => setF('days', e.target.value)}>
                    {['3', '7', '14', '30'].map(d => <option key={d} value={d}>{d} يوم</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowForm(false)}>إلغاء</Button>
                <Button onClick={sendDoc} className="gap-2"><Send size={14} />إرسال</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

