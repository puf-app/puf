'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();

  const isAuth = pathname === '/signin' || pathname === '/signup';

  return (
    <header className='h-16 md:h-24 bg-header flex items-center justify-between px-4 md:px-12 text-primary-foreground border-b border-primary/20'>
      <div className='text-4xl font-semibold'>Puf</div>

      <nav className='flex gap-4'>
        {pathname === '/' && (
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

        {isAuth && (
          <Link href='/'>
            <Button className='px-6 py-2 h-auto rounded-md text-sm font-medium shadow-sm'>
              Home
            </Button>
          </Link>
        )}

        {pathname !== '/signin' &&
          pathname !== '/signup' &&
          pathname !== '/' && (
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
