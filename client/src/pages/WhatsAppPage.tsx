/*
 * واجهة واتساب للتواصل - رمز الإبداع
 */
import { useState } from 'react';
import { MessageCircle, Send, Phone, Search, MoreVertical, CheckCheck, Clock, Users, Plus, Image, Paperclip } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Conversation {
  id: number;
  name: string;
  lastMsg: string;
  time: string;
  unread: number;
  type: 'مستأجر' | 'مالك' | 'فني' | 'وسيط';
  online: boolean;
}

interface Message {
  id: number;
  text: string;
  from: 'me' | 'them';
  time: string;
  status: 'sent' | 'delivered' | 'read';
}

const CONVOS: Conversation[] = [
  { id: 1, name: 'أحمد العمري', lastMsg: 'شكراً، تم استلام الإيصال', time: '10:25', unread: 0, type: 'مستأجر', online: true },
  { id: 2, name: 'سارة الغامدي', lastMsg: 'متى موعد الصيانة؟', time: '09:10', unread: 2, type: 'مستأجر', online: false },
  { id: 3, name: 'خالد النجدي', lastMsg: 'تم تحديث بيانات العقد', time: 'أمس', unread: 0, type: 'مالك', online: true },
  { id: 4, name: 'محمد التقني', lastMsg: 'سأصل في الساعة 3', time: 'أمس', unread: 1, type: 'فني', online: false },
  { id: 5, name: 'مكتب الأمانة العقاري', lastMsg: 'مرحباً، نود الاستفسار عن العقار', time: 'الاثنين', unread: 0, type: 'وسيط', online: false },
];

const INITIAL_MSGS: Message[] = [
  { id: 1, text: 'مرحباً، أود الاستفسار عن موعد صيانة التكييف', from: 'them', time: '09:00', status: 'read' },
  { id: 2, text: 'أهلاً بك! سيتم إرسال فريق الصيانة الثلاثاء القادم الساعة 10 صباحاً', from: 'me', time: '09:05', status: 'read' },
  { id: 3, text: 'ممتاز، سأكون متواجداً. هل يحتاجون لأي شيء؟', from: 'them', time: '09:08', status: 'read' },
  { id: 4, text: 'فقط توفير الوصول للوحدة، شكراً جزيلاً', from: 'me', time: '09:10', status: 'delivered' },
  { id: 5, text: 'متى موعد الصيانة؟', from: 'them', time: '09:10', status: 'read' },
];

const TEMPLATES = [
  'مرحباً، نود إعلامك بموعد تجديد العقد',
  'إشعار: يستحق قسط الإيجار بتاريخ {تاريخ}',
  'تم استلام دفعتكم بنجاح، شكراً',
  'طلب الصيانة رقم {رقم} قيد التنفيذ',
  'دعوة لتقييم الخدمة بعد اكتمال الصيانة',
];

const typeColors: Record<string, string> = {
  'مستأجر': 'text-blue-400 bg-blue-500/15',
  'مالك': 'text-green-400 bg-green-500/15',
  'فني': 'text-amber-400 bg-amber-500/15',
  'وسيط': 'text-purple-400 bg-purple-500/15',
};

export default function WhatsAppPage() {
  const [selected, setSelected] = useState<Conversation>(CONVOS[1]);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MSGS);
  const [input, setInput] = useState('');
  const [searchConvo, setSearchConvo] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [bulkMsg, setBulkMsg] = useState('');
  const [showBulk, setShowBulk] = useState(false);

  const filteredConvos = CONVOS.filter(c => !searchConvo || c.name.includes(searchConvo));

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages(m => [...m, { id: Date.now(), text: input, from: 'me', time: new Date().toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' }), status: 'sent' }]);
    setInput('');
    setTimeout(() => {
      setMessages(m => m.map(msg => msg.status === 'sent' ? { ...msg, status: 'delivered' } : msg));
    }, 1200);
  };

  const sendBulk = () => {
    if (!bulkMsg.trim()) { toast.error('اكتب الرسالة أولاً'); return; }
    toast.success(`تم إرسال الرسالة الجماعية إلى ${CONVOS.length} جهة اتصال`);
    setBulkMsg('');
    setShowBulk(false);
  };

  return (
    <DashboardLayout pageTitle="واتساب الأعمال">
      <div className="flex h-[calc(100vh-7rem)] bg-card border border-border rounded-xl overflow-hidden" dir="rtl">
        {/* Sidebar */}
        <div className="w-80 flex-shrink-0 border-l border-border flex flex-col">
          <div className="p-3 border-b border-border space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle size={18} className="text-green-400" />
                <span className="font-semibold text-sm">واتساب الأعمال</span>
              </div>
              <div className="flex gap-1">
                <button onClick={() => setShowBulk(true)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="رسالة جماعية"><Users size={15} /></button>
                <button className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="محادثة جديدة"><Plus size={15} /></button>
              </div>
            </div>
            <div className="relative">
              <Search size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input className="w-full bg-muted border border-border rounded-lg pr-7 pl-3 py-1.5 text-xs" placeholder="بحث..." value={searchConvo} onChange={e => setSearchConvo(e.target.value)} />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredConvos.map(c => (
              <button key={c.id} onClick={() => setSelected(c)} className={`w-full flex items-center gap-2.5 p-3 text-right hover:bg-muted/40 transition-colors border-b border-border/30 ${selected.id === c.id ? 'bg-muted/50' : ''}`}>
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-sm font-bold">
                    {c.name[0]}
                  </div>
                  {c.online && <span className="absolute bottom-0 left-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-card" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-foreground truncate">{c.name}</p>
                    <span className="text-[10px] text-muted-foreground flex-shrink-0">{c.time}</span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-[10px] text-muted-foreground truncate">{c.lastMsg}</p>
                    {c.unread > 0 && <span className="w-4 h-4 bg-green-500 text-white text-[9px] rounded-full flex items-center justify-center flex-shrink-0">{c.unread}</span>}
                  </div>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${typeColors[c.type]}`}>{c.type}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="p-3 border-b border-border flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-sm font-bold">
              {selected.name[0]}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">{selected.name}</p>
              <p className="text-[10px] text-muted-foreground">{selected.online ? 'متصل الآن' : 'غير متصل'}</p>
            </div>
            <div className="flex gap-1">
              <button className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"><Phone size={15} /></button>
              <button onClick={() => setShowTemplates(!showTemplates)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"><MoreVertical size={15} /></button>
            </div>
          </div>

          {/* Templates dropdown */}
          {showTemplates && (
            <div className="absolute left-80 top-48 z-10 w-72 bg-card border border-border rounded-xl shadow-xl p-3">
              <p className="text-xs font-semibold mb-2 text-muted-foreground">قوالب الرسائل</p>
              {TEMPLATES.map((t, i) => (
                <button key={i} onClick={() => { setInput(t); setShowTemplates(false); }} className="w-full text-right text-xs p-2 hover:bg-muted rounded-lg text-foreground mb-1">{t}</button>
              ))}
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2" style={{ background: 'hsl(var(--background))' }}>
            {messages.map(m => (
              <div key={m.id} className={`flex ${m.from === 'me' ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-xs lg:max-w-sm px-3 py-2 rounded-xl text-xs ${m.from === 'me' ? 'bg-green-500 text-white rounded-tr-sm' : 'bg-card border border-border text-foreground rounded-tl-sm'}`}>
                  <p>{m.text}</p>
                  <div className={`flex items-center gap-1 mt-1 ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                    <span className={`text-[9px] ${m.from === 'me' ? 'text-green-100' : 'text-muted-foreground'}`}>{m.time}</span>
                    {m.from === 'me' && (
                      m.status === 'read' ? <CheckCheck size={11} className="text-blue-200" /> :
                      m.status === 'delivered' ? <CheckCheck size={11} className="text-green-100" /> :
                      <Clock size={10} className="text-green-100" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border flex items-center gap-2">
            <button className="p-2 rounded-lg hover:bg-muted text-muted-foreground"><Paperclip size={15} /></button>
            <button className="p-2 rounded-lg hover:bg-muted text-muted-foreground"><Image size={15} /></button>
            <input
              className="flex-1 bg-muted border border-border rounded-xl px-3 py-2 text-sm"
              placeholder="اكتب رسالة..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
            />
            <button onClick={sendMessage} className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors">
              <Send size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Message Modal */}
      {showBulk && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 space-y-4" dir="rtl">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-primary" />
              <h2 className="font-semibold">رسالة جماعية</h2>
            </div>
            <p className="text-xs text-muted-foreground">سترسل هذه الرسالة إلى جميع جهات الاتصال ({CONVOS.length} جهة)</p>
            <textarea rows={4} className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-sm resize-none" placeholder="اكتب رسالتك..." value={bulkMsg} onChange={e => setBulkMsg(e.target.value)} />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowBulk(false)}>إلغاء</Button>
              <Button onClick={sendBulk} className="bg-green-500 hover:bg-green-600 text-white gap-2"><Send size={14} />إرسال للجميع</Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
