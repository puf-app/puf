'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { IUser } from '@/types';
import { useUpdateUserMutation } from '../hooks/useAdminQueries';
import { useTranslations } from 'next-intl';

const PAGE_SIZE = 10;

const dateFormatter = new Intl.DateTimeFormat('sl-SI', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

interface IUsersTableProps {
  users: IUser[];
}

export default function UsersTable({ users }: IUsersTableProps) {
  const [page, setPage] = useState(0);
  const updateUser = useUpdateUserMutation();
  const t = useTranslations('Admin.usersTable');

  const totalPages = Math.ceil(users.length / PAGE_SIZE);
  const pageUsers = users.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const toggleAdmin = (user: IUser) => {
    updateUser.mutate({ userId: user._id, data: { admin: !user.admin } });
  };

  return (
    <div className='rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden'>
      <div className='overflow-x-auto'>
        <table className='w-full text-sm'>
          <thead className='bg-slate-50 border-b border-slate-200'>
            <tr>
              <th className='px-4 py-3 text-left font-medium text-slate-600'>{t('columns.user')}</th>
              <th className='px-4 py-3 text-left font-medium text-slate-600'>{t('columns.status')}</th>
              <th className='px-4 py-3 text-left font-medium text-slate-600'>{t('columns.verification')}</th>
              <th className='px-4 py-3 text-left font-medium text-slate-600'>{t('columns.lastActivity')}</th>
              <th className='px-4 py-3 text-left font-medium text-slate-600'>{t('columns.role')}</th>
              <th className='px-4 py-3 text-left font-medium text-slate-600'>{t('columns.action')}</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-slate-100'>
            {pageUsers.length === 0 && (
              <tr>
                <td colSpan={6} className='px-4 py-8 text-center text-sm text-slate-400'>
                  {t('noUsers')}
                </td>
              </tr>
            )}
            {pageUsers.map((user) => (
              <tr key={user._id} className='hover:bg-slate-50 transition-colors'>
                <td className='px-4 py-3'>
                  <div className='font-medium text-slate-800'>
                    {user.firstName} {user.lastName}
                  </div>
                  <div className='text-xs text-slate-500'>@{user.username}</div>
                </td>
                <td className='px-4 py-3'>
                  <StatusBadge status={user.status} />
                </td>
                <td className='px-4 py-3'>
                  <VerificationBadge level={user.verificationLevel} isVerified={user.isVerified} />
                </td>
                <td className='px-4 py-3 text-slate-500 text-xs'>
                  {user.lastSeenAt
                    ? dateFormatter.format(new Date(user.lastSeenAt))
                    : t('unknownDate')}
                </td>
                <td className='px-4 py-3'>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      user.admin
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {user.admin ? t('roles.admin') : t('roles.user')}
                  </span>
                </td>
                <td className='px-4 py-3'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => toggleAdmin(user)}
                    disabled={updateUser.isPending}
                    className='h-7 text-xs'
                  >
                    {user.admin ? t('actions.removeAdmin') : t('actions.makeAdmin')}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className='flex items-center justify-between px-4 py-3 border-t border-slate-200'>
          <span className='text-xs text-slate-500'>
            {t('pagination.page', { page: page + 1, total: totalPages, count: users.length })}
          </span>
          <div className='flex gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 0}
              className='h-7 text-xs'
            >
              {t('pagination.prev')}
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= totalPages - 1}
              className='h-7 text-xs'
            >
              {t('pagination.next')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: IUser['status'] }) {
  const map = {
    ACTIVE: 'bg-green-100 text-green-700',
    SUSPENDED: 'bg-yellow-100 text-yellow-700',
    DEACTIVATED: 'bg-red-100 text-red-700',
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${map[status]}`}>
      {status}
    </span>
  );
}

function VerificationBadge({
  level,
  isVerified,
}: {
  level: IUser['verificationLevel'];
  isVerified: boolean;
}) {
  if (!isVerified) {
    return (
      <span className='inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-500'>
        NONE
      </span>
    );
  }

  const map = {
    NONE: 'bg-slate-100 text-slate-500',
    BASIC: 'bg-blue-100 text-blue-700',
    IDENTITY: 'bg-indigo-100 text-indigo-700',
    ENHANCED: 'bg-green-100 text-green-700',
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${map[level]}`}>
      {level}
    </span>
  );
}
