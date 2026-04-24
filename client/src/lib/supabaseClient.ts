/*
 * Supabase Client - رمز الإبداع
 *
 * للحصول على المفاتيح الصحيحة:
 *  1. افتح https://supabase.com/dashboard/project/ndfuwaebrubtcbtqfzbj/settings/api
 *  2. انسخ "Project URL"  →  VITE_SUPABASE_URL
 *  3. انسخ "anon public"  →  VITE_SUPABASE_ANON_KEY
 *
 * المشروع الحالي: ndfuwaebrubtcbtqfzbj
 * URL: https://ndfuwaebrubtcbtqfzbj.supabase.co
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// مفتاح Supabase v3 يبدأ بـ sb_publishable_ أو eyJ (v2)
const isValidKey = supabaseAnonKey?.startsWith('eyJ') || supabaseAnonKey?.startsWith('sb_publishable_') || supabaseAnonKey?.startsWith('sb_secret_');

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[Supabase] ⚠️ متغيرات البيئة غير موجودة.');
} else if (!isValidKey) {
  console.warn('[Supabase] ⚠️ تحقق من المفتاح في ملف .env');
}

export const supabase = (supabaseUrl && supabaseAnonKey && isValidKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const SUPABASE_CONNECTED = !!supabase;

// خريطة أسماء الكيانات إلى أسماء جداول Supabase
export const TABLE_MAP: Record<string, string> = {
  Property: 'properties',
  Unit: 'units',
  Tenant: 'tenants',
  Lease: 'leases',
  Payment: 'payments',
  Maintenance: 'maintenance_requests',
  Expense: 'expenses',
  Owner: 'owners',
  Complaint: 'complaints',
  Invoice: 'invoices',
  Document: 'documents',
};
