/*
 * تقرير العقار الاحترافي - رمز الإبداع
 * نموذج تقرير كامل قابل للطباعة يُقدَّم لمالك العقار
 */
import { useState } from 'react';
import { useLocation } from 'wouter';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useMultiEntityData } from '@/hooks/useEntityData';
import {
  Printer, Building2, MapPin, Users, DollarSign, Wrench,
  FileText, ChevronLeft, BarChart3, Home, Calendar,
  TrendingUp, AlertCircle, CheckCircle, Clock, ArrowLeft
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// دالة توليد HTML الطباعة الاحترافي
// ─────────────────────────────────────────────────────────────────────────────
function generatePrintHTML(property: any, units: any[], leases: any[], payments: any[], expenses: any[], maintenance: any[]) {
  const today = new Date();
  const todayHijri = today.toLocaleDateString('ar-SA-u-ca-islamic', { year: 'numeric', month: 'long', day: 'numeric' });
  const todayGreg = today.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' });

  const propName = property['اسم_العقار'] || property.name || 'عقار';
  const propType = property['نوع_العقار'] || '—';
  const propCity = property['المدينة'] || '—';
  const propAddress = property['العنوان'] || property['العنوان_الوطني'] || '—';
  const ownerName = property['اسم_المالك'] || '—';
  const ownerPhone = property['جوال_المالك'] || '—';
  const floors = property['عدد_الطوابق'] || '—';
  const propStatus = property['حالة_العقار'] || 'نشط';

  // إحصاءات الوحدات
  const totalUnits = units.length;
  const rentedUnits = units.filter(u => u['حالة_الوحدة'] === 'مؤجرة' || u.status === 'occupied').length;
  const vacantUnits = units.filter(u => u['حالة_الوحدة'] === 'شاغرة' || u.status === 'vacant').length;
  const maintenanceUnits = units.filter(u => u['حالة_الوحدة'] === 'صيانة' || u.status === 'maintenance').length;
  const occupancyRate = totalUnits > 0 ? Math.round((rentedUnits / totalUnits) * 100) : 0;

  // الإيرادات
  const totalRevenue = payments
    .filter(p => p['حالة_القسط'] === 'مدفوع')
    .reduce((s, p) => s + (Number(p['مبلغ_الدفعة']) || 0), 0);
  const pendingRevenue = payments
    .filter(p => p['حالة_القسط'] === 'مستحق' || p['حالة_القسط'] === 'لم_يتم_الدفع')
    .reduce((s, p) => s + (Number(p['مبلغ_الدفعة']) || 0), 0);
  const totalExpenses = expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const netIncome = totalRevenue - totalExpenses;

  // الصيانة
  const pendingMaint = maintenance.filter(m => m.status === 'pending').length;
  const inProgressMaint = maintenance.filter(m => m.status === 'in_progress').length;
  const completedMaint = maintenance.filter(m => m.status === 'completed').length;

  // العقود النشطة
  const activeLeases = leases.filter(l => l['حالة_العقد'] === 'نشط');

  const formatMoney = (n: number) => n.toLocaleString('ar-SA') + ' ر.س';

  const unitRows = units.map((u, i) => {
    const lease = leases.find(l =>
      l['اسم_الوحدة'] === (u['اسم_الوحدة'] || u['رقم_الوحدة']) ||
      l['رقم_الوحدة'] === u['رقم_الوحدة']
    );
    const status = u['حالة_الوحدة'] || u.status || 'شاغرة';
    const statusColor = status === 'مؤجرة' || status === 'occupied' ? '#16a34a'
      : status === 'صيانة' || status === 'maintenance' ? '#d97706'
      : '#6b7280';
    return `
      <tr class="${i % 2 === 0 ? 'row-even' : 'row-odd'}">
        <td>${i + 1}</td>
        <td>${u['اسم_الوحدة'] || u['رقم_الوحدة'] || `وحدة ${i + 1}`}</td>
        <td>${u['نوع_الوحدة'] || '—'}</td>
        <td>${u['المساحة'] || '—'}</td>
        <td><span style="color:${statusColor};font-weight:700">${status}</span></td>
        <td>${lease ? lease['اسم_المستأجر'] || '—' : '—'}</td>
        <td>${lease ? formatMoney(Number(lease['قيمة_الإيجار']) || 0) : '—'}</td>
        <td>${lease ? lease['تاريخ_نهاية_العقد'] || '—' : '—'}</td>
      </tr>`;
  }).join('');

  const maintRows = maintenance.slice(0, 10).map((m, i) => {
    const statusMap: any = { pending: 'معلق', in_progress: 'جاري', completed: 'منجز' };
    const colorMap: any = { pending: '#dc2626', in_progress: '#d97706', completed: '#16a34a' };
    const priorityMap: any = { high: 'عالية', medium: 'متوسطة', low: 'منخفضة' };
    return `
      <tr class="${i % 2 === 0 ? 'row-even' : 'row-odd'}">
        <td>${m['عنوان_الطلب'] || 'طلب صيانة'}</td>
        <td>${m['اسم_الوحدة'] || '—'}</td>
        <td><span style="color:${colorMap[m.status] || '#000'}">${statusMap[m.status] || m.status}</span></td>
        <td>${priorityMap[m.priority] || m.priority || '—'}</td>
        <td>${m.created_date || '—'}</td>
      </tr>`;
  }).join('');

  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>تقرير عقار — ${propName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;900&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --primary:   #0f2d5e;
      --gold:      #c8922a;
      --gold-light:#f5e9c8;
      --light-bg:  #f8fafd;
      --border:    #d8e4f0;
      --text:      #1a1a2e;
      --muted:     #64748b;
      --green:     #15803d;
      --red:       #b91c1c;
      --amber:     #b45309;
    }

    body {
      font-family: 'Cairo', 'Arial', sans-serif;
      direction: rtl;
      background: #fff;
      color: var(--text);
      font-size: 13px;
      line-height: 1.7;
    }

    @page {
      size: A4;
      margin: 15mm 12mm 20mm 12mm;
    }

    @media print {
      .no-print { display: none !important; }
      .page-break { page-break-before: always; }
      body { font-size: 12px; }
      .page { padding: 0; }
    }

    .page { max-width: 800px; margin: 0 auto; padding: 24px 28px; }

    /* ─── ترويسة الشركة ─── */
    .company-header {
      display: flex;
      align-items: stretch;
      justify-content: space-between;
      border-bottom: 3px solid var(--primary);
      padding-bottom: 16px;
      margin-bottom: 0;
      gap: 20px;
    }
    .company-brand {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .company-logo {
      width: 62px; height: 62px;
      background: linear-gradient(135deg, var(--primary) 0%, #1e4a8a 100%);
      border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      color: var(--gold);
      font-size: 28px; font-weight: 900;
      box-shadow: 0 4px 12px rgba(15,45,94,0.3);
      flex-shrink: 0;
    }
    .company-text .name { font-size: 22px; font-weight: 900; color: var(--primary); line-height: 1.1; }
    .company-text .tagline { font-size: 11px; color: var(--gold); font-weight: 600; margin-top: 2px; }
    .company-text .sub { font-size: 10px; color: var(--muted); margin-top: 1px; }

    .company-contact {
      text-align: left;
      font-size: 11px;
      color: var(--muted);
      line-height: 1.9;
      padding: 4px 0;
    }
    .company-contact strong { color: var(--primary); }

    /* ─── شريط عنوان التقرير ─── */
    .report-title-bar {
      background: linear-gradient(135deg, var(--primary) 0%, #1a4b8c 60%, #0f2d5e 100%);
      color: white;
      padding: 18px 24px;
      margin: 0 -28px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: relative;
      overflow: hidden;
    }
    .report-title-bar::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    }
    .report-title-bar .rtb-left h1 { font-size: 20px; font-weight: 900; margin-bottom: 3px; }
    .report-title-bar .rtb-left p { font-size: 12px; opacity: 0.8; }
    .report-title-bar .rtb-right {
      text-align: left;
      font-size: 11px;
      opacity: 0.9;
      line-height: 1.8;
    }
    .rtb-badge {
      display: inline-block;
      background: var(--gold);
      color: var(--primary);
      font-weight: 700;
      font-size: 10px;
      padding: 3px 10px;
      border-radius: 20px;
      margin-bottom: 6px;
    }

    /* ─── بطاقات الإحصاء السريع ─── */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin: 16px 0;
    }
    .stat-card {
      border-radius: 10px;
      padding: 14px 12px;
      text-align: center;
      border: 1.5px solid;
    }
    .stat-card.blue  { background: #eff6ff; border-color: #bfdbfe; }
    .stat-card.green { background: #f0fdf4; border-color: #bbf7d0; }
    .stat-card.amber { background: #fffbeb; border-color: #fde68a; }
    .stat-card.red   { background: #fef2f2; border-color: #fecaca; }
    .stat-num { font-size: 26px; font-weight: 900; line-height: 1; }
    .stat-card.blue  .stat-num { color: #1d4ed8; }
    .stat-card.green .stat-num { color: var(--green); }
    .stat-card.amber .stat-num { color: var(--amber); }
    .stat-card.red   .stat-num { color: var(--red); }
    .stat-label { font-size: 10px; color: var(--muted); margin-top: 4px; font-weight: 600; }
    .stat-sub { font-size: 9px; color: var(--muted); margin-top: 2px; }

    /* ─── مؤشر الإشغال ─── */
    .occupancy-bar-wrap {
      background: var(--light-bg);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 14px 18px;
      margin-bottom: 16px;
    }
    .occupancy-bar-wrap .occ-header {
      display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;
    }
    .occ-title { font-size: 13px; font-weight: 700; color: var(--primary); }
    .occ-pct { font-size: 24px; font-weight: 900; color: var(--primary); }
    .bar-track {
      height: 12px;
      background: #e2e8f0;
      border-radius: 8px;
      overflow: hidden;
      position: relative;
    }
    .bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #1d4ed8 0%, #3b82f6 100%);
      border-radius: 8px;
      transition: width 1s ease;
    }
    .bar-labels {
      display: flex; justify-content: space-between; margin-top: 5px; font-size: 10px; color: var(--muted);
    }

    /* ─── قسم ─── */
    .section {
      margin-bottom: 18px;
      border: 1.5px solid var(--border);
      border-radius: 12px;
      overflow: hidden;
      page-break-inside: avoid;
    }
    .section-header {
      background: linear-gradient(90deg, var(--primary) 0%, #1a4b8c 100%);
      color: white;
      padding: 9px 16px;
      font-size: 13px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .section-header .icon {
      width: 22px; height: 22px;
      background: rgba(255,255,255,0.15);
      border-radius: 6px;
      display: flex; align-items: center; justify-content: center;
      font-size: 12px;
    }
    .section-body { padding: 14px 16px; background: white; }

    /* ─── حقول البيانات ─── */
    .fields-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px 16px;
    }
    .fields-grid-2 {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px 16px;
    }
    .field {
      border-bottom: 1px dashed var(--border);
      padding-bottom: 6px;
    }
    .field-label {
      font-size: 10px;
      color: var(--muted);
      font-weight: 600;
      margin-bottom: 2px;
    }
    .field-value {
      font-size: 13px;
      color: var(--text);
      font-weight: 600;
    }
    .field-value.highlight { color: var(--primary); }
    .field-value.gold { color: var(--gold); font-weight: 700; }

    /* ─── الجداول ─── */
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }
    thead tr {
      background: var(--primary);
      color: white;
    }
    thead th {
      padding: 9px 10px;
      text-align: right;
      font-weight: 700;
      white-space: nowrap;
    }
    tbody tr.row-even { background: white; }
    tbody tr.row-odd  { background: var(--light-bg); }
    tbody td {
      padding: 8px 10px;
      border-bottom: 1px solid var(--border);
      color: var(--text);
    }

    /* ─── المالية ─── */
    .finance-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
    }
    .finance-card {
      border-radius: 10px;
      padding: 14px;
      text-align: center;
      border: 1.5px solid;
    }
    .finance-card.income  { background: #f0fdf4; border-color: #86efac; }
    .finance-card.expense { background: #fef2f2; border-color: #fca5a5; }
    .finance-card.net     { background: #eff6ff; border-color: #93c5fd; }
    .finance-num { font-size: 18px; font-weight: 900; }
    .finance-card.income  .finance-num { color: var(--green); }
    .finance-card.expense .finance-num { color: var(--red); }
    .finance-card.net     .finance-num { color: #1d4ed8; }
    .finance-label { font-size: 11px; color: var(--muted); margin-top: 4px; font-weight: 600; }

    /* ─── الفاصل الذهبي ─── */
    .gold-divider {
      height: 3px;
      background: linear-gradient(90deg, transparent, var(--gold), transparent);
      margin: 20px 0;
    }

    /* ─── الختم ─── */
    .signature-section {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 20px;
      margin-top: 24px;
      page-break-inside: avoid;
    }
    .sig-box {
      border: 1.5px dashed var(--border);
      border-radius: 10px;
      padding: 16px;
      text-align: center;
    }
    .sig-label { font-size: 11px; font-weight: 700; color: var(--primary); margin-bottom: 40px; }
    .sig-line { border-top: 1.5px solid var(--border); padding-top: 6px; font-size: 10px; color: var(--muted); }

    /* ─── تذييل الصفحة ─── */
    .page-footer {
      position: fixed;
      bottom: 8mm;
      left: 12mm; right: 12mm;
      border-top: 2px solid var(--primary);
      padding-top: 6px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 10px;
      color: var(--muted);
    }
    .footer-brand { font-weight: 700; color: var(--primary); font-size: 11px; }
    .footer-brand span { color: var(--gold); }

    /* ─── شريط الطباعة ─── */
    .print-toolbar {
      position: fixed;
      top: 0; left: 0; right: 0;
      background: white;
      border-bottom: 2px solid var(--primary);
      padding: 10px 20px;
      display: flex;
      gap: 10px;
      align-items: center;
      z-index: 1000;
      box-shadow: 0 2px 12px rgba(0,0,0,0.1);
    }
    .print-toolbar button {
      background: var(--primary);
      color: white;
      border: none;
      padding: 9px 22px;
      border-radius: 8px;
      font-family: 'Cairo', sans-serif;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      display: flex; align-items: center; gap: 8px;
    }
    .print-toolbar button.secondary {
      background: white; color: var(--primary); border: 2px solid var(--primary);
    }
    .print-toolbar button:hover { opacity: 0.9; }
    .toolbar-title { font-weight: 700; color: var(--primary); font-size: 15px; margin-right: auto; }

    /* ─── وترمارك ─── */
    .watermark {
      position: fixed;
      top: 50%; left: 50%;
      transform: translate(-50%,-50%) rotate(-30deg);
      font-size: 72px; font-weight: 900;
      color: rgba(15,45,94,0.03);
      pointer-events: none;
      white-space: nowrap;
      z-index: 0;
    }

    .content-body { position: relative; z-index: 1; }

    /* ─── تنسيق للطباعة ─── */
    @media print {
      .print-toolbar { display: none !important; }
      .page { padding-top: 0; }
      body { padding-top: 0 !important; }
    }

    body.has-toolbar { padding-top: 55px; }
  </style>
</head>
<body class="has-toolbar">

  <div class="watermark">رمز الإبداع</div>

  <!-- شريط الطباعة -->
  <div class="print-toolbar no-print">
    <button onclick="window.print()">🖨️ طباعة التقرير</button>
    <button class="secondary" onclick="window.close()">✕ إغلاق</button>
    <span class="toolbar-title">تقرير عقار: ${propName}</span>
    <span style="font-size:12px;color:#64748b">التاريخ: ${todayGreg}</span>
  </div>

  <div class="page">
  <div class="content-body">

    <!-- ترويسة الشركة -->
    <div class="company-header">
      <div class="company-brand">
        <div class="company-logo">ر</div>
        <div class="company-text">
          <div class="name">رمز الإبداع</div>
          <div class="tagline">لإدارة الأملاك العقارية</div>
          <div class="sub">المملكة العربية السعودية</div>
        </div>
      </div>
      <div class="company-contact">
        <strong>رمز الإبداع لإدارة الأملاك</strong><br>
        📞 +966 5X XXX XXXX<br>
        📧 info@ramz-abda.com<br>
        🌐 www.ramz-abda.com<br>
        🏢 الرياض، المملكة العربية السعودية
      </div>
    </div>

    <!-- شريط عنوان التقرير -->
    <div class="report-title-bar">
      <div class="rtb-left">
        <div class="rtb-badge">تقرير رسمي</div>
        <h1>📋 تقرير العقار الشامل</h1>
        <p>${propName} — ${propCity}</p>
      </div>
      <div class="rtb-right">
        <div>📅 التاريخ الهجري: <strong>${todayHijri}</strong></div>
        <div>📅 التاريخ الميلادي: <strong>${todayGreg}</strong></div>
        <div>🔖 رقم التقرير: RPT-${Date.now().toString().slice(-6)}</div>
        <div>📊 حالة العقار: <strong style="color:#fcd34d">${propStatus}</strong></div>
      </div>
    </div>

    <!-- إحصاءات سريعة -->
    <div class="stats-grid">
      <div class="stat-card blue">
        <div class="stat-num">${totalUnits}</div>
        <div class="stat-label">إجمالي الوحدات</div>
      </div>
      <div class="stat-card green">
        <div class="stat-num">${rentedUnits}</div>
        <div class="stat-label">وحدات مؤجرة</div>
        <div class="stat-sub">${occupancyRate}% إشغال</div>
      </div>
      <div class="stat-card amber">
        <div class="stat-num">${vacantUnits}</div>
        <div class="stat-label">وحدات شاغرة</div>
      </div>
      <div class="stat-card red">
        <div class="stat-num">${pendingMaint}</div>
        <div class="stat-label">طلبات صيانة معلقة</div>
      </div>
    </div>

    <!-- مؤشر الإشغال -->
    <div class="occupancy-bar-wrap">
      <div class="occ-header">
        <span class="occ-title">🏠 معدل الإشغال</span>
        <span class="occ-pct">${occupancyRate}%</span>
      </div>
      <div class="bar-track">
        <div class="bar-fill" style="width:${occupancyRate}%"></div>
      </div>
      <div class="bar-labels">
        <span>${rentedUnits} وحدة مؤجرة</span>
        <span>${vacantUnits} شاغرة</span>
        <span>${maintenanceUnits} صيانة</span>
        <span>المجموع: ${totalUnits}</span>
      </div>
    </div>

    <!-- البيانات الأساسية -->
    <div class="section">
      <div class="section-header">
        <span class="icon">🏢</span>
        البيانات الأساسية للعقار
      </div>
      <div class="section-body">
        <div class="fields-grid">
          <div class="field">
            <div class="field-label">اسم العقار</div>
            <div class="field-value highlight">${propName}</div>
          </div>
          <div class="field">
            <div class="field-label">نوع العقار</div>
            <div class="field-value">${propType}</div>
          </div>
          <div class="field">
            <div class="field-label">حالة العقار</div>
            <div class="field-value">${propStatus}</div>
          </div>
          <div class="field">
            <div class="field-label">نوع المبنى</div>
            <div class="field-value">${property['نوع_المبنى'] || 'عمارة'}</div>
          </div>
          <div class="field">
            <div class="field-label">عدد الطوابق</div>
            <div class="field-value">${floors}</div>
          </div>
          <div class="field">
            <div class="field-label">سنة البناء</div>
            <div class="field-value">${property['سنة_البناء'] || '—'}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- بيانات الموقع -->
    <div class="section">
      <div class="section-header">
        <span class="icon">📍</span>
        بيانات الموقع والعنوان
      </div>
      <div class="section-body">
        <div class="fields-grid">
          <div class="field">
            <div class="field-label">المدينة</div>
            <div class="field-value">${propCity}</div>
          </div>
          <div class="field">
            <div class="field-label">الحي</div>
            <div class="field-value">${property['الحي'] || propAddress}</div>
          </div>
          <div class="field">
            <div class="field-label">المنطقة الإدارية</div>
            <div class="field-value">${property['المنطقة'] || 'منطقة الرياض'}</div>
          </div>
          <div class="field">
            <div class="field-label">الشارع</div>
            <div class="field-value">${property['الشارع'] || '—'}</div>
          </div>
          <div class="field">
            <div class="field-label">رقم المبنى</div>
            <div class="field-value">${property['رقم_المبنى'] || '—'}</div>
          </div>
          <div class="field">
            <div class="field-label">الرمز البريدي</div>
            <div class="field-value">${property['الرمز_البريدي'] || '—'}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- بيانات الملك والملكية -->
    <div class="section">
      <div class="section-header">
        <span class="icon">📜</span>
        بيانات الملك والملكية
      </div>
      <div class="section-body">
        <div class="fields-grid">
          <div class="field">
            <div class="field-label">رقم الصك</div>
            <div class="field-value gold">${property['رقم_الصك'] || '—'}</div>
          </div>
          <div class="field">
            <div class="field-label">نوع الوثيقة</div>
            <div class="field-value">${property['نوع_الوثيقة'] || '—'}</div>
          </div>
          <div class="field">
            <div class="field-label">تاريخ الإصدار</div>
            <div class="field-value">${property['تاريخ_الإصدار'] || '—'}</div>
          </div>
          <div class="field">
            <div class="field-label">رقم القطعة</div>
            <div class="field-value">${property['رقم_القطعة'] || '—'}</div>
          </div>
          <div class="field">
            <div class="field-label">رقم المخطط</div>
            <div class="field-value">${property['رقم_المخطط'] || '—'}</div>
          </div>
          <div class="field">
            <div class="field-label">مساحة المبنى</div>
            <div class="field-value">${property['المساحة'] || '—'}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- بيانات المالك -->
    <div class="section">
      <div class="section-header">
        <span class="icon">👤</span>
        بيانات مالك العقار
      </div>
      <div class="section-body">
        <div class="fields-grid">
          <div class="field">
            <div class="field-label">اسم المالك</div>
            <div class="field-value highlight">${ownerName}</div>
          </div>
          <div class="field">
            <div class="field-label">رقم الهوية / الإقامة</div>
            <div class="field-value">${property['هوية_المالك'] || '—'}</div>
          </div>
          <div class="field">
            <div class="field-label">رقم الجوال</div>
            <div class="field-value">${ownerPhone}</div>
          </div>
          <div class="field">
            <div class="field-label">البريد الإلكتروني</div>
            <div class="field-value">${property['بريد_المالك'] || '—'}</div>
          </div>
          <div class="field">
            <div class="field-label">رقم الحساب IBAN</div>
            <div class="field-value">${property['IBAN'] || '—'}</div>
          </div>
          <div class="field">
            <div class="field-label">نسبة رسوم الإدارة</div>
            <div class="field-value">${property['نسبة_الإدارة'] || '—'}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- بيانات المبنى والمرافق -->
    <div class="section">
      <div class="section-header">
        <span class="icon">🏗️</span>
        بيانات المبنى والمرافق
      </div>
      <div class="section-body">
        <div class="fields-grid">
          <div class="field">
            <div class="field-label">عدد الطوابق</div>
            <div class="field-value">${floors}</div>
          </div>
          <div class="field">
            <div class="field-label">عدد الوحدات الكلي</div>
            <div class="field-value">${totalUnits}</div>
          </div>
          <div class="field">
            <div class="field-label">عدد المواقف</div>
            <div class="field-value">${property['عدد_المواقف'] || '—'}</div>
          </div>
          <div class="field">
            <div class="field-label">مصعد</div>
            <div class="field-value">${property['مصعد'] || '—'}</div>
          </div>
          <div class="field">
            <div class="field-label">مولد كهربائي</div>
            <div class="field-value">${property['مولد'] || '—'}</div>
          </div>
          <div class="field">
            <div class="field-label">حارس أمني</div>
            <div class="field-value">${property['حراسة'] || '—'}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- الملخص المالي -->
    <div class="section">
      <div class="section-header">
        <span class="icon">💰</span>
        الملخص المالي (الشهر الحالي)
      </div>
      <div class="section-body">
        <div class="finance-grid">
          <div class="finance-card income">
            <div class="finance-num">${formatMoney(totalRevenue)}</div>
            <div class="finance-label">💚 إجمالي الإيرادات المحصَّلة</div>
          </div>
          <div class="finance-card expense">
            <div class="finance-num">${formatMoney(totalExpenses)}</div>
            <div class="finance-label">❌ إجمالي المصروفات</div>
          </div>
          <div class="finance-card net">
            <div class="finance-num">${formatMoney(netIncome)}</div>
            <div class="finance-label">📊 صافي الدخل</div>
          </div>
        </div>
        ${pendingRevenue > 0 ? `
        <div style="margin-top:12px;padding:10px 14px;background:#fffbeb;border:1.5px solid #fde68a;border-radius:8px;font-size:12px">
          ⚠️ <strong>إيرادات معلقة لم تُحصَّل بعد:</strong>
          <span style="color:#b45309;font-weight:700;font-size:14px;margin-right:8px">${formatMoney(pendingRevenue)}</span>
        </div>` : ''}
      </div>
    </div>

    <!-- قائمة الوحدات -->
    <div class="section page-break-inside-avoid">
      <div class="section-header">
        <span class="icon">🏘️</span>
        قائمة الوحدات العقارية (${totalUnits} وحدة)
      </div>
      <div class="section-body" style="padding:0">
        ${units.length === 0 ? `<div style="padding:20px;text-align:center;color:#64748b">لا توجد وحدات مسجلة</div>` : `
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>اسم الوحدة</th>
              <th>النوع</th>
              <th>المساحة</th>
              <th>الحالة</th>
              <th>المستأجر</th>
              <th>قيمة الإيجار</th>
              <th>انتهاء العقد</th>
            </tr>
          </thead>
          <tbody>${unitRows}</tbody>
        </table>`}
      </div>
    </div>

    <!-- طلبات الصيانة -->
    ${maintenance.length > 0 ? `
    <div class="section">
      <div class="section-header">
        <span class="icon">🔧</span>
        طلبات الصيانة (${maintenance.length} طلب — ${pendingMaint} معلق — ${completedMaint} منجز)
      </div>
      <div class="section-body" style="padding:0">
        <table>
          <thead>
            <tr>
              <th>الطلب</th>
              <th>الوحدة</th>
              <th>الحالة</th>
              <th>الأولوية</th>
              <th>التاريخ</th>
            </tr>
          </thead>
          <tbody>${maintRows}</tbody>
        </table>
      </div>
    </div>` : ''}

    <!-- الفاصل الذهبي -->
    <div class="gold-divider"></div>

    <!-- التوقيعات -->
    <div class="signature-section">
      <div class="sig-box">
        <div class="sig-label">توقيع مدير العقار</div>
        <div class="sig-line">الاسم والتوقيع</div>
      </div>
      <div class="sig-box">
        <div class="sig-label">اعتماد المالك</div>
        <div class="sig-line">الاسم والتوقيع</div>
      </div>
      <div class="sig-box">
        <div class="sig-label">الختم الرسمي</div>
        <div class="sig-line">ختم الشركة</div>
      </div>
    </div>

  </div><!-- /content-body -->
  </div><!-- /page -->

  <!-- تذييل الصفحة -->
  <div class="page-footer">
    <div class="footer-brand">رمز <span>الإبداع</span> لإدارة الأملاك العقارية</div>
    <div>تقرير سري — للمالك فقط</div>
    <div>صدر بتاريخ: ${todayGreg}</div>
  </div>

</body>
</html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// المكوّن الرئيسي
// ─────────────────────────────────────────────────────────────────────────────
export default function PropertyReportPrint() {
  const [, navigate] = useLocation();
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');

  const { data, loading } = useMultiEntityData([
    { name: 'Property' },
    { name: 'Unit', limit: 500 },
    { name: 'Lease', limit: 500 },
    { name: 'Payment', limit: 500 },
    { name: 'Expense', limit: 500 },
    { name: 'Maintenance', limit: 200 },
  ]);

  const properties = data.Property || [];
  const allUnits = data.Unit || [];
  const allLeases = data.Lease || [];
  const allPayments = data.Payment || [];
  const allExpenses = data.Expense || [];
  const allMaintenance = data.Maintenance || [];

  const selectedProperty = properties.find(p => p.id === selectedPropertyId) || properties[0] || null;

  const propUnits = allUnits.filter(u =>
    u['معرف_العقار'] === selectedProperty?.id ||
    u['اسم_العقار'] === selectedProperty?.['اسم_العقار']
  );
  const propLeases = allLeases.filter(l =>
    l['اسم_العقار'] === selectedProperty?.['اسم_العقار'] ||
    l['معرف_العقار'] === selectedProperty?.id
  );
  const propPayments = allPayments.filter(p =>
    p['اسم_العقار'] === selectedProperty?.['اسم_العقار']
  );
  const propExpenses = allExpenses.filter(e =>
    e.property_name === selectedProperty?.['اسم_العقار']
  );
  const propMaintenance = allMaintenance.filter(m =>
    m['اسم_العقار'] === selectedProperty?.['اسم_العقار']
  );

  // إحصاءات للعرض
  const totalUnits = propUnits.length;
  const rentedUnits = propUnits.filter(u => u['حالة_الوحدة'] === 'مؤجرة').length;
  const occupancyRate = totalUnits > 0 ? Math.round((rentedUnits / totalUnits) * 100) : 0;
  const totalRevenue = propPayments
    .filter(p => p['حالة_القسط'] === 'مدفوع')
    .reduce((s, p) => s + (Number(p['مبلغ_الدفعة']) || 0), 0);
  const totalExpenses = propExpenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);

  const handlePrint = () => {
    if (!selectedProperty) return;
    const html = generatePrintHTML(
      selectedProperty, propUnits, propLeases, propPayments, propExpenses, propMaintenance
    );
    const win = window.open('', '_blank', 'width=1000,height=800');
    if (win) {
      win.document.write(html);
      win.document.close();
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 max-w-5xl mx-auto">

        {/* رأس الصفحة */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/properties')}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <FileText className="w-6 h-6 text-primary" />
                تقرير العقار الاحترافي
              </h1>
              <p className="text-muted-foreground text-sm mt-0.5">نموذج مقدَّم لمالك العقار — جاهز للطباعة</p>
            </div>
          </div>
          <Button className="gap-2 text-base px-6 py-5" onClick={handlePrint} disabled={!selectedProperty}>
            <Printer className="w-5 h-5" />
            طباعة التقرير
          </Button>
        </div>

        {/* اختيار العقار */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-4 flex-wrap">
              <Building2 className="w-5 h-5 text-primary shrink-0" />
              <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-medium block mb-1.5">اختر العقار</label>
                <select
                  value={selectedPropertyId || selectedProperty?.id || ''}
                  onChange={e => setSelectedPropertyId(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 bg-background text-sm"
                >
                  {properties.map(p => (
                    <option key={p.id} value={p.id}>
                      {p['اسم_العقار'] || p.name} — {p['المدينة'] || p.city}
                    </option>
                  ))}
                </select>
              </div>
              {selectedProperty && (
                <div className="flex gap-3 flex-wrap">
                  <Badge variant="outline" className="gap-1">
                    <Building2 className="w-3 h-3" />
                    {selectedProperty['نوع_العقار'] || '—'}
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <MapPin className="w-3 h-3" />
                    {selectedProperty['المدينة'] || '—'}
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* معاينة الإحصاءات */}
        {selectedProperty && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-blue-700">{totalUnits}</div>
                  <div className="text-xs text-blue-600 mt-1 font-medium">إجمالي الوحدات</div>
                </CardContent>
              </Card>
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-green-700">{occupancyRate}%</div>
                  <div className="text-xs text-green-600 mt-1 font-medium">معدل الإشغال</div>
                </CardContent>
              </Card>
              <Card className="bg-yellow-50 border-yellow-200">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-700">{totalRevenue.toLocaleString()}</div>
                  <div className="text-xs text-yellow-600 mt-1 font-medium">إيرادات محصَّلة (ر.س)</div>
                </CardContent>
              </Card>
              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-purple-700">{propMaintenance.length}</div>
                  <div className="text-xs text-purple-600 mt-1 font-medium">طلبات صيانة</div>
                </CardContent>
              </Card>
            </div>

            {/* محتويات التقرير */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  محتويات التقرير
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { icon: Building2, label: 'البيانات الأساسية', color: 'text-blue-600' },
                    { icon: MapPin, label: 'بيانات الموقع', color: 'text-green-600' },
                    { icon: FileText, label: 'بيانات الملك والملكية', color: 'text-purple-600' },
                    { icon: Users, label: 'بيانات المالك', color: 'text-orange-600' },
                    { icon: Home, label: 'بيانات المبنى والمرافق', color: 'text-teal-600' },
                    { icon: BarChart3, label: 'الملخص المالي', color: 'text-emerald-600' },
                    { icon: Calendar, label: 'قائمة الوحدات والعقود', color: 'text-indigo-600' },
                    { icon: Wrench, label: 'طلبات الصيانة', color: 'text-amber-600' },
                    { icon: CheckCircle, label: 'التوقيعات والاعتماد', color: 'text-slate-600' },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                      <item.icon className={`w-4 h-4 ${item.color} shrink-0`} />
                      <span className="text-xs font-medium">{item.label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* زر الطباعة الكبير */}
            <div className="flex justify-center pt-2">
              <Button size="lg" className="gap-3 text-lg px-10 py-6" onClick={handlePrint}>
                <Printer className="w-6 h-6" />
                طباعة / تحميل تقرير العقار
              </Button>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
