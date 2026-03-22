import type { Metadata } from 'next';
import { Inter, Inter_Tight } from 'next/font/google';
import '../globals.css';
import { NextIntlClientProvider } from 'next-intl';
import { setRequestLocale, getMessages } from 'next-intl/server';

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
  title: {
    default: 'PUF - reši se dolgov',
    template: '%s | PUF',
  },
  description:
    'Aplikacija za sledenje dolgov in obveznosti med prijatelji in znanci. Enostavno beleženje, sledenje in poravnava dolgov.',
  keywords: ['debt tracker', 'dolgi', 'finančno upravljanje', 'sledenje denarja', 'prijatelji', 'obveznosti'],
  authors: [{ name: 'PUF Team' }],
  creator: 'PUF',
  publisher: 'PUF',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'sl_SI',
    url: 'https://puf.app',
    siteName: 'PUF',
    title: 'PUF - reši se dolgov',
    description: 'Aplikacija za sledenje dolgov in obveznosti med prijatelji in znanci.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'PUF - Debt Tracker',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PUF - reši se dolgov',
    description: 'Aplikacija za sledenje dolgov in obveznosti med prijatelji in znanci.',
    images: ['/og-image.png'],
  },
  verification: {
    google: 'google-site-verification-code',
  },
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body
        className={`${interSans.variable} ${interTight.variable} antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <div className='flex flex-col min-h-screen justify-between font-sans'>
              <Header />
              {children}
              <Footer />
            </div>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
