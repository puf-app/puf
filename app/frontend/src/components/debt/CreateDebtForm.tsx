'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { HugeiconsIcon } from '@hugeicons/react';
import { UserAdd01Icon, Tick01Icon, Cancel01Icon } from '@hugeicons/core-free-icons';

import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import {
  setIsCompany,
  addDebtor,
  removeDebtor,
  setStatus,
  resetForm,
  IDebtor,
} from '@/stores/slices/debtSlice';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

import DebtorTag from './DebtorTag';
import ContactsModal from './ContactsModal';
import ImageUpload from './ImageUpload';

const debtSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  amount: z
    .string()
    .min(1, 'Amount is required')
    .refine((v) => parseFloat(v) > 0, 'Amount must be greater than 0'),
  currency: z.string().min(1),
  reason: z.string().optional(),
  dueDate: z.string().min(1, 'Due date is required'),
});

type FormValues = z.infer<typeof debtSchema>;

const CURRENCIES = ['EUR', 'USD', 'GBP', 'CHF'];

export default function CreateDebtForm() {
  const dispatch = useAppDispatch();
  const state = useAppSelector((s) => s.debt);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [debtorError, setDebtorError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(debtSchema),
    defaultValues: { currency: 'EUR' },
  });

  const onSubmit = (_data: FormValues) => {
    if (state.debtors.length === 0) {
      setDebtorError('At least one debtor is required.');
      return;
    }
    setDebtorError('');
    dispatch(setStatus('submitting'));

    // TODO: Replace with real API call when backend is ready
    // POST /api/debts with _data and state.debtors
    setTimeout(() => {
      dispatch(setStatus('success'));
    }, 800);
  };

  const onAbort = () => {
    dispatch(resetForm());
    setFiles([]);
    setDebtorError('');
    reset();
  };

  const handleAddDebtor = (debtor: IDebtor) => {
    dispatch(addDebtor(debtor));
    setDebtorError('');
  };

  const isSubmitting = state.status === 'submitting';
  const isSuccess = state.status === 'success';

  return (
    <>
      <div className="min-h-screen bg-background">
        {/* Page header */}
        <div className="bg-[#1a2744] px-6 py-5 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Create debt
          </h1>
          <Button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2"
          >
            <HugeiconsIcon icon={UserAdd01Icon} size={16} color="white" />
            Contacts
          </Button>
        </div>

        {/* Success banner */}
        {isSuccess && (
          <div className="bg-green-50 border-b border-green-200 px-6 py-3 flex items-center gap-2 text-green-700 text-sm font-medium">
            <HugeiconsIcon icon={Tick01Icon} size={16} color="#15803d" />
            Debt created successfully! Requests have been sent to debtors.
          </div>
        )}

        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Left column */}
              <Card className="p-6 space-y-5">

                <div className="space-y-1.5">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    {...register('title')}
                    placeholder="Enter your debt title"
                    className={errors.title ? 'border-red-400' : ''}
                  />
                  {errors.title && (
                    <p className="text-xs text-red-500">{errors.title.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    {...register('description')}
                    placeholder="Enter debt description"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="reason">Reason</Label>
                  <Input
                    id="reason"
                    {...register('reason')}
                    placeholder="Enter reason for debt"
                  />
                </div>

                {/* Person / Company */}
                <div className="flex gap-4">
                  {[
                    { label: 'Person', value: false },
                    { label: 'Company', value: true },
                  ].map(({ label, value }) => (
                    <label
                      key={label}
                      className="flex items-center gap-2 cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        checked={state.isCompany === value}
                        onChange={() => dispatch(setIsCompany(value))}
                        className="w-4 h-4 accent-blue-600"
                      />
                      <span className="text-sm">{label}</span>
                    </label>
                  ))}
                </div>

                {/* Add debtor */}
                <div className="space-y-1.5">
                  <Label htmlFor="debtor">Add debtor</Label>
                  <Input
                    id="debtor"
                    placeholder="Enter debtor username"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const value = (e.target as HTMLInputElement).value.trim();
                        if (value) {
                          handleAddDebtor({
                            id: `manual-${Date.now()}`,
                            username: value,
                            displayName: value,
                          });
                          (e.target as HTMLInputElement).value = '';
                        }
                      }
                    }}
                  />
                  {debtorError && (
                    <p className="text-xs text-red-500">{debtorError}</p>
                  )}
                  {state.debtors.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {state.debtors.map((d: IDebtor) => (
                        <DebtorTag
                          key={d.id}
                          debtor={d}
                          onRemove={(id: string) => dispatch(removeDebtor(id))}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </Card>

              {/* Right column */}
              <div className="space-y-6">
                <Card className="p-6 space-y-5">

                  {/* Due date */}
                  <div className="space-y-1.5">
                    <Label htmlFor="dueDate">Due date</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      {...register('dueDate')}
                      className={errors.dueDate ? 'border-red-400' : ''}
                    />
                    {errors.dueDate && (
                      <p className="text-xs text-red-500">{errors.dueDate.message}</p>
                    )}
                  </div>

                  {/* Currency + Amount */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="currency">Currency</Label>
                      <select
                        id="currency"
                        {...register('currency')}
                        className="w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background transition"
                      >
                        {CURRENCIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="amount">Amount</Label>
                      <Input
                        id="amount"
                        type="number"
                        min="0"
                        step="0.01"
                        {...register('amount')}
                        placeholder="Enter amount"
                        className={errors.amount ? 'border-red-400' : ''}
                      />
                      {errors.amount && (
                        <p className="text-xs text-red-500">{errors.amount.message}</p>
                      )}
                    </div>
                  </div>
                </Card>

                {/* Image upload */}
                <Card className="p-6">
                  <ImageUpload files={files} onChange={setFiles} />
                </Card>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-8 justify-center">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2"
              >
                <HugeiconsIcon icon={Tick01Icon} size={16} color="white" />
                {isSubmitting ? 'Sending...' : 'Create debt'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={onAbort}
                className="flex items-center gap-2"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={16} />
                Abort debt
              </Button>
            </div>
          </form>
        </main>
      </div>

      <ContactsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddDebtor={handleAddDebtor}
        selectedDebtorIds={state.debtors.map((d: IDebtor) => d.id)}
      />
    </>
   );
}
