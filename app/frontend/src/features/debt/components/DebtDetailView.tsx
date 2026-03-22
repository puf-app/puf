'use client';

import { IDebt } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import { Tick01Icon, PencilEdit01Icon, Money01Icon } from '@hugeicons/core-free-icons';
import { useState } from 'react';
import { useAppDispatch } from '@/hooks/redux';
import { setStatus } from '@/stores/slices/debtSlice';
import { useRouter } from 'next/navigation';
import { useUpdateDebtMutation, useCompleteDebtMutation } from '../hooks/useDebtQuery';

interface DebtDetailViewProps {
  debt: IDebt;
  currentUserId: string;
}

export default function DebtDetailView({ debt, currentUserId }: DebtDetailViewProps) {
  const isCreditor = debt.creditorUserId === currentUserId;
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const updateMutation = useUpdateDebtMutation();
  const completeMutation = useCompleteDebtMutation();

  // Edit form state
  const [editTitle, setEditTitle] = useState(debt.title);
  const [editAmount, setEditAmount] = useState(debt.amount.toString());

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
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  const handleSettle = async () => {
    if (!confirm('Are you sure you want to mark this debt as settled?')) return;
    
    setLoading(true);
    try {
      await completeMutation.mutateAsync(debt._id);
      alert('Debt marked as settled!');
      router.refresh();
      router.push('/debts');
    } catch (err: any) {
      alert(err.message || 'Failed to settle debt');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await updateMutation.mutateAsync({
        id: debt._id,
        data: {
          title: editTitle,
          amount: parseFloat(editAmount),
        }
      });
      alert('Debt updated successfully!');
      setIsEditing(false);
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Failed to update debt');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='max-w-4xl mx-auto w-full py-12 px-4'>
      <div className='flex items-center gap-4 mb-8'>
        <Button variant='ghost' onClick={() => router.push('/debts')} className='p-2 hover:bg-gray-100 rounded-full'>
          <HugeiconsIcon icon={Money01Icon} size={24} className='rotate-180' />
        </Button>
        <h1 className='text-3xl font-bold text-black'>Debt Details</h1>
      </div>

      <Card className='border-2 border-gray-100 rounded-3xl overflow-hidden'>
        <CardHeader className='bg-gray-50 border-b border-gray-100 p-8'>
          <div className='flex justify-between items-start'>
            <div className='flex-1'>
              {isEditing ? (
                <input 
                  type='text' 
                  value={editTitle} 
                  onChange={(e) => setEditTitle(e.target.value)}
                  className='text-2xl font-bold text-black mb-2 bg-white border-2 border-blue-200 rounded-lg px-3 py-1 w-full outline-none focus:border-blue-400'
                />
              ) : (
                <CardTitle className='text-2xl font-bold text-black mb-2'>{debt.title}</CardTitle>
              )}
              <div className='flex items-center gap-3'>
                <span className={`${getStatusColor(debt.status)} font-semibold px-3 py-1 rounded-full border text-sm`}>
                  {debt.status}
                </span>
                <span className='text-gray-400 text-sm'>Created on {formatDate(debt.createdAt)}</span>
              </div>
            </div>
            <div className='text-right ml-4'>
              <p className='text-sm text-gray-500 font-medium uppercase tracking-wider mb-1'>Amount</p>
              {isEditing ? (
                <div className='flex items-center gap-2 justify-end'>
                  <input 
                    type='number' 
                    value={editAmount} 
                    onChange={(e) => setEditAmount(e.target.value)}
                    className='text-2xl font-black text-[#001f3f] bg-white border-2 border-blue-200 rounded-lg px-3 py-1 w-32 text-right outline-none focus:border-blue-400'
                  />
                  <span className='text-2xl font-black text-[#001f3f]'>{debt.currency}</span>
                </div>
              ) : (
                <p className='text-4xl font-black text-[#001f3f]'>{debt.amount} {debt.currency}</p>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className='p-8 space-y-8'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
            <div className='space-y-4'>
              <div>
                <h3 className='text-sm font-bold text-gray-400 uppercase tracking-wider mb-1'>Creditor</h3>
                <p className='text-lg font-semibold text-black'>{isCreditor ? 'You' : 'User'}</p>
              </div>
              <div>
                <h3 className='text-sm font-bold text-gray-400 uppercase tracking-wider mb-1'>Debtor</h3>
                <p className='text-lg font-semibold text-black'>{isCreditor ? 'User' : 'You'}</p>
              </div>
            </div>
            <div className='space-y-4'>
              <div>
                <h3 className='text-sm font-bold text-gray-400 uppercase tracking-wider mb-1'>Due Date</h3>
                <p className='text-lg font-semibold text-black'>{formatDate(debt.dueDate)}</p>
              </div>
              <div>
                <h3 className='text-sm font-bold text-gray-400 uppercase tracking-wider mb-1'>Reason</h3>
                <p className='text-lg font-semibold text-black capitalize'>{debt.reason || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className='border-t border-gray-100 pt-8'>
            <h3 className='text-sm font-bold text-gray-400 uppercase tracking-wider mb-2'>Description</h3>
            <p className='text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-2xl italic'>
              &quot;{debt.description || 'No description provided.'}&quot;
            </p>
          </div>

          {isCreditor && debt.status !== 'PAID' && (
            <div className='flex flex-col sm:flex-row gap-4 pt-8 border-t border-gray-100'>
              {isEditing ? (
                <>
                  <Button 
                    onClick={handleUpdate} 
                    className='flex-1 bg-[#001f3f] hover:bg-[#003366] text-white py-6 h-auto text-lg rounded-2xl font-bold flex items-center justify-center gap-2'
                    disabled={loading || updateMutation.isPending}
                  >
                    <HugeiconsIcon icon={Tick01Icon} size={20} />
                    {loading || updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button 
                    variant='outline'
                    onClick={() => {
                      setIsEditing(false);
                      setEditTitle(debt.title);
                      setEditAmount(debt.amount.toString());
                    }} 
                    className='flex-1 border-2 border-gray-200 text-gray-500 hover:bg-gray-50 py-6 h-auto text-lg rounded-2xl font-bold flex items-center justify-center gap-2'
                    disabled={loading || updateMutation.isPending}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    onClick={handleSettle} 
                    className='flex-1 bg-green-600 hover:bg-green-700 text-white py-6 h-auto text-lg rounded-2xl font-bold flex items-center justify-center gap-2'
                    disabled={loading || completeMutation.isPending}
                  >
                    <HugeiconsIcon icon={Tick01Icon} size={20} />
                    {loading || completeMutation.isPending ? 'Processing...' : 'Settle Debt'}
                  </Button>
                  <Button 
                    variant='outline' 
                    onClick={() => setIsEditing(true)}
                    className='flex-1 border-2 border-[#001f3f] text-[#001f3f] hover:bg-gray-50 py-6 h-auto text-lg rounded-2xl font-bold flex items-center justify-center gap-2'
                    disabled={loading || completeMutation.isPending}
                  >
                    <HugeiconsIcon icon={PencilEdit01Icon} size={20} />
                    Edit Details
                  </Button>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
