// =====================================================
// Project Socrates - Workbench Page (Student)
// =====================================================

'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { BookOpen, MessageSquare, Camera, X, Clock, Play, Pause, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ImageUploader } from '@/components/ImageUploader';
import { OCRResult } from '@/components/OCRResult';
import { ChatMessageList, type Message } from '@/components/ChatMessage';
import { ChatInput } from '@/components/ChatInput';

type Step = 'upload' | 'ocr' | 'chat';

export default function WorkbenchPage() {
  const { profile } = useAuth();

  console.log('WorkbenchPage rendered, profile:', profile);

  const [currentStep, setCurrentStep] = useState<Step>('upload');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [ocrText, setOcrText] = useState('');

  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatSessionRef = useRef<string>(`session_${Date.now()}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Study session tracking
  const [isStudying, setIsStudying] = useState(false);
  const [studySessionId, setStudySessionId] = useState<string | null>(null);
  const [studyDuration, setStudyDuration] = useState(0);
  const studyTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Start study session when component mounts
  useEffect(() => {
    startStudySession();

    // Set up heartbeat interval
    const heartbeatInterval = setInterval(() => {
      if (isStudying && studySessionId) {
        sendHeartbeat();
      }
    }, 30000); // Every 30 seconds

    // Set up duration update interval
    studyTimerRef.current = setInterval(() => {
      if (isStudying) {
        setStudyDuration(prev => prev + 1);
      }
    }, 1000); // Update every second

    // Cleanup on unmount
    return () => {
      clearInterval(heartbeatInterval);
      if (studyTimerRef.current) {
        clearInterval(studyTimerRef.current);
      }
      endStudySession();
    };
  }, []);

  // Start a new study session
  const startStudySession = async () => {
    if (!profile?.id) return;

    try {
      const response = await fetch('/api/study/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-action': 'start',
        },
        body: JSON.stringify({
          student_id: profile.id,
          session_type: 'error_analysis',
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setStudySessionId(result.data.session_id);
        setIsStudying(true);
        setStudyDuration(0);
      }
    } catch (error) {
      console.error('Failed to start study session:', error);
    }
  };

  // End the current study session
  const endStudySession = async () => {
    if (!studySessionId) return;

    try {
      const response = await fetch('/api/study/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-action': 'end',
        },
        body: JSON.stringify({
          student_id: profile?.id,
          session_id: studySessionId,
        }),
      });

      if (response.ok) {
        setIsStudying(false);
        setStudySessionId(null);
      }
    } catch (error) {
      console.error('Failed to end study session:', error);
    }
  };

  // Send heartbeat to keep session alive
  const sendHeartbeat = async () => {
    if (!studySessionId) return;

    try {
      await fetch('/api/study/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-action': 'heartbeat',
        },
        body: JSON.stringify({
          student_id: profile?.id,
          session_id: studySessionId,
        }),
      });
    } catch (error) {
      console.error('Failed to send heartbeat:', error);
    }
  };

  // Toggle study session (pause/resume)
  const toggleStudySession = async () => {
    if (isStudying) {
      await endStudySession();
    } else {
      await startStudySession();
    }
  };

  // Format duration display
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const handleImageSelect = (file: File, preview: string) => {
    setSelectedImage(file);
    setImagePreview(preview);
    setCurrentStep('ocr');
  };

  const handleOCRComplete = async (text: string) => {
    setOcrText(text);
    // OCR 完成后，先切换到聊天界面
    setCurrentStep('chat');

    // 创建错题会话到数据库
    // 检查 profile 是否存在
    if (!profile?.id) {
      console.error('No profile ID, cannot save error session');
      // 不中断流程，继续到聊天界面
      return;
    }

    // 异步保存错题会话，不阻塞 UI
    saveErrorSession(text);
  };

  const saveErrorSession = async (text: string) => {
    try {
      console.log('Creating error session with profile ID:', profile.id);
      const response = await fetch('/api/error-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: profile.id,
          subject: 'math', // 默认数学，后续可以扩展
          original_image_url: imagePreview || null,
          extracted_text: text,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        // 保存 session_id 用于后续对话记录
        chatSessionRef.current = result.data.session_id;
        console.log('Error session created successfully:', result.data.session_id);
      } else {
        const errorText = await response.text();
        console.error('Failed to create error session. Response:', errorText);
      }
    } catch (error) {
      console.error('Exception creating error session:', error);
    }
  };

  const handleImageRemove = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setOcrText('');
    setCurrentStep('upload');
    // Clear chat when image is removed
    setMessages([]);
    chatSessionRef.current = `session_${Date.now()}`;
  };

  // Chat functions
  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsChatLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          session_id: chatSessionRef.current,
          theme: profile?.theme_preference || 'junior',
          subject: 'math',
          questionContent: ocrText,
        }),
      });

      const data = await response.json();

      if (data.content) {
        const assistantMessage: Message = {
          id: `msg_${Date.now()}_assistant`,
          role: 'assistant',
          content: data.content,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else if (data.error) {
        const errorMessage: Message = {
          id: `msg_${Date.now()}_error`,
          role: 'assistant',
          content: '抱歉，我遇到了一些问题。请稍后再试。',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      const errorMessage: Message = {
        id: `msg_${Date.now()}_error`,
        role: 'assistant',
        content: '网络连接失败，请检查你的网络设置。',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([]);
    chatSessionRef.current = `session_${Date.now()}`;
  };

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const themeClass = profile?.theme_preference === 'junior' ? 'theme-junior' : 'theme-senior';

  return (
    <div className={`min-h-screen bg-background ${themeClass}`}>
      {/* Study Session Toolbar - below global nav */}
      <div className="border-b border-border/50 bg-card/30 backdrop-blur-sm px-6 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {profile?.theme_preference === 'junior' ? 'Jasper' : 'Logic'} AI
            </span>
            {profile?.theme_preference && (
              <span className="text-xs text-muted-foreground">
                · {profile.theme_preference === 'junior' ? '小学版' : '中学版'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Study Session Timer */}
            {isStudying && (
              <Badge className="bg-green-100 text-green-700 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" />
                <span className="text-xs">学习中</span>
                <span className="text-xs font-medium">{formatDuration(studyDuration)}</span>
              </Badge>
            )}
            {!isStudying && (
              <Badge className="bg-muted text-muted-foreground flex items-center gap-1">
                <span className="text-xs">未开始</span>
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleStudySession}
              className="h-7 gap-1 text-xs"
            >
              {isStudying ? (
                <>
                  <Pause className="w-3 h-3" />
                  暂停
                </>
              ) : (
                <>
                  <Play className="w-3 h-3" />
                  开始
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-6" style={{ minHeight: 'calc(100vh - 64px)' }}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left Panel - 40% */}
          <div className="lg:col-span-2 space-y-4">
            {/* Image Upload */}
            <ImageUploader
              onImageSelect={handleImageSelect}
              onImageRemove={handleImageRemove}
              currentImage={imagePreview}
              maxSize={10}
            />

            {/* OCR Result */}
            {selectedImage && (
              <OCRResult
                initialText={ocrText}
                onTextChange={setOcrText}
                onConfirm={handleOCRComplete}
                imageData={imagePreview}
              />
            )}
          </div>

          {/* Right Panel - 60% */}
          <div className="lg:col-span-3 bg-card rounded-2xl shadow-apple flex flex-col">
            <div className="flex-1 p-6">
              {currentStep === 'upload' && (
                <div className="h-full flex items-center justify-center text-center">
                  <Camera className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold text-card-foreground">
                    {profile?.theme_preference === 'junior' ? '上传错题开始学习 🌟' : '上传错题开始学习'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {profile?.theme_preference === 'junior'
                      ? 'Jasper 会帮你理解问题，而不是直接给答案'
                      : 'Logic 会引导你通过推理找到答案'}
                  </p>
                </div>
              )}

              {currentStep === 'ocr' && (
                <div className="h-full flex items-center justify-center text-center">
                  <div className="animate-pulse w-12 h-12 rounded-full border-4 border-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-card-foreground">
                    正在分析你的错题...
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    请稍候
                  </p>
                </div>
              )}

              {currentStep === 'chat' && (
                <div className="h-full flex flex-col">
                  {/* Chat Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                        <span className="text-lg">
                          {profile?.theme_preference === 'junior' ? 'J' : 'L'}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {profile?.theme_preference === 'junior' ? 'Jasper' : 'Logic'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          AI 学习导师
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleResetChat}
                      className="gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      重新开始
                    </Button>
                  </div>

                  {/* OCR Context */}
                  {ocrText && (
                    <div className="p-3 rounded-lg bg-muted/30 mb-4">
                      <p className="text-xs text-muted-foreground mb-1">题目内容：</p>
                      <p className="text-sm line-clamp-3">{ocrText}</p>
                    </div>
                  )}

                  {/* Messages */}
                  <div className="flex-1 overflow-auto">
                    <ChatMessageList
                      messages={messages}
                      theme={profile?.theme_preference || 'junior'}
                      isLoading={isChatLoading}
                    />
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <div className="pt-4 border-t border-border/50">
                    <ChatInput
                      onSend={handleSendMessage}
                      isLoading={isChatLoading}
                      placeholder={
                        profile?.theme_preference === 'junior'
                          ? '告诉我你的想法...'
                          : '描述你的问题或思路...'
                      }
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Development Notice */}
      <div className="fixed bottom-4 left-0 right-0 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="mx-auto bg-card/80 backdrop-blur-xl rounded-full px-4 py-2 text-sm text-muted-foreground shadow-apple">
            🚧 工作台正在开发中...更多功能即将上线
          </div>
        </div>
      </div>
    </div>
  );
}
