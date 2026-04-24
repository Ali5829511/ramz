/*
 * الخريطة التفاعلية - رمز الإبداع
 */
import { useState } from 'react';
import { Map, MapPin, Building2, Home, Search, Filter, Layers } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useMultiEntityData } from '@/hooks/useEntityData';

const CITIES: Record<string, { lat: number; lng: number }> = {
  'الرياض': { lat: 24.7136, lng: 46.6753 },
  'جدة': { lat: 21.3891, lng: 39.8579 },
  'الدمام': { lat: 26.4207, lng: 50.0888 },
  'مكة المكرمة': { lat: 21.3891, lng: 39.8579 },
  'المدينة المنورة': { lat: 24.5247, lng: 39.5692 },
};

const DISTRICTS = ['الملز', 'العليا', 'النزهة', 'الروضة', 'الشفا', 'الورود', 'الربوة', 'المحمدية'];

function PropertyPin({ x, y, label, type, status }: { x: number; y: number; label: string; type: string; status: string }) {
  const [hover, setHover] = useState(false);
  const color = status === 'مؤجرة' ? '#10b981' : status === 'شاغرة' ? '#f59e0b' : '#3b82f6';
  return (
    <div
      className="absolute cursor-pointer transition-transform hover:scale-125"
      style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="relative">
        <MapPin size={28} style={{ color }} fill={color} opacity={0.9} />
        {hover && (
          <div className="absolute bottom-full mb-1 right-1/2 translate-x-1/2 bg-card border border-border rounded-lg p-2 text-xs whitespace-nowrap shadow-lg z-10">
            <p className="font-medium text-foreground">{label}</p>
            <p className="text-muted-foreground">{type} · {status}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MapViewPage() {
  const [search, setSearch] = useState('');
  const [filterCity, setFilterCity] = useState('الكل');
  const [filterStatus, setFilterStatus] = useState('الكل');

  const { data, loading } = useMultiEntityData([{ name: 'Property', limit: 200 }]);
  const properties: any[] = data.Property || [];

  const filtered = properties.filter(p => {
    const name = p['اسم_العقار'] || '';
    const city = p['المدينة'] || '';
    const status = p['حالة_العقار'] || '';
    return (!search || name.includes(search)) &&
           (filterCity === 'الكل' || city === filterCity) &&
           (filterStatus === 'الكل' || status === filterStatus);
  });

  // Generate pseudo-random positions for pins based on index
  const pins = filtered.slice(0, 20).map((p: any, i: number) => ({
    label: p['اسم_العقار'] || `عقار ${i + 1}`,
    type: p['نوع_العقار'] || 'عقار',
    status: p['حالة_العقار'] || 'شاغرة',
    x: 15 + ((i * 37) % 70),
    y: 10 + ((i * 53) % 80),
  }));

  const cities = ['الكل', ...Array.from(new Set(properties.map((p: any) => p['المدينة']).filter(Boolean)))];
  const statuses = ['الكل', ...Array.from(new Set(properties.map((p: any) => p['حالة_العقار']).filter(Boolean)))];

  return (
    <DashboardLayout pageTitle="الخريطة التفاعلية">
      <div className="space-y-4" dir="rtl">
        <div className="flex items-center gap-2">
          <Map size={20} className="text-primary" />
          <h1 className="text-lg font-bold">الخريطة التفاعلية للعقارات</h1>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap gap-2 items-center bg-card border border-border rounded-xl p-3">
          <div className="relative flex-1 min-w-40">
            <Search size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input className="w-full bg-muted border border-border rounded-lg pr-8 pl-3 py-1.5 text-xs" placeholder="ابحث عن عقار..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="bg-muted border border-border rounded-lg px-2 py-1.5 text-xs" value={filterCity} onChange={e => setFilterCity(e.target.value)}>
            {cities.slice(0, 8).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="bg-muted border border-border rounded-lg px-2 py-1.5 text-xs" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            {statuses.slice(0, 6).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <div className="flex items-center gap-3 mr-2 text-xs">
            {[['#10b981', 'مؤجرة'], ['#f59e0b', 'شاغرة'], ['#3b82f6', 'محجوزة']].map(([color, label]) => (
              <span key={label} className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                <span className="text-muted-foreground">{label}</span>
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Map Area */}
          <div className="lg:col-span-3 bg-card border border-border rounded-xl overflow-hidden" style={{ minHeight: 500 }}>
            <div className="relative w-full h-full" style={{ minHeight: 500, background: 'linear-gradient(135deg, hsl(var(--muted)/30) 0%, hsl(var(--muted)/10) 100%)' }}>
              {/* Grid overlay */}
              <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(hsl(var(--border)/40) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)/40) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
              
              {/* Saudi Arabia silhouette area */}
              <div className="absolute inset-4 border-2 border-dashed border-border/30 rounded-2xl flex items-center justify-center">
                <div className="text-center text-muted-foreground/30">
                  <Map size={80} />
                  <p className="text-sm mt-2">المملكة العربية السعودية</p>
                </div>
              </div>

              {loading ? (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">جاري التحميل...</div>
              ) : pins.length === 0 ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                  <MapPin size={32} className="opacity-30" />
                  <p className="text-sm">لا توجد عقارات لعرضها</p>
                </div>
              ) : pins.map((pin, i) => (
                <PropertyPin key={i} x={pin.x} y={pin.y} label={pin.label} type={pin.type} status={pin.status} />
              ))}

              {/* Zoom controls */}
              <div className="absolute left-4 bottom-4 flex flex-col gap-1">
                {['+', '−'].map(btn => (
                  <button key={btn} className="w-8 h-8 bg-card border border-border rounded-lg flex items-center justify-center text-sm font-bold text-muted-foreground hover:text-foreground shadow">{btn}</button>
                ))}
              </div>

              {/* Scale bar */}
              <div className="absolute left-4 top-4 flex items-center gap-1.5">
                <Layers size={14} className="text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground bg-card/80 px-1.5 py-0.5 rounded">{filtered.length} عقار</span>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-3">
            {/* Stats */}
            <div className="bg-card border border-border rounded-xl p-4 space-y-2">
              <h3 className="text-xs font-semibold text-muted-foreground">إحصائيات</h3>
              {[
                { label: 'إجمالي العقارات', value: properties.length, color: 'text-primary' },
                { label: 'ظاهرة على الخريطة', value: pins.length, color: 'text-foreground' },
                { label: 'مؤجرة', value: properties.filter((p: any) => p['حالة_العقار'] === 'مؤجرة').length, color: 'text-green-400' },
                { label: 'شاغرة', value: properties.filter((p: any) => p['حالة_العقار'] === 'شاغرة').length, color: 'text-amber-400' },
              ].map(s => (
                <div key={s.label} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{s.label}</span>
                  <span className={`font-semibold ${s.color}`}>{s.value}</span>
                </div>
              ))}
            </div>

            {/* Property List */}
            <div className="bg-card border border-border rounded-xl p-4">
              <h3 className="text-xs font-semibold text-muted-foreground mb-2">العقارات ({filtered.length})</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {loading ? <p className="text-xs text-muted-foreground">جاري التحميل...</p> :
                  filtered.slice(0, 15).map((p: any, i: number) => (
                    <div key={i} className="flex items-start gap-2 py-1.5 border-b border-border/30 last:border-0">
                      <Building2 size={13} className="text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-foreground">{p['اسم_العقار'] || `عقار ${i+1}`}</p>
                        <p className="text-[10px] text-muted-foreground">{p['المدينة'] || ''} {p['الحي'] ? `· ${p['الحي']}` : ''}</p>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
