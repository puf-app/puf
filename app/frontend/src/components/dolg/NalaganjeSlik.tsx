'use client';

import { useRef, useState, useCallback } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Upload01Icon, Cancel01Icon } from '@hugeicons/core-free-icons';

interface NalaganjeSlikProps {
  slike: File[];
  onSprememba: (slike: File[]) => void;
}

export default function NalaganjeSlik({ slike, onSprememba }: NalaganjeSlikProps) {
  const vnosRef = useRef<HTMLInputElement>(null);
  const [vlece, setVlece] = useState(false);

  const obdelajSlike = useCallback(
    (prispele: FileList | null) => {
      if (!prispele) return;
      const veljavne = Array.from(prispele).filter((f) =>
        f.type.startsWith('image/')
      );
      onSprememba([...slike, ...veljavne]);
    },
    [slike, onSprememba]
  );

  const odstraniSliko = (indeks: number) => {
    const posodobljene = [...slike];
    posodobljene.splice(indeks, 1);
    onSprememba(posodobljene);
  };

  const obdelajSpust = (e: React.DragEvent) => {
    e.preventDefault();
    setVlece(false);
    obdelajSlike(e.dataTransfer.files);
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => { e.preventDefault(); setVlece(true); }}
        onDragLeave={() => setVlece(false)}
        onDrop={obdelajSpust}
        onClick={() => vnosRef.current?.click()}
        className={`relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 h-44
          ${vlece
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-200 bg-gray-50 hover:bg-blue-50 hover:border-blue-400'
          }`}
      >
        <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${vlece ? 'bg-blue-200' : 'bg-blue-100'}`}>
          <HugeiconsIcon
            icon={Upload01Icon}
            size={22}
            color={vlece ? '#1d4ed8' : '#3b82f6'}
          />
        </div>
        <p className="text-sm text-gray-500 text-center px-4">
          Naloži dokazilo o dolgu
        </p>
        <input
          ref={vnosRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => obdelajSlike(e.target.files)}
        />
      </div>

      {slike.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {slike.map((slika, i) => {
            const url = URL.createObjectURL(slika);
            return (
              <div
                key={i}
                className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group"
              >
                <img
                  src={url}
                  alt={`dokazilo-${i}`}
                  className="w-full h-full object-cover"
                  onLoad={() => URL.revokeObjectURL(url)}
                />
                <button
                  type="button"
                  onClick={() => odstraniSliko(i)}
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
