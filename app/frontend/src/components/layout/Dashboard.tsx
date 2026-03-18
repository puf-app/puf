import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Hero from './Hero';

export default function Dashboard() {
  return (
    <div className='flex flex-col w-full'>
      {/* Re-use Hero content at the top */}
      <Hero />

      {/* Action Boxes Section */}
      <section className='px-8 md:px-24 max-w-screen-2xl mx-auto w-full pb-20'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
          {/* Left Box: Log a Debt */}
          <div className='bg-white rounded-2xl border-2 border-gray-100 p-10 shadow-sm flex flex-col items-start gap-4'>
            <h2 className='text-2xl font-bold text-black'>Log a Debt</h2>
            <p className='text-lg text-black'>
              Keep a clear record of everything you owe.
            </p>
            <div className='mt-2 flex flex-wrap gap-3'>
              <Link href='/dolgovi'>
                <Button className='bg-[#001f3f] hover:bg-[#003366] text-white px-8 py-6 h-auto text-lg rounded-xl'>
                  Open Debts
                </Button>
              </Link>
              <Link href='/ustvari-dolg'>
                <Button
                  variant='outline'
                  className='px-8 py-6 h-auto text-lg rounded-xl border-[#001f3f] text-[#001f3f] hover:bg-[#001f3f]/5'
                >
                  Create Debt
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Box: Pending Debts */}
          <div className='bg-white rounded-2xl border-2 border-gray-100 p-10 shadow-sm flex flex-col items-start gap-4'>
            <h2 className='text-2xl font-bold text-black'>Pending debts</h2>
            <p className='text-lg text-gray-500 italic'>
              Live debt overview is now available on the Debts page.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
