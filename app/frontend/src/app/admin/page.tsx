'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAppSelector } from '@/hooks/redux';
import {
  useUsersQuery,
  useVerificationsQuery,
} from '@/features/admin/hooks/useAdminQueries';
import UsersTable from '@/features/admin/components/UsersTable';
import VerificationsTable from '@/features/admin/components/VerificationsTable';

type TTab = 'users' | 'verifications';

export default function AdminPage() {
  const user = useAppSelector((state) => state.user.user);
  const [tab, setTab] = useState<TTab>('users');
  const [verificationStatus, setVerificationStatus] =
    useState<string>('PENDING');

  const usersQuery = useUsersQuery();
  const verificationsQuery = useVerificationsQuery(
    verificationStatus || undefined,
  );

  if (!user?.admin) {
    return (
      <main className='flex-1 flex items-center justify-center bg-[#eceef2]'>
        <p className='text-slate-500'>Access denied. Admins only.</p>
      </main>
    );
  }

  return (
    <main className='flex-1 bg-[#eceef2] px-4 py-8 md:px-8'>
      <section className='mx-auto w-full max-w-7xl space-y-6'>
        {/* Header */}
        <div className='rounded-3xl bg-[#1f2f4c] px-6 py-6 text-white shadow-sm'>
          <h1 className='text-4xl font-semibold'>Admin panel</h1>
          <p className='mt-1 text-sm text-blue-100'>
            Manage users and verifications.
          </p>

          <div className='mt-4 grid gap-3 sm:grid-cols-2'>
            <div className='rounded-2xl bg-white/10 px-4 py-3'>
              <p className='text-xs uppercase tracking-wide text-blue-100'>
                Total users
              </p>
              <p className='mt-1 text-2xl font-semibold'>
                {usersQuery.isLoading
                  ? '...'
                  : (usersQuery.data?.users.length ?? 0)}
              </p>
            </div>
            <div className='rounded-2xl bg-white/10 px-4 py-3'>
              <p className='text-xs uppercase tracking-wide text-blue-100'>
                Pending verifications
              </p>
              <p className='mt-1 text-2xl font-semibold'>
                {verificationsQuery.isLoading
                  ? '...'
                  : (verificationsQuery.data?.length ?? 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className='flex gap-2'>
          <Button
            onClick={() => setTab('users')}
            variant={tab === 'users' ? 'default' : 'outline'}
            size='sm'
          >
            Users
          </Button>
          <Button
            onClick={() => setTab('verifications')}
            variant={tab === 'verifications' ? 'default' : 'outline'}
            size='sm'
          >
            Verifications
          </Button>
        </div>

        {/* Users tab */}
        {tab === 'users' && (
          <>
            {usersQuery.isLoading && (
              <p className='text-sm text-slate-500'>Loading users...</p>
            )}
            {usersQuery.error && (
              <p className='rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>
                {(usersQuery.error as Error).message}
              </p>
            )}
            {usersQuery.data && <UsersTable users={usersQuery.data.users} />}
          </>
        )}

        {/* Verifications tab */}
        {tab === 'verifications' && (
          <>
            <div className='flex gap-2'>
              {['PENDING', 'APPROVED', 'REJECTED', ''].map((s) => (
                <Button
                  key={s}
                  onClick={() => setVerificationStatus(s)}
                  variant={verificationStatus === s ? 'default' : 'outline'}
                  size='sm'
                >
                  {s || 'All'}
                </Button>
              ))}
            </div>

            {verificationsQuery.isLoading && (
              <p className='text-sm text-slate-500'>Loading verifications...</p>
            )}
            {verificationsQuery.error && (
              <p className='rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>
                {(verificationsQuery.error as Error).message || ''}
              </p>
            )}
            {verificationsQuery.data && (
              <VerificationsTable verifications={verificationsQuery.data} />
            )}
          </>
        )}
      </section>
    </main>
  );
}
