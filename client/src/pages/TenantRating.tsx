/*
 * تقييم المستأجرين - رمز الإبداع
 */
import { useState } from 'react';
import { Star, Search, User, TrendingUp, CheckCircle, AlertTriangle, ThumbsUp } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useMultiEntityData } from '@/hooks/useEntityData';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const CRITERIA = [
  { key: 'payment', label: 'الالتزام بالدفع' },
  { key: 'property', label: 'المحافظة على العقار' },
  { key: 'noise', label: 'الهدوء وحسن الجوار' },
  { key: 'communication', label: 'التواصل والتجاوب' },
  { key: 'renewal', label: 'الرغبة في التجديد' },
];

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(i)}
          className="focus:outline-none"
        >
          <Star size={20} className={`transition-colors ${i <= (hover || value) ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/30'}`} />
        </button>
      ))}
    </div>
  );
}

const SAMPLE_RATINGS: Record<string, { payment: number; property: number; noise: number; communication: number; renewal: number; notes: string }> = {
  '0': { payment: 5, property: 4, noise: 5, communication: 4, renewal: 5, notes: 'مستأجر ممتاز، يدفع في الموعد دائماً' },
  '1': { payment: 3, property: 4, noise: 5, communication: 3, renewal: 2, notes: 'يتأخر في الدفع أحياناً' },
};

function avgRating(r: { payment: number; property: number; noise: number; communication: number; renewal: number }) {
  return ((r.payment + r.property + r.noise + r.communication + r.renewal) / 5);
}

function badge(avg: number) {
  if (avg >= 4.5) return { label: 'ممتاز', color: 'text-green-400 bg-green-500/15', icon: ThumbsUp };
  if (avg >= 3.5) return { label: 'جيد', color: 'text-blue-400 bg-blue-500/15', icon: CheckCircle };
  if (avg >= 2.5) return { label: 'متوسط', color: 'text-amber-400 bg-amber-500/15', icon: TrendingUp };
  return { label: 'ضعيف', color: 'text-red-400 bg-red-500/15', icon: AlertTriangle };
}

export default function TenantRating() {
  const { data, loading } = useMultiEntityData([{ name: 'Tenant', limit: 200 }]);
  const tenants: any[] = data.Tenant || [];

  const [search, setSearch] = useState('');
  const [ratings, setRatings] = useState<Record<string, any>>(SAMPLE_RATINGS);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<any>({});

  const filtered = tenants.filter(t => !search || (t['اسم_المستأجر'] || t.name || '').includes(search));

  const getName = (t: any) => t['اسم_المستأجر'] || t.name || 'مستأجر';
  const getId = (t: any, i: number) => String(t.id || i);

  const startEdit = (id: string) => {
    setDraft(ratings[id] || { payment: 3, property: 3, noise: 3, communication: 3, renewal: 3, notes: '' });
    setEditing(id);
  };

  const saveEdit = (id: string) => {
    setRatings(r => ({ ...r, [id]: draft }));
    setEditing(null);
    toast.success('تم حفظ التقييم');
  };

  const ratedIds = Object.keys(ratings);
  const allAvgs = ratedIds.map(id => {
    const r = ratings[id];
    return avgRating(r);
  });
  const overallAvg = allAvgs.length ? (allAvgs.reduce((a, b) => a + b, 0) / allAvgs.length).toFixed(1) : '—';

  return (
    <DashboardLayout pageTitle="تقييم المستأجرين">
      <div className="space-y-5" dir="rtl">
        <div className="flex items-center gap-2">
          <Star size={20} className="text-primary" />
          <h1 className="text-lg font-bold">تقييم المستأجرين</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-primary">{tenants.length}</p>
            <p className="text-xs text-muted-foreground mt-1">إجمالي المستأجرين</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-green-400">{ratedIds.length}</p>
            <p className="text-xs text-muted-foreground mt-1">تم تقييمهم</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-amber-400">{overallAvg}</p>
            <p className="text-xs text-muted-foreground mt-1">متوسط التقييم</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input className="w-full bg-muted border border-border rounded-lg pr-8 pl-3 py-2 text-sm" placeholder="بحث عن مستأجر..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {loading ? (
          <div className="text-center py-10 text-muted-foreground text-sm">جاري التحميل...</div>
        ) : (
          <div className="space-y-3">
            {(filtered.length > 0 ? filtered : tenants).slice(0, 30).map((t: any, i: number) => {
              const id = getId(t, i);
              const r = ratings[id];
              const avg = r ? avgRating(r) : null;
              const b = avg ? badge(avg) : null;
              const BadgeIcon = b?.icon;
              const isEditing = editing === id;

              return (
                <div key={id} className="bg-card border border-border rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-primary">
                      {getName(t)[0]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-sm text-foreground">{getName(t)}</p>
                        {b && BadgeIcon && (
                          <span className={`text-xs flex items-center gap-1 px-2 py-0.5 rounded-full ${b.color}`}>
                            <BadgeIcon size={10} />{b.label}
                          </span>
                        )}
                      </div>
                      {t['رقم_الجوال'] && <p className="text-xs text-muted-foreground">{t['رقم_الجوال']}</p>}
                    </div>
                    {avg && (
                      <div className="text-left">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map(s => (
                            <Star key={s} size={13} className={s <= Math.round(avg) ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/20'} />
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground text-left">{avg.toFixed(1)} / 5</p>
                      </div>
                    )}
                    <Button size="sm" variant={r ? 'outline' : 'default'} onClick={() => isEditing ? setEditing(null) : startEdit(id)}>
                      {r ? 'تعديل' : 'تقييم'}
                    </Button>
                  </div>

                  {r && !isEditing && (
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-border/30">
                      {CRITERIA.map(c => (
                        <div key={c.key} className="text-center">
                          <div className="flex justify-center">
                            {[1, 2, 3, 4, 5].map(s => <Star key={s} size={10} className={s <= r[c.key] ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/20'} />)}
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{c.label}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {isEditing && (
                    <div className="pt-3 border-t border-border/30 space-y-3">
                      {CRITERIA.map(c => (
                        <div key={c.key} className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground w-32">{c.label}</span>
                          <StarRating value={draft[c.key] || 3} onChange={v => setDraft((d: any) => ({ ...d, [c.key]: v }))} />
                        </div>
                      ))}
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">ملاحظات</label>
                        <textarea rows={2} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-xs resize-none" value={draft.notes || ''} onChange={e => setDraft((d: any) => ({ ...d, notes: e.target.value }))} placeholder="ملاحظات إضافية عن المستأجر" />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" size="sm" onClick={() => setEditing(null)}>إلغاء</Button>
                        <Button size="sm" onClick={() => saveEdit(id)}>حفظ التقييم</Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

