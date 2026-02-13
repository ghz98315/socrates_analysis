// =====================================================
// Project Socrates - Study Session API (Mock)
// =====================================================

import { NextResponse, type NextRequest } from 'next/server';

// 内存存储模拟数据库
interface StudySession {
  id: string;
  student_id: string;
  session_type: 'error_analysis' | 'review';
  start_time: string;
  end_time: string | null;
  last_heartbeat: string;
  duration_seconds: number | null;
}

const sessionsStore = new Map<string, StudySession>();

// 生成唯一ID
function generateId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// POST endpoint - 管理学习会话 (开始/结束/心跳)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const student_id = body.student_id as string;
    const session_id = body.session_id as string | undefined;
    const session_type = body.session_type as 'error_analysis' | 'review' | undefined;

    // 从header获取action，默认为start
    const action = req.headers.get('x-action') || 'start';
    const now = new Date().toISOString();

    switch (action) {
      case 'start': {
        // 开始新的学习会话
        const newSession: StudySession = {
          id: generateId(),
          student_id,
          session_type: session_type || 'error_analysis',
          start_time: now,
          end_time: null,
          last_heartbeat: now,
          duration_seconds: null,
        };

        sessionsStore.set(newSession.id, newSession);

        return NextResponse.json({
          data: { session_id: newSession.id },
          message: 'Study session started',
        });
      }

      case 'end': {
        // 结束学习会话
        const end_time = now;

        // 如果提供了session_id，直接结束该会话
        if (session_id) {
          const session = sessionsStore.get(session_id);
          if (!session) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
          }

          const duration = Math.floor(
            (new Date(end_time).getTime() - new Date(session.start_time).getTime()) / 1000
          );

          session.end_time = end_time;
          session.duration_seconds = duration;
          sessionsStore.set(session_id, session);

          return NextResponse.json({
            data: { session_id: session.id, duration_seconds: duration },
            message: 'Study session ended',
          });
        }

        // 否则查找该学生的活跃会话
        let activeSession: StudySession | null = null;
        for (const session of sessionsStore.values()) {
          if (session.student_id === student_id && !session.end_time) {
            activeSession = session;
            break;
          }
        }

        if (!activeSession) {
          return NextResponse.json({ error: 'No active session found' }, { status: 404 });
        }

        const duration = Math.floor(
          (new Date(end_time).getTime() - new Date(activeSession.start_time).getTime()) / 1000
        );

        activeSession.end_time = end_time;
        activeSession.duration_seconds = duration;
        sessionsStore.set(activeSession.id, activeSession);

        return NextResponse.json({
          data: { session_id: activeSession.id, duration_seconds: duration },
          message: 'Study session ended',
        });
      }

      case 'heartbeat': {
        // 心跳保持会话活跃
        if (!session_id) {
          return NextResponse.json({ error: 'session_id is required for heartbeat' }, { status: 400 });
        }

        const session = sessionsStore.get(session_id);
        if (!session) {
          return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }

        session.last_heartbeat = now;
        sessionsStore.set(session_id, session);

        return NextResponse.json({
          data: { session_id: session.id },
          message: 'Heartbeat recorded',
        });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Study session API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET endpoint - 获取学习时长统计
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const student_id = searchParams.get('student_id');
    const start_date = searchParams.get('start_date');
    const end_date = searchParams.get('end_date');

    if (!student_id) {
      return NextResponse.json({ error: 'student_id is required' }, { status: 400 });
    }

    // 获取该学生的所有会话
    const studentSessions: StudySession[] = [];
    for (const session of sessionsStore.values()) {
      if (session.student_id === student_id) {
        // 日期过滤
        const sessionDate = new Date(session.start_time);
        let include = true;

        if (start_date) {
          include = include && sessionDate >= new Date(start_date);
        }
        if (end_date) {
          include = include && sessionDate <= new Date(end_date);
        }

        if (include) {
          studentSessions.push(session);
        }
      }
    }

    // Helper function to check if a session is from today
    const isToday = (session: StudySession): boolean => {
      const sessionDate = new Date(session.start_time);
      const today = new Date();
      return sessionDate.toDateString() === today.toDateString();
    };

    // 计算统计
    const totalSessions = studentSessions.length;
    const totalDurationSeconds = studentSessions.reduce(
      (sum, s) => sum + (s.duration_seconds || 0),
      0
    );
    const todaySessionsList = studentSessions.filter(isToday);
    const todayDurationSeconds = todaySessionsList.reduce(
      (sum, s) => sum + (s.duration_seconds || 0),
      0
    );

    const stats = {
      total_sessions: totalSessions,
      total_duration_minutes: Math.round(totalDurationSeconds / 60),
      today_sessions: todaySessionsList.length,
      today_duration_minutes: Math.round(todayDurationSeconds / 60),
    };

    return NextResponse.json({
      data: stats,
    });
  } catch (error) {
    console.error('Study stats API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
