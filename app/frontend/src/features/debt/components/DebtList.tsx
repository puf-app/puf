'use client';

import { IDebt } from '../types';
import DebtCard from './DebtCard';

interface DebtListProps {
  debts: IDebt[];
  currentUserId: string;
}

export default function DebtList({ debts, currentUserId }: DebtListProps) {
  if (debts.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-20 text-center'>
        <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4'>
          <span className='text-2xl'>💸</span>
        </div>
        <h3 className='text-lg font-semibold text-gray-900'>No debts found</h3>
        <p className='text-gray-500 max-w-xs'>
          You don&apos;t have any active debts at the moment.
        </p>
      </div>
    );
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
      {debts.map((debt) => (
        <DebtCard
          key={debt._id}
          debt={debt}
          isCreditor={debt.creditorUserId === currentUserId}
        />
      ))}
    </div>
  );
}
