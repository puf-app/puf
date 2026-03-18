'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { IDebtFilters, TDebtStatusFilter } from '../types';

const STATUS_OPTIONS: TDebtStatusFilter[] = [
  'ALL',
  'PENDING',
  'ACCEPTED',
  'REJECTED',
  'PARTIALLY_PAID',
  'PAID',
  'CANCELLED',
  'DISPUTED',
];

interface IDebtFiltersProps {
  filters: IDebtFilters;
  onChange: (changes: Partial<IDebtFilters>) => void;
  onReset: () => void;
  isUpdating: boolean;
  isFetching: boolean;
}

export default function DebtFilters({
  filters,
  onChange,
  onReset,
  isUpdating,
  isFetching,
}: IDebtFiltersProps) {
  return (
    <section className='rounded-3xl border border-slate-200 bg-white p-5 shadow-sm'>
      <div className='grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
        <Input
          value={filters.search}
          onChange={(event) => onChange({ search: event.target.value })}
          placeholder='Search by title, person or reason'
          className='h-10 text-sm'
        />

        <select
          value={filters.status}
          onChange={(event) =>
            onChange({ status: event.target.value as TDebtStatusFilter })
          }
          className='h-10 rounded-md border border-input bg-white px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30'
        >
          {STATUS_OPTIONS.map((statusOption) => (
            <option key={statusOption} value={statusOption}>
              {statusOption}
            </option>
          ))}
        </select>

        <Input
          type='number'
          min='0'
          step='0.01'
          value={filters.minAmount}
          onChange={(event) => onChange({ minAmount: event.target.value })}
          placeholder='Min amount'
          className='h-10 text-sm'
        />

        <Input
          type='number'
          min='0'
          step='0.01'
          value={filters.maxAmount}
          onChange={(event) => onChange({ maxAmount: event.target.value })}
          placeholder='Max amount'
          className='h-10 text-sm'
        />
      </div>

      <div className='mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
        <Input
          type='date'
          value={filters.fromDate}
          onChange={(event) => onChange({ fromDate: event.target.value })}
          className='h-10 text-sm'
        />

        <Input
          type='date'
          value={filters.toDate}
          onChange={(event) => onChange({ toDate: event.target.value })}
          className='h-10 text-sm'
        />

        <select
          value={filters.sortBy}
          onChange={(event) =>
            onChange({ sortBy: event.target.value as IDebtFilters['sortBy'] })
          }
          className='h-10 rounded-md border border-input bg-white px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30'
        >
          <option value='dueDate'>Sort by due date</option>
          <option value='amount'>Sort by amount</option>
        </select>

        <select
          value={filters.sortOrder}
          onChange={(event) =>
            onChange({
              sortOrder: event.target.value as IDebtFilters['sortOrder'],
            })
          }
          className='h-10 rounded-md border border-input bg-white px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30'
        >
          <option value='asc'>Ascending</option>
          <option value='desc'>Descending</option>
        </select>
      </div>

      <div className='mt-4 flex flex-wrap items-center justify-between gap-3'>
        <p className='text-xs text-slate-500'>
          {isFetching ? 'Refreshing data...' : 'Live sync with backend enabled'}
        </p>
        <Button
          type='button'
          variant='outline'
          onClick={onReset}
          disabled={isUpdating}
          className='h-9 px-4 text-sm'
        >
          Reset filters
        </Button>
      </div>
    </section>
  );
}
