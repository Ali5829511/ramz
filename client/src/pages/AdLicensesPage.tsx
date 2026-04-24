/*
 * تراخيص الإعلانات - رمز الإبداع
 */
import { useState } from 'react';
import { Megaphone, Plus, Search, ExternalLink, Clock, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type LicenseStatus = 'نشط' | 'منتهي الصلاحية' | 'قيد التجديد' | 'ملغي';

interface AdLicense {
  id: number;
  licenseNo: string;
  property: string;
  platform: string;
  type: string;
  issueDate: string;
  expiryDate: string;
  status: LicenseStatus;
  cost: number;
}

const statusColors: Record<LicenseStatus, string> = {
  'نشط': 'text-green-400 bg-green-500/15',
  'منتهي الصلاحية': 'text-red-400 bg-red-500/15',
  'قيد التجديد': 'text-amber-400 bg-amber-500/15',
  'ملغي': 'text-muted-foreground bg-muted',
};

const addDays = (d: number) => new Date(Date.now() + d * 86400e3).toISOString().split('T')[0];

const SAMPLE: AdLicense[] = [
  { id: 1, licenseNo: 'ADV-2024-001', property: 'برج النور', platform: 'عقار', type: 'إعلان إيجار سكني', issueDate: '2024-01-15', expiryDate: addDays(60), status: 'نشط', cost: 500 },
  { id: 2, licenseNo: 'ADV-2024-002', property: 'مجمع الياسمين', platform: 'بيوت', type: 'إعلان مجمع سكني', issueDate: '2024-02-01', expiryDate: addDays(-10), status: 'منتهي الصلاحية', cost: 800 },
  { id: 3, licenseNo: 'ADV-2024-003', property: 'بناية الأمل', platform: 'صبّار', type: 'إعلان تجاري', issueDate: '2024-03-20', expiryDate: addDays(90), status: 'نشط', cost: 1200 },
  { id: 4, licenseNo: 'ADV-2024-004', property: 'برج النور', platform: 'ملاك', type: 'إعلان مكتبي', issueDate: '2023-12-01', expiryDate: addDays(5), status: 'قيد التجديد', cost: 600 },
];

export default function AdLicensesPage() {
  const [licenses, setLicenses] = useState<AdLicense[]>(SAMPLE);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('الكل');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ property: '', platform: 'عقار', type: 'إعلان إيجار سكني', issueDate: addDays(0), expiryDate: addDays(365), cost: '' });

  const filtered = licenses.filter(l => {
    const match = !search || l.property.includes(search) || l.licenseNo.includes(search);
    const matchFilter = filter === 'الكل' || l.status === filter;
    return match && matchFilter;
  });

  const counts = { 'نشط': licenses.filter(l => l.status === 'نشط').length, 'منتهي الصلاحية': licenses.filter(l => l.status === 'منتهي الصلاحية').length, 'قيد التجديد': licenses.filter(l => l.status === 'قيد التجديد').length };

  const handleRenew = (id: number) => {
    setLicenses(list => list.map(l => l.id === id ? { ...l, status: 'نشط', expiryDate: addDays(365) } : l));
    toast.success('تم تجديد الترخيص بنجاح');
  };

  const handleAdd = () => {
    if (!form.property || !form.platform) { toast.error('العقار والمنصة مطلوبان'); return; }
    const newL: AdLicense = { id: Date.now(), licenseNo: `ADV-${new Date().getFullYear()}-${String(licenses.length + 1).padStart(3, '0')}`, status: 'نشط', cost: parseFloat(form.cost) || 0, type: form.type, platform: form.platform, property: form.property, issueDate: form.issueDate, expiryDate: form.expiryDate };
    setLicenses(l => [newL, ...l]);
    setShowForm(false);
    toast.success('تم إضافة الترخيص');
  };

  return (
    <DashboardLayout pageTitle="تراخيص الإعلانات">
      <div className="space-y-5" dir="rtl">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Megaphone size={20} className="text-primary" />
            <h1 className="text-lg font-bold">تراخيص الإعلانات العقارية</h1>
          </div>
          <Button onClick={() => setShowForm(true)} className="gap-2"><Plus size={16} />ترخيص جديد</Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[{ label: 'نشط', value: counts['نشط'], color: 'text-green-400' }, { label: 'منتهي الصلاحية', value: counts['منتهي الصلاحية'], color: 'text-red-400' }, { label: 'قيد التجديد', value: counts['قيد التجديد'], color: 'text-amber-400' }].map(s => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-48">
            <Search size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input className="w-full bg-muted border border-border rounded-lg pr-8 pl-3 py-2 text-sm" placeholder="بحث..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          {['الكل', 'نشط', 'منتهي الصلاحية', 'قيد التجديد'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs ${filter === f ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>{f}</button>
          ))}
        </div>

        {/* List */}
        <div className="space-y-3">
          {filtered.map(l => (
            <div key={l.id} className={`bg-card border rounded-xl p-4 ${l.status === 'منتهي الصلاحية' ? 'border-red-500/30' : l.status === 'قيد التجديد' ? 'border-amber-500/30' : 'border-border'}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Megaphone size={18} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-sm text-foreground">{l.property}</p>
                    <span className="text-xs text-muted-foreground">{l.licenseNo}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[l.status]}`}>{l.status}</span>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-1 text-xs text-muted-foreground">
                    <span>{l.platform}</span>
                    <span>· {l.type}</span>
                    <span className="flex items-center gap-1"><Clock size={11} />ينتهي: {l.expiryDate}</span>
                    <span>{l.cost.toLocaleString('ar-SA')} ر.س</span>
                  </div>
                </div>
                {(l.status === 'منتهي الصلاحية' || l.status === 'قيد التجديد') && (
                  <Button size="sm" variant="outline" className="text-xs h-7 gap-1 flex-shrink-0" onClick={() => handleRenew(l.id)}>
                    <RefreshCw size={11} />تجديد
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 space-y-4" dir="rtl">
              <h2 className="font-semibold">ترخيص إعلان جديد</h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2"><label className="text-xs text-muted-foreground mb-1 block">العقار *</label><input className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm" value={form.property} onChange={e => setForm(f => ({ ...f, property: e.target.value }))} /></div>
                <div><label className="text-xs text-muted-foreground mb-1 block">المنصة</label><select className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm" value={form.platform} onChange={e => setForm(f => ({ ...f, platform: e.target.value }))}>{['عقار', 'بيوت', 'صبّار', 'ملاك', 'أخرى'].map(p => <option key={p}>{p}</option>)}</select></div>
                <div><label className="text-xs text-muted-foreground mb-1 block">نوع الإعلان</label><select className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>{['إعلان إيجار سكني', 'إعلان إيجار تجاري', 'إعلان مجمع سكني', 'إعلان مكتبي'].map(t => <option key={t}>{t}</option>)}</select></div>
                <div><label className="text-xs text-muted-foreground mb-1 block">تاريخ الإصدار</label><input type="date" className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm" value={form.issueDate} onChange={e => setForm(f => ({ ...f, issueDate: e.target.value }))} /></div>
                <div><label className="text-xs text-muted-foreground mb-1 block">تاريخ الانتهاء</label><input type="date" className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm" value={form.expiryDate} onChange={e => setForm(f => ({ ...f, expiryDate: e.target.value }))} /></div>
                <div className="col-span-2"><label className="text-xs text-muted-foreground mb-1 block">تكلفة الترخيص (ر.س)</label><input type="number" className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm" value={form.cost} onChange={e => setForm(f => ({ ...f, cost: e.target.value }))} /></div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowForm(false)}>إلغاء</Button>
                <Button onClick={handleAdd}>حفظ</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
