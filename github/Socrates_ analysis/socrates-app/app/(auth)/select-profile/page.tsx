// =====================================================
// Project Socrates - Profile Selection Page
// =====================================================

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import type { ThemeType } from '@/lib/supabase/types';
import { GraduationCap, UserCircle, ChartBar, Loader2 } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

interface ProfileOption {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  theme: ThemeType;
  gradeLevel?: [number, number];
  role: 'student' | 'parent';
}

const profileOptions: ProfileOption[] = [
  {
    id: 'junior',
    title: 'Junior',
    subtitle: '3-6 Grade',
    icon: <GraduationCap className="w-12 h-12" />,
    theme: 'junior',
    gradeLevel: [3, 6],
    role: 'student',
  },
  {
    id: 'senior',
    title: 'Senior',
    subtitle: '7-9 Grade',
    icon: <UserCircle className="w-12 h-12" />,
    theme: 'senior',
    gradeLevel: [7, 9],
    role: 'student',
  },
  {
    id: 'parent',
    title: 'Parent',
    subtitle: 'Dashboard',
    icon: <ChartBar className="w-12 h-12" />,
    theme: 'senior',
    role: 'parent',
  },
];

export default function SelectProfilePage() {
  const router = useRouter();
  const { profile, loading, refreshProfile, user, updateProfile, signOut } = useAuth();
  const [selecting, setSelecting] = useState<string | null>(null);

  // 只有当 profile 已经设置了 theme_preference 和 grade_level 时才自动跳转
  // 如果这些字段为空，说明用户还没有选择角色，需要显示选择界面
  // 修改：即使有角色，也显示选择界面，允许用户重新选择
  useEffect(() => {
    if (!loading && profile) {
      // 检查是否已经设置过角色（有 theme_preference 或 grade_level）
      const hasSelectedRole = profile.theme_preference || profile.grade_level;

      // 修改：不再自动跳转，始终显示角色选择界面让用户可以重新选择
      // if (hasSelectedRole) {
      //   if (profile.role === 'parent') {
      //     router.push('/dashboard');
      //   } else {
      //     router.push('/workbench');
      //   }
      // }
    }
  }, [profile, loading, router]);

  // 如果用户已登录但没有 profile，重试获取
  useEffect(() => {
    if (!loading && user && !profile) {
      console.log('User logged in but no profile, retrying...');
      refreshProfile();
    }
  }, [loading, user, profile, refreshProfile]);

  const handleSelectProfile = async (option: ProfileOption) => {
    if (!user) {
      console.error('No user found');
      return;
    }

    setSelecting(option.id);

    try {
      // 直接使用 updateProfile（从 AuthContext），无论 profile 是否存在
      // AuthContext 的 updateProfile 会处理新创建或更新
      await updateProfile({
        role: option.role,
        theme_preference: option.theme,
        grade_level: option.gradeLevel?.[0],
        display_name: profile?.display_name || user.user_metadata?.display_name || user.email?.split('@')[0],
      });

      console.log('Profile updated, navigating to:', option.role === 'parent' ? '/dashboard' : '/workbench');

      // 直接跳转，不需要 setTimeout
      if (option.role === 'parent') {
        router.push('/dashboard');
      } else {
        router.push('/workbench');
      }
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      alert(`设置角色失败: ${error?.message || JSON.stringify(error)}`);
    } finally {
      setSelecting(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
      <div className="w-full max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            Select your profile
          </h1>
          <p className="text-muted-foreground">
            选择你的学习空间
          </p>
        </div>

        {/* Profile Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {profileOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => handleSelectProfile(option)}
              disabled={selecting !== null}
              className={`
                group relative bg-card rounded-2xl p-8
                transition-all duration-300 ease-out
                hover:shadow-apple-hover hover:-translate-y-1
                active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
                border border-transparent hover:border-gray-100
                ${option.theme === 'junior' ? 'theme-junior' : 'theme-senior'}
              `}
            >
              {/* Icon */}
              <div className={`
                w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center
                transition-colors duration-200
                ${option.theme === 'junior'
                  ? 'bg-orange-50 text-orange-500 group-hover:bg-orange-100'
                  : 'bg-blue-50 text-blue-500 group-hover:bg-blue-100'
                }
              `}>
                {option.icon}
              </div>

              {/* Title & Subtitle */}
              <h3 className="text-center text-xl font-semibold mb-1 text-card-foreground">
                {option.title}
              </h3>
              <p className="text-center text-sm text-muted-foreground mb-6">
                {option.subtitle}
              </p>

              {/* Continue Button */}
              <div className={`
                py-3 rounded-full text-sm font-medium transition-colors
                ${option.theme === 'junior'
                  ? 'bg-orange-500 text-white hover:bg-orange-600'
                  : 'bg-gray-900 text-white hover:bg-gray-800'
                }
              `}>
                {selecting === option.id ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    切换中...
                  </div>
                ) : (
                  'Continue'
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Sign Out */}
        <div className="text-center">
          <button
            onClick={async () => {
              await signOut();
              router.push('/login');
            }}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            切换账户
          </button>
        </div>
      </div>
    </div>
  );
}
