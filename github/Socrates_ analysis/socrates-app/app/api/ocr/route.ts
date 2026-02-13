// =====================================================
// Project Socrates - OCR API (简化版 - 仅用于配置查询)
// =====================================================

import { NextResponse } from 'next/server';

// POST endpoint - OCR（客户端处理，此端点仅用于兼容）
export async function POST() {
  return NextResponse.json({
    success: false,
    error: 'OCR 已改为客户端处理，请刷新页面重试',
  });
}

// GET endpoint - 获取 OCR 配置状态
export async function GET() {
  return NextResponse.json({
    config: {
      provider: 'client-side',
      method: 'tesseract.js',
      languages: ['chi_sim', 'eng'],
      description: 'OCR 在浏览器中直接运行，无需服务器处理',
    },
  });
}
