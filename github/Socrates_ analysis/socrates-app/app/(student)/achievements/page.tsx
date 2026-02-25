// =====================================================
// Project Socrates - Achievements Page
// 成就页面 - 展示用户成就、等级、积分
// =====================================================

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import {
  Trophy,
  Star,
  Flame,
  Target,
  Lock,
  CheckCircle,
  Loader2,
  Clock,
  Zap,
  Crown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PageHeader } from '@/components/PageHeader';
import { cn } from '@/lib/utils';
import { RARITY_CONFIG } from '@/lib/achievements/definitions';
import type { AchievementDefinition } from '@/lib/achievements/types';

interface AchievementWithStatus extends AchievementDefinition {
  unlocked: boolean;
  unlocked_at: string | null;
  progress: number;
}

interface UserLevelData {
  level: number;
  xp: number;
  total_xp: number;
  title: string;
  current: number;
  next: number;
  progress: number;
}

interface AchievementStats {
  total_achievements: number;
  unlocked_achievements: number;
  total_points: number;
  earned_points: number;
  current_streak: number;
  longest_streak: number;
}

export default function AchievementsPage() {
  const { profile } = useAuth();
  const [achievements, setAchievements] = useState<AchievementWithStatus[]>([]);
  const [level, setLevel] = useState<UserLevelData | null>(null);
  const [stats, setStats] = useState<AchievementStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  useEffect(() => {
    if (profile?.id) {
      fetchAchievements();
    }
  }, [profile?.id]);

  const fetchAchievements = async () => {
    if (!profile?.id) return;
    setLoading(true);

    try {
      const response = await fetch(`/api/achievements?user_id=${profile.id}`);
      if (response.ok) {
        const result = await response.json();
        setAchievements(result.data.achievements);
        setLevel(result.data.level);
        setStats(result.data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAchievements = achievements.filter(a => {
    if (filter === 'unlocked') return a.unlocked;
    if (filter === 'locked') return !a.unlocked && !a.hidden;
    return !a.hidden || a.unlocked;
  });

  const groupedAchievements = filteredAchievements.reduce((acc, a) => {
    if (!acc[a.type]) acc[a.type] = [];
    acc[a.type].push(a);
    return acc;
  }, {} as Record<string, AchievementWithStatus[]>);

  const typeLabels: Record<string, string> = {
    learning: '学习成就',
    streak: '连续学习',
    mastery: '掌握成就',
    social: '社交成就',
    special: '特殊成就',
  };

  const themeClass = profile?.theme_preference === 'junior' ? 'theme-junior' : 'theme-senior';

  if (loading) {
    return (
      <div className={cn('min-h-screen bg-background flex items-center justify-center', themeClass)}>
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">加载成就数据...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('min-h-screen bg-gradient-to-br from-yellow-50 via-white to-amber-50 dark:from-slate-950 dark:via-slate-900 dark:to-yellow-950/30', themeClass)}>
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 right-1/4 w-80 h-80 bg-yellow-200/40 dark:bg-yellow-900/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-amber-200/30 dark:bg-amber-900/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 right-1/4 w-72 h-72 bg-orange-200/20 dark:bg-orange-900/20 rounded-full blur-3xl" />
      </div>

      {/* 页面标题 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        <PageHeader
          title="成就中心"
          description="查看你的学习成就和等级进度"
          icon={Trophy}
          iconColor="text-yellow-500"
        />
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-24 space-y-6">
        {/* 等级和统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 等级卡片 */}
          <Card className="border-border/50 md:col-span-2">
            <CardContent className="p-6">
              <div className="flex items-center gap-6">
                {/* 等级图标 */}
                <div className="relative">
                  <div className={cn(
                    "w-20 h-20 rounded-2xl flex items-center justify-center",
                    "bg-gradient-to-br from-yellow-400 to-orange-500",
                    "shadow-lg shadow-yellow-500/30"
                  )}>
                    <Crown className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-card border-2 border-yellow-500 flex items-center justify-center">
                    <span className="text-sm font-bold text-yellow-500">{level?.level || 1}</span>
                  </div>
                </div>

                {/* 等级信息 */}
                <div className="flex-1">
                  <h2 className="text-2xl font-bold">{level?.title || '初学者'}</h2>
                  <p className="text-muted-foreground text-sm mb-3">
                    经验值: {level?.total_xp || 0} XP
                  </p>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span>升级进度</span>
                      <span>{Math.round(level?.progress || 0)}%</span>
                    </div>
                    <Progress value={level?.progress || 0} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      距离下一级还需 {((level?.next || 0) - (level?.total_xp || 0))} XP
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 统计卡片 */}
          <Card className="border-border/50">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">已解锁成就</span>
                <span className="font-bold">{stats?.unlocked_achievements || 0}/{stats?.total_achievements || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">获得积分</span>
                <span className="font-bold text-yellow-500">{stats?.earned_points || 0} XP</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">当前连续</span>
                <span className="font-bold flex items-center gap-1">
                  <Flame className="w-4 h-4 text-orange-500" />
                  {stats?.current_streak || 0} 天
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">最长连续</span>
                <span className="font-bold">{stats?.longest_streak || 0} 天</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 筛选器 */}
        <div className="flex gap-2">
          {(['all', 'unlocked', 'locked'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 hover:bg-muted"
              )}
            >
              {f === 'all' ? '全部' : f === 'unlocked' ? '已解锁' : '未解锁'}
            </button>
          ))}
        </div>

        {/* 成就列表 */}
        {Object.entries(groupedAchievements).map(([type, achievements]) => (
          <div key={type} className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              {type === 'streak' && <Flame className="w-5 h-5 text-orange-500" />}
              {type === 'learning' && <Target className="w-5 h-5 text-blue-500" />}
              {type === 'mastery' && <CheckCircle className="w-5 h-5 text-green-500" />}
              {type === 'special' && <Star className="w-5 h-5 text-purple-500" />}
              {typeLabels[type] || type}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map((achievement) => {
                const rarityConfig = RARITY_CONFIG[achievement.rarity];
                return (
                  <Card
                    key={achievement.id}
                    className={cn(
                      "border-border/50 transition-all duration-300",
                      achievement.unlocked
                        ? "hover:shadow-lg"
                        : "opacity-60"
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        {/* 图标 */}
                        <div
                          className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center text-2xl",
                            achievement.unlocked
                              ? rarityConfig.bgColor
                              : "bg-muted"
                          )}
                        >
                          {achievement.unlocked ? achievement.icon : <Lock className="w-5 h-5 text-muted-foreground" />}
                        </div>

                        {/* 内容 */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium truncate">{achievement.name}</h4>
                            {achievement.unlocked && (
                              <Badge variant="secondary" className="text-xs">
                                +{achievement.points} XP
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {achievement.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge
                              variant="outline"
                              className={cn("text-xs", rarityConfig.color)}
                            >
                              {rarityConfig.label}
                            </Badge>
                            {achievement.unlocked && achievement.unlocked_at && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(achievement.unlocked_at).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
