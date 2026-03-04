import React, { useRef } from 'react';
import Button from './Button';

interface ProfilePictureUploadProps {
  imageSrc?: string;
  onChange: (base64: string) => void;
  onRemove?: () => void;
  className?: string;
}

export default function ProfilePictureUpload({ imageSrc, onChange, onRemove, className }: ProfilePictureUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        onChange(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className={className}>
      <div className="relative group">
        <div className="w-32 h-32 rounded-[2.5rem] bg-indigo-50 border-4 border-white shadow-xl overflow-hidden flex items-center justify-center relative">
          {imageSrc ? (
            <img src={imageSrc} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <svg className="w-12 h-12 text-indigo-200" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          )}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 bg-indigo-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812-1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />
      </div>

      <div className="mt-4 flex gap-3 justify-center md:justify-start">
        <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
          Upload New Picture
        </Button>
        {imageSrc && onRemove && (
          <Button variant="danger" size="sm" onClick={onRemove} className="bg-red-50 text-red-600 hover:bg-red-100">
            Remove
          </Button>
        )}
      </div>
    </div>
  );
}
