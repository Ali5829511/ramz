-- ================================================
-- SQL Schema كامل لمنصة رمز الإبداع - إدارة الأملاك
-- انسخ هذا الكود في: Supabase > SQL Editor > Run
-- ================================================

-- تفعيل UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- حذف الجداول القديمة (للتحديث النظيف)
-- ================================================
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS complaints CASCADE;
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS maintenance_requests CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS leases CASCADE;
DROP TABLE IF EXISTS tenants CASCADE;
DROP TABLE IF EXISTS units CASCADE;
DROP TABLE IF EXISTS properties CASCADE;
DROP TABLE IF EXISTS owners CASCADE;

-- ================================================
-- 1. جدول الملاك
-- ================================================
CREATE TABLE owners (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_date TIMESTAMPTZ DEFAULT NOW(),
  "الاسم" TEXT NOT NULL,
  "رقم_الهوية" TEXT,
  "رقم_الجوال" TEXT,
  "البريد_الإلكتروني" TEXT,
  "عدد_العقارات" INTEGER DEFAULT 0,
  "رقم_الحساب_البنكي" TEXT,
  "اسم_البنك" TEXT,
  "ملاحظات" TEXT
);

-- ================================================
-- 2. جدول العقارات
-- ================================================
CREATE TABLE properties (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_date TIMESTAMPTZ DEFAULT NOW(),
  "اسم_العقار" TEXT NOT NULL,
  "نوع_العقار" TEXT,
  "المدينة" TEXT,
  "العنوان" TEXT,
  "رقم_الصك" TEXT,
  "مساحة_الأرض" NUMERIC,
  "عدد_الطوابق" INTEGER,
  "عدد_الوحدات" INTEGER DEFAULT 0,
  "عقار_مميز" BOOLEAN DEFAULT FALSE,
  "الحالة" TEXT DEFAULT 'نشط'
);

-- ================================================
-- 3. جدول الوحدات
-- ================================================
CREATE TABLE units (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_date TIMESTAMPTZ DEFAULT NOW(),
  "اسم_الوحدة" TEXT NOT NULL,
  "رقم_الوحدة" TEXT,
  "اسم_العقار" TEXT,
  "نوع_الوحدة" TEXT DEFAULT 'شقة',
  "حالة_الوحدة" TEXT DEFAULT 'شاغرة',
  "المساحة" NUMERIC,
  "عدد_الغرف" INTEGER,
  "الطابق" INTEGER,
  "قيمة_الإيجار_المتوقعة" NUMERIC,
  "ملاحظات" TEXT
);

-- ================================================
-- 4. جدول المستأجرين
-- ================================================
CREATE TABLE tenants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_date TIMESTAMPTZ DEFAULT NOW(),
  "الاسم_الكامل" TEXT NOT NULL,
  "رقم_الهوية" TEXT,
  "رقم_الجوال" TEXT,
  "البريد_الإلكتروني" TEXT,
  "الجنسية" TEXT DEFAULT 'سعودي',
  "حالة_المستأجر" TEXT DEFAULT 'نشط',
  "العقار" TEXT,
  "الوحدة" TEXT,
  "تاريخ_الميلاد" DATE,
  "ملاحظات" TEXT
);

-- ================================================
-- 5. جدول العقود
-- ================================================
CREATE TABLE leases (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_date TIMESTAMPTZ DEFAULT NOW(),
  "رقم_العقد" TEXT UNIQUE,
  "اسم_المستأجر" TEXT,
  "اسم_العقار" TEXT,
  "اسم_الوحدة" TEXT,
  "تاريخ_بداية_العقد" DATE,
  "تاريخ_نهاية_العقد" DATE,
  "حالة_العقد" TEXT DEFAULT 'نشط',
  "قيمة_الإيجار" NUMERIC,
  "دورية_الدفع" TEXT DEFAULT 'شهري',
  "مبلغ_التأمين" NUMERIC DEFAULT 0,
  "ملاحظات" TEXT
);

-- ================================================
-- 6. جدول الدفعات
-- ================================================
CREATE TABLE payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_date TIMESTAMPTZ DEFAULT NOW(),
  "رقم_الإيصال" TEXT,
  "اسم_المستأجر" TEXT,
  "اسم_العقار" TEXT,
  "اسم_الوحدة" TEXT,
  "رقم_العقد" TEXT,
  "مبلغ_الدفعة" NUMERIC NOT NULL,
  "تاريخ_الدفع" DATE,
  "تاريخ_استحقاق_القسط" DATE,
  "حالة_القسط" TEXT DEFAULT 'مدفوع',
  "طريقة_الدفع" TEXT,
  "ملاحظات" TEXT
);

-- ================================================
-- 7. جدول طلبات الصيانة
-- ================================================
CREATE TABLE maintenance_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_date TIMESTAMPTZ DEFAULT NOW(),
  "عنوان_الطلب" TEXT NOT NULL,
  "وصف_المشكلة" TEXT,
  "اسم_العقار" TEXT,
  "اسم_الوحدة" TEXT,
  "اسم_المستأجر" TEXT,
  status TEXT DEFAULT 'pending',
  priority TEXT DEFAULT 'medium',
  "اسم_الفني" TEXT,
  "تكلفة_الصيانة" NUMERIC DEFAULT 0,
  "تاريخ_الإنجاز" DATE,
  "ملاحظات" TEXT
);

-- ================================================
-- 8. جدول المصروفات
-- ================================================
CREATE TABLE expenses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_date TIMESTAMPTZ DEFAULT NOW(),
  description TEXT NOT NULL,
  category TEXT,
  amount NUMERIC NOT NULL,
  date DATE,
  property_name TEXT,
  status TEXT DEFAULT 'paid',
  "طريقة_الدفع" TEXT,
  "المورد" TEXT,
  notes TEXT
);

-- ================================================
-- 9. جدول الشكاوى
-- ================================================
CREATE TABLE complaints (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_date TIMESTAMPTZ DEFAULT NOW(),
  "عنوان_الشكوى" TEXT NOT NULL,
  "تفاصيل_الشكوى" TEXT,
  "اسم_المستأجر" TEXT,
  "اسم_العقار" TEXT,
  "اسم_الوحدة" TEXT,
  status TEXT DEFAULT 'جديدة',
  priority TEXT DEFAULT 'medium',
  "الرد" TEXT,
  "تاريخ_الحل" DATE
);

-- ================================================
-- 10. جدول الفواتير
-- ================================================
CREATE TABLE invoices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_date TIMESTAMPTZ DEFAULT NOW(),
  "رقم_الفاتورة" TEXT UNIQUE,
  "اسم_العميل" TEXT,
  "اسم_العقار" TEXT,
  "المبلغ" NUMERIC,
  "تاريخ_الفاتورة" DATE,
  "تاريخ_الاستحقاق" DATE,
  "حالة_الفاتورة" TEXT DEFAULT 'غير_مدفوعة',
  "تفاصيل" TEXT
);

-- ================================================
-- 11. جدول المستندات
-- ================================================
CREATE TABLE documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_date TIMESTAMPTZ DEFAULT NOW(),
  "اسم_المستند" TEXT NOT NULL,
  "نوع_المستند" TEXT,
  "اسم_العقار" TEXT,
  "اسم_المستأجر" TEXT,
  "رابط_الملف" TEXT,
  "تاريخ_الانتهاء" DATE,
  "ملاحظات" TEXT
);

-- ================================================
-- Row Level Security
-- ================================================
ALTER TABLE owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE leases ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- سياسات مفتوحة (للتطوير)
CREATE POLICY "allow_all_owners" ON owners FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_properties" ON properties FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_units" ON units FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_tenants" ON tenants FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_leases" ON leases FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_payments" ON payments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_maintenance" ON maintenance_requests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_expenses" ON expenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_complaints" ON complaints FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_invoices" ON invoices FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_documents" ON documents FOR ALL USING (true) WITH CHECK (true);

-- ================================================
-- بيانات حقيقية - Seed Data
-- ================================================

-- الملاك
INSERT INTO owners ("الاسم", "رقم_الهوية", "رقم_الجوال", "البريد_الإلكتروني", "عدد_العقارات", "اسم_البنك", "رقم_الحساب_البنكي") VALUES
('عبدالله بن سعد الراشد', '1012345678', '0501234567', 'arasid@email.com', 3, 'البنك الأهلي', 'SA0380000000608010167519'),
('محمد بن فهد العمري', '1023456789', '0509876543', 'mfomari@email.com', 2, 'بنك الراجحي', 'SA8480000472608016038800'),
('سعد بن خالد المنصور', '1034567890', '0505678901', 'skmansour@email.com', 1, 'بنك الإنماء', 'SA4405000068201333560002');

-- العقارات
INSERT INTO properties ("اسم_العقار", "نوع_العقار", "المدينة", "العنوان", "رقم_الصك", "عدد_الطوابق", "عدد_الوحدات", "عقار_مميز", "الحالة") VALUES
('برج الرياض السكني', 'سكني', 'الرياض', 'حي النخيل - طريق الملك عبدالله', '1234567890', 10, 40, true, 'نشط'),
('مجمع الأندلس التجاري', 'تجاري', 'جدة', 'حي الروضة - شارع التحلية', '0987654321', 3, 12, false, 'نشط'),
('فيلا الواحة', 'سكني', 'الرياض', 'حي الملقا - شارع 15', '1122334455', 3, 1, false, 'نشط'),
('عمارة النور', 'سكني', 'الدمام', 'حي الفيصلية - شارع الأمير محمد', '5544332211', 5, 20, false, 'نشط'),
('مكاتب الإبداع', 'تجاري', 'الرياض', 'طريق الملك فهد - برج المملكة', '9988776655', 2, 8, true, 'نشط'),
('شقق الربيع', 'سكني', 'الرياض', 'حي الربيع - شارع الربيع', '6677889900', 6, 24, false, 'نشط');

-- الوحدات
INSERT INTO units ("اسم_الوحدة", "رقم_الوحدة", "اسم_العقار", "نوع_الوحدة", "حالة_الوحدة", "المساحة", "عدد_الغرف", "الطابق", "قيمة_الإيجار_المتوقعة") VALUES
('شقة 101', '101', 'برج الرياض السكني', 'شقة', 'مؤجرة', 120, 3, 1, 36000),
('شقة 102', '102', 'برج الرياض السكني', 'شقة', 'مؤجرة', 100, 2, 1, 30000),
('شقة 103', '103', 'برج الرياض السكني', 'شقة', 'شاغرة', 100, 2, 1, 30000),
('شقة 201', '201', 'برج الرياض السكني', 'شقة', 'مؤجرة', 150, 4, 2, 45000),
('شقة 202', '202', 'برج الرياض السكني', 'شقة', 'صيانة', 120, 3, 2, 36000),
('محل A1', 'A1', 'مجمع الأندلس التجاري', 'محل تجاري', 'مؤجرة', 80, 0, 0, 80000),
('محل A2', 'A2', 'مجمع الأندلس التجاري', 'محل تجاري', 'مؤجرة', 80, 0, 0, 75000),
('محل A3', 'A3', 'مجمع الأندلس التجاري', 'محل تجاري', 'شاغرة', 60, 0, 0, 60000),
('الفيلا الرئيسية', '1', 'فيلا الواحة', 'فيلا', 'مؤجرة', 500, 6, 0, 120000),
('شقة N1', '1', 'عمارة النور', 'شقة', 'مؤجرة', 90, 2, 1, 24000),
('شقة N2', '2', 'عمارة النور', 'شقة', 'شاغرة', 90, 2, 1, 24000),
('مكتب B1', 'B1', 'مكاتب الإبداع', 'مكتب', 'مؤجرة', 200, 0, 1, 60000),
('مكتب B2', 'B2', 'مكاتب الإبداع', 'مكتب', 'مؤجرة', 180, 0, 1, 55000),
('شقة 301', '301', 'شقق الربيع', 'شقة', 'مؤجرة', 110, 3, 3, 28000),
('شقة 302', '302', 'شقق الربيع', 'شقة', 'شاغرة', 110, 3, 3, 28000);

-- المستأجرون
INSERT INTO tenants ("الاسم_الكامل", "رقم_الهوية", "رقم_الجوال", "البريد_الإلكتروني", "الجنسية", "حالة_المستأجر", "العقار", "الوحدة") VALUES
('أحمد محمد العتيبي', '1098765432', '0551234567', 'a.otaibi@email.com', 'سعودي', 'نشط', 'برج الرياض السكني', 'شقة 101'),
('فهد عبدالله الشمري', '1087654321', '0559876543', 'f.shamri@email.com', 'سعودي', 'نشط', 'برج الرياض السكني', 'شقة 102'),
('خالد سعد القحطاني', '1076543210', '0554567890', 'k.qahtani@email.com', 'سعودي', 'نشط', 'مجمع الأندلس التجاري', 'محل A1'),
('عبدالرحمن يوسف الحربي', '1065432109', '0553456789', 'a.harbi@email.com', 'سعودي', 'نشط', 'فيلا الواحة', 'الفيلا الرئيسية'),
('سلطان ناصر الدوسري', '1054321098', '0552345678', 's.dosari@email.com', 'سعودي', 'غير نشط', 'عمارة النور', 'شقة N1'),
('محمد علي الغامدي', '1043210987', '0557654321', 'm.ghamdi@email.com', 'سعودي', 'نشط', 'مكاتب الإبداع', 'مكتب B1'),
('عمر حسن الزهراني', '1032109876', '0558765432', 'o.zahrani@email.com', 'سعودي', 'نشط', 'شقق الربيع', 'شقة 301'),
('تركي سعود المطيري', '1021098765', '0556543210', 't.mutairi@email.com', 'سعودي', 'نشط', 'برج الرياض السكني', 'شقة 201');

-- العقود
INSERT INTO leases ("رقم_العقد", "اسم_المستأجر", "اسم_العقار", "اسم_الوحدة", "تاريخ_بداية_العقد", "تاريخ_نهاية_العقد", "حالة_العقد", "قيمة_الإيجار", "دورية_الدفع", "مبلغ_التأمين") VALUES
('C-2024-001', 'أحمد محمد العتيبي', 'برج الرياض السكني', 'شقة 101', '2024-01-01', '2025-12-31', 'نشط', 36000, 'شهري', 3000),
('C-2024-002', 'فهد عبدالله الشمري', 'برج الرياض السكني', 'شقة 102', '2024-03-01', '2025-02-28', 'نشط', 30000, 'شهري', 2500),
('C-2024-003', 'خالد سعد القحطاني', 'مجمع الأندلس التجاري', 'محل A1', '2024-06-01', '2026-05-31', 'نشط', 80000, 'ربع سنوي', 10000),
('C-2024-004', 'عبدالرحمن يوسف الحربي', 'فيلا الواحة', 'الفيلا الرئيسية', '2024-01-15', '2026-06-15', 'نشط', 120000, 'سنوي', 15000),
('C-2023-010', 'سلطان ناصر الدوسري', 'عمارة النور', 'شقة N1', '2023-06-01', '2024-05-31', 'منتهي', 24000, 'شهري', 2000),
('C-2024-005', 'محمد علي الغامدي', 'مكاتب الإبداع', 'مكتب B1', '2024-09-01', '2026-08-31', 'نشط', 60000, 'ربع سنوي', 8000),
('C-2025-001', 'عمر حسن الزهراني', 'شقق الربيع', 'شقة 301', '2025-01-01', '2026-06-30', 'نشط', 28000, 'شهري', 2333),
('C-2025-002', 'تركي سعود المطيري', 'برج الرياض السكني', 'شقة 201', '2025-02-01', '2026-01-31', 'نشط', 45000, 'شهري', 3750);

-- الدفعات
INSERT INTO payments ("رقم_الإيصال", "اسم_المستأجر", "اسم_العقار", "اسم_الوحدة", "رقم_العقد", "مبلغ_الدفعة", "تاريخ_الدفع", "تاريخ_استحقاق_القسط", "حالة_القسط", "طريقة_الدفع") VALUES
('RCP-2026-001', 'أحمد محمد العتيبي', 'برج الرياض السكني', 'شقة 101', 'C-2024-001', 3000, '2026-04-05', '2026-04-01', 'مدفوع', 'تحويل بنكي'),
('RCP-2026-002', 'فهد عبدالله الشمري', 'برج الرياض السكني', 'شقة 102', 'C-2024-002', 2500, '2026-04-03', '2026-04-01', 'مدفوع', 'نقدي'),
('RCP-2026-003', 'خالد سعد القحطاني', 'مجمع الأندلس التجاري', 'محل A1', 'C-2024-003', 20000, '2026-04-01', '2026-04-01', 'مدفوع', 'تحويل بنكي'),
(NULL, 'عبدالرحمن يوسف الحربي', 'فيلا الواحة', 'الفيلا الرئيسية', 'C-2024-004', 10000, NULL, '2026-04-15', 'مستحق', NULL),
('RCP-2026-004', 'محمد علي الغامدي', 'مكاتب الإبداع', 'مكتب B1', 'C-2024-005', 15000, '2026-04-10', '2026-04-01', 'مدفوع', 'شيك'),
(NULL, 'عمر حسن الزهراني', 'شقق الربيع', 'شقة 301', 'C-2025-001', 2333, NULL, '2026-03-01', 'متأخر', NULL),
('RCP-2026-005', 'تركي سعود المطيري', 'برج الرياض السكني', 'شقة 201', 'C-2025-002', 3750, '2026-04-07', '2026-04-01', 'مدفوع', 'تحويل بنكي'),
('RCP-2026-006', 'أحمد محمد العتيبي', 'برج الرياض السكني', 'شقة 101', 'C-2024-001', 3000, '2026-03-05', '2026-03-01', 'مدفوع', 'تحويل بنكي'),
('RCP-2026-007', 'فهد عبدالله الشمري', 'برج الرياض السكني', 'شقة 102', 'C-2024-002', 2500, '2026-03-04', '2026-03-01', 'مدفوع', 'نقدي');

-- طلبات الصيانة
INSERT INTO maintenance_requests ("عنوان_الطلب", "وصف_المشكلة", "اسم_العقار", "اسم_الوحدة", "اسم_المستأجر", status, priority, "اسم_الفني", "تكلفة_الصيانة") VALUES
('تسريب مياه في الحمام', 'تسريب من أنبوب المياه الساخنة تحت المغسلة', 'برج الرياض السكني', 'شقة 101', 'أحمد محمد العتيبي', 'pending', 'high', NULL, 0),
('عطل في التكييف', 'التكييف لا يبرد بشكل كافٍ', 'مجمع الأندلس التجاري', 'محل A1', 'خالد سعد القحطاني', 'in_progress', 'medium', 'محمد السالم', 800),
('صيانة المصعد الدورية', 'فحص وصيانة دورية للمصعد الرئيسي', 'برج الرياض السكني', 'عام', NULL, 'completed', 'high', 'شركة أوتيس', 5000),
('إصلاح باب المدخل', 'قفل الباب الرئيسي لا يعمل', 'عمارة النور', 'شقة N1', 'سلطان ناصر الدوسري', 'pending', 'low', NULL, 0),
('تغيير إضاءة الممرات', 'تغيير لمبات الممرات إلى LED', 'مكاتب الإبداع', 'عام', NULL, 'completed', 'low', 'أحمد الكهربائي', 1200),
('صيانة خزان المياه', 'تنظيف وفحص خزان المياه العلوي', 'شقق الربيع', 'عام', NULL, 'in_progress', 'medium', 'خالد السباك', 600);

-- المصروفات
INSERT INTO expenses (description, category, amount, date, property_name, status, "طريقة_الدفع", "المورد") VALUES
('صيانة المصعد الدورية', 'صيانة', 5000, '2026-04-10', 'برج الرياض السكني', 'paid', 'تحويل بنكي', 'شركة أوتيس للمصاعد'),
('فاتورة كهرباء - أبريل', 'مرافق', 2500, '2026-04-15', 'مجمع الأندلس التجاري', 'paid', 'تحويل بنكي', 'شركة الكهرباء السعودية'),
('خدمات تنظيف شهرية', 'نظافة', 1500, '2026-04-01', 'برج الرياض السكني', 'paid', 'نقدي', 'شركة النظافة الذهبية'),
('إصلاح سباكة طارئة', 'صيانة', 800, '2026-03-20', 'فيلا الواحة', 'paid', 'نقدي', 'أبو محمد للسباكة'),
('حراسة أمنية - أبريل', 'أمن', 4000, '2026-04-01', 'مكاتب الإبداع', 'paid', 'تحويل بنكي', 'شركة الحراسة الأمينة'),
('تأمين المبنى السنوي', 'تأمين', 12000, '2026-01-01', 'برج الرياض السكني', 'paid', 'شيك', 'شركة التعاونية للتأمين'),
('صيانة مضخة المياه', 'صيانة', 1800, '2026-03-15', 'عمارة النور', 'paid', 'نقدي', 'محمد للميكانيكا'),
('فاتورة مياه - أبريل', 'مرافق', 750, '2026-04-15', 'شقق الربيع', 'paid', 'تحويل بنكي', 'شركة المياه الوطنية');

-- الشكاوى
INSERT INTO complaints ("عنوان_الشكوى", "تفاصيل_الشكوى", "اسم_المستأجر", "اسم_العقار", "اسم_الوحدة", status, priority) VALUES
('ضوضاء من الجيران', 'يوجد ضوضاء مزعجة من الشقة المجاورة حتى منتصف الليل', 'أحمد محمد العتيبي', 'برج الرياض السكني', 'شقة 101', 'جديدة', 'medium'),
('مشكلة في مواقف السيارات', 'شخص خارجي يستخدم موقفي بشكل متكرر', 'فهد عبدالله الشمري', 'برج الرياض السكني', 'شقة 102', 'قيد_المعالجة', 'medium'),
('تأخر في إصلاح التكييف', 'مضى أسبوعان ولم يتم الإصلاح', 'خالد سعد القحطاني', 'مجمع الأندلس التجاري', 'محل A1', 'محلولة', 'high'),
('ضعف ضغط المياه', 'ضغط المياه ضعيف جداً في الصباح', 'عمر حسن الزهراني', 'شقق الربيع', 'شقة 301', 'جديدة', 'low');

-- فهارس لتسريع الاستعلامات
CREATE INDEX IF NOT EXISTS idx_units_property ON units ("اسم_العقار");
CREATE INDEX IF NOT EXISTS idx_leases_tenant ON leases ("اسم_المستأجر");
CREATE INDEX IF NOT EXISTS idx_leases_status ON leases ("حالة_العقد");
CREATE INDEX IF NOT EXISTS idx_payments_tenant ON payments ("اسم_المستأجر");
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments ("حالة_القسط");
CREATE INDEX IF NOT EXISTS idx_maintenance_status ON maintenance_requests (status);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints (status);


-- Production hardening: indexes + uniqueness guards
-- Run in Supabase SQL Editor after schema creation.

-- Prevent duplicate properties by name
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'properties_unique_name'
  ) THEN
    ALTER TABLE properties
      ADD CONSTRAINT properties_unique_name UNIQUE ("اسم_العقار");
  END IF;
END $$;

-- Prevent duplicate unit number under same property
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'units_unique_property_unit'
  ) THEN
    ALTER TABLE units
      ADD CONSTRAINT units_unique_property_unit UNIQUE ("اسم_العقار", "رقم_الوحدة");
  END IF;
END $$;

-- Common query indexes
CREATE INDEX IF NOT EXISTS idx_properties_name ON properties ("اسم_العقار");
CREATE INDEX IF NOT EXISTS idx_units_property_name ON units ("اسم_العقار");
CREATE INDEX IF NOT EXISTS idx_leases_contract_no ON leases ("رقم_العقد");
CREATE INDEX IF NOT EXISTS idx_leases_tenant_name ON leases ("اسم_المستأجر");
CREATE INDEX IF NOT EXISTS idx_payments_contract_no ON payments ("رقم_العقد");
CREATE INDEX IF NOT EXISTS idx_payments_payment_date ON payments ("تاريخ_الدفع");
CREATE INDEX IF NOT EXISTS idx_payments_due_date ON payments ("تاريخ_استحقاق_القسط");

-- Keep created_date present for sorting
CREATE INDEX IF NOT EXISTS idx_properties_created_date ON properties (created_date DESC);
CREATE INDEX IF NOT EXISTS idx_units_created_date ON units (created_date DESC);
CREATE INDEX IF NOT EXISTS idx_leases_created_date ON leases (created_date DESC);
CREATE INDEX IF NOT EXISTS idx_payments_created_date ON payments (created_date DESC);

