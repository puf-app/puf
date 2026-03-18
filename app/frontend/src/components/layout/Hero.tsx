import Image from 'next/image';

export default function Hero() {
  return (
    <section className='flex flex-col md:flex-row items-center justify-between gap-16 py-20 px-8 md:px-24 max-w-screen-2xl mx-auto'>
      <div className='flex flex-col gap-6 text-center md:text-left order-2 md:order-1 flex-1 text-black'>
        <p className='text-2xl md:text-4xl font-bold'>About us</p>
        <p className='text-xl md:text-3xl leading-relaxed'>
          Welcome to our platform. This is a simple space where you can keep
          track of shared expenses and debts between people. Easily create a new
          debt, see who owes what, and keep everything organized in one place.
          To get started, just create a new entry and manage your balances
          quickly and clearly.
        </p>
      </div>
      <div className='flex-shrink-0 order-1 md:order-2'>
        <Image
          src='/images/puf.svg'
          alt='Puf Logo'
          width={450}
          height={450}
          className='object-contain w-[250px] h-[250px] md:w-[450px] md:h-[450px]'
        />
      </div>
    </section>
  );
}
