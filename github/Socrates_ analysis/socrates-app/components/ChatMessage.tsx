'use client';

import { User, Bot } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
  theme?: 'junior' | 'senior';
}

export function ChatMessage({ message, theme = 'junior' }: ChatMessageProps) {
  if (message.role === 'system') return null;

  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`
        w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
        ${isUser ? 'bg-primary/20' : 'bg-primary'}
      `}>
        {isUser ? (
          <User className="w-4 h-4 text-primary" />
        ) : (
          <span className="text-sm">
            {theme === 'junior' ? '🤖' : 'AI'}
          </span>
        )}
      </div>

      {/* Message Content */}
      <Card className={`
        max-w-[80%] shadow-apple
        ${isUser ? 'bg-primary text-primary-foreground' : ''}
      `}>
        <CardContent className="p-3">
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          <p className={`
            text-xs mt-1 opacity-70
            ${isUser ? 'text-primary-foreground/70' : 'text-muted-foreground'}
          `}>
            {new Date(message.timestamp).toLocaleTimeString('zh-CN', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

interface ChatMessageListProps {
  messages: Message[];
  theme?: 'junior' | 'senior';
  isLoading?: boolean;
}

export function ChatMessageList({ messages, theme = 'junior', isLoading }: ChatMessageListProps) {
  return (
    <div className="space-y-4">
      {messages.length === 0 ? (
        <div className="text-center py-8">
          <Bot className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {theme === 'junior' ? '开始你的学习之旅吧！🌟' : '准备好开始学习了吗？'}
          </p>
        </div>
      ) : (
        messages.map((message) => (
          <ChatMessage key={message.id} message={message} theme={theme} />
        ))
      )}

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <span className="text-sm">{theme === 'junior' ? '🤖' : 'AI'}</span>
          </div>
          <Card className="shadow-apple">
            <CardContent className="p-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
