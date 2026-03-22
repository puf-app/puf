import { IDebt } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

interface DebtCardProps {
  debt: IDebt;
  isCreditor: boolean;
}

export default function DebtCard({ debt, isCreditor }: DebtCardProps) {
  const getStatusColor = (status: IDebt['status']) => {
    switch (status) {
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'PAID':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(dateString));
  };

  return (
    <Link href={`/debts/${debt._id}`} className='block focus:outline-none focus:ring-2 focus:ring-[#001f3f] rounded-2xl'>
      <Card className='hover:shadow-md transition-shadow border-2 border-gray-100 rounded-2xl h-full'>
        <CardHeader className='pb-2'>
          <div className='flex justify-between items-start'>
            <CardTitle className='text-lg font-bold text-black'>
              {debt.title}
            </CardTitle>
            <span
              className={`${getStatusColor(
                debt.status
              )} font-semibold px-2 py-0.5 rounded-full border text-xs`}
            >
              {debt.status}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col gap-2'>
            <div className='flex justify-between items-center'>
              <span className='text-sm text-gray-500 font-medium'>Amount:</span>
              <span className='text-xl font-bold text-[#001f3f]'>
                {debt.amount} {debt.currency}
              </span>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-sm text-gray-500 font-medium'>
                {isCreditor ? 'Debtor:' : 'Creditor:'}
              </span>
              <span className='text-sm font-semibold text-black'>
                {/* placeholder for username */}
                {isCreditor ? 'User' : 'You'}
              </span>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-sm text-gray-500 font-medium'>Due Date:</span>
              <span className='text-sm text-black'>{formatDate(debt.dueDate)}</span>
            </div>
            {debt.description && (
              <p className='text-sm text-gray-600 mt-2 line-clamp-2 italic'>
                &quot;{debt.description}&quot;
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
