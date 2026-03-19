'use client';

import { HugeiconsIcon } from '@hugeicons/react';
import { Clock01Icon, CheckmarkCircle01Icon, Cancel01Icon, BlockedIcon } from '@hugeicons/core-free-icons';
import { IDebtRequest, TRequestStatus } from '@/stores/slices/debtSlice';

const statusConfig: Record<
  TRequestStatus,
  { label: string; color: string; icon: React.ReactNode }
> = {
  pending: {
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    icon: <HugeiconsIcon icon={Clock01Icon} size={14} />,
  },
  confirmed: {
    label: 'Confirmed',
    color: 'bg-green-100 text-green-700 border-green-200',
    icon: <HugeiconsIcon icon={CheckmarkCircle01Icon} size={14} />,
  },
  rejected: {
    label: 'Rejected',
    color: 'bg-red-100 text-red-700 border-red-200',
    icon: <HugeiconsIcon icon={Cancel01Icon} size={14} />,
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-gray-100 text-gray-600 border-gray-200',
    icon: <HugeiconsIcon icon={BlockedIcon} size={14} />,
  },
};

interface RequestStatusProps {
  requests: IDebtRequest[];
}

export default function RequestStatus({ requests }: RequestStatusProps) {
  if (requests.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6 text-center">
        <p className="text-sm text-gray-400">No requests sent yet</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700">Request status</h3>
      </div>
      <ul className="divide-y divide-gray-50">
        {requests.map((request) => {
          const config = statusConfig[request.status];
          return (
            <li
              key={request.id}
              className="flex items-center justify-between px-4 py-3 gap-3"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {request.debtorUsername.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    @{request.debtorUsername}
                  </p>
                  <p className="text-xs text-gray-400">
                    Sent {new Date(request.sentAt).toLocaleDateString('en-GB')}
                  </p>
                </div>
              </div>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border flex-shrink-0 ${config.color}`}
              >
                {config.icon}
                {config.label}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
