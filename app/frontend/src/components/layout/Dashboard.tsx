import { Button } from '@/components/ui/button';
import Hero from './Hero';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

export default function Dashboard() {
  const t = useTranslations('Dashboard');
  return (
    <div className='flex flex-col w-full'>
      {/* Re-use Hero content at the top */}
      <Hero />

      {/* Action Boxes Section */}
      <section className='px-8 md:px-24 max-w-screen-2xl mx-auto w-full pb-20'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
          {/* Left Box: Log a Debt */}
          <div className='bg-white rounded-2xl border-2 border-gray-100 p-10 shadow-sm flex flex-col items-start gap-4'>
            <h2 className='text-2xl font-bold text-black'>{t('logDebt')}</h2>
            <p className='text-lg text-black'>
              {t('logDebtDesc')}
            </p>
            <Link href='/create-debt'>
              <Button className='bg-[#001f3f] hover:bg-[#003366] text-white px-8 py-6 h-auto text-lg rounded-xl mt-2'>
                {t('createDebt')}
              </Button>
            </Link>
          </div>

          {/* Right Box: Pending Debts */}
          <div className='bg-white rounded-2xl border-2 border-gray-100 p-10 shadow-sm flex flex-col items-start gap-4'>
            <h2 className='text-2xl font-bold text-black'>{t('pendingDebts')}</h2>
            <p className='text-lg text-gray-500 italic'>{t('noDebtsYet')}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
