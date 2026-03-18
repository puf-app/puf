import type { Metadata } from 'next';
import { DebtsPage } from '@/features/debts';

export const metadata: Metadata = {
  title: 'Dolgovi | Puf',
  description: 'Pregled mojih dolgov in dolgov drugih do mene',
};

export default function DolgoviPage() {
  return <DebtsPage />;
}
