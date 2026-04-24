/*
 * لوحة الفنيين - رمز الإبداع
 */
import React, { useState } from 'react';
import { HardHat, Star, Wrench, CheckCircle2, Clock, TrendingUp, User, Phone, MapPin } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const TECHNICIANS = [
  { id: 1, name: 'محمد الفني', phone: '0501234567', specialty: 'كهرباء', active: true, assigned: 3, completed: 28, rating: 4.8, avgTime: 2.1 },
  { id: 2, name: 'علي المصلح', phone: '0557654321', specialty: 'سباكة', active: true, assigned: 2, completed: 34, rating: 4.5, avgTime: 1.8 },
  { id: 3, name: 'خالد الأسطى', phone: '0565432109', specialty: 'تكييف', active: false, assigned: 0, completed: 21, rating: 4.2, avgTime: 3.5 },
  { id: 4, name: 'سعد المقاول', phone: '0509876543', specialty: 'نجارة ودهانات', active: true, assigned: 5, completed: 19, rating: 4.7, avgTime: 2.8 },
  { id: 5, name: 'عبدالله التقني', phone: '0543211098', specialty: 'صيانة عامة', active: true, assigned: 1, completed: 42, rating: 4.9, avgTime: 1.5 },
];

const WORK_LOG = [
  { id: 1, tech: 'محمد الفني', task: 'إصلاح تمديدات كهربائية', unit: 'A-101', status: 'قيد التنفيذ', date: new Date().toISOString().split('T')[0] },
  { id: 2, tech: 'علي المصلح', task: 'إصلاح تسريب مياه', unit: 'B-203', status: 'مكتمل', date: new Date(Date.now() - 86400e3).toISOString().split('T')[0] },
  { id: 3, tech: 'سعد المقاول', task: 'دهان غرفة المعيشة', unit: 'C-315', status: 'مجدول', date: new Date(Date.now() + 86400e3).toISOString().split('T')[0] },
  { id: 4, tech: 'عبدالله التقني', task: 'صيانة دورية', unit: 'A-205', status: 'مكتمل', date: new Date(Date.now() - 2 * 86400e3).toISOString().split('T')[0] },
];

const PERF_DATA = [
  { month: 'يناير', مكتملة: 8, مجدولة: 3 },
  { month: 'فبراير', مكتملة: 12, مجدولة: 4 },
  { month: 'مارس', مكتملة: 9, مجدولة: 5 },
  { month: 'أبريل', مكتملة: 15, مجدولة: 2 },
  { month: 'مايو', مكتملة: 11, مجدولة: 6 },
  { month: 'يونيو', مكتملة: 14, مجدولة: 3 },
];

const statusColors: Record<string, string> = {
  'قيد التنفيذ': 'text-amber-400 bg-amber-500/15',
  'مكتمل': 'text-green-400 bg-green-500/15',
  'مجدول': 'text-blue-400 bg-blue-500/15',
};

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={11} className={i <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/30'} />
      ))}
      <span className="text-xs text-muted-foreground mr-1">{rating}</span>
    </span>
  );
}

export default function TechnicianDashboard() {
  const [selected, setSelected] = useState<typeof TECHNICIANS[0] | null>(null);

  const totalCompleted = TECHNICIANS.reduce((s, t) => s + t.completed, 0);
  const totalAssigned = TECHNICIANS.reduce((s, t) => s + t.assigned, 0);
  const avgRating = (TECHNICIANS.reduce((s, t) => s + t.rating, 0) / TECHNICIANS.length).toFixed(1);

  return (
    <DashboardLayout pageTitle="لوحة الفنيين">
      <div className="space-y-5" dir="rtl">
        <div className="flex items-center gap-2">
          <HardHat size={20} className="text-primary" />
          <h1 className="text-lg font-bold">لوحة تحكم الفنيين</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'إجمالي الفنيين', value: TECHNICIANS.length, color: 'text-primary', sub: `${TECHNICIANS.filter(t => t.active).length} نشط` },
            { label: 'مهام مسندة', value: totalAssigned, color: 'text-amber-400', sub: 'قيد التنفيذ' },
            { label: 'مهام مكتملة', value: totalCompleted, color: 'text-green-400', sub: 'هذا الشهر' },
            { label: 'متوسط التقييم', value: avgRating, color: 'text-amber-400', sub: 'من 5 نجوم' },
          ].map(s => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-4">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-sm font-medium text-foreground mt-0.5">{s.label}</p>
              <p className="text-xs text-muted-foreground">{s.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Technicians List */}
          <div className="lg:col-span-2 space-y-2">
            <h2 className="text-sm font-semibold text-foreground">قائمة الفنيين</h2>
            {TECHNICIANS.map(t => (
              <div
                key={t.id}
                onClick={() => setSelected(selected?.id === t.id ? null : t)}
                className={`bg-card border rounded-xl p-4 cursor-pointer transition-colors ${selected?.id === t.id ? 'border-primary/50 bg-primary/5' : 'border-border hover:border-border/80'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${t.active ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    {t.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm text-foreground">{t.name}</p>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${t.active ? 'text-green-400 bg-green-500/15' : 'text-muted-foreground bg-muted'}`}>{t.active ? 'نشط' : 'غير متاح'}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{t.specialty}</p>
                  </div>
                  <div className="text-left sm:text-right space-y-1">
                    <Stars rating={t.rating} />
                    <p className="text-xs text-muted-foreground">{t.assigned} مسندة · {t.completed} مكتملة</p>
                  </div>
                </div>
                {selected?.id === t.id && (
                  <div className="mt-3 pt-3 border-t border-border grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground"><Phone size={12} />{t.phone}</div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground"><Wrench size={12} />{t.specialty}</div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground"><Clock size={12} />متوسط الوقت: {t.avgTime} ساعة</div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground"><TrendingUp size={12} />{t.completed} مهمة مكتملة</div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right Column */}
          <div className="space-y-5">
            {/* Performance Chart */}
            <div className="bg-card border border-border rounded-xl p-4">
              <h3 className="text-sm font-semibold mb-3">الأداء الشهري</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={PERF_DATA} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="مكتملة" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Recent Work Log */}
            <div className="bg-card border border-border rounded-xl p-4">
              <h3 className="text-sm font-semibold mb-3">سجل المهام الأخيرة</h3>
              <div className="space-y-2">
                {WORK_LOG.map(w => (
                  <div key={w.id} className="flex items-start gap-2 py-2 border-b border-border/50 last:border-0">
                    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${w.status === 'مكتمل' ? 'bg-green-400' : w.status === 'قيد التنفيذ' ? 'bg-amber-400' : 'bg-blue-400'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground">{w.task}</p>
                      <p className="text-xs text-muted-foreground">{w.tech} · {w.unit}</p>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0 ${statusColors[w.status]}`}>{w.status}</span>
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

