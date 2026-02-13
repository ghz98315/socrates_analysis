import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Supabase 配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-anon-key';

// 单例模式：确保只有一个客户端实例
let clientInstance: ReturnType<typeof createSupabaseClient> | null = null;

export function createClient() {
  if (!clientInstance) {
    clientInstance = createSupabaseClient(supabaseUrl, supabaseAnonKey);
  }
  return clientInstance;
}

export async function createServerClient() {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey);
}
