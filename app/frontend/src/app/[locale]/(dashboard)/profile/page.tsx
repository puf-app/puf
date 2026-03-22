'use client';

import { useAppSelector } from '@/hooks/redux';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

export default function ProfilePage() {
  const t = useTranslations('Profile');
  const user = useAppSelector((state) => state.user.user);

  if (!user) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[60vh] gap-4'>
        <h1 className='text-2xl font-bold text-red-600'>
          {t('errors.notLoggedInTitle')}
        </h1>
        <p className='text-gray-600'>{t('errors.notLoggedInDesc')}</p>
        <Link href='/'>
          <Button>{t('actions.goHome')}</Button>
        </Link>
      </div>
    );
  }

  // Fallback for fields that might be missing in older mock data or initial state
  const firstName = user.firstName || 'User';
  const lastName = user.lastName || '';
  const username = user.username || 'username';
  const email = user.email || t('fields.noEmail');
  const phone = user.phone || t('fields.noPhone');
  const createdAt = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString()
    : t('fields.na');
  const isVerified = user.isVerified ? t('fields.verified') : t('fields.notVerified');

  return (
    <div className='max-w-5xl mx-auto px-8 py-12 w-full'>
      <div className='flex flex-col md:flex-row gap-12 md:gap-24'>
        {/* Left Column: Avatar & Summary */}
        <div className='flex flex-col items-center md:items-start text-center md:text-left gap-4 min-w-[200px]'>
          <div className='w-32 h-32 md:w-40 md:h-40 bg-gray-100 rounded-full flex items-center justify-center text-4xl md:text-5xl font-bold text-primary overflow-hidden border-4 border-white shadow-sm'>
            {user.profileImageUrl ? (
              <img
                src={user.profileImageUrl}
                alt={firstName}
                className='w-full h-full object-cover'
              />
            ) : (
              firstName.charAt(0)
            )}
          </div>

          <div className='space-y-1'>
            <h1 className='text-3xl font-black text-black'>
              {firstName} {lastName}
            </h1>
            <p className='text-gray-500 text-sm'>@{username}</p>
          </div>

          <Link href='/settings' className='mt-2'>
            <Button className='bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8'>
              {t('actions.settings')}
            </Button>
          </Link>
        </div>

        {/* Right Column: Basic Info */}
        <div className='flex-grow'>
          <div className='bg-white rounded-2xl border-2 border-gray-50 p-8 shadow-sm'>
            <h2 className='text-2xl font-bold text-black mb-2'>{t('fields.basicInfo')}</h2>
            <hr className='border-gray-100 mb-6' />

            <div className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
                <span className='font-semibold text-black'>{t('fields.email')}</span>
                <span className='text-gray-600'>{email}</span>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
                <span className='font-semibold text-black'>{t('fields.telephone')}</span>
                <span className='text-gray-600'>{phone}</span>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
                <span className='font-semibold text-black'>
                  {t('fields.accountCreated')}
                </span>
                <span className='text-gray-600'>{createdAt}</span>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
                <span className='font-semibold text-black'>
                  {t('fields.verificationStatus')}
                </span>
                <span
                  className={`font-medium ${user.isVerified ? 'text-blue-600' : 'text-gray-500'}`}
                >
                  {isVerified}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
