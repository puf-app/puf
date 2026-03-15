'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function AuthHeader() {
  return (
    <header className="h-16 md:h-20 bg-primary flex items-center justify-between px-4 md:px-12 text-primary-foreground">
      <div className="text-2xl font-semibold">Puf</div>
      <Link href="/">
        <Button className="px-6 py-2 h-auto rounded-md text-sm font-medium shadow-sm">
          Home
        </Button>
      </Link>
    </header>
  );
}

