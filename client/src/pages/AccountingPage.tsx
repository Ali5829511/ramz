/*
 * المحاسبة - رمز الإبداع
 */
import React, { useState } from 'react';
import { Calculator, Plus, TrendingUp, TrendingDown, Wallet, Filter } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { toast } from 'sonner';

type EntryType = 'إيراد' | 'مصروف';

interface Entry {
  id: number;
  date: string;
  description: string;
  category: string;
  amount: number;
  type: EntryType;
  reference: string;
}

const INCOME_CATS = ['إيجارات', 'رسوم إدارية', 'غرامات تأخير', 'عمولات', 'إيرادات أخرى'];
const EXPENSE_CATS = ['صيانة', 'خدمات', 'رواتب', 'تسويق', 'مصاريف إدارية', 'مصاريف أخرى'];

const MONTHLY_DATA = [
  { month: 'يناير', إيرادات: 85000, مصروفات: 22000 },
  { month: 'فبراير', إيرادات: 91000, مصروفات: 25000 },
  { month: 'مارس', إيرادات: 88000, مصروفات: 19000 },
  { month: 'أبريل', إيرادات: 96000, مصروفات: 28000 },
  { month: 'مايو', إيرادات: 102000, مصروفات: 21000 },
  { month: 'يونيو', إيرادات: 98000, مصروفات: 24000 },
];

const today = new Date().toISOString().split('T')[0];

const SAMPLE: Entry[] = [
  { id: 1, date: today, description: 'إيجار شقة A-101', category: 'إيجارات', amount: 8500, type: 'إيراد', reference: 'PAY-001' },
  { id: 2, date: today, description: 'صيانة تكييف', category: 'صيانة', amount: 1200, type: 'مصروف', reference: 'EXP-001' },
  { id: 3, date: new Date(Date.now() - 86400e3).toISOString().split('T')[0], description: 'إيجار B-203', category: 'إيجارات', amount: 7200, type: 'إيراد', reference: 'PAY-002' },
  { id: 4, date: new Date(Date.now() - 86400e3).toISOString().split('T')[0], description: 'رواتب موظفين', category: 'رواتب', amount: 15000, type: 'مصروف', reference: 'EXP-002' },
  { id: 5, date: new Date(Date.now() - 2 * 86400e3).toISOString().split('T')[0], description: 'غرامة تأخير - مستأجر 5', category: 'غرامات تأخير', amount: 450, type: 'إيراد', reference: 'PAY-003' },
];

export default function AccountingPage() {
  const [entries, setEntries] = useState<Entry[]>(SAMPLE);
  const [filterType, setFilterType] = useState<string>('الكل');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: today, description: '', category: INCOME_CATS[0], amount: '', type: 'إيراد' as EntryType, reference: '' });

  const setF = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const filtered = filterType === 'الكل' ? entries : entries.filter(e => e.type === filterType);

  const totalIncome = entries.filter(e => e.type === 'إيراد').reduce((s, e) => s + e.amount, 0);
  const totalExpense = entries.filter(e => e.type === 'مصروف').reduce((s, e) => s + e.amount, 0);
  const netProfit = totalIncome - totalExpense;

  const handleSave = () => {
    if (!form.description || !form.amount) { toast.error('وصف القيد والمبلغ مطلوبان'); return; }
    const entry: Entry = { id: Date.now(), ...form, amount: parseFloat(form.amount) };
    setEntries(list => [entry, ...list]);
    setShowForm(false);
    toast.success('تم إضافة القيد المحاسبي');
  };

  const cats = form.type === 'إيراد' ? INCOME_CATS : EXPENSE_CATS;

  return (
    <DashboardLayout pageTitle="المحاسبة">
      <div className="space-y-5" dir="rtl">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Calculator size={20} className="text-primary" />
            <h1 className="text-lg font-bold">المحاسبة المالية</h1>
          </div>
          <Button onClick={() => setShowForm(true)} className="gap-2"><Plus size={16} />قيد محاسبي جديد</Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2"><TrendingUp size={16} className="text-green-400" /><span className="text-xs text-muted-foreground">إجمالي الإيرادات</span></div>
            <p className="text-2xl font-bold text-green-400">{totalIncome.toLocaleString('ar-SA')}</p>
            <p className="text-xs text-muted-foreground">ر.س</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2"><TrendingDown size={16} className="text-red-400" /><span className="text-xs text-muted-foreground">إجمالي المصروفات</span></div>
            <p className="text-2xl font-bold text-red-400">{totalExpense.toLocaleString('ar-SA')}</p>
            <p className="text-xs text-muted-foreground">ر.س</p>
          </div>
          <div className={`bg-card border border-border rounded-xl p-4`}>
            <div className="flex items-center gap-2 mb-2"><Wallet size={16} className={netProfit >= 0 ? 'text-primary' : 'text-red-400'} /><span className="text-xs text-muted-foreground">صافي الربح</span></div>
            <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-primary' : 'text-red-400'}`}>{netProfit.toLocaleString('ar-SA')}</p>
            <p className="text-xs text-muted-foreground">ر.س</p>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="text-sm font-semibold mb-4">الإيرادات والمصروفات الشهرية</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={MONTHLY_DATA} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} formatter={(v: any) => `${Number(v).toLocaleString('ar-SA')} ر.س`} />
              <Bar dataKey="إيرادات" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
              <Bar dataKey="مصروفات" fill="hsl(var(--destructive))" radius={[3, 3, 0, 0]} opacity={0.7} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Entries Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="p-4 border-b border-border flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold flex-1">القيود المحاسبية</h3>
            <div className="flex gap-1.5">
              {['الكل', 'إيراد', 'مصروف'].map(f => (
                <button key={f} onClick={() => setFilterType(f)} className={`px-3 py-1 rounded-lg text-xs transition-colors ${filterType === f ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>{f}</button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-right py-2.5 px-4 text-xs font-semibold text-muted-foreground">التاريخ</th>
                  <th className="text-right py-2.5 px-4 text-xs font-semibold text-muted-foreground">الوصف</th>
                  <th className="text-right py-2.5 px-4 text-xs font-semibold text-muted-foreground">الفئة</th>
                  <th className="text-right py-2.5 px-4 text-xs font-semibold text-muted-foreground">النوع</th>
                  <th className="text-left py-2.5 px-4 text-xs font-semibold text-muted-foreground">المبلغ</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(e => (
                  <tr key={e.id} className="border-b border-border/30 hover:bg-muted/10 transition-colors last:border-0">
                    <td className="py-2.5 px-4 text-xs text-muted-foreground">{e.date}</td>
                    <td className="py-2.5 px-4 text-sm text-foreground">{e.description}</td>
                    <td className="py-2.5 px-4 text-xs text-muted-foreground">{e.category}</td>
                    <td className="py-2.5 px-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${e.type === 'إيراد' ? 'text-green-400 bg-green-500/15' : 'text-red-400 bg-red-500/15'}`}>{e.type}</span>
                    </td>
                    <td className={`py-2.5 px-4 text-sm font-semibold text-left ${e.type === 'إيراد' ? 'text-green-400' : 'text-red-400'}`}>
                      {e.type === 'إيراد' ? '+' : '-'}{e.amount.toLocaleString('ar-SA')} ر.س
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 space-y-4" dir="rtl">
              <h2 className="font-semibold">قيد محاسبي جديد</h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs text-muted-foreground mb-1 block">نوع القيد</label>
                  <div className="flex gap-2">
                    {(['إيراد', 'مصروف'] as EntryType[]).map(t => (
                      <button key={t} onClick={() => { setF('type', t); setF('category', t === 'إيراد' ? INCOME_CATS[0] : EXPENSE_CATS[0]); }} className={`flex-1 py-2 rounded-lg text-sm border transition-colors ${form.type === t ? t === 'إيراد' ? 'bg-green-500/15 border-green-500/50 text-green-400' : 'bg-red-500/15 border-red-500/50 text-red-400' : 'bg-muted border-border text-muted-foreground'}`}>{t}</button>
                    ))}
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-muted-foreground mb-1 block">الوصف *</label>
                  <input className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm" value={form.description} onChange={e => setF('description', e.target.value)} placeholder="وصف العملية المالية" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">الفئة</label>
                  <select className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm" value={form.category} onChange={e => setF('category', e.target.value)}>
                    {cats.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">المبلغ (ر.س) *</label>
                  <input type="number" className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm" value={form.amount} onChange={e => setF('amount', e.target.value)} placeholder="0.00" min="0" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">التاريخ</label>
                  <input type="date" className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm" value={form.date} onChange={e => setF('date', e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">رقم المرجع</label>
                  <input className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm" value={form.reference} onChange={e => setF('reference', e.target.value)} placeholder="PAY-XXX" />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowForm(false)}>إلغاء</Button>
                <Button onClick={handleSave}>حفظ القيد</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

