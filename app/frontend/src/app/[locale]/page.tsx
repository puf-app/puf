'use client';

import { useAppSelector } from '@/hooks/redux';
import Hero from '@/components/layout/Hero';
import Dashboard from '@/components/layout/Dashboard';

export default function Home() {
  const user = useAppSelector((state) => state.user.user);

  return (
    <main className='flex-grow flex flex-col'>
      {user ? <Dashboard /> : <Hero />}
    </main>
  );
}
