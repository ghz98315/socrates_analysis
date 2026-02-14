import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Supabase 配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-anon-key';

// 单例模式：确保只有一个客户端实例
let clientInstance: ReturnType<typeof createSupabaseClient<Database>> | null = null;

export function createClient() {
  if (!clientInstance) {
    clientInstance = createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        // 使用 cookies 存储令牌（而不是 localStorage）
        // 这样服务端才能读取认证信息
        storage: {
          getItem: (key: string) => {
            if (typeof window === 'undefined') return null;
            return document.cookie.match(new RegExp(`(^| )${key}=([^;]*)`))?.[2] || null;
          },
          setItem: (key: string, value: string) => {
            if (typeof window === 'undefined') return;
            // 设置 cookie 时添加 httpOnly 和 secure 标志
            const maxAge = 60 * 60 * 24 * 7; // 7 天
            document.cookie = `${key}=${value}; max-age=${maxAge}; path=/; secure; samesite=lax`;
          },
          removeItem: (key: string) => {
            if (typeof window === 'undefined') return;
            document.cookie = `${key}=; max-age=-1; path=/`;
          },
        },
      },
    });
  }
  return clientInstance;
}

export async function createServerClient() {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey);
}
