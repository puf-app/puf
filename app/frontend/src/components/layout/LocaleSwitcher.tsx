'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { HugeiconsIcon } from '@hugeicons/react';
import { GlobalIcon } from '@hugeicons/core-free-icons';

export default function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (e: React.ChangeEvent<HTMLSelectElement>) => {
    router.replace(pathname, { locale: e.target.value });
  };

  return (
    <div className="relative flex items-center rounded-md hover:bg-white/10 transition-colors">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5">
        <HugeiconsIcon icon={GlobalIcon} size={16} className="text-primary-foreground/80" />
      </div>
      <select
        value={locale}
        onChange={switchLocale}
        className="h-10 appearance-none bg-transparent py-2 pl-9 pr-8 text-sm font-medium text-primary-foreground focus:outline-none focus:ring-0 cursor-pointer"
        aria-label="Toggle language"
      >
        <option value="en" className="text-black bg-white">English</option>
        <option value="sl" className="text-black bg-white">Slovenščina</option>
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-primary-foreground/80">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}
