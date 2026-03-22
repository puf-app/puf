'use client';

// hooks
import { useAppSelector } from '@/hooks/redux';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

export default function Footer() {
  const user = useAppSelector((state) => state.user.user);
  const t = useTranslations('Footer');

  return (
    <div className='flex flex-col items-center justify-center gap-4 py-6 text-sm bg-footer h-20 w-full md:h-24'>
      {!user && (
        <p>
          {t('noAccount')}{' '}
          <Link href='/signup' className='underline'>
            {t('signUp')}
          </Link>
        </p>
      )}
      <p className='text-xs text-footer-light-foreground'>{t('copyright', { year: new Date().getFullYear() })}</p>
    </div>
  );
}
