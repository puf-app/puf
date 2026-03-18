'use client';

import type { IDebtListItem } from '../types';

const STATUS_LABELS: Record<IDebtListItem['status'], string> = {
  PENDING: 'Pending',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
  PARTIALLY_PAID: 'Partially paid',
  PAID: 'Paid',
  CANCELLED: 'Cancelled',
  DISPUTED: 'Disputed',
};

const STATUS_COLORS: Record<IDebtListItem['status'], string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  ACCEPTED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  PARTIALLY_PAID: 'bg-indigo-100 text-indigo-700',
  PAID: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-slate-200 text-slate-600',
  DISPUTED: 'bg-orange-100 text-orange-700',
};

interface IDebtCardProps {
  debt: IDebtListItem;
  isSelected: boolean;
  onSelect: (debtId: string) => void;
}

const amountFormatter = new Intl.NumberFormat('sl-SI', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat('sl-SI');

export default function DebtCard({ debt, isSelected, onSelect }: IDebtCardProps) {
  const dueText =
    debt.dueInDays < 0
      ? `Overdue by ${Math.abs(debt.dueInDays)} day(s)`
      : debt.dueInDays === 0
        ? 'Due today'
        : `Due in ${debt.dueInDays} day(s)`;

  return (
    <button
      type='button'
      onClick={() => onSelect(debt._id)}
      className={`w-full rounded-3xl border px-4 py-3 text-left shadow-sm transition-all ${
        isSelected
          ? 'border-blue-500 bg-gradient-to-r from-white to-blue-200'
          : 'border-slate-200 bg-gradient-to-r from-white to-blue-100 hover:border-blue-400'
      }`}
    >
      <div className='flex items-start justify-between gap-3'>
        <div className='min-w-0'>
          <p className='truncate text-sm font-semibold text-slate-900'>
            {debt.counterpartyName}
          </p>
          <p className='truncate text-xs text-slate-500'>{debt.title}</p>
        </div>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_COLORS[debt.status]}`}
        >
          {STATUS_LABELS[debt.status]}
        </span>
      </div>

      <div className='mt-3 flex items-end justify-between gap-2'>
        <div>
          <p className='text-base font-bold text-slate-800'>
            {amountFormatter.format(debt.amount)} {debt.currency}
          </p>
          <p className='text-xs text-slate-500'>{dueText}</p>
        </div>
        <p className='text-xs text-slate-500'>
          {dateFormatter.format(new Date(debt.dueDate))}
        </p>
      </div>
    </button>
  );
}
