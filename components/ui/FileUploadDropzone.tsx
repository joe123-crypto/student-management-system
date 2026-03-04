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
        'w-full h-48 border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center cursor-pointer transition-all',
        value
          ? 'border-emerald-200 bg-emerald-50/30'
          : dragActive
            ? 'border-indigo-300 bg-indigo-50/40'
            : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-indigo-200',
        className,
      )}
    >
      {value ? (
        <div className="flex flex-col items-center gap-2">
          <svg className="w-12 h-12 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-bold text-emerald-600 uppercase tracking-widest">{uploadedLabel}</span>
          {onClear && (
            <button
              onClick={(event) => {
                event.stopPropagation();
                onClear();
              }}
              className="text-[10px] font-black text-slate-400 hover:text-red-500 uppercase mt-2"
            >
              Replace
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <span className="text-sm font-bold text-slate-600">{emptyTitle}</span>
          <span className="text-xs text-slate-400 mt-1 font-medium">{emptySubtitle}</span>
        </>
      )}
      <input type="file" ref={inputRef} className="hidden" accept={accept} onChange={handleInput} />
    </div>
  );
}
