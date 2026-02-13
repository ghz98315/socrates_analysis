// =====================================================
// 健壮的 Supabase 客户端实现
// 带有重试逻辑和错误处理
// =====================================================

import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-anon-key';

// 重试配置
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1秒

// 延迟函数
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 创建客户端
export function createClient() {
  const client = createSupabaseClient(supabaseUrl, supabaseAnonKey);

  // 包装所有数据库查询，添加重试逻辑
  const originalFrom = client.from.bind(client);

  client.from = (table: string) => {
    const queryBuilder = originalFrom(table);

    // 包装查询方法
    const originalSelect = queryBuilder.select.bind(queryBuilder);
    const originalUpdate = queryBuilder.update.bind(queryBuilder);
    const originalUpsert = queryBuilder.upsert.bind(queryBuilder);
    const originalInsert = queryBuilder.insert.bind(queryBuilder);

    // 带重试的 select
    queryBuilder.select = function(...args: any[]) {
      return retryOperation(() => originalSelect(...args));
    };

    // 带重试的 update
    queryBuilder.update = function(...args: any[]) {
      return retryOperation(() => originalUpdate(...args));
    };

    // 带重试的 upsert
    queryBuilder.upsert = function(...args: any[]) {
      return retryOperation(() => originalUpsert(...args));
    };

    // 带重试的 insert
    queryBuilder.insert = function(...args: any[]) {
      return retryOperation(() => originalInsert(...args));
    };

    return queryBuilder;
  };

  return client;
}

// 重试操作函数
async function retryOperation<T>(
  operation: () => T,
  retries = MAX_RETRIES
): Promise<T> {
  let lastError: any;

  for (let i = 0; i <= retries; i++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;

      // 如果是 AbortError 且不是最后一次重试，则重试
      if (error?.message?.includes('AbortError') && i < retries) {
        console.log(`请求被中止，重试 ${i + 1}/${retries}...`);
        await delay(RETRY_DELAY * (i + 1)); // 指数退避
        continue;
      }

      // 如果是其他错误或已达到最大重试次数，抛出错误
      throw error;
    }
  }

  throw lastError;
}

export async function createServerClient() {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey);
}
