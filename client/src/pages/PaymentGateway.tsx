/*
 * بوابة الدفع الإلكتروني - رمز الإبداع
 */
import { useState } from 'react';
import { CreditCard, Shield, CheckCircle, Clock, TrendingUp, Link, Copy, RefreshCw, ExternalLink } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const GATEWAYS = [
  { id: 'moyasar', name: 'Moyasar', nameAr: 'موياسار', icon: '🏦', status: 'متصل', color: 'text-green-400 bg-green-500/15', desc: 'بوابة دفع سعودية تدعم مدى وفيزا وماستركارد وApple Pay', features: ['مدى', 'Visa', 'Mastercard', 'Apple Pay', 'STC Pay'] },
  { id: 'stcpay', name: 'STC Pay', nameAr: 'STC Pay', icon: '📱', status: 'غير متصل', color: 'text-muted-foreground bg-muted', desc: 'محفظة STC Pay للدفع الفوري', features: ['دفع فوري', 'QR Code', 'تحويل بنكي'] },
  { id: 'tamara', name: 'Tamara', nameAr: 'تمارا', icon: '🛍️', status: 'غير متصل', color: 'text-muted-foreground bg-muted', desc: 'الدفع بالتقسيط بدون فوائد', features: ['3 أقساط', '6 أقساط', 'بدون فوائد'] },
  { id: 'bank', name: 'تحويل بنكي', nameAr: 'تحويل بنكي', icon: '🏛️', status: 'متصل', color: 'text-green-400 bg-green-500/15', desc: 'استقبال التحويلات البنكية المباشرة', features: ['IBAN', 'SWIFT', 'تحقق تلقائي'] },
];

const RECENT_TXNS = [
  { id: 'TXN-001', tenant: 'أحمد العمري', amount: 8500, method: 'مدى', date: new Date().toISOString().split('T')[0], status: 'مكتمل', ref: '4521XXXX' },
  { id: 'TXN-002', tenant: 'سارة الغامدي', amount: 7200, method: 'Apple Pay', date: new Date(Date.now() - 86400e3).toISOString().split('T')[0], status: 'مكتمل', ref: '7823XXXX' },
  { id: 'TXN-003', tenant: 'خالد النجدي', amount: 12000, method: 'تحويل بنكي', date: new Date(Date.now() - 2 * 86400e3).toISOString().split('T')[0], status: 'قيد التحقق', ref: 'TRF2024' },
  { id: 'TXN-004', tenant: 'نورة القحطاني', amount: 5500, method: 'Visa', date: new Date(Date.now() - 3 * 86400e3).toISOString().split('T')[0], status: 'فشل', ref: '9012XXXX' },
];

export default function PaymentGateway() {
  const [payLink, setPayLink] = useState('');
  const [amount, setAmount] = useState('');
  const [tenant, setTenant] = useState('');

  const generateLink = () => {
    if (!amount || !tenant) { toast.error('ادخل المبلغ واسم المستأجر'); return; }
    const link = `https://pay.ramz-abda.sa/p/${btoa(`${tenant}:${amount}:${Date.now()}`).slice(0, 12)}`;
    setPayLink(link);
    toast.success('تم إنشاء رابط الدفع');
  };

  const copyLink = () => { navigator.clipboard.writeText(payLink); toast.success('تم نسخ الرابط'); };

  const totalCollected = RECENT_TXNS.filter(t => t.status === 'مكتمل').reduce((s, t) => s + t.amount, 0);
  const pendingCount = RECENT_TXNS.filter(t => t.status === 'قيد التحقق').length;

  return (
    <DashboardLayout pageTitle="بوابة الدفع الإلكتروني">
      <div className="space-y-5" dir="rtl">
        <div className="flex items-center gap-2">
          <CreditCard size={20} className="text-primary" />
          <h1 className="text-lg font-bold">بوابة الدفع الإلكتروني</h1>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'إجمالي المحصّل', value: `${totalCollected.toLocaleString('ar-SA')} ر.س`, color: 'text-green-400' },
            { label: 'معاملات اليوم', value: RECENT_TXNS.filter(t => t.date === new Date().toISOString().split('T')[0]).length, color: 'text-primary' },
            { label: 'قيد التحقق', value: pendingCount, color: 'text-amber-400' },
            { label: 'بوابات نشطة', value: GATEWAYS.filter(g => g.status === 'متصل').length, color: 'text-blue-400' },
          ].map(s => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-4 text-center">
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            {/* Payment Gateways */}
            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="font-semibold text-sm mb-4">بوابات الدفع</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {GATEWAYS.map(g => (
                  <div key={g.id} className={`border rounded-xl p-4 ${g.status === 'متصل' ? 'border-green-500/30 bg-green-500/5' : 'border-border'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{g.icon}</span>
                        <div>
                          <p className="text-sm font-medium text-foreground">{g.nameAr}</p>
                          <p className="text-[10px] text-muted-foreground">{g.name}</p>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${g.color}`}>{g.status}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{g.desc}</p>
                    <div className="flex flex-wrap gap-1">
                      {g.features.map(f => <span key={f} className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{f}</span>)}
                    </div>
                    {g.status === 'غير متصل' && (
                      <Button size="sm" variant="outline" className="mt-3 w-full text-xs h-7">ربط الآن</Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h2 className="font-semibold text-sm">المعاملات الأخيرة</h2>
                <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><RefreshCw size={11} />تحديث</button>
              </div>
              <div className="divide-y divide-border/30">
                {RECENT_TXNS.map(t => (
                  <div key={t.id} className="flex items-center gap-3 p-3 hover:bg-muted/10">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${t.status === 'مكتمل' ? 'bg-green-400' : t.status === 'قيد التحقق' ? 'bg-amber-400' : 'bg-red-400'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-medium text-foreground">{t.tenant}</p>
                        <span className="text-[10px] text-muted-foreground">{t.id}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">{t.method} · {t.date}</p>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-foreground">{t.amount.toLocaleString('ar-SA')} ر.س</p>
                      <span className={`text-[10px] ${t.status === 'مكتمل' ? 'text-green-400' : t.status === 'قيد التحقق' ? 'text-amber-400' : 'text-red-400'}`}>{t.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Generate Pay Link */}
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Link size={16} className="text-primary" />
                <h2 className="font-semibold text-sm">إنشاء رابط دفع</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">اسم المستأجر</label>
                  <input className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm" value={tenant} onChange={e => setTenant(e.target.value)} placeholder="الاسم الكامل" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">المبلغ (ر.س)</label>
                  <input type="number" className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" min="0" />
                </div>
                <Button onClick={generateLink} className="w-full gap-2"><Link size={14} />إنشاء الرابط</Button>
                {payLink && (
                  <div className="mt-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                    <p className="text-[10px] text-muted-foreground mb-1">رابط الدفع:</p>
                    <p className="text-xs text-primary break-all">{payLink}</p>
                    <button onClick={copyLink} className="mt-2 flex items-center gap-1 text-xs text-primary hover:text-primary/80"><Copy size={11} />نسخ الرابط</button>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Shield size={16} className="text-green-400" />
                <h2 className="font-semibold text-sm">الأمان والامتثال</h2>
              </div>
              <div className="space-y-2">
                {['تشفير SSL/TLS 256-bit', 'متوافق مع PCI DSS', 'مدعوم من SAMA', '3D Secure'].map(item => (
                  <div key={item} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle size={12} className="text-green-400 flex-shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
