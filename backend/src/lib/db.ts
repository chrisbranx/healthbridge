import { supabase } from './supabase';
import { devDb } from './devDb';

function getDb() {
  return supabase;
}

export async function select(table: string, options?: { eq?: [string, any]; order?: [string, boolean]; limit?: number }) {
  const db = getDb();
  if (db) {
    let q = db.from(table).select('*');
    if (options?.eq) q = q.eq(options.eq[0], options.eq[1]);
    if (options?.order) q = q.order(options.order[0], { ascending: options.order[1] });
    if (options?.limit) q = q.limit(options.limit);
    const { data, error } = await q;
    if (error) throw error;
    return data || [];
  }

  let results = devDb.get(table as any) as any[];
  if (options?.eq) {
    results = results.filter((r: any) => r[options.eq![0]] === options.eq![1]);
  }
  if (options?.order) {
    const [key, asc] = options.order;
    results.sort((a: any, b: any) => asc ? (a[key] > b[key] ? 1 : -1) : (a[key] < b[key] ? 1 : -1));
  }
  if (options?.limit) {
    results = results.slice(0, options.limit);
  }
  return results;
}

export async function selectOne(table: string, column: string, value: any) {
  const db = getDb();
  if (db) {
    const { data, error } = await db.from(table).select('*').eq(column, value).single();
    if (error) return null;
    return data;
  }
  return devDb.findWhere(table as any, (r: any) => r[column] === value)[0] || null;
}

export async function insertOne(table: string, data: any) {
  const db = getDb();
  if (db) {
    const { data: result, error } = await db.from(table).insert(data).select().single();
    if (error) throw error;
    return result;
  }
  return devDb.insert(table as any, data);
}

export async function updateOne(table: string, id: string, updates: any) {
  const db = getDb();
  if (db) {
    const { data, error } = await db.from(table).update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }
  return devDb.update(table as any, id, updates);
}
