'use client';

import { useAppSelector } from '@/hooks/redux';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Add01Icon,
  Money01Icon,
  MoneyReceive01Icon,
} from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';
import { DebtList } from '@/features/debt/components';
import { useDebtsQuery } from '@/features/debt/hooks/useDebtQuery';
import Hero from '@/components/layout/Hero';
import { formatAmount } from '@/lib/utils';

export default function DebtsPage() {
  const user = useAppSelector((state) => state.user.user);
  const { data: debts, isLoading, error } = useDebtsQuery();

  if (!user) {
    return (
      <main className='flex-grow flex flex-col'>
        <Hero />
      </main>
    );
  }

  const receivables =
    debts &&
    debts.debts
      .filter((d) => d.creditorUserId._id === user._id && d.status !== 'PAID')
      .reduce((acc, d) => acc + formatAmount(d.amount), 0);

  const obligations =
    debts &&
    debts.debts
      .filter((d) => d.debtorUserId._id === user._id && d.status !== 'PAID')
      .reduce((acc, d) => acc + formatAmount(d.amount), 0);

  console.log(debts?.debts);

  console.log(receivables, obligations);

  return (
    <main className='flex-grow bg-slate-50/50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10'>
        {/* Header Section */}
        <div className='flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10'>
          <div>
            <h1 className='text-4xl font-black text-black tracking-tight'>
              My Debts
            </h1>
            <p className='text-gray-500 mt-2 text-lg font-medium'>
              Manage your receivables and obligations in one place.
            </p>
          </div>
          <Button className='bg-[#001f3f] hover:bg-[#003366] text-white px-8 py-6 h-auto text-lg rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-blue-900/10 transition-all hover:scale-[1.02] active:scale-[0.98]'>
            <HugeiconsIcon icon={Add01Icon} size={20} />
            Create New Debt
          </Button>
        </div>

        {/* Stats Summary */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-12'>
          <div className='bg-white p-8 rounded-3xl border-2 border-green-50 shadow-sm flex items-center gap-6'>
            <div className='w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center flex-shrink-0'>
              <HugeiconsIcon
                icon={MoneyReceive01Icon}
                size={32}
                className='text-green-600'
              />
            </div>
            <div>
              <p className='text-sm font-bold text-gray-400 uppercase tracking-wider'>
                Receivables
              </p>
              <h2 className='text-3xl font-black text-green-600 mt-1'>
                {receivables && receivables.toFixed(2)} EUR
              </h2>
            </div>
          </div>

          <div className='bg-white p-8 rounded-3xl border-2 border-red-50 shadow-sm flex items-center gap-6'>
            <div className='w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center flex-shrink-0'>
              <HugeiconsIcon
                icon={Money01Icon}
                size={32}
                className='text-red-600'
              />
            </div>
            <div>
              <p className='text-sm font-bold text-gray-400 uppercase tracking-wider'>
                Obligations
              </p>
              <h2 className='text-3xl font-black text-red-600 mt-1'>
                {obligations && obligations.toFixed(2)} EUR
              </h2>
            </div>
          </div>
        </div>

        {/* Debts List Section */}
        <div className='space-y-6'>
          <div className='flex items-center justify-between'>
            <h3 className='text-2xl font-bold text-black'>Active Debts</h3>
            <div className='h-1 flex-1 mx-6 bg-gray-100 rounded-full hidden sm:block' />
          </div>

          {isLoading ? (
            <div className='flex justify-center py-20'>
              <p className='text-gray-400 font-medium'>Loading debts...</p>
            </div>
          ) : error ? (
            <div className='bg-red-50 border-2 border-red-100 p-8 rounded-3xl text-center'>
              <p className='text-red-600 font-bold'>
                Failed to load debts. Please try again later.
              </p>
            </div>
          ) : (
            <DebtList
              debts={(debts && debts.debts) || []}
              currentUserId={user._id}
            />
          )}
        </div>
      </div>
    </main>
  );
}
