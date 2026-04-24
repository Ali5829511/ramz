/*
 * صفحة الوحدات المستقلة - رمز الإبداع
 * إدارة شاملة لجميع وحدات العقار — بيانات حقيقية من Supabase
 */
import { useMemo, useState } from 'react';
import { Link } from 'wouter';
import {
  Home, Search, Plus, Eye, Edit, MoreVertical,
  Building2, BedDouble, Bath, Ruler, DollarSign, RefreshCw,
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingState } from '@/components/shared/PageStates';
import { useMultiEntityData } from '@/hooks/useEntityData';
import { cn } from '@/lib/utils';

type UnitStatus = 'مشغولة' | 'شاغرة' | 'صيانة' | 'محجوزة';

interface Unit {
  id: string; unitNo: string; unitName: string; propertyName: string; propertyId: string;
  floor: number; type: string; area: number; bedrooms: number; bathrooms: number;
  rentPrice: number; status: UnitStatus; tenantName?: string;
  leaseEnd?: string; lastMaintenance?: string;
}

function mapStatus(raw: string): UnitStatus {
  if (raw === 'مؤجرة' || raw === 'occupied' || raw === 'مشغولة') return 'مشغولة';
  if (raw === 'محجوزة' || raw === 'reserved') return 'محجوزة';
  if (raw === 'صيانة' || raw === 'maintenance') return 'صيانة';
  return 'شاغرة';
}

const STATUS_CONFIG: Record<UnitStatus, { label: string; badge: string; dot: string }> = {
  'مشغولة':  { label: 'مشغولة',  badge: 'bg-green-100 text-green-700 border-green-200',    dot: 'bg-green-500' },
  'شاغرة':   { label: 'شاغرة',   badge: 'bg-blue-100 text-blue-700 border-blue-200',       dot: 'bg-blue-500' },
  'صيانة':   { label: 'صيانة',   badge: 'bg-amber-100 text-amber-700 border-amber-200',    dot: 'bg-amber-500' },
  'محجوزة':  { label: 'محجوزة',  badge: 'bg-purple-100 text-purple-700 border-purple-200', dot: 'bg-purple-500' },
};

const STATUS_FILTERS: (UnitStatus | 'الكل')[] = ['الكل', 'مشغولة', 'شاغرة', 'صيانة', 'محجوزة'];
const UNIT_TYPES = ['الكل', 'شقة', 'استوديو', 'محل تجاري', 'مكتب', 'شقة فاخرة'];

function UnitCard({ unit }: { unit: Unit }) {
  const cfg = STATUS_CONFIG[unit.status];
  const daysLeft = unit.leaseEnd ? Math.ceil((new Date(unit.leaseEnd).getTime() - Date.now()) / 86400000) : null;
  const barColor = unit.status === 'مشغولة' ? 'bg-green-500' : unit.status === 'شاغرة' ? 'bg-blue-500' : unit.status === 'صيانة' ? 'bg-amber-500' : 'bg-purple-500';

  return (
    <Card className="hover:shadow-md transition-all group overflow-hidden">
      <div className={cn('h-1.5', barColor)} />
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg">وحدة {unit.unitNo}</span>
              <Badge variant="outline" className={cn('text-[10px] px-1.5 h-5 border', cfg.badge)}>{cfg.label}</Badge>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
              <Building2 className="w-3 h-3" />{unit.propertyName}<span>·</span><span>ط {unit.floor}</span>
            </div>
          </div>
          <button className="p-1 hover:bg-muted rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreVertical className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1"><Home className="w-3 h-3" />{unit.type}</div>
          <div className="flex items-center gap-1"><Ruler className="w-3 h-3" />{unit.area} م²</div>
          {unit.bedrooms > 0 && <div className="flex items-center gap-1"><BedDouble className="w-3 h-3" />{unit.bedrooms} غ</div>}
          <div className="flex items-center gap-1"><Bath className="w-3 h-3" />{unit.bathrooms}</div>
        </div>

        <div className="flex items-center gap-1.5">
          <DollarSign className="w-3.5 h-3.5 text-primary" />
          <span className="font-bold text-primary">{unit.rentPrice.toLocaleString('ar-SA')}</span>
          <span className="text-xs text-muted-foreground">ر.س / سنة</span>
        </div>

        {unit.tenantName && (
          <div className="bg-muted/30 rounded-lg px-3 py-2">
            <p className="text-xs font-medium">{unit.tenantName}</p>
            {unit.leaseEnd && daysLeft !== null && (
              <p className={cn('text-[10px] mt-0.5', daysLeft < 60 ? 'text-red-600 font-medium' : 'text-muted-foreground')}>
                ينتهي: {new Date(unit.leaseEnd).toLocaleDateString('ar-SA')}
                {daysLeft < 60 && ` (${daysLeft} يوم)`}
              </p>
            )}
          </div>
        )}

        {unit.status === 'صيانة' && unit.lastMaintenance && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            <p className="text-xs text-amber-700">🔧 تحت الصيانة منذ {new Date(unit.lastMaintenance).toLocaleDateString('ar-SA')}</p>
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <Link href={`/property-detail?id=${unit.propertyId}`}>
            <Button size="sm" variant="outline" className="flex-1 text-xs h-7 gap-1">
              <Eye className="w-3 h-3" /> عرض
            </Button>
          </Link>
          <Button size="sm" variant="ghost" className="text-xs h-7 gap-1">
            <Edit className="w-3 h-3" /> تعديل
          </Button>
          {unit.status === 'شاغرة' && (
            <Button size="sm" className="text-xs h-7 gap-1">
              <Plus className="w-3 h-3" /> تأجير
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Units() {
  const { data, loading, isDemo, reload } = useMultiEntityData([
    { name: 'Unit', sort: '-created_date', limit: 2000 },
    { name: 'Property', sort: '-created_date', limit: 200 },
    { name: 'Lease', sort: '-created_date', limit: 500 },
  ]);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('الكل');
  const [statusFilter, setStatusFilter] = useState<UnitStatus | 'الكل'>('الكل');

  // Map Supabase units → local Unit shape
  const allUnits: Unit[] = useMemo(() => {
    const rawUnits = data.Unit || [];
    const rawProps = data.Property || [];
    const rawLeases = data.Lease || [];

    return rawUnits.map((u: any) => {
      const propId = u['معرف_العقار'] || u.property_id || '';
      const prop = rawProps.find((p: any) => p.id === propId);
      const lease = rawLeases.find((l: any) =>
        (l['معرف_الوحدة'] || l.unit_id) === u.id &&
        ((l['حالة_العقد'] || l.status) === 'نشط' || (l['حالة_العقد'] || l.status) === 'active')
      );
      return {
        id: u.id,
        unitNo: u['رقم_الوحدة'] || u.unit_number || '-',
        unitName: u['اسم_الوحدة'] || u.unit_name || '',
        propertyName: u['اسم_العقار'] || prop?.['اسم_العقار'] || prop?.name || '-',
        propertyId: propId,
        floor: parseInt(u['الطابق'] || u.floor || '0') || 0,
        type: u['نوع_الوحدة'] || u.unit_type || u.type || 'شقة',
        area: parseFloat(u['مساحة_الوحدة'] || u.area || '0') || 0,
        bedrooms: parseInt(u['عدد_الغرف'] || u.bedrooms || '0') || 0,
        bathrooms: parseInt(u['عدد_الحمامات'] || u.bathrooms || '0') || 0,
        rentPrice: parseFloat(u['قيمة_الإيجار'] || u['سعر_الإيجار'] || u.rent_price || '0') || 0,
        status: mapStatus(u['حالة_الوحدة'] || u.status || 'شاغرة'),
        tenantName: lease?.['اسم_المستأجر'] || lease?.tenant_name,
        leaseEnd: lease?.['تاريخ_انتهاء_الإيجار'] || lease?.['تاريخ_نهاية_العقد'],
      };
    });
  }, [data]);

  const stats = useMemo(() => ({
    total: allUnits.length,
    occupied: allUnits.filter(u => u.status === 'مشغولة').length,
    vacant: allUnits.filter(u => u.status === 'شاغرة').length,
    maintenance: allUnits.filter(u => u.status === 'صيانة').length,
  }), [allUnits]);

  const filtered = allUnits.filter(u => {
    const matchSearch = !search || u.unitNo.includes(search) || u.tenantName?.includes(search) || u.propertyName.includes(search) || u.type.includes(search) || u.unitName.includes(search);
    const matchType = typeFilter === 'الكل' || u.type === typeFilter;
    const matchStatus = statusFilter === 'الكل' || u.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  return (
    <DashboardLayout pageTitle="الوحدات">
      <PageHeader title="إدارة الوحدات" description={`${stats.total} وحدة — ${stats.occupied} مشغولة — ${stats.vacant} شاغرة`}>
        <button onClick={reload} className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
        <Button size="sm" className="gap-2">
          <Plus className="w-4 h-4" />إضافة وحدة
        </Button>
      </PageHeader>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">جاري التحميل...</div>
      ) : (<>

      {isDemo && (
        <div className="mb-4 text-xs text-primary bg-primary/10 border border-primary/20 rounded-lg px-4 py-2">
          بيانات تجريبية — قم بتوصيل Supabase لعرض وحداتك الحقيقية
        </div>
      )}

      {/* إحصاءات */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'إجمالي', value: stats.total, color: 'text-foreground', bg: 'bg-card' },
          { label: 'مشغولة', value: stats.occupied, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'شاغرة', value: stats.vacant, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'صيانة', value: stats.maintenance, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map(s => (
          <div key={s.label} className={cn('rounded-xl p-4 text-center border border-border', s.bg)}>
            <div className={cn('text-2xl font-bold', s.color)}>{s.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* شريط الإشغال */}
      <div className="bg-card border border-border rounded-xl p-4 mb-5">
        <div className="flex items-center justify-between mb-2 text-sm">
          <span className="font-medium">نسبة الإشغال</span>
          <span className="font-bold text-primary">{Math.round(stats.occupied / stats.total * 100)}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" style={{ width: `${Math.round(stats.occupied / stats.total * 100)}%` }} />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>{stats.occupied} مشغولة</span>
          <span>{stats.vacant} شاغرة</span>
        </div>
      </div>

      {/* فلاتر */}
      <div className="space-y-3 mb-5">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text" placeholder="بحث برقم الوحدة أو المستأجر أو العقار..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full h-9 pr-9 pl-4 rounded-lg bg-input border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUS_FILTERS.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} className={cn('px-2.5 py-1 rounded-full text-xs font-medium border transition-colors', statusFilter === s ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border hover:bg-muted')}>{s}</button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          {UNIT_TYPES.map(t => (
            <button key={t} onClick={() => setTypeFilter(t)} className={cn('px-2.5 py-1 rounded-full text-xs font-medium border transition-colors', typeFilter === t ? 'bg-secondary text-secondary-foreground border-secondary' : 'bg-card text-muted-foreground border-border hover:bg-muted')}>{t}</button>
          ))}
        </div>
      </div>

      {/* الشبكة */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Home className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p>لا توجد وحدات تطابق البحث</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(unit => <UnitCard key={unit.id} unit={unit} />)}
        </div>
      )}
      </>)}
    </DashboardLayout>
  );
}
