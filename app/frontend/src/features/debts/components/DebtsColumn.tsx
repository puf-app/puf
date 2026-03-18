'use client';

import DebtCard from './DebtCard';
import type { IDebtListItem } from '../types';

interface IDebtsColumnProps {
  title: string;
  debts: IDebtListItem[];
  selectedDebtId: string | null;
  onSelect: (debtId: string) => void;
  emptyStateText: string;
}

export default function DebtsColumn({
  title,
  debts,
  selectedDebtId,
  onSelect,
  emptyStateText,
}: IDebtsColumnProps) {
  return (
    <section className='rounded-3xl border border-slate-200 bg-white p-5 shadow-sm'>
      <h2 className='mb-4 text-xl font-semibold text-[#1f2f4c]'>{title}</h2>
      <div className='space-y-3'>
        {debts.length === 0 && (
          <p className='rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500'>
            {emptyStateText}
          </p>
        )}

        {debts.map((debt) => (
          <DebtCard
            key={debt._id}
            debt={debt}
            isSelected={debt._id === selectedDebtId}
            onSelect={onSelect}
          />
        ))}
      </div>
    </section>
  );
}
