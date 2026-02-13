// =====================================================
// Project Socrates - Authentication Context
// =====================================================

'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  email?: string;
  role: 'admin' | 'student' | 'parent';
  theme_preference?: 'junior' | 'senior';
  grade_level?: number;
  display_name?: string;
  avatar_url?: string;
  xp_points?: number;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // 防止重复请求
  const fetchingRef = useRef<string | null>(null);
  const updatingRef = useRef<boolean>(false);

  const supabase = createClient();

  // Fetch user profile from database
  const fetchProfile = async (userId: string): Promise<UserProfile | null> => {
    // 防止重复请求
    if (fetchingRef.current === userId) {
      console.log('Already fetching profile for user:', userId);
      return null;
    }

    fetchingRef.current = userId;

    try {
      console.log('Fetching profile for user:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle(); // 允许返回 null

      if (error) {
        console.error('Error fetching profile:', JSON.stringify(error, null, 2));
        return null;
      }

      console.log('Profile fetched:', data);
      return (data as UserProfile | null);
    } catch (error: any) {
      console.error('Exception fetching profile:', error?.message || error);
      return null;
    } finally {
      fetchingRef.current = null;
    }
  };

  useEffect(() => {
    // Check active session and set up auth listener
    const getSession = async () => {
      console.log('[AuthContext] Getting initial session');
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('[AuthContext] Error getting session:', error);
        setLoading(false);
        return;
      }

      console.log('[AuthContext] Initial session:', !!session?.user);
      if (session?.user) {
        setUser(session.user);
        const userProfile = await fetchProfile(session.user.id);
        setProfile(userProfile);
      }

      setLoading(false);
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[AuthContext] onAuthStateChange:', event, !!session?.user);
        if (session?.user) {
          setUser(session.user);
          const userProfile = await fetchProfile(session.user.id);
          setProfile(userProfile);
        } else {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setLoading(false);
      throw error;
    }

    if (data.user) {
      setUser(data.user);
      const userProfile = await fetchProfile(data.user.id);
      setProfile(userProfile);
    }
    setLoading(false);
  };

  const signUp = async (email: string, password: string, name?: string) => {
    console.log('[AuthContext] signUp started');
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: name,
        },
      },
    });

    console.log('[AuthContext] signUp response:', { hasUser: !!data.user, hasSession: !!data.session, error });

    if (error) {
      console.error('[AuthContext] signUp error:', error);
      setLoading(false);
      throw error;
    }

    // 检查是否有 session（如果没有 session，说明需要邮箱确认）
    if (!data.session) {
      console.error('[AuthContext] No session after signUp');
      setLoading(false);
      throw new Error('注册成功，但需要邮箱确认。请检查您的邮箱。');
    }

    if (data.user) {
      console.log('[AuthContext] Setting user:', data.user.id);
      setUser(data.user);

      // 等待触发器创建 profile，然后获取
      // 使用重试逻辑，因为触发器是异步的
      let userProfile = null;
      for (let i = 0; i < 5; i++) {
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log(`[AuthContext] Fetching profile attempt ${i + 1}/5`);
        userProfile = await fetchProfile(data.user.id);
        if (userProfile) {
          console.log('[AuthContext] Profile fetched successfully');
          break;
        }
      }

      // 如果触发器未创建 profile，手动创建
      if (!userProfile) {
        console.log('[AuthContext] Profile not found after retries, creating manually');
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            role: 'student',
            display_name: name || email.split('@')[0],
          } as any)
          .select()
          .maybeSingle();

        if (insertError) {
          console.error('[AuthContext] Error creating profile:', insertError);
        } else {
          console.log('[AuthContext] Profile created, fetching again');
          userProfile = await fetchProfile(data.user.id);
        }
      }

      console.log('[AuthContext] Setting profile:', userProfile);
      setProfile(userProfile);
    }

    console.log('[AuthContext] signUp completed, setting loading to false');
    setLoading(false);
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
    setUser(null);
    setProfile(null);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) {
      throw new Error('Not authenticated');
    }

    // 防止重复更新
    if (updatingRef.current) {
      console.log('Update already in progress');
      return;
    }

    updatingRef.current = true;

    console.log('updateProfile called with:', updates);

    try {
      // 使用 update() 方法直接更新
      const { data, error } = await supabase
        .from('profiles')
        .update(updates as any)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', JSON.stringify(error, null, 2));
        throw error;
      }

      console.log('Profile updated successfully:', data);

      // 更新后立即刷新本地 profile 状态
      setProfile(data as UserProfile);
    } catch (err: any) {
      console.error('Exception in updateProfile:', err);
      throw err;
    } finally {
      updatingRef.current = false;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const userProfile = await fetchProfile(user.id);
      setProfile(userProfile);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signIn,
        signUp,
        signOut,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
