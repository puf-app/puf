import { IDebt } from '@/types';
import DebtCard from './DebtCard';
import { useTranslations } from 'next-intl';

interface DebtListProps {
  debts: IDebt[];
  currentUserId: string;
}

export default function DebtList({ debts, currentUserId }: DebtListProps) {
  const t = useTranslations('Debts.debtList');
  if (debts.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200'>
        <p className='text-xl text-gray-400 font-medium'>{t('emptyTitle')}</p>
        <p className='text-gray-400 mt-1'>{t('emptyDesc')}</p>
      </div>
    );
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
      {debts.map((debt) => (
        <DebtCard
          key={debt._id}
          debt={debt}
          isCreditor={debt.creditorUserId._id === currentUserId}
        />
      ))}
    </div>
  );
}
