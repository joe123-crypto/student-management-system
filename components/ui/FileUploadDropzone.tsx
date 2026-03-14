import React, { useRef, useState } from 'react';
import { cn } from './cn';

interface FileUploadDropzoneProps {
  value?: string;
  onChange: (base64: string) => void;
  onClear?: () => void;
  accept?: string;
  className?: string;
  emptyTitle?: string;
  emptySubtitle?: string;
  uploadedLabel?: string;
}

export default function FileUploadDropzone({
  value,
  onChange,
  onClear,
  accept = '.pdf,image/*',
  className,
  emptyTitle = 'Drop file here',
  emptySubtitle = 'Or click to browse',
  uploadedLabel = 'Document Uploaded',
}: FileUploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const readFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        onChange(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      readFile(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      readFile(file);
    }
  };

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(event) => {
        event.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={handleDrop}
      className={cn(
        'flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-[2rem] border-2 border-dashed transition-all',
        value
          ? 'theme-success border-[color:var(--theme-primary)]'
          : dragActive
            ? 'border-[color:var(--theme-primary-soft)] bg-[rgba(245,130,74,0.12)]'
            : 'theme-card-muted border hover:border-[color:var(--theme-primary-soft)]',
        className,
      )}
    >
      {value ? (
        <div className="flex flex-col items-center gap-2">
          <svg className="h-12 w-12 text-[color:var(--theme-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-bold uppercase tracking-widest text-[color:var(--theme-primary)]">{uploadedLabel}</span>
          {onClear && (
            <button
              onClick={(event) => {
                event.stopPropagation();
                onClear();
              }}
              className="mt-2 text-[10px] font-black uppercase text-[color:var(--theme-text-muted)] hover:text-[color:var(--theme-danger)]"
            >
              Replace
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="theme-card mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border">
            <svg className="h-6 w-6 text-[color:var(--theme-primary-soft)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <span className="theme-heading text-sm font-bold">{emptyTitle}</span>
          <span className="theme-text-muted mt-1 text-xs font-medium">{emptySubtitle}</span>
        </>
      )}
      <input type="file" ref={inputRef} className="hidden" accept={accept} onChange={handleInput} />
    </div>
  );
}
