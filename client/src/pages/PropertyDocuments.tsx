/*
 * مستندات العقارات - رمز الإبداع
 */
import { useState } from 'react';
import { FileText, Upload, Search, Download, Eye, Trash2, FolderOpen, Plus, File, FileImage, FileSpreadsheet } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type DocType = 'عقد' | 'ترخيص' | 'صورة' | 'تقرير' | 'أخرى';

interface Doc {
  id: number;
  name: string;
  property: string;
  type: DocType;
  size: string;
  uploadedAt: string;
  format: 'pdf' | 'jpg' | 'xlsx' | 'docx';
}

const SAMPLE: Doc[] = [
  { id: 1, name: 'رخصة بناء - برج النور', property: 'برج النور', type: 'ترخيص', size: '2.4 MB', uploadedAt: '2024-01-15', format: 'pdf' },
  { id: 2, name: 'عقد ملكية - مجمع الياسمين', property: 'مجمع الياسمين', type: 'عقد', size: '1.8 MB', uploadedAt: '2024-02-20', format: 'pdf' },
  { id: 3, name: 'صور خارجية - بناية الأمل', property: 'بناية الأمل', type: 'صورة', size: '15.2 MB', uploadedAt: '2024-03-10', format: 'jpg' },
  { id: 4, name: 'تقرير تقييم - برج النور', property: 'برج النور', type: 'تقرير', size: '3.1 MB', uploadedAt: '2024-04-05', format: 'pdf' },
  { id: 5, name: 'سجل الصيانة السنوي', property: 'مجمع الياسمين', type: 'تقرير', size: '0.9 MB', uploadedAt: '2024-05-01', format: 'xlsx' },
  { id: 6, name: 'شهادة إتمام البناء', property: 'بناية الأمل', type: 'ترخيص', size: '1.2 MB', uploadedAt: '2024-06-12', format: 'pdf' },
];

const typeColors: Record<DocType, string> = {
  'عقد': 'text-blue-400 bg-blue-500/15',
  'ترخيص': 'text-green-400 bg-green-500/15',
  'صورة': 'text-purple-400 bg-purple-500/15',
  'تقرير': 'text-amber-400 bg-amber-500/15',
  'أخرى': 'text-muted-foreground bg-muted',
};

const formatIcons: Record<string, any> = {
  pdf: File,
  jpg: FileImage,
  xlsx: FileSpreadsheet,
  docx: FileText,
};

const DOC_TYPES: DocType[] = ['عقد', 'ترخيص', 'صورة', 'تقرير', 'أخرى'];

export default function PropertyDocuments() {
  const [docs, setDocs] = useState<Doc[]>(SAMPLE);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('الكل');

  const filtered = docs.filter(d => {
    const match = !search || d.name.includes(search) || d.property.includes(search);
    const matchType = filterType === 'الكل' || d.type === filterType;
    return match && matchType;
  });

  const handleUpload = () => {
    toast.info('يمكنك رفع الملفات من هنا — الميزة قيد التطوير');
  };

  const handleDelete = (id: number) => {
    setDocs(d => d.filter(doc => doc.id !== id));
    toast.success('تم حذف المستند');
  };

  const counts = DOC_TYPES.reduce((acc, t) => ({ ...acc, [t]: docs.filter(d => d.type === t).length }), {} as Record<string, number>);

  return (
    <DashboardLayout pageTitle="مستندات العقارات">
      <div className="space-y-5" dir="rtl">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <FolderOpen size={20} className="text-primary" />
            <h1 className="text-lg font-bold">مستندات العقارات</h1>
          </div>
          <Button onClick={handleUpload} className="gap-2"><Upload size={15} />رفع مستند</Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {[{ label: 'الكل', value: docs.length, active: filterType === 'الكل', onClick: () => setFilterType('الكل'), color: 'text-primary' },
            ...DOC_TYPES.map(t => ({ label: t, value: counts[t] || 0, active: filterType === t, onClick: () => setFilterType(t), color: typeColors[t].split(' ')[0] }))
          ].map(s => (
            <button key={s.label} onClick={s.onClick} className={`bg-card border rounded-xl p-3 text-center transition-colors ${s.active ? 'border-primary/50 bg-primary/5' : 'border-border hover:border-border/60'}`}>
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input className="w-full bg-muted border border-border rounded-lg pr-8 pl-3 py-2 text-sm" placeholder="بحث عن مستند..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* List */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="grid grid-cols-1 divide-y divide-border/40">
            {filtered.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground text-sm">لا توجد مستندات</div>
            ) : filtered.map(d => {
              const Icon = formatIcons[d.format] || FileText;
              return (
                <div key={d.id} className="flex items-center gap-3 p-4 hover:bg-muted/20 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <Icon size={18} className="text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{d.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${typeColors[d.type]}`}>{d.type}</span>
                      <span className="text-xs text-muted-foreground">{d.property}</span>
                      <span className="text-xs text-muted-foreground">· {d.size}</span>
                      <span className="text-xs text-muted-foreground">· {d.uploadedAt}</span>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <button className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground" title="معاينة">
                      <Eye size={14} />
                    </button>
                    <button className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground" title="تنزيل">
                      <Download size={14} />
                    </button>
                    <button onClick={() => handleDelete(d.id)} className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-red-400" title="حذف">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upload Area */}
        <div onClick={handleUpload} className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors">
          <Upload size={32} className="mx-auto text-muted-foreground/40 mb-2" />
          <p className="text-sm font-medium text-foreground">اسحب وأفلت الملفات هنا</p>
          <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG, XLSX, DOCX — الحد الأقصى 50 MB</p>
        </div>
      </div>
    </DashboardLayout>
  );
}

