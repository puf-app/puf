import type { Metadata } from 'next';
import { Inter, Inter_Tight } from 'next/font/google';
import './globals.css';

// providers
import Providers from '@/providers/Providers';

// components
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';

const interSans = Inter({
  variable: '--font-inter-sans',
  subsets: ['latin'],
});

const interTight = Inter_Tight({
  variable: '--font-inter-tight',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'PUF - reši se dolgov',
  description:
    'Aplikacija za sledenje dolgov in obveznosti med prijatelji in znanci.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body
        className={`${interSans.variable} ${interTight.variable} antialiased`}
      >
        <Providers>
          <div className='flex flex-col min-h-screen justify-between font-sans'>
            <Header />
            {children}
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
