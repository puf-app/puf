import type { Metadata } from 'next';
import { Geist, Geist_Mono, Inter } from 'next/font/google';
import './globals.css';

// providers
import Providers from '@/providers/Providers';

// components
import Footer from '@/components/layout/Footer';
import { cn } from "@/lib/utils";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
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
    <html lang='en' className={cn("font-sans", inter.variable)}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <div className='flex flex-col min-h-screen justify-between font-sans'>
            {children}
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
