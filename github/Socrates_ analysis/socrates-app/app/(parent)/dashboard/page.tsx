// =====================================================
// Project Socrates - Parent Dashboard
// =====================================================

'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { LogOut, Calendar, Users, TrendingUp, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import type { StudentStats } from '@/lib/supabase/types';
import { LearningHeatmap } from '@/components/LearningHeatmap';
import { WeakKnowledgePoints } from '@/components/WeakKnowledgePoints';
import { TodayStats, WeeklyStats } from '@/components/StudyTimeCards';

interface StudyTimeStats {
  total_sessions: number;
  total_duration_minutes: number;
  today_sessions: number;
  today_duration_minutes: number;
}

interface StatCardProps {
  title: string;
  value: string | number;
  unit: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'stable';
}

function StatCard({ title, value, unit, icon, trend }: StatCardProps) {
  return (
    <Card className="shadow-apple">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              {icon}
              <div>
                <div className="text-2xl font-bold text-card-foreground">
                  {value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {unit}
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{title}</p>
          </div>
          {trend && (
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center
              ${trend === 'up' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}
            `}>
              {trend === 'up' && <TrendingUp className="w-5 h-5" />}
              {trend === 'down' && <TrendingUp className="w-5 h-5 rotate-180" />}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { profile, signOut } = useAuth();
  const router = useRouter();

  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [heatmapData, setHeatmapData] = useState<{ date: string; count: number }[]>([]);
  const [weakPoints, setWeakPoints] = useState<{ tag: string; count: number; trend?: 'up' | 'down' | 'stable' }[]>([]);
  const [studyStats, setStudyStats] = useState<StudyTimeStats | null>(null);
  const [loading, setLoading] = useState(true);

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  // 加载仪表板数据
  useEffect(() => {
    const loadDashboardData = async () => {
      // TODO: 从 Supabase 加载真实数据
      // 暂时使用模拟数据
      setStats({
        student_id: 'mock',
        total_errors: 12,
        mastered_count: 8,
        mastery_rate: 66.7,
      });

      // 生成热力图数据（最近30天）
      const today = new Date();
      const heatmap: { date: string; count: number }[] = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        heatmap.push({
          date: `${date.getMonth() + 1}/${date.getDate()}`,
          count: Math.floor(Math.random() * 8), // 模拟 0-8 题每天
        });
      }
      setHeatmapData(heatmap.reverse());

      // 生成薄弱知识点数据
      setWeakPoints([
        { tag: '勾股定理', count: 12, trend: 'up' },
        { tag: '方程求解', count: 8, trend: 'down' },
        { tag: '力的计算', count: 5, trend: 'stable' },
        { tag: '化学方程式', count: 4, trend: 'up' },
        { tag: '函数图像', count: 3, trend: 'down' },
        { tag: '单位换算', count: 2, trend: 'stable' },
      ]);

      // 加载学习时长统计
      await loadStudyTimeStats();
    };

    loadDashboardData();
    setLoading(false);
  }, [selectedStudent]);

  // 加载学习时长统计
  const loadStudyTimeStats = async () => {
    if (!selectedStudent) {
      setStudyStats(null);
      return;
    }

    try {
      // 获取本周学习统计（最近7天）
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const response = await fetch(`/api/study/session?student_id=${selectedStudent}&start_date=${weekAgo}`);

      if (!response.ok) {
        console.error('Failed to load study stats');
        return;
      }

      const result = await response.json();
      setStudyStats(result.data || null);
    } catch (error) {
      console.error('Error loading study stats:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold">Dashboard</h1>
            <span className="text-sm text-muted-foreground">Parent</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Student Selector */}
            {selectedStudent && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedStudent(null)}
                className="gap-2"
              >
                返回概览
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              退出
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-muted-foreground" />
          </div>
        ) : selectedStudent ? (
          /* Individual Student View */
          <div className="space-y-6">
            {/* Student Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-card-foreground">
                {selectedStudent} 的学习报告
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedStudent(null)}
              >
                切换学生
              </Button>
            </div>

            {/* Original Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                title="错题数"
                value={stats?.total_errors || 0}
                unit="题"
                icon={<Calendar className="w-6 h-6 text-muted-foreground" />}
              />
              <StatCard
                title="已掌握"
                value={stats?.mastered_count || 0}
                unit="题"
                icon={<Users className="w-6 h-6 text-muted-foreground" />}
                trend="up"
              />
              <StatCard
                title="复习完成"
                value="0"
                unit="次"
                icon={<CheckCircle className="w-6 h-6 text-muted-foreground" />}
              />
              <StatCard
                title="掌握率"
                value={`${stats?.mastery_rate || 0}%`}
                unit=""
                icon={<TrendingUp className="w-6 h-6 text-muted-foreground" />}
                trend="up"
              />
            </div>

            {/* Study Time Tracking - New */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-card-foreground mb-4">
                📊 学习时长统计
              </h3>

              {/* Today's Stats */}
              {studyStats && (
                <TodayStats
                  todayDuration={studyStats.today_duration_minutes.toString()}
                  todaySessions={studyStats.today_sessions}
                  todayStreak={3}
                />
              )}

              {/* Weekly Stats */}
              {studyStats && (
                <WeeklyStats
                  totalDuration={studyStats.total_duration_minutes > 0 ? (studyStats.total_duration_minutes / 60).toFixed(1) : '0'}
                  totalSessions={studyStats.total_sessions}
                  avgDaily={studyStats.total_sessions > 0 ? (studyStats.total_duration_minutes / 60 / 7).toFixed(1) : '0'}
                  weeklyTrend={studyStats.total_sessions > 5 ? 'up' : 'stable'}
                />
              )}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <LearningHeatmap data={heatmapData} />
              <WeakKnowledgePoints data={weakPoints} />
            </div>
          </div>
        ) : (
          /* Overview - Select Student */
          <div className="text-center py-20">
            <div className="max-w-md mx-auto space-y-6">
              <div className="w-20 h-20 mx-auto mb-6 text-muted-foreground opacity-50">
                <Users className="w-16 h-16" />
              </div>
              <h2 className="text-2xl font-semibold text-card-foreground mb-2">
                选择查看学生报告
              </h2>
              <p className="text-muted-foreground">
                请选择要查看详细数据的学生
              </p>

              {/* TODO: 从数据库加载真实学生列表 */}
              <div className="grid grid-cols-2 gap-4">
                {['小明', '小红'].map(student => (
                  <Button
                    key={student}
                    variant="outline"
                    onClick={() => setSelectedStudent(student)}
                    className="h-24 flex flex-col gap-2 btn-press"
                  >
                    <span className="text-xl font-medium">
                      {student}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {student === '小明' ? '小学' : '初中'}
                    </span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-card-foreground mb-4">
                最近活动
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/30">
                  <Calendar className="w-10 h-10 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="font-medium text-card-foreground">
                      小明 完成了数学题学习
                    </p>
                    <p className="text-sm text-muted-foreground">
                      2 小时前
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/30">
                  <Calendar className="w-10 h-10 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="font-medium text-card-foreground">
                      小红 完成了化学方程式复习
                    </p>
                    <p className="text-sm text-muted-foreground">
                      1 小时前
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Development Notice */}
      <div className="fixed bottom-4 left-0 right-0 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="mx-auto bg-card/80 backdrop-blur-xl rounded-full px-4 py-2 text-sm text-muted-foreground shadow-apple">
            🚧 Dashboard 正在开发中...更多统计功能即将上线
          </div>
        </div>
      </div>
    </div>
  );
}
