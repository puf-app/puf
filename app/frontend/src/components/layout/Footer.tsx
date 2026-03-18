'use client';

// hooks
import { useAppSelector } from '@/hooks/redux';
import Link from 'next/link';

export default function Footer() {
  const user = useAppSelector((state) => state.user.user);

  return (
    <div className='flex flex-col items-center justify-center gap-4 py-6 text-sm bg-footer h-20 w-full md:h-24'>
      {!user && (
        <p>
          Don&apos;t have an account?{' '}
          <Link href='/signup' className='underline'>
            Sign up
          </Link>
        </p>
      )}
      <p className='text-xs text-footer-light-foreground'>{`© ${new Date().getFullYear()} Puff Inc.`}</p>
    </div>
  );
}
