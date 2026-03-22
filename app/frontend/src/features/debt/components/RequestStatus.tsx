'use client';

import { HugeiconsIcon } from '@hugeicons/react';
import { Clock01Icon, CheckmarkCircle01Icon, Cancel01Icon, BlockedIcon, MoneyReceive01Icon } from '@hugeicons/core-free-icons';
import { IDebt, TDebtStatus } from '../types';

const statusConfig: Record<
  TDebtStatus,
  { label: string; color: string; icon: React.ReactNode }
> = {
  PENDING: {
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    icon: <HugeiconsIcon icon={Clock01Icon} size={14} />,
  },
  ACCEPTED: {
    label: 'Accepted',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: <HugeiconsIcon icon={CheckmarkCircle01Icon} size={14} />,
  },
  REJECTED: {
    label: 'Rejected',
    color: 'bg-red-100 text-red-700 border-red-200',
    icon: <HugeiconsIcon icon={Cancel01Icon} size={14} />,
  },
  PARTIALLY_PAID: {
    label: 'Partially paid',
    color: 'bg-orange-100 text-orange-700 border-orange-200',
    icon: <HugeiconsIcon icon={MoneyReceive01Icon} size={14} />,
  },
  PAID: {
    label: 'Paid',
    color: 'bg-green-100 text-green-700 border-green-200',
    icon: <HugeiconsIcon icon={CheckmarkCircle01Icon} size={14} />,
  },
  CANCELLED: {
    label: 'Cancelled',
    color: 'bg-gray-100 text-gray-600 border-gray-200',
    icon: <HugeiconsIcon icon={BlockedIcon} size={14} />,
  },
  DISPUTED: {
    label: 'Disputed',
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    icon: <HugeiconsIcon icon={Cancel01Icon} size={14} />,
  },
};

interface RequestStatusProps {
  debt: IDebt;
}

export default function RequestStatus({ debt }: RequestStatusProps) {
  const config = statusConfig[debt.status];

  return (
    <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700">Request status</h3>
      </div>
      <div className="flex items-center justify-between px-4 py-3 gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-800 truncate">{debt.title}</p>
          <p className="text-xs text-gray-400">
            Due {new Date(debt.dueDate).toLocaleDateString('en-GB')}
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border flex-shrink-0 ${config.color}`}
        >
          {config.icon}
          {config.label}
        </span>
      </div>
    </div>
  );
}
