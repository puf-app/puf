'use client';

import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { usePathname } from '@/i18n/navigation';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { clearUser } from '@/stores/slices/userSlice';
import { getHeaderText } from '@/lib/utils';
import { postToApi } from '@/lib/api/client';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import LocaleSwitcher from '@/components/layout/LocaleSwitcher';

export default function Header() {
  const t = useTranslations('Header');
  const tTitles = useTranslations('PageTitles');
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.user);
  const headerText = getHeaderText(pathname);

  const handleLogout = async () => {
    try {
      await postToApi('/api/auth/logoutUser', {});
    } finally {
      dispatch(clearUser());
      router.push('/');
      router.refresh();
    }
  };

  return (
    <header className='h-16 md:h-24 bg-header flex items-center justify-between px-4 md:px-12 text-primary-foreground border-b border-primary/20'>
      <div className='flex items-center gap-8'>
        <Link href='/' className='text-4xl font-semibold'>
          <h1>{tTitles(headerText as any)}</h1>
        </Link>
      </div>

      <nav className='flex items-center gap-4'>
        {pathname === '/' && !user && (
          <>
            <Link href='/signup'>
              <Button className='px-6 py-2 h-auto rounded-md text-sm font-medium shadow-sm'>
                {t('signUp')}
              </Button>
            </Link>

            <Link href='/signin'>
              <Button className='px-6 py-2 h-auto rounded-md text-sm font-medium shadow-sm'>
                {t('signIn')}
              </Button>
            </Link>
          </>
        )}

        {(pathname === '/signin' ||
          pathname === '/signup' ||
          pathname === '/verification') && (
          <Link href='/'>
            <Button className='px-6 py-2 h-auto rounded-md text-sm font-medium shadow-sm'>
              {t('home')}
            </Button>
          </Link>
        )}

        {pathname !== '/signin' &&
          pathname !== '/signup' &&
          pathname !== '/' && (
            <>
              <Link href='/home'>
                <Button className='px-6 py-2 h-auto rounded-md text-sm font-medium shadow-sm'>
                  {t('home')}
                </Button>
              </Link>
              <Link href='/statistics'>
                <Button className='px-6 py-2 h-auto rounded-md text-sm font-medium shadow-sm'>
                  {t('statistics')}
                </Button>
              </Link>
            </>
          )}

        {user && (
          <div className='flex items-center gap-4'>
            <Link href='/contacts'>
              <Button className='px-6 py-2 h-auto rounded-md text-sm font-medium shadow-sm'>
                {t('contacts')}
              </Button>
            </Link>
            <Link href='/debts'>
              <Button className='px-6 py-2 h-auto rounded-md text-sm font-medium shadow-sm'>
                {t('debts')}
              </Button>
            </Link>
            <Link href='/profile'>
              <Button className='px-6 py-2 h-auto rounded-md text-sm font-medium shadow-sm'>
                {t('profile')}
              </Button>
            </Link>
            <Button
              className='px-6 py-2 h-auto rounded-md text-sm font-medium shadow-sm'
              onClick={handleLogout}
            >
              {t('logOut')}
            </Button>
          </div>
        )}

        <LocaleSwitcher />
      </nav>
    </header>
  );
}
