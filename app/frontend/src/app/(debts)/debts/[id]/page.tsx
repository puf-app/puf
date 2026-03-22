'use client';

import { useParams } from 'next/navigation';
import { useAppSelector } from '@/hooks/redux';
import { DebtDetailView } from '@/features/debt/components';
import { useDebtsQuery } from '@/features/debt/hooks/useDebtQuery';
import Hero from '@/components/layout/Hero';

export default function DebtDetailPage() {
  const { id } = useParams();
  const user = useAppSelector((state) => state.user.user);
  const { data: debts = [], isLoading } = useDebtsQuery();

  const debt = debts.find((d) => d._id === id);

  if (!user) {
    return (
      <main className='flex-grow flex flex-col'>
        <Hero />
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className='flex-grow flex flex-col items-center justify-center py-20'>
        <p className='text-gray-400 font-medium'>Loading debt details...</p>
      </main>
    );
  }

  if (!debt) {
    return (
      <main className='flex-grow flex flex-col items-center justify-center py-20'>
        <h2 className='text-2xl font-bold text-gray-400'>Debt not found</h2>
        <p className='text-gray-400'>The debt you are looking for does not exist or has been removed.</p>
      </main>
    );
  }

  return (
    <main className='flex-grow flex flex-col'>
      <DebtDetailView debt={debt} currentUserId={user._id} />
    </main>
  );
}
