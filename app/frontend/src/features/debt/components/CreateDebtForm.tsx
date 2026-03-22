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
import { useCreateDebtMutation } from '../hooks/useDebtQuery';
import { IDebt } from '../types';
import { useTranslations } from 'next-intl';

const CURRENCIES = ['EUR', 'USD', 'GBP', 'CHF'];

export default function CreateDebtForm() {
  const dispatch = useAppDispatch();
  const state = useAppSelector((s) => s.debt);
  const [files, setFiles] = useState<File[]>([]);
  const createDebtMutation = useCreateDebtMutation();
  const t = useTranslations('Debts.createForm');

  const debtSchema = z.object({
    debtor_username: z.string().min(1, t('validation.usernameReq')),
    title: z.string().min(1, t('validation.titleReq')),
    description: z.string().optional(),
    amount: z
      .string()
      .min(1, t('validation.amountReq'))
      .refine((v) => parseFloat(v) > 0, t('validation.amountMin')),
    currency: z.string().min(1),
    reason: z.string().optional(),
    due_date: z.string().min(1, t('validation.dueDateReq')),
  });

  type FormValues = z.infer<typeof debtSchema>;

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

    try {
      const res = await createDebtMutation.mutateAsync({
        debtor_username: data.debtor_username,
        title: data.title,
        description: data.description,
        amount: parseFloat(data.amount),
        currency: data.currency,
        reason: data.reason,
        due_date: data.due_date,
        verification_required: state.verificationRequired,
      });
      
      dispatch(setCreatedDebt(res.debt));
      dispatch(setStatus('success'));
    } catch (err) {
      dispatch(setStatus('error'));
    }
  };

  const onAbort = () => {
    dispatch(resetForm());
    setFiles([]);
    reset();
  };

  const isSubmitting = createDebtMutation.isPending || state.status === 'submitting';
  const isSuccess = createDebtMutation.isSuccess || state.status === 'success';

  return (
    <div className='min-h-screen bg-background'>
      {/* Success banner */}
      {isSuccess && (
        <div className='bg-green-50 border-b border-green-200 px-6 py-3 flex items-center gap-2 text-green-700 text-sm font-medium'>
          <HugeiconsIcon icon={Tick01Icon} size={16} color='#15803d' />
          {t('success')}
        </div>
      )}

      <main className='max-w-5xl mx-auto px-4 sm:px-6 py-8'>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Left column */}
            <Card className='p-6 space-y-5'>
              <div className='space-y-1.5'>
                <Label htmlFor='debtor_username'>{t('fields.username')}</Label>
                <Input
                  id='debtor_username'
                  {...register('debtor_username')}
                  placeholder={t('fields.usernamePlaceholder')}
                  className={errors.debtor_username ? 'border-red-400' : ''}
                />
                {errors.debtor_username && (
                  <p className='text-xs text-red-500'>
                    {errors.debtor_username.message}
                  </p>
                )}
              </div>

              <div className='space-y-1.5'>
                <Label htmlFor='title'>{t('fields.title')}</Label>
                <Input
                  id='title'
                  {...register('title')}
                  placeholder={t('fields.titlePlaceholder')}
                  className={errors.title ? 'border-red-400' : ''}
                />
                {errors.title && (
                  <p className='text-xs text-red-500'>{errors.title.message}</p>
                )}
              </div>

              <div className='space-y-1.5'>
                <Label htmlFor='description'>{t('fields.description')}</Label>
                <Input
                  id='description'
                  {...register('description')}
                  placeholder={t('fields.descriptionPlaceholder')}
                />
              </div>

              <div className='space-y-1.5'>
                <Label htmlFor='reason'>{t('fields.reason')}</Label>
                <Input
                  id='reason'
                  {...register('reason')}
                  placeholder={t('fields.reasonPlaceholder')}
                />
              </div>

              <div className='flex items-center gap-2'>
                <input
                  type='checkbox'
                  id='verification_required'
                  checked={state.verificationRequired}
                  onChange={(e) =>
                    dispatch(setVerificationRequired(e.target.checked))
                  }
                  className='w-4 h-4 accent-blue-600'
                />
                <Label htmlFor='verification_required'>
                  {t('fields.verificationReq')}
                </Label>
              </div>
            </Card>

            {/* Right column */}
            <div className='space-y-6'>
              <Card className='p-6 space-y-5'>
                <div className='space-y-1.5'>
                  <Label htmlFor='due_date'>{t('fields.dueDate')}</Label>
                  <Input
                    id='due_date'
                    type='date'
                    {...register('due_date')}
                    className={errors.due_date ? 'border-red-400' : ''}
                  />
                  {errors.due_date && (
                    <p className='text-xs text-red-500'>
                      {errors.due_date.message}
                    </p>
                  )}
                </div>

                <div className='grid grid-cols-2 gap-3'>
                  <div className='space-y-1.5'>
                    <Label htmlFor='currency'>{t('fields.currency')}</Label>
                    <select
                      id='currency'
                      {...register('currency')}
                      className='w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background transition'
                    >
                      {CURRENCIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className='space-y-1.5'>
                    <Label htmlFor='amount'>{t('fields.amount')}</Label>
                    <Input
                      id='amount'
                      type='number'
                      min='0'
                      step='0.01'
                      {...register('amount')}
                      placeholder={t('fields.amountPlaceholder')}
                      className={errors.amount ? 'border-red-400' : ''}
                    />
                    {errors.amount && (
                      <p className='text-xs text-red-500'>
                        {errors.amount.message}
                      </p>
                    )}
                  </div>
                </div>
              </Card>

              {/* Image upload */}
              <Card className='p-6'>
                <ImageUpload files={files} onChange={setFiles} />
              </Card>
            </div>
          </div>

          {/* Request status - shown after debt is created */}
          {state.createdDebt && (
            <div className='mt-6'>
              <RequestStatus debt={state.createdDebt} />
            </div>
          )}

          {/* Buttons */}
          <div className='flex gap-3 mt-8 justify-center'>
            <Button
              type='submit'
              disabled={isSubmitting}
              className='flex items-center gap-2'
            >
              <HugeiconsIcon icon={Tick01Icon} size={16} color='white' />
              {isSubmitting ? t('actions.sending') : t('actions.create')}
            </Button>
            <Button
              type='button'
              variant='secondary'
              onClick={onAbort}
              className='flex items-center gap-2'
            >
              <HugeiconsIcon icon={Cancel01Icon} size={16} />
              {t('actions.abort')}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
