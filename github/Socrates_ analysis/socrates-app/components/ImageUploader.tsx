'use client';

import { useRef, useState, useCallback } from 'react';
import { Camera, Upload, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ImageUploaderProps {
  onImageSelect: (file: File, preview: string) => void;
  onImageRemove: () => void;
  currentImage?: string | null;
  maxSize?: number; // MB
  accept?: string;
}

export function ImageUploader({
  onImageSelect,
  onImageRemove,
  currentImage,
  maxSize = 10,
  accept = 'image/jpeg,image/png,image/webp'
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string>('');

  // 验证文件
  const validateFile = useCallback((file: File): string | null => {
    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      return '请上传图片文件';
    }

    // 检查文件大小
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      return `图片大小不能超过 ${maxSize}MB`;
    }

    // 检查具体格式
    const allowedTypes = accept.split(',');
    if (!allowedTypes.includes(file.type)) {
      return '只支持 JPG、PNG、WebP 格式';
    }

    return null;
  }, [maxSize, accept]);

  const handleFileSelect = useCallback((file: File) => {
    setError('');

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    // 读取文件并生成预览
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPreview(result);
      onImageSelect(file, result);
    };
    reader.onerror = () => {
      setError('图片读取失败，请重试');
    };
    reader.readAsDataURL(file);
  }, [validateFile, onImageSelect]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragIn = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragOut = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError('');

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setError('');
    onImageRemove();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    setError('');
    fileInputRef.current?.click();
  };

  return (
    <Card className="shadow-apple overflow-hidden">
      <CardContent className="p-0">
        {preview ? (
          <div className="relative group">
            <img
              src={preview}
              alt="上传的题目"
              className="w-full h-64 object-cover"
            />
            {/* 悬停遮罩 */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button
                size="icon"
                variant="destructive"
                className="rounded-full"
                onClick={handleRemove}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            {/* 移动端始终显示删除按钮 */}
            <Button
              size="icon"
              variant="destructive"
              className="absolute top-2 right-2 rounded-full md:hidden"
              onClick={handleRemove}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div
            className={`
              h-64 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all
              ${dragActive ? 'border-primary bg-primary/10 scale-105' : 'border-border hover:border-primary/50 hover:bg-muted/30'}
              ${error ? 'border-destructive bg-destructive/5' : ''}
            `}
            onClick={handleClick}
            onDragEnter={handleDragIn}
            onDragLeave={handleDragOut}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              className="hidden"
              onChange={handleFileChange}
            />
            {dragActive ? (
              <>
                <Upload className="w-12 h-12 text-primary mb-3 animate-bounce" />
                <p className="text-sm font-medium text-primary">
                  松开鼠标上传图片
                </p>
              </>
            ) : (
              <>
                <Camera className="w-12 h-12 text-muted-foreground mb-3" />
                <p className="text-sm font-medium text-card-foreground mb-1">
                  点击拍照或上传图片
                </p>
                <p className="text-xs text-muted-foreground">
                  支持 JPG、PNG、WebP，最大 {maxSize}MB
                </p>
              </>
            )}
          </div>
        )}

        {/* 错误提示 */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
