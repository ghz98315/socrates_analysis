// =====================================================
// Project Socrates - Login Page
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

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(phone, password);
      router.push('/select-profile');
    } catch (err) {
      const message = err instanceof Error ? err.message : '登录失败，请检查手机号和密码';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-apple">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-semibold">Socrates</CardTitle>
          <CardDescription>
            登录你的学习账户
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
              <label htmlFor="phone" className="text-sm font-medium">
                手机号
              </label>
              <Input
                id="phone"
                type="tel"
                placeholder="请输入手机号"
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
                placeholder="•••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                  登录中...
                </>
              ) : (
                '登录'
              )}
            </Button>

            <p className="text-sm text-muted-foreground text-center">
              还没有账户？{' '}
              <Link href="/register" className="text-foreground hover:underline font-medium">
                立即注册
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
