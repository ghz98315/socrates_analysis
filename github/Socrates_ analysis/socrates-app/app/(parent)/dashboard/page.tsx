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
  const [selectedStudentName, setSelectedStudentName] = useState<string>('');
  const [students, setStudents] = useState<Array<{ id: string; display_name: string; grade_level: number }>>([]);
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [heatmapData, setHeatmapData] = useState<{ date: string; count: number }[]>([]);
  const [weakPoints, setWeakPoints] = useState<{ tag: string; count: number; trend?: 'up' | 'down' | 'stable' }[]>([]);
  const [studyStats, setStudyStats] = useState<StudyTimeStats | null>(null);
  const [loading, setLoading] = useState(true);

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  // 加载学生列表
  useEffect(() => {
    const loadStudents = async () => {
      try {
        const response = await fetch('/api/students');
        if (!response.ok) {
          console.error('Failed to load students');
          return;
        }
        const result = await response.json();
        setStudents(result.data || []);
      } catch (error) {
        console.error('Error loading students:', error);
      }
    };
    loadStudents();
  }, []);

  // 加载仪表板数据
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!selectedStudent) {
        setLoading(false);
        return;
      }

      try {
        // 从 API 获取真实数据
        const response = await fetch(`/api/student/stats?student_id=${selectedStudent}&days=30`);

        if (!response.ok) {
          console.error('Failed to load student stats');
          setLoading(false);
          return;
        }

        const result = await response.json();
        const data = result.data;

        // 更新统计数据
        setStats({
          student_id: selectedStudent,
          total_errors: data.total_errors,
          mastered_count: data.mastered_count,
          mastery_rate: data.mastery_rate,
        });

        // 更新热力图数据
        setHeatmapData(data.heatmap_data);

        // 更新薄弱知识点
        setWeakPoints(data.weak_points);

        // 加载学习时长统计
        await loadStudyTimeStats();
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      }

      setLoading(false);
    };

    loadDashboardData();
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
                {selectedStudentName || selectedStudent} 的学习报告
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedStudent(null);
                  setSelectedStudentName('');
                }}
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

              {/* 从数据库加载真实学生列表 */}
              <div className="grid grid-cols-2 gap-4">
                {students.map(student => (
                  <Button
                    key={student.id}
                    variant="outline"
                    onClick={() => {
                      setSelectedStudent(student.id);
                      setSelectedStudentName(student.display_name);
                    }}
                    className="h-24 flex flex-col gap-2 btn-press"
                  >
                    <span className="text-xl font-medium">
                      {student.display_name}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {student.grade_level}年级
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
