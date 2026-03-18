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
  setRequests,
  setStatus,
  resetForm,
  IDebtor,
  IDebtRequest,
  TDebtType,
} from '@/stores/slices/debtSlice';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

import DebtorTag from './DebtorTag';
import ContactsModal from './ContactsModal';
import ImageUpload from './ImageUpload';
import RequestStatus from './RequestStatus';

const debtSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  username: z.string().optional(),
  description: z.string().optional(),
  amount: z
    .string()
    .min(1, 'Amount is required')
    .refine((v) => parseFloat(v) > 0, 'Amount must be greater than 0'),
  currency: z.string().min(1),
  type: z.string().min(1, 'Debt type is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  delayDate: z.string().optional(),
});

type FormValues = z.infer<typeof debtSchema>;

const CURRENCIES = ['EUR', 'USD', 'GBP', 'CHF'];

const DEBT_TYPES: { value: TDebtType; label: string }[] = [
  { value: 'personal', label: 'Personal' },
  { value: 'business', label: 'Business' },
  { value: 'mortgage', label: 'Mortgage' },
  { value: 'student', label: 'Student loan' },
  { value: 'credit_card', label: 'Credit card' },
  { value: 'other', label: 'Other' },
];

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
    setTimeout(() => {
      const mockRequests: IDebtRequest[] = state.debtors.map(
        (d: IDebtor, i: number) => ({
          id: `request-${i}`,
          debtId: 'debt-mock',
          debtorId: d.id,
          debtorUsername: d.username,
          status: 'pending' as const,
          sentAt: new Date().toISOString(),
        })
      );
      dispatch(setRequests(mockRequests));
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
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    {...register('username')}
                    placeholder="Enter your username"
                  />
                </div>

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
                      <span className="text-sm text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>

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

                <div className="space-y-1.5">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    {...register('description')}
                    placeholder="Enter debt description"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="type">Type of debt</Label>
                  <select
                    id="type"
                    {...register('type')}
                    className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background transition ${
                      errors.type ? 'border-red-400' : 'border-input'
                    }`}
                  >
                    <option value="">Choose the type of your debt</option>
                    {DEBT_TYPES.map(({ value, label }) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  {errors.type && (
                    <p className="text-xs text-red-500">{errors.type.message}</p>
                  )}
                </div>
              </Card>

              {/* Right column */}
              <div className="space-y-6">
                <Card className="p-6 space-y-5">

                  <div className="space-y-1.5">
                    <Label htmlFor="startDate">Choose a start date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      {...register('startDate')}
                      className={errors.startDate ? 'border-red-400' : ''}
                    />
                    {errors.startDate && (
                      <p className="text-xs text-red-500">{errors.startDate.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="endDate">Choose end date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      {...register('endDate')}
                      className={errors.endDate ? 'border-red-400' : ''}
                    />
                    {errors.endDate && (
                      <p className="text-xs text-red-500">{errors.endDate.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="delayDate">Date of delay (max.)</Label>
                    <Input
                      id="delayDate"
                      type="date"
                      {...register('delayDate')}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="currency">Select currency</Label>
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
                      <Label htmlFor="amount">Debt amount</Label>
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

                <Card className="p-6">
                  <ImageUpload files={files} onChange={setFiles} />
                </Card>
              </div>
            </div>

            {state.requests.length > 0 && (
              <div className="mt-6">
                <RequestStatus requests={state.requests} />
              </div>
            )}

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
