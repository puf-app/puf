import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Statistics - PUF',
  description: 'View your debt statistics, trends over time, and financial insights. Track total debts, recent activity, and amount summaries.',
  keywords: ['debt tracker', 'statistics', 'financial management', 'debt overview', 'money tracking'],
  openGraph: {
    title: 'Statistics - PUF',
    description: 'View your debt statistics, trends over time, and financial insights.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Statistics - PUF',
    description: 'View your debt statistics, trends over time, and financial insights.',
  },
};

export default function StatisticsPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
