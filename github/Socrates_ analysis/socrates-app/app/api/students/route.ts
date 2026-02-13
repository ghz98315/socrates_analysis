// =====================================================
// Project Socrates - Students List API
// =====================================================

import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 创建 Supabase 服务端客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET endpoint - 获取学生列表
export async function GET(req: NextRequest) {
  try {
    const { data: students, error } = await supabase
      .from('profiles')
      .select('id, display_name, grade_level, avatar_url')
      .eq('role', 'student')
      .order('display_name', { ascending: true });

    if (error) {
      console.error('Error fetching students:', error);
      return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
    }

    return NextResponse.json({
      data: students || [],
    });
  } catch (error) {
    console.error('Students API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
