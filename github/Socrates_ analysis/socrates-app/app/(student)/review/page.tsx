// =====================================================
// Project Socrates - Review List Page
// =====================================================

'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Calendar, Clock, CheckCircle } from 'lucide-react';
import type { ErrorSession, ReviewSchedule } from '@/lib/supabase/types';
import { createClient } from '@/lib/supabase/client';
import { formatReviewDate, getUrgencyColor, getUrgencyLabel, REVIEW_STAGES } from '@/lib/review/utils';

interface ReviewItem {
  id: string;
  sessionId: string;
  subject: 'math' | 'physics' | 'chemistry';
  conceptTags: string[] | null;
  difficultyRating: number | null;
  nextReviewAt: string;
  reviewStage: number;
  daysUntilDue: number;
  isOverdue: boolean;
}

interface ReviewScheduleData {
  id: string;
  session_id: string;
  review_stage: number;
  next_review_at: string;
  is_completed: boolean;
}

interface ErrorSessionData {
  id: string;
  subject: 'math' | 'physics' | 'chemistry';
  concept_tags: string[] | null;
  difficulty_rating: number | null;
}

export default function ReviewPage() {
  const { profile } = useAuth();
  const supabase = createClient() as any;

  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'overdue'>('all');

  // 加载复习列表
  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    setLoading(true);

    const { data: reviewData, error: reviewError } = await supabase
      .from('review_schedule')
      .select('*')
      .eq('student_id', profile?.id || '')
      .eq('is_completed', false)
      .order('next_review_at', { ascending: true });

    if (reviewError) {
      console.error('Failed to load reviews:', reviewError);
      setLoading(false);
      return;
    }

    const reviewSchedules = (reviewData as any) || [];

    // 关联错题会话信息
    const sessionIds = reviewSchedules.map((r: any) => r.session_id) || [];

    if (sessionIds.length > 0) {
      const { data: sessionData } = await supabase
        .from('error_sessions')
        .select('*')
        .in('id', sessionIds);

      const sessions = (sessionData as any) || [];

      // 组合数据
      const sessionMap = new Map(sessions.map((s: any) => [s.id, s]));

      const enrichedReviews: ReviewItem[] = reviewSchedules.map((review: any) => {
        const session = sessionMap.get(review.session_id) as any;
        const now = new Date();
        const nextReviewDate = new Date(review.next_review_at);
        const daysUntil = Math.ceil((nextReviewDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        return {
          id: review.id,
          sessionId: review.session_id,
          subject: session?.subject || 'math',
          conceptTags: session?.concept_tags ?? null,
          difficultyRating: session?.difficulty_rating ?? null,
          nextReviewAt: review.next_review_at,
          reviewStage: review.review_stage,
          daysUntilDue: daysUntil,
          isOverdue: daysUntil <= 0,
        };
      });

      setReviews(enrichedReviews);
    } else {
      setReviews([]);
    }

    setLoading(false);
  };

  const filteredReviews = reviews.filter(review => {
    if (filterStatus === 'pending') return !review.isOverdue;
    if (filterStatus === 'overdue') return review.isOverdue;
    return true;
  });

  const handleCompleteReview = async (reviewId: string) => {
    // 更新为下一阶段
    const { data: currentReview, error: fetchError } = await supabase
      .from('review_schedule')
      .select('*')
      .eq('id', reviewId)
      .single();

    if (fetchError || !currentReview) {
      console.error('Failed to fetch review:', fetchError);
      return;
    }

    const reviewSchedule = (currentReview as any);

    // 计算下一阶段
    const nextStage = Math.min(reviewSchedule.review_stage + 1, 4);
    const currentDate = new Date(reviewSchedule.next_review_at);
    const nextDays = REVIEW_STAGES.find(s => s.stage === nextStage)?.days || 30;
    currentDate.setDate(currentDate.getDate() + nextDays);

    // 更新
    const { error: updateError } = await supabase
      .from('review_schedule')
      .update({
        review_stage: nextStage,
        next_review_at: currentDate.toISOString(),
      })
      .eq('id', reviewId);

    if (updateError) {
      console.error('Failed to complete review:', updateError);
      return;
    }

    // 重新加载列表
    await loadReviews();
  };

  const getSubjectIcon = (subject: string) => {
    switch (subject) {
      case 'math': return '📐';
      case 'physics': return '🔬';
      case 'chemistry': return '🧪';
      default: return '📚';
    }
  };

  const getDifficultyStars = (rating: number | null) => {
    if (!rating) return '—';
    return '⭐'.repeat(rating);
  };

  return (
    <div className={`min-h-screen bg-background ${profile?.theme_preference === 'junior' ? 'theme-junior' : 'theme-senior'}`}>
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold">复习中心</h1>
            {profile?.theme_preference === 'junior' && (
              <span className="text-sm text-muted-foreground">Junior</span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.history.back()}
            className="gap-2"
          >
            返回工作台
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* Filter Tabs */}
        <div className="flex gap-3 mb-6">
          <Button
            variant={filterStatus === 'all' ? 'default' : 'ghost'}
            onClick={() => setFilterStatus('all')}
            className={filterStatus === 'all' ? 'bg-primary text-primary-foreground' : ''}
          >
            全部 ({reviews.length})
          </Button>
          <Button
            variant={filterStatus === 'pending' ? 'default' : 'ghost'}
            onClick={() => setFilterStatus('pending')}
            className={filterStatus === 'pending' ? 'bg-yellow-500 text-white' : ''}
          >
            待复习 ({reviews.filter(r => !r.isOverdue).length})
          </Button>
          <Button
            variant={filterStatus === 'overdue' ? 'default' : 'ghost'}
            onClick={() => setFilterStatus('overdue')}
            className={filterStatus === 'overdue' ? 'bg-red-500 text-white' : ''}
          >
            已到期 ({reviews.filter(r => r.isOverdue).length})
          </Button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">加载复习列表...</p>
          </div>
        ) : filteredReviews.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20">
            <Calendar className="w-16 h-16 text-muted-foreground" />
            <div className="text-center">
              <p className="text-lg font-medium text-card-foreground">
                {filterStatus === 'all' && '暂无复习任务'}
                {filterStatus === 'pending' && '太棒了！没有待复习任务'}
                {filterStatus === 'overdue' && '没有过期的复习'}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                完成错题学习后，系统会自动安排复习
              </p>
            </div>
          </div>
        ) : (
          /* Review List */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredReviews.map(review => (
              <Card
                key={review.id}
                className={`
                  shadow-apple hover:shadow-apple-hover transition-apple
                  border-l-4 ${review.isOverdue ? 'border-red-200' : 'border-transparent'}
                `}
              >
                <CardContent className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className={`text-2xl ${getUrgencyColor(review.daysUntilDue)}`}>
                        {getSubjectIcon(review.subject)}
                      </span>
                      <Badge
                        variant={review.isOverdue ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {getUrgencyLabel(review.daysUntilDue)}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-muted-foreground">
                        {formatReviewDate(review.nextReviewAt)}
                      </span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>难度: {getDifficultyStars(review.difficultyRating)}</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {review.conceptTags?.slice(0, 2).map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {review.conceptTags && review.conceptTags.length > 2 && (
                        <span className="text-muted-foreground">...</span>
                      )}
                    </div>

                    <div className="text-xs text-muted-foreground">
                      {REVIEW_STAGES.find(s => s.stage === review.reviewStage)?.name}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-3 border-t border-border/50">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.location.href = `/workbench?review=${review.sessionId}`}
                      className="flex-1 btn-press"
                    >
                      开始复习
                    </Button>
                    <Button
                      size="sm"
                      variant={review.isOverdue ? 'default' : 'ghost'}
                      onClick={() => handleCompleteReview(review.id)}
                      className="flex-1 gap-2 btn-press"
                      disabled={review.isOverdue}
                    >
                      {review.isOverdue ? '已过期' : '完成'}
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Development Notice */}
      <div className="fixed bottom-4 left-0 right-0 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="mx-auto bg-card/80 backdrop-blur-xl rounded-full px-4 py-2 text-sm text-muted-foreground shadow-apple">
            🚧 复习系统正在开发中...艾宾浩斯算法即将上线
          </div>
        </div>
      </div>
    </div>
  );
}
