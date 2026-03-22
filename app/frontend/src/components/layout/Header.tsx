'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { clearUser } from '@/stores/slices/userSlice';
import { getHeaderText } from '@/lib/utils';
import { postToApi } from '@/lib/api/client';
import { useRouter } from 'next/navigation';

export default function Header() {
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
          <h1>{headerText}</h1>
        </Link>
      </div>

      <nav className='flex gap-4'>
        {pathname === '/' && !user && (
          <>
            <Link href='/signup'>
              <Button className='px-6 py-2 h-auto rounded-md text-sm font-medium shadow-sm'>
                Sign up
              </Button>
            </Link>

            <Link href='/signin'>
              <Button className='px-6 py-2 h-auto rounded-md text-sm font-medium shadow-sm'>
                Sign in
              </Button>
            </Link>
          </>
        )}

        {user && (
          <div className='flex items-center gap-4'>
            <Link href='/contacts'>
              <Button className='px-6 py-2 h-auto rounded-md text-sm font-medium shadow-sm'>
                Contacts
              </Button>
            </Link>
            <Link href='/debts'>
              <Button className='px-6 py-2 h-auto rounded-md text-sm font-medium shadow-sm'>
                Debts
              </Button>
            </Link>
            <Link href='/profile'>
              <Button className='px-6 py-2 h-auto rounded-md text-sm font-medium shadow-sm'>
                Profile
              </Button>
            </Link>
            <Button
              className='px-6 py-2 h-auto rounded-md text-sm font-medium shadow-sm'
              onClick={handleLogout}
            >
              Log out
            </Button>
          </div>
        )}

        {(pathname === '/signin' ||
          pathname === '/signup' ||
          pathname === '/verification') && (
          <Link href='/'>
            <Button className='px-6 py-2 h-auto rounded-md text-sm font-medium shadow-sm'>
              Home
            </Button>
          </Link>
        )}

        {pathname !== '/signin' &&
          pathname !== '/signup' &&
          pathname !== '/' && (
            <>
              <Link href='/home'>
                <Button className='px-6 py-2 h-auto rounded-md text-sm font-medium shadow-sm'>
                  Home
                </Button>
              </Link>
              <Link href='/statistics'>
                <Button className='px-6 py-2 h-auto rounded-md text-sm font-medium shadow-sm'>
                  Statistics
                </Button>
              </Link>
            </>
          )}
      </nav>
    </header>
  );
}
