'use client';

import { useRef, useState, useCallback } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Upload01Icon, Cancel01Icon } from '@hugeicons/core-free-icons';
import { useTranslations } from 'next-intl';

interface ImageUploadProps {
  files: File[];
  onChange: (files: File[]) => void;
}

export default function ImageUpload({ files, onChange }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const t = useTranslations('Debts.imageUpload');

  const handleFiles = useCallback(
    (incoming: FileList | null) => {
      if (!incoming) return;
      const valid = Array.from(incoming).filter((f) =>
        f.type.startsWith('image/')
      );
      onChange([...files, ...valid]);
    },
    [files, onChange]
  );

  const removeFile = (index: number) => {
    const updated = [...files];
    updated.splice(index, 1);
    onChange(updated);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 h-44
          ${isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-200 bg-gray-50 hover:bg-blue-50 hover:border-blue-400'
          }`}
      >
        <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isDragging ? 'bg-blue-200' : 'bg-blue-100'}`}>
          <HugeiconsIcon
            icon={Upload01Icon}
            size={22}
            color={isDragging ? '#1d4ed8' : '#3b82f6'}
          />
        </div>
        <p className="text-sm text-gray-500 text-center px-4">
          {t('uploadProof')}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {files.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {files.map((file, i) => {
            const url = URL.createObjectURL(file);
            return (
              <div
                key={i}
                className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group"
              >
                <img
                  src={url}
                  alt={`proof-${i}`}
                  className="w-full h-full object-cover"
                  onLoad={() => URL.revokeObjectURL(url)}
                />
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  <HugeiconsIcon icon={Cancel01Icon} size={10} color="white" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
