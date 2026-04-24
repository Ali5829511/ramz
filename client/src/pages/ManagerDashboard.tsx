/*
 * لوحة المدير - رمز الإبداع
 */
import { useMemo } from 'react';
import { Shield, Building2, DollarSign, Users, Wrench, TrendingUp, Bell, CheckCircle } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import { LoadingState } from '@/components/shared/PageStates';
import { useMultiEntityData } from '@/hooks/useEntityData';

const fmt = (v: number) => `${(v || 0).toLocaleString('ar-SA')} ر.س`;

export default function ManagerDashboard() {
  const { data, loading } = useMultiEntityData([
    { name: 'Payment', sort: '-created_date', limit: 1000 },
    { name: 'Property', limit: 200 },
    { name: 'Tenant', limit: 200 },
    { name: 'Maintenance', limit: 200 },
    { name: 'Complaint', limit: 50 },
  ]);

  const payments = data.Payment || [];
  const properties = data.Property || [];
  const tenants = data.Tenant || [];
  const maintenance = data.Maintenance || [];
  const complaints = data.Complaint || [];

  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = now.toISOString().slice(0, 7);
    const revenue = payments
      .filter(p => (p['تاريخ_الدفع'] || p.created_date || '').startsWith(thisMonth))
      .reduce((s, p) => s + parseFloat(p['مبلغ_الدفعة'] || p['قيمة_القسط'] || 0), 0);

    const occupied = properties.filter(p => ['مؤجر', 'occupied'].includes(p['حالة_العقار'] || p.status || '')).length;
    const openMaint = maintenance.filter(m => !['مكتمل', 'completed', 'مغلق'].includes(m['حالة_الطلب'] || m.status || '')).length;
    const openComplaints = complaints.filter(c => !['محلولة', 'مغلقة', 'resolved', 'closed'].includes(c['حالة_الشكوى'] || c.status || '')).length;

    const alerts = [
      openMaint > 0 && { type: 'warning', msg: `${openMaint} طلبات صيانة معلقة تحتاج متابعة` },
      openComplaints > 0 && { type: 'danger', msg: `${openComplaints} شكاوى مفتوحة` },
      occupied < properties.length && { type: 'info', msg: `${properties.length - occupied} وحدة شاغرة تحتاج تأجير` },
    ].filter(Boolean) as { type: string; msg: string }[];

    return { revenue, occupied, propertyCount: properties.length, tenantCount: tenants.length, openMaint, openComplaints, alerts, occupancyRate: properties.length ? Math.round((occupied / properties.length) * 100) : 0 };
  }, [payments, properties, tenants, maintenance, complaints]);

  return (
    <DashboardLayout pageTitle="لوحة المدير">
      <PageHeader title="لوحة المدير التنفيذي" description="نظرة عامة شاملة على أداء المحفظة">
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-md">
          <Shield size={14} className="text-primary" />
          صلاحيات مدير
        </div>
      </PageHeader>

      {loading ? <LoadingState /> : (
        <div className="space-y-6">
          {/* Alerts */}
          {stats.alerts.length > 0 && (
            <div className="space-y-2">
              {stats.alerts.map((a, i) => (
                <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-sm ${
                  a.type === 'danger' ? 'bg-red-500/5 border-red-500/20 text-red-600' :
                  a.type === 'warning' ? 'bg-amber-500/5 border-amber-500/20 text-amber-600' :
                  'bg-blue-500/5 border-blue-500/20 text-blue-600'
                }`}>
                  <Bell size={14} />
                  {a.msg}
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard title="إيرادات هذا الشهر" value={fmt(stats.revenue)} icon={DollarSign} />
            <StatCard title="نسبة الإشغال" value={`${stats.occupancyRate}%`} icon={Building2} />
            <StatCard title="المستأجرون" value={stats.tenantCount} icon={Users} />
            <StatCard title="صيانة معلقة" value={stats.openMaint} icon={Wrench} />
          </div>

          {/* Performance Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: 'أداء التحصيل', value: 92, color: 'text-green-500', bg: 'bg-green-500' },
              { title: 'رضا المستأجرين', value: 85, color: 'text-blue-500', bg: 'bg-blue-500' },
              { title: 'إشغال العقارات', value: stats.occupancyRate, color: 'text-primary', bg: 'bg-primary' },
            ].map(item => (
              <div key={item.title} className="rounded-lg border border-border bg-card p-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-muted-foreground">{item.title}</span>
                  <span className={`text-2xl font-bold ${item.color}`}>{item.value}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full ${item.bg} rounded-full transition-all`} style={{ width: `${item.value}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Quick Summary Table */}
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="font-heading text-sm font-semibold mb-3 flex items-center gap-2"><TrendingUp size={15} className="text-primary" /> ملخص الأداء</h3>
            <div className="divide-y divide-border">
              {[
                { label: 'إجمالي العقارات', value: stats.propertyCount, icon: Building2 },
                { label: 'وحدات مؤجرة', value: stats.occupied, icon: CheckCircle },
                { label: 'وحدات شاغرة', value: stats.propertyCount - stats.occupied, icon: Building2 },
                { label: 'مجموع المستأجرين', value: stats.tenantCount, icon: Users },
                { label: 'شكاوى مفتوحة', value: stats.openComplaints, icon: Bell },
              ].map(row => (
                <div key={row.label} className="flex justify-between items-center py-2.5">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <row.icon size={13} />
                    {row.label}
                  </div>
                  <span className="text-sm font-semibold">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
