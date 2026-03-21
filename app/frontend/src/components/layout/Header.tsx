'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { clearUser } from '@/stores/slices/userSlice';
import { getHeaderText } from '@/lib/utils';
import { postToApi } from '@/lib/api/client';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.user);
  const headerText = getHeaderText(pathname);

  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (loggingOut) return;
    try {
      setLoggingOut(true);
      // Backend logout: clears session on the server side.
      try {
        await postToApi('/api/auth/logoutUser', {});
      } catch (e) {
        // If the backend session cookie isn't present (dummy mode / expired session),
        // we still want the local UI to log out without crashing.
      }
    } finally {
      // Always clear client state so the UI updates immediately.
      dispatch(clearUser());
      router.push('/');
      setLoggingOut(false);
    }
  };

  return (
    <header className='h-16 md:h-24 bg-header flex items-center justify-between px-4 md:px-12 text-primary-foreground border-b border-primary/20'>
      <div className='flex items-center gap-8'>
        <Link href='/' className='text-4xl font-semibold'>
          <h1>{headerText}</h1>
        </Link>
        {user && (
          <Button
            onClick={handleLogout}
            disabled={loggingOut}
            variant='outline'
            size='sm'
            className='text-xs h-8 bg-transparent text-primary-foreground border-primary-foreground/30 hover:bg-white/10'
          >
            {loggingOut ? 'Logging out...' : 'Logout'}
          </Button>
        )}
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
          </div>
        )}

        {(pathname === '/signin' || pathname === '/signup') && (
          <Link href='/'>
            <Button className='px-6 py-2 h-auto rounded-md text-sm font-medium shadow-sm'>
              Home
            </Button>
          </Link>
        )}

        {pathname !== '/signin' &&
          pathname !== '/signup' &&
          pathname !== '/' &&
          !user && (
            <Link href='/home'>
              <Button className='px-6 py-2 h-auto rounded-md text-sm font-medium shadow-sm'>
                Home
              </Button>
            </Link>
          )}
      </nav>
    </header>
  );
}
