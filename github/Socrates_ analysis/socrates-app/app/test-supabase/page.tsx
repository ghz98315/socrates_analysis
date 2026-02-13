// =====================================================
// Supabase 连接诊断页面
// 访问 http://localhost:3000/test-supabase
// =====================================================

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  details?: string;
}

export default function TestSupabasePage() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [userId] = useState('8c7c7afd-bbf3-400c-9926-b4fc93c86488');

  const addResult = (result: TestResult) => {
    setResults(prev => [...prev, result]);
  };

  const runTests = async () => {
    setResults([]);
    const supabase = createClient();

    // 测试 1: 客户端创建
    addResult({ name: '创建 Supabase 客户端', status: 'success', message: '客户端创建成功' });

    // 测试 2: 获取当前会话
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      addResult({
        name: '获取会话',
        status: 'success',
        message: session ? '已登录' : '未登录',
        details: session?.user?.email
      });
    } catch (error: any) {
      addResult({
        name: '获取会话',
        status: 'error',
        message: error.message,
        details: JSON.stringify(error)
      });
    }

    // 测试 3: 简单查询（不使用 RLS）
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, role, display_name')
        .limit(1);

      if (error) throw error;
      addResult({
        name: '简单查询 (无 RLS)',
        status: 'success',
        message: `找到 ${data?.length || 0} 条记录`,
        details: JSON.stringify(data)
      });
    } catch (error: any) {
      addResult({
        name: '简单查询 (无 RLS)',
        status: 'error',
        message: error.message,
        details: JSON.stringify(error)
      });
    }

    // 测试 4: 查询特定用户的 profile
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      addResult({
        name: '查询特定用户 profile',
        status: 'success',
        message: '查询成功',
        details: JSON.stringify(data, null, 2)
      });
    } catch (error: any) {
      addResult({
        name: '查询特定用户 profile',
        status: 'error',
        message: error.message,
        details: error.code ? `Code: ${error.code}` : JSON.stringify(error)
      });
    }

    // 测试 5: 尝试更新 profile
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ theme_preference: 'junior' })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      addResult({
        name: '更新 profile',
        status: 'success',
        message: '更新成功',
        details: JSON.stringify(data, null, 2)
      });
    } catch (error: any) {
      addResult({
        name: '更新 profile',
        status: 'error',
        message: error.message,
        details: error.code ? `Code: ${error.code}` : JSON.stringify(error)
      });
    }
  };

  useEffect(() => {
    runTests();
  }, []);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Supabase 连接诊断</h1>

        <div className="mb-6 p-4 bg-muted rounded-lg">
          <h2 className="font-semibold mb-2">测试用户 ID</h2>
          <code className="text-sm break-all">{userId}</code>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">测试结果</h2>

          {results.length === 0 ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              运行测试中...
            </div>
          ) : (
            results.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  result.status === 'success'
                    ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800'
                    : result.status === 'error'
                    ? 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800'
                    : 'bg-gray-50 border-gray-200 dark:bg-gray-950 dark:border-gray-800'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold">{result.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded ${
                    result.status === 'success'
                      ? 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200'
                      : result.status === 'error'
                      ? 'bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200'
                      : 'bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                  }`}>
                    {result.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm mb-2">{result.message}</p>
                {result.details && (
                  <pre className="text-xs bg-black/5 p-2 rounded overflow-auto max-h-40">
                    {result.details}
                  </pre>
                )}
              </div>
            ))
          )}
        </div>

        <button
          onClick={runTests}
          className="mt-8 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          重新运行测试
        </button>
      </div>
    </div>
  );
}
