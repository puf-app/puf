'use client';

import { useEffect, useState } from 'react';
import { API_BASE_URL } from '@/config/constants';
import { Button } from '@/components/ui/button';
import type { IVerificationWithUser } from '../types';
import {
  useReviewVerificationMutation,
  useVerificationDetailsQuery,
} from '../hooks/useAdminQueries';
import { useTranslations } from 'next-intl';

const dateFormatter = new Intl.DateTimeFormat('sl-SI', { dateStyle: 'medium' });

interface IVerificationsTableProps {
  verifications: IVerificationWithUser[];
}

export default function VerificationsTable({
  verifications,
}: IVerificationsTableProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const t = useTranslations('Admin.verificationsTable');

  const detailsQuery = useVerificationDetailsQuery(selectedId);
  const reviewMutation = useReviewVerificationMutation();

  useEffect(() => {
    setReviewNote('');
  }, [selectedId]);

  const handleReview = (status: 'APPROVED' | 'REJECTED') => {
    if (!selectedId) return;
    reviewMutation.mutate(
      { id: selectedId, status, reviewNote },
      {
        onSuccess: () => {
          setSelectedId(null);
          setReviewNote('');
        },
      },
    );
  };

  console.log(verifications);

  return (
    <div className='space-y-4'>
      <div className='rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead className='bg-slate-50 border-b border-slate-200'>
              <tr>
                <th className='px-4 py-3 text-left font-medium text-slate-600'>
                  {t('columns.user')}
                </th>
                <th className='px-4 py-3 text-left font-medium text-slate-600'>
                  {t('columns.type')}
                </th>
                <th className='px-4 py-3 text-left font-medium text-slate-600'>
                  {t('columns.status')}
                </th>
                <th className='px-4 py-3 text-left font-medium text-slate-600'>
                  {t('columns.date')}
                </th>
                <th className='px-4 py-3 text-left font-medium text-slate-600'>
                  {t('columns.action')}
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-100'>
              {verifications.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className='px-4 py-8 text-center text-sm text-slate-400'
                  >
                    {t('noVerifs')}
                  </td>
                </tr>
              )}
              {verifications.map((v) => (
                <tr
                  key={v._id}
                  className={`hover:bg-slate-50 transition-colors ${selectedId === v._id ? 'bg-blue-50' : ''}`}
                >
                  <td className='px-4 py-3'>
                    {v.user ? (
                      <>
                        <div className='font-medium text-slate-800'>
                          {v.user.firstName} {v.user.lastName}
                        </div>
                        <div className='text-xs text-slate-500'>
                          @{v.user.username}
                        </div>
                      </>
                    ) : (
                      <span className='text-xs text-slate-400'>
                        {v.userId.username}
                      </span>
                    )}
                  </td>
                  <td className='px-4 py-3 text-slate-600'>
                    {v.verificationType}
                  </td>
                  <td className='px-4 py-3'>
                    <VerificationStatusBadge status={v.status} />
                  </td>
                  <td className='px-4 py-3 text-xs text-slate-500'>
                    {dateFormatter.format(new Date(v.createdAt || new Date()))}
                  </td>
                  <td className='px-4 py-3'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() =>
                        setSelectedId(selectedId === v._id ? null : v._id)
                      }
                      className='h-7 text-xs'
                    >
                      {selectedId === v._id ? t('actions.close') : t('actions.review')}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedId && (
        <div className='rounded-2xl border border-slate-200 bg-white shadow-sm p-6 space-y-4'>
          <h3 className='font-semibold text-slate-800'>{t('reviewPanel.title')}</h3>

          {detailsQuery.isLoading && (
            <p className='text-sm text-slate-500'>{t('reviewPanel.loading')}</p>
          )}

          {detailsQuery.error && (
            <p className='text-sm text-red-600'>
              {(detailsQuery.error as Error).message}
            </p>
          )}

          {detailsQuery.data && (
            <>
              <div className='grid gap-3 sm:grid-cols-3'>
                {detailsQuery.data.documents?.map((doc) => (
                  <div key={doc.fileStorageId} className='space-y-1'>
                    <p className='text-xs font-medium text-slate-600 uppercase tracking-wide'>
                      {doc.documentSide}
                    </p>
                    <img
                      src={`${API_BASE_URL}/api/verification/view/${doc.fileName}`}
                      alt={doc.documentSide}
                      className='w-full rounded-lg border border-slate-200 object-cover'
                    />
                  </div>
                ))}
              </div>

              <div className='space-y-2'>
                <label className='text-xs font-medium text-slate-600'>
                  {t('reviewPanel.noteLabel')}
                </label>
                <textarea
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  rows={2}
                  placeholder={t('reviewPanel.notePlaceholder')}
                  className='w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>

              <div className='flex gap-3'>
                <Button
                  onClick={() => handleReview('APPROVED')}
                  disabled={reviewMutation.isPending}
                  className='bg-green-600 hover:bg-green-700 text-white'
                >
                  {t('reviewPanel.approve')}
                </Button>
                <Button
                  variant='outline'
                  onClick={() => handleReview('REJECTED')}
                  disabled={reviewMutation.isPending}
                  className='border-red-300 text-red-600 hover:bg-red-50'
                >
                  {t('reviewPanel.reject')}
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function VerificationStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    APPROVED: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-700',
    EXPIRED: 'bg-slate-100 text-slate-500',
    DRAFT: 'bg-blue-100 text-blue-600',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${map[status] ?? 'bg-slate-100 text-slate-500'}`}
    >
      {status}
    </span>
  );
}
