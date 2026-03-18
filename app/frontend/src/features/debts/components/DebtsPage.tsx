'use client';

import Link from 'next/link';
import { useDeferredValue, useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { DEFAULT_CURRENT_USER_ID } from '@/config/constants';
import { useAppSelector } from '@/hooks/redux';
import { useDebtDetailsQuery } from '../hooks/useDebtDetailsQuery';
import { useDebtsQuery } from '../hooks/useDebtsQuery';
import { DEFAULT_DEBT_FILTERS, type IDebtFilters } from '../types';
import DebtDetailsPanel from './DebtDetailsPanel';
import DebtFilters from './DebtFilters';
import DebtsColumn from './DebtsColumn';

const amountFormatter = new Intl.NumberFormat('sl-SI', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const dateTimeFormatter = new Intl.DateTimeFormat('sl-SI', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

export default function DebtsPage() {
  const user = useAppSelector((state) => state.user.user);
  const [filters, setFilters] = useState(DEFAULT_DEBT_FILTERS);
  const [selectedDebtId, setSelectedDebtId] = useState<string | null>(null);
  const [isUpdatingFilters, startTransition] = useTransition();
  const deferredSearch = useDeferredValue(filters.search);

  const currentUserId =
    (user as { _id?: string; id?: string } | null)?._id ||
    (user as { _id?: string; id?: string } | null)?.id ||
    DEFAULT_CURRENT_USER_ID;

  const queryFilters: IDebtFilters = { ...filters, search: deferredSearch };

  const debtsQuery = useDebtsQuery(queryFilters, currentUserId, true);
  const debts = debtsQuery.data?.items || [];
  const myDebts = debts.filter((debt) => debt.relation === 'mine');
  const othersDebts = debts.filter((debt) => debt.relation === 'othersToMe');
  const selectedDebtExists = Boolean(
    selectedDebtId && debts.some((debt) => debt._id === selectedDebtId)
  );
  const activeDebtId = selectedDebtExists
    ? selectedDebtId
    : debts.length > 0
      ? debts[0]._id
      : null;
  const detailsQuery = useDebtDetailsQuery(activeDebtId, currentUserId, true);

  const onFiltersChange = (changes: Partial<IDebtFilters>) => {
    startTransition(() => {
      setFilters((current) => ({ ...current, ...changes }));
    });
  };

  const onResetFilters = () => {
    startTransition(() => {
      setFilters(DEFAULT_DEBT_FILTERS);
    });
  };

  const onRefresh = async () => {
    await debtsQuery.refetch();

    if (activeDebtId) {
      await detailsQuery.refetch();
    }
  };

  return (
    <main className='flex-1 bg-[#eceef2] px-4 py-8 md:px-8'>
      <section className='mx-auto w-full max-w-7xl space-y-6'>
        <div className='rounded-3xl bg-[#1f2f4c] px-6 py-6 text-white shadow-sm'>
          <div className='flex flex-wrap items-start justify-between gap-4'>
            <div>
              <h1 className='text-4xl font-semibold'>Debts</h1>
              <p className='mt-1 text-sm text-blue-100'>
                Overview of your debts and debts of others to you.
              </p>
            </div>
            <div className='flex flex-wrap gap-2'>
              <Button
                type='button'
                variant='outline'
                onClick={onRefresh}
                className='h-9 border-white/30 bg-transparent px-4 text-white hover:bg-white/10'
              >
                {debtsQuery.isFetching ? 'Refreshing...' : 'Refresh'}
              </Button>
              <Link href='/ustvari-dolg'>
                <Button type='button' className='h-9 px-4 text-sm'>
                  Log a debt
                </Button>
              </Link>
            </div>
          </div>

          {!user && (
            <p className='mt-4 rounded-2xl bg-white/10 px-4 py-2 text-xs text-blue-100'>
              Viewing debts in demo mode (default user).
            </p>
          )}

          <div className='mt-4 grid gap-3 md:grid-cols-2'>
            <div className='rounded-2xl bg-white/10 px-4 py-3'>
              <p className='text-xs uppercase tracking-wide text-blue-100'>My debts</p>
              <p className='mt-1 text-lg font-semibold'>
                {debtsQuery.data?.summary.myDebtsCount || 0} active
              </p>
              <p className='text-sm text-blue-100'>
                {amountFormatter.format(debtsQuery.data?.summary.myDebtsTotal || 0)} EUR
              </p>
            </div>
            <div className='rounded-2xl bg-white/10 px-4 py-3'>
              <p className='text-xs uppercase tracking-wide text-blue-100'>
                Other debts
              </p>
              <p className='mt-1 text-lg font-semibold'>
                {debtsQuery.data?.summary.othersDebtsCount || 0} active
              </p>
              <p className='text-sm text-blue-100'>
                {amountFormatter.format(
                  debtsQuery.data?.summary.othersDebtsTotal || 0
                )}{' '}
                EUR
              </p>
            </div>
          </div>
        </div>

        <DebtFilters
          filters={filters}
          onChange={onFiltersChange}
          onReset={onResetFilters}
          isUpdating={isUpdatingFilters}
          isFetching={debtsQuery.isFetching}
        />

        {debtsQuery.error && (
          <p className='rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>
            {(debtsQuery.error as Error).message}
          </p>
        )}

        <div className='grid gap-6 lg:grid-cols-2'>
          <DebtsColumn
            title='My debts'
            debts={myDebts}
            selectedDebtId={activeDebtId}
            onSelect={setSelectedDebtId}
            emptyStateText='No matching debts in this section.'
          />
          <DebtsColumn
            title='Other debts'
            debts={othersDebts}
            selectedDebtId={activeDebtId}
            onSelect={setSelectedDebtId}
            emptyStateText='No matching debts in this section.'
          />
        </div>

        <DebtDetailsPanel
          data={detailsQuery.data}
          isLoading={detailsQuery.isLoading}
          errorMessage={detailsQuery.error ? (detailsQuery.error as Error).message : null}
        />

        <div className='mx-auto w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm'>
          <h3 className='text-3xl font-semibold text-[#1f2f4c]'>Log a Debt</h3>
          <p className='mt-2 text-slate-600'>
            Keep a clear record of everything you owe.
          </p>
          <Link href='/ustvari-dolg'>
            <Button className='mt-5 h-10 min-w-44 bg-[#0d2a5c] text-white hover:bg-[#123977]'>
              Create Debt
            </Button>
          </Link>
        </div>

        <p className='text-center text-xs text-slate-500'>
          Last backend update:{' '}
          {debtsQuery.data?.lastUpdated
            ? dateTimeFormatter.format(new Date(debtsQuery.data.lastUpdated))
            : 'Not available yet'}
        </p>
      </section>
    </main>
  );
}
