/*
 * Hook لجلب البيانات من Supabase مع fallback للبيانات التجريبية
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase, TABLE_MAP } from '@/lib/supabaseClient';
import {
  DEMO_PROPERTIES, DEMO_UNITS, DEMO_TENANTS, DEMO_LEASES,
  DEMO_PAYMENTS, DEMO_MAINTENANCE, DEMO_EXPENSES, DEMO_OWNERS,
  DEMO_COMPLAINTS
} from '@/lib/demoData';

const DEMO_MAP: Record<string, any[]> = {
  Property: DEMO_PROPERTIES,
  Unit: DEMO_UNITS,
  Tenant: DEMO_TENANTS,
  Lease: DEMO_LEASES,
  Payment: DEMO_PAYMENTS,
  Maintenance: DEMO_MAINTENANCE,
  Expense: DEMO_EXPENSES,
  Owner: DEMO_OWNERS,
  Complaint: DEMO_COMPLAINTS,
  Invoice: [],
  Document: [],
};

// وضع البيانات التجريبية الإجباري - يُفعَّل تلقائياً عند غياب Supabase
const FORCE_DEMO_MODE = !supabase;

export function useEntityData(entityName: string, sort = '-created_date', limit = 1000) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    // استخدام البيانات التجريبية مباشرة عند غياب Supabase
    if (FORCE_DEMO_MODE) {
      setData(DEMO_MAP[entityName] || []);
      setIsDemo(true);
      setLoading(false);
      return;
    }
    try {
      const tableName = TABLE_MAP[entityName];
      if (tableName && supabase) {
        const sortColumn = sort.startsWith('-') ? sort.slice(1) : sort;
        const ascending = !sort.startsWith('-');
        const { data: result, error } = await supabase
          .from(tableName)
          .select('*')
          .order(sortColumn, { ascending })
          .limit(limit);
        if (!error) {
          setData(result || []);
          setIsDemo(false);
          setLoading(false);
          return;
        }
        console.warn(`[${entityName}] Supabase error: ${error.message}`);
      }
    } catch (e) {
      console.warn(`[${entityName}] Supabase failed, using demo data`);
    }
    setData(DEMO_MAP[entityName] || []);
    setIsDemo(true);
    setLoading(false);
  }, [entityName, sort, limit]);

  useEffect(() => { loadData(); }, [loadData]);

  return { data, loading, isDemo, reload: loadData, setData };
}

export function useMultiEntityData(entities: { name: string; sort?: string; limit?: number }[]) {
  const [data, setData] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    const result: Record<string, any[]> = {};

    // استخدام البيانات التجريبية مباشرة عند غياب Supabase
    if (FORCE_DEMO_MODE) {
      entities.forEach(({ name }) => {
        result[name] = DEMO_MAP[name] || [];
      });
      setData(result);
      setIsDemo(true);
      setLoading(false);
      return;
    }

    let usedDemo = false;

    await Promise.all(entities.map(async ({ name, sort = '-created_date', limit = 1000 }) => {
      try {
        const tableName = TABLE_MAP[name];
        if (tableName && supabase) {
          const sortColumn = sort.startsWith('-') ? sort.slice(1) : sort;
          const ascending = !sort.startsWith('-');
          const { data: res, error } = await supabase
            .from(tableName)
            .select('*')
            .order(sortColumn, { ascending })
            .limit(limit);
          if (!error) {
            result[name] = res || [];
            return;
          }
          console.warn(`[${name}] Supabase error: ${error.message}`);
        }
      } catch (e) {
        console.warn(`[${name}] Supabase failed, using demo data`);
      }
      result[name] = DEMO_MAP[name] || [];
      usedDemo = true;
    }));

    setData(result);
    setIsDemo(usedDemo);
    setLoading(false);
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  return { data, loading, isDemo, reload: loadAll };
}

// ================================================
// Hook لعمليات CRUD الكاملة على جدول واحد
// ================================================
export function useSupabaseCrud(entityName: string) {
  const tableName = TABLE_MAP[entityName];

  const insert = async (record: Record<string, any>): Promise<{ data: any; error: string | null }> => {
    if (!supabase || !tableName) return { data: null, error: 'Supabase غير متصل - يعمل بوضع تجريبي' };
    const { data, error } = await (supabase.from(tableName) as any).insert([record]).select().single();
    return { data, error: error?.message || null };
  };

  const update = async (id: string, updates: Record<string, any>): Promise<{ data: any; error: string | null }> => {
    if (!supabase || !tableName) return { data: null, error: 'Supabase غير متصل - يعمل بوضع تجريبي' };
    const { data, error } = await (supabase.from(tableName) as any).update(updates).eq('id', id).select().single();
    return { data, error: error?.message || null };
  };

  const remove = async (id: string): Promise<{ error: string | null }> => {
    if (!supabase || !tableName) return { error: 'Supabase غير متصل - يعمل بوضع تجريبي' };
    const { error } = await (supabase.from(tableName) as any).delete().eq('id', id);
    return { error: error?.message || null };
  };

  const getById = async (id: string): Promise<{ data: any; error: string | null }> => {
    if (!supabase || !tableName) return { data: null, error: 'Supabase غير متصل' };
    const { data, error } = await (supabase.from(tableName) as any).select('*').eq('id', id).single();
    return { data, error: error?.message || null };
  };

  return { insert, update, remove, getById, isConnected: !!supabase };
}
