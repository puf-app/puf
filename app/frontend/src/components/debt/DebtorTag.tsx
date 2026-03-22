'use client';

import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon } from '@hugeicons/core-free-icons';
import { IDebtor } from '@/features/debt/types';

interface DebtorTagProps {
  debtor: IDebtor;
  onRemove: (id: string) => void;
}

export default function DebtorTag({ debtor, onRemove }: DebtorTagProps) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium border border-blue-200">
      <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold select-none">
        {(debtor.firstName || '?').charAt(0).toUpperCase()}
      </span>
      {debtor.firstName} {debtor.lastName}
      <button
        type="button"
        onClick={() => onRemove(debtor._id)}
        className="ml-0.5 text-blue-400 hover:text-blue-800 transition-colors"
        aria-label={`Remove ${debtor.firstName}`}
      >
        <HugeiconsIcon icon={Cancel01Icon} size={14} />
      </button>
    </span>
  );
}
