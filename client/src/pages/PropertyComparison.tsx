/*
 * مقارنة العقارات - رمز الإبداع
 */
import { useState } from 'react';
import { GitCompare, Plus, X, TrendingUp, TrendingDown, Minus, Home } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useMultiEntityData } from '@/hooks/useEntityData';
import { Button } from '@/components/ui/button';

const FIELDS = [
  { key: 'نوع_العقار', label: 'نوع العقار' },
  { key: 'المدينة', label: 'المدينة' },
  { key: 'الحي', label: 'الحي' },
  { key: 'المساحة', label: 'المساحة (م²)', numeric: true },
  { key: 'عدد_الغرف', label: 'عدد الغرف', numeric: true },
  { key: 'عدد_الوحدات', label: 'عدد الوحدات', numeric: true },
  { key: 'قيمة_الإيجار', label: 'الإيجار الشهري (ر.س)', numeric: true },
  { key: 'سنة_البناء', label: 'سنة البناء', numeric: true },
  { key: 'نسبة_الإشغال', label: 'نسبة الإشغال (%)', numeric: true },
  { key: 'حالة_العقار', label: 'حالة العقار' },
];

function CompareCell({ val, best, worst, numeric }: { val: any; best: any; worst: any; numeric?: boolean }) {
  if (!numeric || val === undefined || val === null || val === '' || !best || !worst) {
    return <td className="text-center py-2 px-3 text-sm text-foreground border-r border-border/30 last:border-0">{val ?? '—'}</td>;
  }
  const n = parseFloat(val);
  const b = parseFloat(best);
  const w = parseFloat(worst);
  const isTop = n === b;
  const isBottom = n === w && b !== w;
  return (
    <td className={`text-center py-2 px-3 text-sm border-r border-border/30 last:border-0 ${isTop ? 'text-green-400 font-semibold' : isBottom ? 'text-red-400' : 'text-foreground'}`}>
      <span className="flex items-center justify-center gap-1">
        {isTop ? <TrendingUp size={12} /> : isBottom ? <TrendingDown size={12} /> : <Minus size={10} className="text-muted-foreground" />}
        {n.toLocaleString('ar-SA')}
      </span>
    </td>
  );
}

export default function PropertyComparison() {
  const [selected, setSelected] = useState<string[]>([]);

  const { data, loading } = useMultiEntityData([{ name: 'Property', limit: 500 }]);
  const properties = data.Property || [];

  const getName = (p: any) => p['اسم_العقار'] || p.name || p['رقم_العقار'] || 'عقار';
  const getPropId = (p: any, i: number) => String(p.id || p['رقم_العقار'] || i);

  const selectedProps = properties.filter((p: any, i: number) => selected.includes(getPropId(p, i)));

  const toggle = (id: string) => {
    if (selected.includes(id)) setSelected(s => s.filter(x => x !== id));
    else if (selected.length < 4) setSelected(s => [...s, id]);
  };

  return (
    <DashboardLayout pageTitle="مقارنة العقارات">
      <div className="space-y-5" dir="rtl">
        <div className="flex items-center gap-2">
          <GitCompare size={20} className="text-primary" />
          <h1 className="text-lg font-bold">مقارنة العقارات</h1>
          <span className="text-xs text-muted-foreground">(اختر حتى 4 عقارات)</span>
        </div>

        {loading ? (
          <div className="text-center py-10 text-muted-foreground text-sm">جاري التحميل...</div>
        ) : (
          <>
            {/* Property Selector */}
            <div className="bg-card border border-border rounded-xl p-4">
              <h2 className="text-sm font-semibold mb-3">اختر العقارات للمقارنة</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {properties.slice(0, 20).map((p: any, i: number) => {
                  const id = getPropId(p, i);
                  const isSelected = selected.includes(id);
                  return (
                    <button
                      key={id}
                      onClick={() => toggle(id)}
                      disabled={!isSelected && selected.length >= 4}
                      className={`flex items-center gap-2 p-2.5 rounded-lg border text-right transition-colors ${isSelected ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-border/60 text-foreground disabled:opacity-40'}`}
                    >
                      <Home size={14} className="flex-shrink-0" />
                      <span className="text-xs font-medium truncate">{getName(p)}</span>
                      {isSelected && <X size={12} className="mr-auto flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
              {properties.length > 20 && <p className="text-xs text-muted-foreground mt-2">يتم عرض أول 20 عقار. استخدم البحث لتضييق النتائج.</p>}
            </div>

            {/* Compare Table */}
            {selectedProps.length === 0 ? (
              <div className="bg-card border border-dashed border-border rounded-xl p-10 text-center">
                <GitCompare size={40} className="mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">اختر عقارين على الأقل للمقارنة</p>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted/40 border-b border-border">
                        <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground w-36 border-r border-border/30">الخاصية</th>
                        {selectedProps.map((p: any, i: number) => (
                          <th key={i} className="text-center py-3 px-3 text-xs font-semibold text-foreground border-r border-border/30 last:border-0">
                            <div className="flex items-center justify-center gap-1">
                              {getName(p)}
                              <button onClick={() => toggle(getPropId(p, properties.indexOf(p)))} className="text-muted-foreground hover:text-foreground"><X size={12} /></button>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {FIELDS.map((field, fi) => {
                        const values = selectedProps.map((p: any) => p[field.key]);
                        const numValues = field.numeric ? values.map(v => parseFloat(String(v))).filter(n => !isNaN(n)) : [];
                        const best = numValues.length ? Math.max(...numValues) : null;
                        const worst = numValues.length ? Math.min(...numValues) : null;
                        return (
                          <tr key={field.key} className={`border-b border-border/30 last:border-0 ${fi % 2 === 0 ? '' : 'bg-muted/10'}`}>
                            <td className="py-2 px-4 text-xs font-medium text-muted-foreground border-r border-border/30">{field.label}</td>
                            {selectedProps.map((p: any, i: number) => (
                              <CompareCell key={i} val={p[field.key] ?? '—'} best={best} worst={worst} numeric={field.numeric} />
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="px-4 py-2 border-t border-border/30 flex items-center gap-4 text-xs text-muted-foreground bg-muted/20">
                  <span className="flex items-center gap-1"><TrendingUp size={11} className="text-green-400" />الأفضل</span>
                  <span className="flex items-center gap-1"><TrendingDown size={11} className="text-red-400" />الأدنى</span>
                  <span className="flex items-center gap-1"><Minus size={10} />متوسط</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

