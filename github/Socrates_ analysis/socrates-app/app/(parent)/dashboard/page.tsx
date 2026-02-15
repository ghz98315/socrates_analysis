// =====================================================
// Project Socrates - Parent Dashboard
// =====================================================

'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Calendar, Users, TrendingUp, CheckCircle, Loader2, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { StudentStats } from '@/lib/supabase/types';
import { LearningHeatmap } from '@/components/LearningHeatmap';
import { WeakKnowledgePoints } from '@/components/WeakKnowledgePoints';
import { TodayStats, WeeklyStats } from '@/components/StudyTimeCards';
import { Input } from '@/components/ui/input';

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
  const { profile, loading: authLoading } = useAuth();

  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [selectedStudentName, setSelectedStudentName] = useState<string>('');
  const [students, setStudents] = useState<Array<{ id: string; display_name: string; grade_level: number }>>([]);
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [heatmapData, setHeatmapData] = useState<{ date: string; count: number }[]>([]);
  const [weakPoints, setWeakPoints] = useState<{ tag: string; count: number; trend?: 'up' | 'down' | 'stable' }[]>([]);
  const [studyStats, setStudyStats] = useState<StudyTimeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<{ id: string; name: string } | null>(null);

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const display_name = formData.get('studentName') as string;
    const phone = formData.get('phone') as string;
    const password = formData.get('password') as string;
    const grade_level = formData.get('grade') as string;

    try {
      const response = await fetch('/api/students/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ display_name, phone, password, grade_level }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(`添加失败: ${error.error || '未知错误'}`);
        return;
      }

      const result = await response.json();

      // Show success message
      alert(`学生 ${result.data.display_name} 添加成功！`);

      // Close modal
      setShowAddStudentModal(false);

      // Refresh student list
      window.location.reload();
    } catch (error) {
      console.error('Error adding student:', error);
      alert(`添加失败: ${error}`);
    }
  };

  const handleDeleteStudent = async () => {
    if (!studentToDelete) return;

    try {
      const response = await fetch(`/api/students/${studentToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        alert(`删除失败: ${error.error || '未知错误'}`);
        return;
      }

      // Show success message
      alert(`学生 ${studentToDelete.name} 已删除`);

      // Close modal
      setShowDeleteConfirm(false);
      setStudentToDelete(null);

      // If deleted student was selected, clear selection
      if (selectedStudent === studentToDelete.id) {
        setSelectedStudent(null);
        setSelectedStudentName('');
        setStats(null);
      }

      // Refresh student list
      window.location.reload();
    } catch (error) {
      console.error('Error deleting student:', error);
      alert(`删除失败: ${error}`);
    }
  };

  // 加载学生列表 - 等待用户认证完成
  useEffect(() => {
    const loadStudents = async () => {
      // 等待认证完成且 profile 可用
      if (authLoading || !profile) return;

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
  }, [profile, authLoading]);

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
      {/* Dashboard Toolbar - below global nav */}
      <div className="border-b border-border/50 bg-card/30 backdrop-blur-sm px-6 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">家长中心</span>
            {selectedStudent && (
              <>
                <span className="text-muted-foreground">·</span>
                <span className="text-sm text-muted-foreground">{selectedStudentName}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Student Selector */}
            {selectedStudent && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedStudent(null)}
                className="h-7 text-xs"
              >
                返回概览
              </Button>
            )}

            <Button
              variant="default"
              size="sm"
              onClick={() => setShowAddStudentModal(true)}
              className="h-7 gap-1 text-xs"
            >
              <Plus className="w-3 h-3" />
              添加学生
            </Button>
          </div>
        </div>
      </div>

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
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setStudentToDelete({ id: selectedStudent, name: selectedStudentName });
                    setShowDeleteConfirm(true);
                  }}
                  className="gap-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                  删除学生
                </Button>
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
                  <div key={student.id} className="relative group">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedStudent(student.id);
                        setSelectedStudentName(student.display_name);
                      }}
                      className="w-full h-24 flex flex-col gap-2 btn-press pr-10"
                    >
                      <span className="text-xl font-medium">
                        {student.display_name}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {student.grade_level}年级
                      </span>
                    </Button>
                    {/* Delete button - always visible */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setStudentToDelete({ id: student.id, name: student.display_name });
                        setShowDeleteConfirm(true);
                      }}
                      className="absolute top-1 right-1 w-7 h-7 bg-red-100 hover:bg-red-500 hover:text-white text-red-500 rounded-lg shadow-sm transition-all flex items-center justify-center"
                      title="删除学生"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
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

      {/* Add Student Modal */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>添加学生</CardTitle>
              <button
                onClick={() => setShowAddStudentModal(false)}
                className="ml-auto text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddStudent} className="space-y-4">
                {/* Display Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">学生姓名</label>
                  <Input
                    id="studentName"
                    name="studentName"
                    placeholder="请输入学生姓名"
                    required
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">手机号</label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="请输入手机号"
                    pattern="[0-9]{11}"
                    required
                  />
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">密码</label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="至少6位"
                    minLength={6}
                    required
                  />
                </div>

                {/* Grade Level */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">年级</label>
                  <select id="grade" name="grade" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                    <option value="">请选择</option>
                    <option value="1">一年级</option>
                    <option value="2">二年级</option>
                    <option value="3">三年级</option>
                    <option value="4">四年级</option>
                    <option value="5">五年级</option>
                    <option value="6">六年级</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1">
                    添加学生
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Student Confirmation Modal */}
      {showDeleteConfirm && studentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>确认删除</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                确定要删除学生 <span className="font-medium text-foreground">{studentToDelete.name}</span> 吗？
              </p>
              <p className="text-xs text-destructive">
                ⚠️ 此操作将永久删除该学生的所有数据（错题记录、学习报告等），无法恢复。
              </p>
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setStudentToDelete(null);
                  }}
                >
                  取消
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={handleDeleteStudent}
                >
                  确认删除
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
