// =====================================================
// Project Socrates - Register Page
// =====================================================

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { signIn } = useAuth();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 验证手机号
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      setError('请输入正确的手机号');
      return;
    }

    // 验证密码
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    if (password.length < 6) {
      setError('密码长度至少为 6 位');
      return;
    }

    setLoading(true);

    try {
      // 调用服务端注册 API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone,
          password,
          display_name: displayName || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '注册失败，请稍后重试');
      }

      // 注册成功后自动登录
      await signIn(phone, password);

      // 跳转到选择角色页面
      router.push('/select-profile');
    } catch (err) {
      const message = err instanceof Error ? err.message : '注册失败，请稍后重试';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-apple">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-semibold">创建账户</CardTitle>
          <CardDescription>
            开启你的 AI 学习之旅
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="displayName" className="text-sm font-medium">
                昵称（可选）
              </label>
              <Input
                id="displayName"
                type="text"
                placeholder="小明"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={loading}
                className="rounded-xl h-12"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium">
                手机号
              </label>
              <Input
                id="phone"
                type="tel"
                placeholder="请输入11位手机号"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                pattern="[0-9]{11}"
                maxLength={11}
                required
                disabled={loading}
                className="rounded-xl h-12"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                密码
              </label>
              <Input
                id="password"
                type="password"
                placeholder="至少 6 位"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="rounded-xl h-12"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                确认密码
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="再次输入密码"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                className="rounded-xl h-12"
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full h-12 rounded-full text-base font-medium btn-press"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  注册中...
                </>
              ) : (
                '创建账户'
              )}
            </Button>

            <p className="text-sm text-muted-foreground text-center">
              已有账户？{' '}
              <Link href="/login" className="text-foreground hover:underline font-medium">
                立即登录
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
