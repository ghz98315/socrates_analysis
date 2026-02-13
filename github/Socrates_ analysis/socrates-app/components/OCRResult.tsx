'use client';

import { useState, useEffect } from 'react';
import { Loader2, Check, AlertCircle, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface OCRResultProps {
  initialText: string;
  onTextChange: (text: string) => void;
  onConfirm: () => void;
  imageData?: string | null;
}

// OCR backend service URL
const OCR_API_URL = 'http://localhost:8000/ocr-base64';

export function OCRResult({ initialText, onTextChange, onConfirm, imageData }: OCRResultProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [text, setText] = useState(initialText);
  const [error, setError] = useState<string>('');
  const [usingPaddleOCR, setUsingPaddleOCR] = useState(true);

  useEffect(() => {
    setText(initialText);
  }, [initialText]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    onTextChange(e.target.value);
    setError('');
  };

  // Convert dataURL to base64 format
  const getBase64FromDataURL = (dataUrl: string): string => {
    if (dataUrl.startsWith('data:')) {
      return dataUrl.split(',')[1];
    }
    return dataUrl;
  };

  const handleReOCR = async () => {
    if (!imageData) {
      setError('No image data available');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setStatus('Preparing recognition...');
    setError('');

    try {
      setProgress(10);
      setStatus('Connecting to OCR service...');

      const base64Image = getBase64FromDataURL(imageData);
      setProgress(20);

      const response = await fetch(OCR_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64Image,
        }),
      });

      setProgress(50);

      if (!response.ok) {
        throw new Error(`OCR service error: ${response.status}`);
      }

      const result = await response.json();
      setProgress(80);
      setStatus('Processing recognition results...');

      if (result.success && result.text) {
        setText(result.text);
        onTextChange(result.text);
        setProgress(100);
        setStatus('Recognition complete!');
      } else {
        setError('No text recognized, please ensure the image is clear and contains text');
      }
    } catch (err: any) {
      if (err.message?.includes('fetch') || err.message?.includes('connect') || err.code === 'ECONNREFUSED') {
        setUsingPaddleOCR(false);
        setStatus('PaddleOCR service not available, using fallback...');
        await fallbackOCR();
      } else {
        setError(err.message || 'OCR recognition failed, please try again');
        console.error('OCR Error:', err);
      }
    } finally {
      setIsProcessing(false);
      setTimeout(() => {
        setProgress(0);
        setStatus('');
      }, 2000);
    }
  };

  // Fallback OCR solution: Tesseract.js
  const fallbackOCR = async () => {
    try {
      setStatus('Loading Tesseract.js...');
      const Tesseract = await import('tesseract.js');
      setProgress(30);

      setStatus('Recognizing...');
      const result = await Tesseract.recognize(
        imageData!,
        'chi_sim+eng',
        {
          logger: (m: any) => {
            if (m.status === 'recognizing text') {
              const p = Math.round(m.progress * 50) + 30;
              setProgress(p);
              setStatus(`Recognizing... ${Math.round(m.progress * 100)}%`);
            }
          },
        }
      );

      const recognizedText = result.data.text.trim();

      if (recognizedText) {
        setText(recognizedText);
        onTextChange(recognizedText);
        setProgress(100);
        setStatus('Recognition complete (using fallback)');
      } else {
        setError('No text recognized, please ensure the image is clear and contains text');
      }
    } catch (err: any) {
      setError(err.message || 'OCR recognition failed, please try again');
      console.error('Fallback OCR Error:', err);
    }
  };

  // Auto-execute OCR when image is uploaded
  useEffect(() => {
    if (imageData && !initialText && !isProcessing) {
      handleReOCR();
    }
  }, [imageData]);

  return (
    <Card className="shadow-apple">
      <CardContent className="p-4">
        <h3 className="text-sm font-medium mb-3 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-purple-500" />
            原题目内容
            {usingPaddleOCR && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 font-medium">
                PaddleOCR
              </span>
            )}
          </span>
          {isProcessing && (
            <span className="text-xs text-muted-foreground">{status}</span>
          )}
        </h3>

        {isProcessing && (
          <div className="mb-3">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1 text-center">
              {progress > 0 && `Progress: ${progress}%`}
            </p>
          </div>
        )}

        {isProcessing ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground mb-2" />
            <span className="text-sm text-muted-foreground">{status || 'Recognizing...'}</span>
            <p className="text-xs text-muted-foreground mt-1">
              {usingPaddleOCR ? 'Using PaddleOCR high-accuracy recognition' : 'Using Tesseract.js fallback'}
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              <textarea
                value={text}
                onChange={handleTextChange}
                placeholder="Click upload image above, AI will automatically recognize the question content...

You can also directly input or paste the question content"
                className="w-full h-32 rounded-xl border border-input bg-transparent px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={handleReOCR}
                disabled={isProcessing || !imageData}
              >
                Re-recognize
              </Button>
              <Button
                size="sm"
                className="flex-1 gap-2"
                onClick={() => onConfirm(text)}
                disabled={!text || isProcessing}
              >
                <Check className="w-4 h-4" />
                Confirm & Start Learning
              </Button>
            </div>

            {error && (
              <div className="mt-2 text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {error}
              </div>
            )}

            {!error && !text && !isProcessing && (
              <p className="mt-2 text-xs text-muted-foreground text-center">
                Upload an image containing text, AI will automatically recognize the content<br />
                Recognition results can be manually edited and corrected
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
