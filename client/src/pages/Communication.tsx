/*
 * صفحة منصة التواصل - رمز الإبداع
 */
import { useMemo, useState } from 'react';
import { MessageSquare, Send, Phone, Mail, Users, CheckCircle, Clock } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import { LoadingState } from '@/components/shared/PageStates';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useMultiEntityData } from '@/hooks/useEntityData';

export default function Communication() {
  const { data, loading } = useMultiEntityData([
    { name: 'Tenant', limit: 200 },
    { name: 'Owner', limit: 100 },
  ]);

  const tenants = data.Tenant || [];
  const owners = data.Owner || [];
  const [activeTab, setActiveTab] = useState<'tenants' | 'owners'>('tenants');
  const [search, setSearch] = useState('');

  const recipients = activeTab === 'tenants' ? tenants : owners;
  const filtered = useMemo(() => {
    if (!search) return recipients;
    return recipients.filter(r => {
      const name = r['الاسم'] || r.name || '';
      const phone = r['رقم_الجوال'] || r.phone || '';
      return name.toLowerCase().includes(search.toLowerCase()) || phone.includes(search);
    });
  }, [recipients, search]);

  const withPhone = recipients.filter(r => r['رقم_الجوال'] || r.phone).length;
  const withEmail = recipients.filter(r => r['البريد_الإلكتروني'] || r.email).length;

  return (
    <DashboardLayout pageTitle="منصة التواصل">
      <PageHeader title="منصة التواصل" description="إرسال الرسائل والإشعارات للمستأجرين والملاك">
        <Button size="sm" className="gap-2"><Send size={16} /> رسالة جماعية</Button>
      </PageHeader>

      {loading ? <LoadingState /> : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard title="إجمالي المستأجرين" value={tenants.length} icon={Users} />
            <StatCard title="إجمالي الملاك" value={owners.length} icon={Users} />
            <StatCard title="لديهم جوال" value={withPhone} icon={Phone} />
            <StatCard title="لديهم بريد" value={withEmail} icon={Mail} />
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { icon: Send, label: 'إشعار دفعة مستحقة', desc: 'إرسال تذكير بالدفعات المستحقة', color: 'text-amber-500' },
              { icon: MessageSquare, label: 'رسالة ترحيبية', desc: 'إرسال رسالة للمستأجرين الجدد', color: 'text-blue-500' },
              { icon: CheckCircle, label: 'تأكيد استلام دفعة', desc: 'إرسال إيصال للدفعات المستلمة', color: 'text-green-500' },
            ].map(action => (
              <button key={action.label} className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card hover:bg-muted/30 text-right transition-colors">
                <div className={cn('p-2 rounded-lg bg-muted', action.color)}>
                  <action.icon size={18} />
                </div>
                <div>
                  <p className="text-sm font-medium">{action.label}</p>
                  <p className="text-xs text-muted-foreground">{action.desc}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Recipients List */}
          <div className="rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex gap-1 bg-muted rounded-md p-0.5">
                <button onClick={() => setActiveTab('tenants')} className={cn('px-3 py-1 text-xs rounded', activeTab === 'tenants' ? 'bg-background shadow font-semibold' : 'text-muted-foreground')}>
                  المستأجرون ({tenants.length})
                </button>
                <button onClick={() => setActiveTab('owners')} className={cn('px-3 py-1 text-xs rounded', activeTab === 'owners' ? 'bg-background shadow font-semibold' : 'text-muted-foreground')}>
                  الملاك ({owners.length})
                </button>
              </div>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="بحث..."
                className="bg-muted text-sm rounded-md px-3 py-1.5 border border-border focus:outline-none focus:ring-1 focus:ring-primary w-48"
              />
            </div>
            <div className="divide-y divide-border max-h-96 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="text-center text-muted-foreground text-sm py-8">لا توجد نتائج</div>
              ) : filtered.map((r: any) => {
                const name = r['الاسم'] || r.name || '—';
                const phone = r['رقم_الجوال'] || r.phone || '';
                const email = r['البريد_الإلكتروني'] || r.email || '';
                return (
                  <div key={r.id} className="flex items-center justify-between px-4 py-3 hover:bg-muted/20">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">{name[0]}</div>
                      <div>
                        <p className="text-sm font-medium">{name}</p>
                        {phone && <p className="text-xs text-muted-foreground">{phone}</p>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {phone && (
                        <a href={`tel:${phone}`} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground" aria-label={`اتصال بـ ${name}`}>
                          <Phone size={13} />
                        </a>
                      )}
                      {email && (
                        <a href={`mailto:${email}`} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground" aria-label={`مراسلة ${name}`}>
                          <Mail size={13} />
                        </a>
                      )}
                      <button className="p-1.5 rounded-md hover:bg-accent text-muted-foreground" aria-label={`إرسال رسالة لـ ${name}`}>
                        <Send size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
