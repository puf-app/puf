import { Metadata } from 'next';
import CreateDebtForm from '@/components/debt/CreateDebtForm';

export const metadata: Metadata = {
  title: 'Create Debt | Puff',
  description: 'Create a new debt and send requests to debtors',
};

export default function CreateDebtPage() {
  return <CreateDebtForm />;
}
