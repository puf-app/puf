'use client';

import Image from 'next/image';
import type { IDebtDetailsData } from '../types';

interface IDebtDetailsPanelProps {
  data: IDebtDetailsData | undefined;
  isLoading: boolean;
  errorMessage: string | null;
}

const amountFormatter = new Intl.NumberFormat('sl-SI', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat('sl-SI', {
  dateStyle: 'medium',
});

const dateTimeFormatter = new Intl.DateTimeFormat('sl-SI', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

export default function DebtDetailsPanel({
  data,
  isLoading,
  errorMessage,
}: IDebtDetailsPanelProps) {
  if (isLoading) {
    return (
      <section className='rounded-3xl border border-slate-200 bg-white p-5 shadow-sm'>
        <h2 className='text-xl font-semibold text-[#1f2f4c]'>Debt details</h2>
        <p className='mt-3 text-sm text-slate-500'>Loading debt details...</p>
      </section>
    );
  }

  if (errorMessage) {
    return (
      <section className='rounded-3xl border border-red-200 bg-red-50 p-5 shadow-sm'>
        <h2 className='text-xl font-semibold text-red-800'>Debt details</h2>
        <p className='mt-3 text-sm text-red-600'>{errorMessage}</p>
      </section>
    );
  }

  if (!data) {
    return (
      <section className='rounded-3xl border border-slate-200 bg-white p-5 shadow-sm'>
        <h2 className='text-xl font-semibold text-[#1f2f4c]'>Debt details</h2>
        <p className='mt-3 text-sm text-slate-500'>
          Select a debt card to see amount, description, images and status.
        </p>
      </section>
    );
  }

  return (
    <section className='rounded-3xl border border-slate-200 bg-white p-5 shadow-sm'>
      <div className='flex flex-wrap items-start justify-between gap-3'>
        <div>
          <h2 className='text-xl font-semibold text-[#1f2f4c]'>Debt details</h2>
          <p className='text-sm text-slate-500'>{data.debt.title}</p>
        </div>
        <p className='text-lg font-bold text-slate-800'>
          {amountFormatter.format(data.debt.amount)} {data.debt.currency}
        </p>
      </div>

      <div className='mt-4 grid gap-3 md:grid-cols-2'>
        <div className='rounded-2xl border border-slate-200 bg-slate-50 p-3'>
          <p className='text-xs uppercase tracking-wide text-slate-500'>Status</p>
          <p className='mt-1 text-sm font-semibold text-slate-800'>
            {data.debt.status.replace('_', ' ')}
          </p>
        </div>
        <div className='rounded-2xl border border-slate-200 bg-slate-50 p-3'>
          <p className='text-xs uppercase tracking-wide text-slate-500'>
            Due date
          </p>
          <p className='mt-1 text-sm font-semibold text-slate-800'>
            {dateFormatter.format(new Date(data.debt.dueDate))}
          </p>
        </div>
      </div>

      <div className='mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3'>
        <p className='text-xs uppercase tracking-wide text-slate-500'>
          Description
        </p>
        <p className='mt-1 text-sm text-slate-700'>{data.debt.description}</p>
      </div>

      <div className='mt-4'>
        <p className='text-sm font-semibold text-slate-700'>Evidence images</p>
        <div className='mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2'>
          {data.evidence.length === 0 && (
            <p className='rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-sm text-slate-500'>
              No evidence images attached.
            </p>
          )}

          {data.evidence.map((evidence) => (
            <div
              key={evidence._id}
              className='overflow-hidden rounded-2xl border border-slate-200'
            >
              <Image
                src={evidence.fileUrl}
                alt={evidence.fileName}
                width={640}
                height={288}
                className='h-36 w-full object-cover'
              />
              <div className='px-3 py-2'>
                <p className='truncate text-xs font-medium text-slate-700'>
                  {evidence.fileName}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className='mt-4'>
        <p className='text-sm font-semibold text-slate-700'>Status history</p>
        <ul className='mt-2 space-y-2'>
          {data.statusHistory.length === 0 && (
            <li className='rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-500'>
              No status history available.
            </li>
          )}

          {data.statusHistory.map((history) => (
            <li
              key={history._id}
              className='rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3'
            >
              <p className='text-sm font-medium text-slate-700'>
                {history.oldStatus} {'->'} {history.newStatus}
              </p>
              <p className='mt-0.5 text-xs text-slate-500'>{history.note}</p>
              <p className='mt-1 text-xs text-slate-400'>
                {dateTimeFormatter.format(new Date(history.createdAt))}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
