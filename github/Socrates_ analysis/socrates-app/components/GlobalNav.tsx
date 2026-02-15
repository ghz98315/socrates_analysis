// =====================================================
// Project Socrates - Global Navigation Bar
// 全局导航栏 - 所有用户可见
// =====================================================

'use client';

import { useAuth } from '@/lib/contexts/AuthContext';
import { LogOut, Home, BookOpen, Users, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export function GlobalNav() {
  const { profile, user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // 认证页面不显示导航栏
  const isAuthPage = pathname?.includes('/login') || pathname?.includes('/register');
  if (!user || isAuthPage) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const isParent = profile?.role === 'parent';
  const isStudent = profile?.role === 'student';

  return (
    <nav className="border-b border-border/50 bg-card/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <span className="font-semibold text-lg hidden sm:inline">Socrates</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="flex items-center gap-2">
          {isParent && (
            <>
              <Button
                variant={pathname === '/dashboard' ? 'default' : 'ghost'}
                size="sm"
                asChild
              >
                <Link href="/dashboard" className="gap-2">
                  <Home className="w-4 h-4" />
                  <span className="hidden md:inline">家长中心</span>
                </Link>
              </Button>
              <Button
                variant={pathname?.includes('/workbench') ? 'default' : 'ghost'}
                size="sm"
                asChild
              >
                <Link href="/workbench" className="gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span className="hidden md:inline">开始学习</span>
                </Link>
              </Button>
              <Button
                variant={pathname?.includes('/review') ? 'default' : 'ghost'}
                size="sm"
                asChild
              >
                <Link href="/review" className="gap-2">
                  <Users className="w-4 h-4" />
                  <span className="hidden md:inline">学习报告</span>
                </Link>
              </Button>
            </>
          )}

          {isStudent && (
            <>
              <Button
                variant={pathname?.includes('/workbench') ? 'default' : 'ghost'}
                size="sm"
                asChild
              >
                <Link href="/workbench" className="gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span className="hidden md:inline">学习工作台</span>
                </Link>
              </Button>
              <Button
                variant={pathname?.includes('/review') ? 'default' : 'ghost'}
                size="sm"
                asChild
              >
                <Link href="/review" className="gap-2">
                  <Users className="w-4 h-4" />
                  <span className="hidden md:inline">复习计划</span>
                </Link>
              </Button>
            </>
          )}

          {/* Logout */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">退出</span>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="sm:hidden p-2 rounded-lg hover:bg-muted"
        >
          <div className="w-6 h-6 flex flex-col items-center justify-center gap-1">
            <span className={`w-5 h-0.5 bg-foreground transition-all ${isOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
            <span className={`w-5 h-0.5 bg-foreground transition-all ${isOpen ? 'opacity-0' : ''}`} />
            <span className={`w-5 h-0.5 bg-foreground transition-all ${isOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
          </div>
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="sm:hidden border-t border-border/50 py-4 px-4 space-y-2">
          {isParent && (
            <>
              <Button
                variant={pathname === '/dashboard' ? 'default' : 'ghost'}
                size="sm"
                className="w-full justify-start gap-2"
                asChild
                onClick={() => setIsOpen(false)}
              >
                <Link href="/dashboard">
                  <Home className="w-4 h-4" />
                  家长中心
                </Link>
              </Button>
              <Button
                variant={pathname?.includes('/workbench') ? 'default' : 'ghost'}
                size="sm"
                className="w-full justify-start gap-2"
                asChild
                onClick={() => setIsOpen(false)}
              >
                <Link href="/workbench">
                  <BookOpen className="w-4 h-4" />
                  开始学习
                </Link>
              </Button>
              <Button
                variant={pathname?.includes('/review') ? 'default' : 'ghost'}
                size="sm"
                className="w-full justify-start gap-2"
                asChild
                onClick={() => setIsOpen(false)}
              >
                <Link href="/review">
                  <Users className="w-4 h-4" />
                  学习报告
                </Link>
              </Button>
            </>
          )}

          {isStudent && (
            <>
              <Button
                variant={pathname?.includes('/workbench') ? 'default' : 'ghost'}
                size="sm"
                className="w-full justify-start gap-2"
                asChild
                onClick={() => setIsOpen(false)}
              >
                <Link href="/workbench">
                  <BookOpen className="w-4 h-4" />
                  学习工作台
                </Link>
              </Button>
              <Button
                variant={pathname?.includes('/review') ? 'default' : 'ghost'}
                size="sm"
                className="w-full justify-start gap-2"
                asChild
                onClick={() => setIsOpen(false)}
              >
                <Link href="/review">
                  <Users className="w-4 h-4" />
                  复习计划
                </Link>
              </Button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
