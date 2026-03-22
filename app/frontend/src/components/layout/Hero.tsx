import Image from 'next/image';
import { useTranslations } from 'next-intl';

export default function Hero() {
  const t = useTranslations('Hero');
  return (
    <section className='flex flex-col lg:flex-row items-center justify-between gap-4 md:gap-16 py-20 px-8 md:px-24 max-w-screen-2xl mx-auto'>
      <div className='flex flex-col gap-6 text-center lg:text-left order-2 lg:order-1 flex-1 text-black'>
        <p className='text-2xl md:text-3xl lg:text-4xl font-bold'>{t('aboutUs')}</p>
        <p className='text-xl md:text-2xl lg:text-3xl leading-relaxed'>
          {t('description')}
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
