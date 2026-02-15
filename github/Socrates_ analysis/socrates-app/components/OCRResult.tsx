'use client';

import { useState, useEffect, useRef } from 'react';
import { Loader2, Check, RefreshCw, AlertCircle, Sparkles, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

// Base64 conversion utility function
function getBase64FromDataURL(dataUrl: string): string {
  if (dataUrl.startsWith('data:')) {
    return dataUrl.split(',')[1];
  }
  return dataUrl;
}

interface OCRResultProps {
  initialText: string;
  onTextChange: (text: string) => void;
  onConfirm: (text: string) => void;
  imageData?: string | null;
}

const OCR_API_URL = 'http://localhost:8000/ocr-base64';
const OCR_TIMEOUT = 30000; // 30秒超时

// Fix encoding for Chinese characters
const fixChineseEncoding = (text: string): string => {
  if (!text) return '';
  try {
    return decodeURIComponent(escape(text));
  } catch {
    return text;
  }
};

export function OCRResult({ initialText, onTextChange, onConfirm, imageData }: OCRResultProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [text, setText] = useState(initialText);
  const [error, setError] = useState<string>('');
  const [ocrMethod, setOcrMethod] = useState<'paddle' | 'tesseract' | null>(null);
  const [paddleAvailable, setPaddleAvailable] = useState<boolean | null>(null);
  const cancelRef = useRef<boolean>(false);

  useEffect(() => {
    setText(initialText);
  }, [initialText]);

  // 检查 PaddleOCR 服务是否可用
  useEffect(() => {
    const checkPaddleOCR = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);

        const response = await fetch('http://localhost:8000/health', {
          method: 'GET',
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        setPaddleAvailable(response.ok);
      } catch {
        setPaddleAvailable(false);
      }
    };
    checkPaddleOCR();
  }, []);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    onTextChange(e.target.value);
    setError('');
  };

  const updateProgress = (value: number, statusText?: string) => {
    if (cancelRef.current) return;
    setProgress(value);
    if (statusText) setStatus(statusText);
  };

  const handleReOCR = async () => {
    if (!imageData) {
      setError('没有可用的图片数据');
      return;
    }

    cancelRef.current = false;
    setIsProcessing(true);
    setProgress(0);
    setStatus('准备识别...');
    setError('');
    setOcrMethod(null);

    try {
      // 先尝试 PaddleOCR
      if (paddleAvailable !== false) {
        updateProgress(5, '连接 PaddleOCR 服务...');
        setOcrMethod('paddle');

        const base64Image = getBase64FromDataURL(imageData);

        // 使用 AbortController 实现超时
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), OCR_TIMEOUT);

        try {
          const response = await fetch(OCR_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: base64Image }),
            signal: controller.signal,
          });
          clearTimeout(timeoutId);

          if (cancelRef.current) return;

          updateProgress(50, '处理图片中...');

          if (!response.ok) {
            throw new Error(`OCR服务错误: ${response.status}`);
          }

          const result = await response.json();
          updateProgress(90, '解析结果...');

          if (result.success && result.text) {
            const fixedText = fixChineseEncoding(result.text);
            setText(fixedText);
            onTextChange(fixedText);
            updateProgress(100, '识别完成!');
            setPaddleAvailable(true);
            return; // 成功，直接返回
          } else {
            throw new Error('未识别到文字');
          }
        } catch (err: any) {
          clearTimeout(timeoutId);
          if (cancelRef.current) return;

          // PaddleOCR 失败，回退到 Tesseract
          console.log('PaddleOCR failed, falling back to Tesseract:', err.message);
          setPaddleAvailable(false);
        }
      }

      // 回退到 Tesseract.js
      updateProgress(10, '加载 Tesseract.js...');
      setOcrMethod('tesseract');
      await fallbackOCR();

    } catch (err: any) {
      if (cancelRef.current) return;
      setError(err.message || 'OCR识别失败，请重试');
      console.error('OCR Error:', err);
    } finally {
      if (!cancelRef.current) {
        setIsProcessing(false);
        setTimeout(() => {
          setProgress(0);
          setStatus('');
        }, 2000);
      }
    }
  };

  const fallbackOCR = async () => {
    try {
      updateProgress(15, '加载 Tesseract 引擎...');

      // 动态导入 Tesseract
      const Tesseract = await import('tesseract.js');

      if (cancelRef.current) return;
      updateProgress(25, '初始化中文识别模型...');

      // 创建 worker 并识别
      const result = await Tesseract.recognize(
        imageData!,
        'chi_sim+eng',
        {
          logger: (m: any) => {
            if (cancelRef.current) return;

            if (m.status === 'loading tesseract core') {
              updateProgress(30, '加载 Tesseract 核心...');
            } else if (m.status === 'initializing tesseract') {
              updateProgress(35, '初始化 Tesseract...');
            } else if (m.status === 'loading language traineddata') {
              updateProgress(40, '加载中文语言包(首次较慢)...');
            } else if (m.status === 'initializing api') {
              updateProgress(50, '准备识别...');
            } else if (m.status === 'recognizing text') {
              const p = Math.round(50 + m.progress * 45);
              updateProgress(p, `识别中... ${Math.round(m.progress * 100)}%`);
            }
          },
        }
      );

      if (cancelRef.current) return;

      const recognizedText = result.data.text.trim();
      updateProgress(95, '处理结果...');

      if (recognizedText) {
        setText(recognizedText);
        onTextChange(recognizedText);
        updateProgress(100, '识别完成!');
      } else {
        setError('未识别到文字，请确保图片清晰且包含文字');
        setProgress(0);
        setStatus('');
      }
    } catch (err: any) {
      setError(err.message || 'Tesseract识别失败');
      console.error('Fallback OCR Error:', err);
      throw err;
    }
  };

  const handleCancel = () => {
    cancelRef.current = true;
    setIsProcessing(false);
    setProgress(0);
    setStatus('');
    setOcrMethod(null);
  };

  // Auto-execute OCR when image is uploaded
  useEffect(() => {
    if (imageData && !initialText && !isProcessing) {
      handleReOCR();
    }
  }, [imageData]);

  return (
    <Card className={cn(
      "border-border/50 transition-all duration-300",
      isProcessing && "border-primary/30 shadow-lg shadow-primary/5"
    )}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            题目识别
          </h3>
          <div className="flex items-center gap-2">
            {paddleAvailable === true && (
              <span className="text-xs px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                <Zap className="w-3 h-3" />
                PaddleOCR
              </span>
            )}
            {paddleAvailable === false && (
              <span className="text-xs px-2 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 font-medium">
                Tesseract
              </span>
            )}
            {paddleAvailable === null && (
              <span className="text-xs text-muted-foreground">检测服务中...</span>
            )}
          </div>
        </div>

        {isProcessing ? (
          <div className="space-y-3">
            <div className="relative">
              <Progress value={progress} className="h-2.5" />
              {progress > 0 && (
                <span className="absolute right-0 top-4 text-xs text-muted-foreground">
                  {progress}%
                </span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                {status}
              </p>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCancel}
                className="text-muted-foreground hover:text-foreground"
              >
                取消
              </Button>
            </div>

            {ocrMethod === 'tesseract' && progress < 50 && (
              <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded-lg">
                首次使用 Tesseract 需要下载中文语言包，可能需要1-2分钟。
                <br />
                如需更快的识别速度，请启动本地 PaddleOCR 服务。
              </p>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-3">
              <textarea
                value={text}
                onChange={handleTextChange}
                placeholder="上传图片后，AI将自动识别题目内容..."
                className={cn(
                  "w-full h-32 rounded-xl border bg-transparent px-4 py-3 text-sm resize-none",
                  "transition-all duration-200",
                  "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50",
                  "placeholder:text-muted-foreground/60"
                )}
              />
            </div>

            <div className="flex gap-2 mt-4">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 gap-2"
                onClick={handleReOCR}
                disabled={isProcessing || !imageData}
              >
                <RefreshCw className="w-4 h-4" />
                重新识别
              </Button>
              <Button
                size="sm"
                className="flex-1 gap-2"
                onClick={() => onConfirm(text)}
                disabled={!text || isProcessing}
              >
                <Check className="w-4 h-4" />
                确认并开始学习
              </Button>
            </div>
          </>
        )}

        {error && (
          <div className="mt-3 text-sm text-destructive flex items-center gap-2 p-3 bg-destructive/10 rounded-lg">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
