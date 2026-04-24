/*
 * عقود الوساطة - رمز الإبداع
 */
import { useState } from 'react';
import { Handshake, Plus, Search, FileText, User, Calendar, DollarSign, CheckCircle, Clock, XCircle } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type ContractStatus = 'نشط' | 'منتهي' | 'ملغي' | 'مسودة';

interface BrokerContract {
  id: number;
  contractNo: string;
  broker: string;
  property: string;
  type: string;
  startDate: string;
  endDate: string;
  commission: number;
  commissionType: string;
  status: ContractStatus;
}

const statusColors: Record<ContractStatus, string> = {
  'نشط': 'text-green-400 bg-green-500/15',
  'منتهي': 'text-muted-foreground bg-muted',
  'ملغي': 'text-red-400 bg-red-500/15',
  'مسودة': 'text-amber-400 bg-amber-500/15',
};

const statusIcons: Record<ContractStatus, any> = {
  'نشط': CheckCircle,
  'منتهي': Clock,
  'ملغي': XCircle,
  'مسودة': FileText,
};

const SAMPLE: BrokerContract[] = [
  { id: 1, contractNo: 'BRK-001', broker: 'مكتب الأمانة العقاري', property: 'برج النور', type: 'إيجار سكني', startDate: '2024-01-01', endDate: '2025-01-01', commission: 5, commissionType: 'نسبة مئوية', status: 'نشط' },
  { id: 2, contractNo: 'BRK-002', broker: 'شركة الريادة للعقارات', property: 'مجمع الياسمين', type: 'بيع تجاري', startDate: '2023-06-01', endDate: '2024-06-01', commission: 2.5, commissionType: 'نسبة مئوية', status: 'منتهي' },
  { id: 3, contractNo: 'BRK-003', broker: 'مؤسسة النجاح العقارية', property: 'بناية الأمل', type: 'إيجار تجاري', startDate: '2024-03-15', endDate: '2025-03-15', commission: 8000, commissionType: 'مبلغ ثابت', status: 'نشط' },
  { id: 4, contractNo: 'BRK-004', broker: 'مكتب الفيصل', property: 'برج النور', type: 'إيجار سكني', startDate: '2024-09-01', endDate: '2025-09-01', commission: 3, commissionType: 'نسبة مئوية', status: 'مسودة' },
];

export default function BrokerageContractsPage() {
  const [contracts, setContracts] = useState<BrokerContract[]>(SAMPLE);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('الكل');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ broker: '', property: '', type: 'إيجار سكني', startDate: '', endDate: '', commission: '', commissionType: 'نسبة مئوية', status: 'مسودة' as ContractStatus });

  const filtered = contracts.filter(c => {
    const match = !search || c.broker.includes(search) || c.property.includes(search) || c.contractNo.includes(search);
    const matchFilter = filter === 'الكل' || c.status === filter;
    return match && matchFilter;
  });

  const handleSave = () => {
    if (!form.broker || !form.property) { toast.error('اسم الوسيط والعقار مطلوبان'); return; }
    const newC: BrokerContract = { id: Date.now(), contractNo: `BRK-${String(contracts.length + 1).padStart(3, '0')}`, commission: parseFloat(form.commission) || 0, type: form.type, broker: form.broker, property: form.property, commissionType: form.commissionType, startDate: form.startDate, endDate: form.endDate, status: form.status };
    setContracts(c => [newC, ...c]);
    setShowForm(false);
    toast.success('تم إضافة عقد الوساطة');
  };

  const counts = { 'نشط': contracts.filter(c => c.status === 'نشط').length, 'منتهي': contracts.filter(c => c.status === 'منتهي').length, 'مسودة': contracts.filter(c => c.status === 'مسودة').length };

  return (
    <DashboardLayout pageTitle="عقود الوساطة">
      <div className="space-y-5" dir="rtl">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Handshake size={20} className="text-primary" />
            <h1 className="text-lg font-bold">عقود الوساطة العقارية</h1>
          </div>
          <Button onClick={() => setShowForm(true)} className="gap-2"><Plus size={16} />عقد وساطة جديد</Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[{ label: 'نشط', value: counts['نشط'], color: 'text-green-400' }, { label: 'منتهي', value: counts['منتهي'], color: 'text-muted-foreground' }, { label: 'مسودة', value: counts['مسودة'], color: 'text-amber-400' }].map(s => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Search & Filter */}
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative flex-1 min-w-48">
            <Search size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input className="w-full bg-muted border border-border rounded-lg pr-8 pl-3 py-2 text-sm" placeholder="بحث..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          {['الكل', 'نشط', 'منتهي', 'مسودة', 'ملغي'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${filter === f ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>{f}</button>
          ))}
        </div>

        {/* Contracts */}
        <div className="space-y-3">
          {filtered.map(c => {
            const Icon = statusIcons[c.status];
            return (
              <div key={c.id} className="bg-card border border-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Handshake size={18} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-sm text-foreground">{c.broker}</p>
                    <span className="text-xs text-muted-foreground">{c.contractNo}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${statusColors[c.status]}`}><Icon size={10} />{c.status}</span>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><FileText size={11} />{c.property}</span>
                    <span className="flex items-center gap-1"><Calendar size={11} />{c.startDate} ← {c.endDate}</span>
                    <span className="flex items-center gap-1"><DollarSign size={11} />عمولة: {c.commission}{c.commissionType === 'نسبة مئوية' ? '%' : ' ر.س'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 space-y-4" dir="rtl">
              <h2 className="font-semibold">عقد وساطة جديد</h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2"><label className="text-xs text-muted-foreground mb-1 block">اسم الوسيط *</label><input className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm" value={form.broker} onChange={e => setForm(f => ({ ...f, broker: e.target.value }))} /></div>
                <div className="col-span-2"><label className="text-xs text-muted-foreground mb-1 block">العقار *</label><input className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm" value={form.property} onChange={e => setForm(f => ({ ...f, property: e.target.value }))} /></div>
                <div><label className="text-xs text-muted-foreground mb-1 block">تاريخ البدء</label><input type="date" className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} /></div>
                <div><label className="text-xs text-muted-foreground mb-1 block">تاريخ الانتهاء</label><input type="date" className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} /></div>
                <div><label className="text-xs text-muted-foreground mb-1 block">العمولة</label><input type="number" className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm" value={form.commission} onChange={e => setForm(f => ({ ...f, commission: e.target.value }))} /></div>
                <div><label className="text-xs text-muted-foreground mb-1 block">نوع العمولة</label><select className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm" value={form.commissionType} onChange={e => setForm(f => ({ ...f, commissionType: e.target.value }))}><option>نسبة مئوية</option><option>مبلغ ثابت</option></select></div>
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
