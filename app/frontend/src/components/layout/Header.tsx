'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { setUser, clearUser } from '@/stores/slices/userSlice';
import { getHeaderText } from '@/lib/utils';

export default function Header() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.user);
  const headerText = getHeaderText(pathname);

  // TODO: REMOVE MOCK LOGIN - This is temporary for testing the dashboard without a backend
  const toggleMockLogin = () => {
    if (user) {
      dispatch(clearUser());
    } else {
      dispatch(
        setUser({
          _id: '1',
          firstName: 'Jane',
          lastName: 'Doe',
          username: 'janedoe',
          email: 'jane@example.com',
          phone: '+386 40 123 456',
          isVerified: true,
          status: 'ACTIVE',
          admin: false,
          company: false,
          createdAt: new Date('2024-01-15').toISOString(),
        } as any),
      );
    }
  };

  return (
    <header className='h-16 md:h-24 bg-header flex items-center justify-between px-4 md:px-12 text-primary-foreground border-b border-primary/20'>
      <div className='flex items-center gap-8'>
        <div className='text-4xl font-semibold'>{headerText}</div>
        {/* TODO: REMOVE MOCK LOGIN BUTTON */}
        <Button
          onClick={toggleMockLogin}
          variant='outline'
          size='sm'
          className='text-xs h-8 bg-transparent text-primary-foreground border-primary-foreground/30 hover:bg-white/10'
        >
          Dev: {user ? 'Logout' : 'Login'}
        </Button>
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
