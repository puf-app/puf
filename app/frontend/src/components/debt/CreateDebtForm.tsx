'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { HugeiconsIcon } from '@hugeicons/react';
import { Tick01Icon, Cancel01Icon } from '@hugeicons/core-free-icons';

import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import {
  setVerificationRequired,
  setStatus,
  setCreatedDebt,
  resetForm,
} from '@/stores/slices/debtSlice';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

import ImageUpload from './ImageUpload';
import RequestStatus from './RequestStatus';

const debtSchema = z.object({
  debtor_username: z.string().min(1, 'Debtor username is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  amount: z
    .string()
    .min(1, 'Amount is required')
    .refine((v) => parseFloat(v) > 0, 'Amount must be greater than 0'),
  currency: z.string().min(1),
  reason: z.string().optional(),
  due_date: z.string().min(1, 'Due date is required'),
});

type FormValues = z.infer<typeof debtSchema>;

const CURRENCIES = ['EUR', 'USD', 'GBP', 'CHF'];

export default function CreateDebtForm() {
  const dispatch = useAppDispatch();
  const state = useAppSelector((s) => s.debt);
  const [files, setFiles] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(debtSchema),
    defaultValues: { currency: 'EUR' },
  });

  const onSubmit = async (data: FormValues) => {
    dispatch(setStatus('submitting'));


   const response = await fetch('https://api.fl0rijan.freemyip.com/debts/createDebt', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        debtor_username: data.debtor_username,
         title: data.title,
         description: data.description,
         amount: parseFloat(data.amount),
         currency: data.currency,
         reason: data.reason,
         due_date: data.due_date,
        verification_required: state.verificationRequired,
       }),
     });
     const result = await response.json();
     dispatch(setCreatedDebt(result));
     dispatch(setStatus('success'));

    setTimeout(() => {
      dispatch(setStatus('success'));
    }, 800);
  };

  const onAbort = () => {
    dispatch(resetForm());
    setFiles([]);
    reset();
  };

  const isSubmitting = state.status === 'submitting';
  const isSuccess = state.status === 'success';

  return (
    <div className="min-h-screen bg-background">
      {/* Page header */}
      <div className="bg-[#1a2744] px-6 py-5 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Create debt
        </h1>
      </div>

      {/* Success banner */}
      {isSuccess && (
        <div className="bg-green-50 border-b border-green-200 px-6 py-3 flex items-center gap-2 text-green-700 text-sm font-medium">
          <HugeiconsIcon icon={Tick01Icon} size={16} color="#15803d" />
          Debt created successfully!
        </div>
      )}

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Left column */}
            <Card className="p-6 space-y-5">

              <div className="space-y-1.5">
                <Label htmlFor="debtor_username">Debtor username</Label>
                <Input
                  id="debtor_username"
                  {...register('debtor_username')}
                  placeholder="Enter debtor username"
                  className={errors.debtor_username ? 'border-red-400' : ''}
                />
                {errors.debtor_username && (
                  <p className="text-xs text-red-500">{errors.debtor_username.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  {...register('title')}
                  placeholder="Enter debt title"
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

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="verification_required"
                  checked={state.verificationRequired}
                  onChange={(e) => dispatch(setVerificationRequired(e.target.checked))}
                  className="w-4 h-4 accent-blue-600"
                />
                <Label htmlFor="verification_required">Verification required</Label>
              </div>

            </Card>

            {/* Right column */}
            <div className="space-y-6">
              <Card className="p-6 space-y-5">

                <div className="space-y-1.5">
                  <Label htmlFor="due_date">Due date</Label>
                  <Input
                    id="due_date"
                    type="date"
                    {...register('due_date')}
                    className={errors.due_date ? 'border-red-400' : ''}
                  />
                  {errors.due_date && (
                    <p className="text-xs text-red-500">{errors.due_date.message}</p>
                  )}
                </div>

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

          {/* Request status - shown after debt is created */}
          {state.createdDebt && (
            <div className="mt-6">
              <RequestStatus debt={state.createdDebt} />
            </div>
          )}

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
  );
}
