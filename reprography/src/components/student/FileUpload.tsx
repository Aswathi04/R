'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn, validateFile, formatFileSize, ALLOWED_FILE_TYPES } from '@/lib/utils';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onClear: () => void;
  disabled?: boolean;
}

export function FileUpload({ onFileSelect, selectedFile, onClear, disabled }: FileUploadProps) {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    const validation = validateFile(file);
    
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      return;
    }
    
    onFileSelect(file);
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxFiles: 1,
    disabled
  });

  const getFileIcon = (type: string) => {
    if (type === 'application/pdf') {
      return <File className="h-10 w-10 text-red-500" />;
    }
    return <File className="h-10 w-10 text-blue-500" />;
  };

  if (selectedFile) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getFileIcon(selectedFile.type)}
            <div>
              <p className="font-medium truncate max-w-[200px] sm:max-w-[300px]">
                {selectedFile.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClear}
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
          isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <input {...getInputProps()} />
        <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
        {isDragActive ? (
          <p className="text-primary font-medium">Drop the file here...</p>
        ) : (
          <>
            <p className="font-medium mb-1">Drag & drop your file here</p>
            <p className="text-sm text-muted-foreground mb-2">or click to browse</p>
            <p className="text-xs text-muted-foreground">
              Supported: PDF, JPG, PNG (Max 10MB)
            </p>
          </>
        )}
      </div>
      
      {error && (
        <div className="flex items-center gap-2 mt-3 text-destructive text-sm">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
    </div>
  );
}
