'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { HugeiconsIcon } from '@hugeicons/react';
import { Upload01Icon } from '@hugeicons/core-free-icons';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppSelector } from '@/hooks/redux';
import { getFromApi } from '@/lib/api/client';
import { cn } from '@/lib/utils';
import {
  createVerificationRequest,
  getMyVerificationStatus,
  mapDocumentTypeForApi,
  resubmitVerificationDraft,
  submitVerificationForReview,
  syncProfileFromVerificationForm,
  uploadVerificationDocument,
  type IMyVerificationStatus,
} from '@/features/verification/services/verificationService';
import type { IUser } from '@/types';

const COUNTRIES = [
  { value: '', label: 'Select country' },
  { value: 'SI', label: 'Slovenia' },
  { value: 'AT', label: 'Austria' },
  { value: 'DE', label: 'Germany' },
  { value: 'IT', label: 'Italy' },
  { value: 'HR', label: 'Croatia' },
  { value: 'HU', label: 'Hungary' },
  { value: 'OTHER', label: 'Other' },
] as const;

const COUNTRY_CODES = [
  { value: '', label: 'Select code' },
  { value: '+386', label: '+386 (SI)' },
  { value: '+43', label: '+43 (AT)' },
  { value: '+49', label: '+49 (DE)' },
  { value: '+39', label: '+39 (IT)' },
  { value: '+385', label: '+385 (HR)' },
] as const;

const DOCUMENT_TYPES = [
  { value: '', label: 'Select type' },
  { value: 'PASSPORT', label: 'Passport' },
  { value: 'NATIONAL_ID', label: 'National ID card' },
  { value: 'DRIVERS_LICENSE', label: "Driver's license" },
] as const;

const verificationSchema = z.object({
  firstName: z.string().min(2, 'Required'),
  lastName: z.string().min(2, 'Required'),
  gender: z.enum(['male', 'female'], { message: 'Select gender' }),
  dateOfBirth: z.string().min(1, 'Required'),
  country: z
    .string()
    .min(1, 'Select country')
    .refine((c) => c !== 'OTHER', {
      message: 'Pick a country with an ISO code (required for verification)',
    }),
  address: z.string().min(3, 'Required'),
  postalCode: z.string().min(2, 'Required'),
  phoneNumber: z.string().min(5, 'Required'),
  countryCode: z.string().min(1, 'Required'),
  documentType: z.string().min(1, 'Select document type'),
  documentNumber: z.string().min(3, 'Enter document number'),
});

type VerificationFormValues = z.infer<typeof verificationSchema>;

type DocumentSide = 'FRONT' | 'BACK' | 'SELFIE';

const SIDES: { side: DocumentSide; label: string }[] = [
  { side: 'FRONT', label: 'Front of ID' },
  { side: 'BACK', label: 'Back of ID' },
  { side: 'SELFIE', label: 'Selfie with ID' },
];

const selectClassName = cn(
  'h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
  'outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30',
  'text-foreground placeholder:text-muted-foreground'
);

function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  placeholderOption = true,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly { value: string; label: string }[];
  placeholderOption?: boolean;
}) {
  return (
    <div className='flex flex-col gap-1.5'>
      <Label htmlFor={id} className='text-sm font-medium text-muted-foreground'>
        {label}
      </Label>
      <div className='relative'>
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(selectClassName, 'appearance-none pr-9')}
        >
          {options.map((opt) => (
            <option key={opt.value || 'empty'} value={opt.value} disabled={placeholderOption && opt.value === ''}>
              {opt.label}
            </option>
          ))}
        </select>
        <span className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground'>
          ▼
        </span>
      </div>
    </div>
  );
}

function UploadSlot({
  side,
  label,
  file,
  onPick,
  disabled,
}: {
  side: DocumentSide;
  label: string;
  file: File | null;
  onPick: (side: DocumentSide, f: File | null) => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className='flex min-w-0 flex-col gap-1.5'>
      <span className='text-xs font-medium text-muted-foreground'>{label}</span>
      <button
        type='button'
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'flex min-h-[100px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-sky-200/80 bg-sky-50/80 px-2 py-3 transition-colors hover:bg-sky-100/90',
          disabled && 'cursor-not-allowed opacity-60'
        )}
      >
        <HugeiconsIcon icon={Upload01Icon} size={24} color='#0f172a' />
        <span className='mt-1 line-clamp-2 text-center text-[11px] text-muted-foreground'>
          {file ? file.name : 'Tap to upload'}
        </span>
        <input
          ref={inputRef}
          type='file'
          accept='image/*,application/pdf'
          className='hidden'
          disabled={disabled}
          onChange={(e) => {
            const f = e.target.files?.[0] ?? null;
            onPick(side, f);
          }}
        />
      </button>
    </div>
  );
}

export default function VerificationPage() {
  const reduxUser = useAppSelector((s) => s.user.user);

  const [remote, setRemote] = useState<IMyVerificationStatus | null | undefined>(undefined);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [authRequired, setAuthRequired] = useState(false);

  const [files, setFiles] = useState<Record<DocumentSide, File | null>>({
    FRONT: null,
    BACK: null,
    SELFIE: null,
  });

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resubmitting, setResubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<VerificationFormValues>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      gender: undefined as unknown as VerificationFormValues['gender'],
      dateOfBirth: '',
      country: '',
      address: '',
      postalCode: '',
      phoneNumber: '',
      countryCode: '',
      documentType: '',
      documentNumber: '',
    },
  });

  const gender = watch('gender');

  const onPickFile = useCallback((side: DocumentSide, f: File | null) => {
    setFiles((prev) => ({ ...prev, [side]: f }));
  }, []);

  const refreshRemote = useCallback(async () => {
    setLoadError(null);
    setAuthRequired(false);
    try {
      const s = await getMyVerificationStatus();
      setRemote(s);
    } catch (e) {
      const msg = e instanceof Error ? e.message : '';
      if (msg.includes('401') || msg.toLowerCase().includes('unauthorized')) {
        setAuthRequired(true);
        setRemote(null);
        return;
      }
      if (msg.includes('404') || msg.toLowerCase().includes('not found')) {
        setRemote(null);
        return;
      }
      setLoadError(msg || 'Could not load verification status');
      setRemote(null);
    }
  }, []);

  useEffect(() => {
    void refreshRemote();
  }, [refreshRemote]);

  const statusUpper = remote?.status?.toUpperCase?.() ?? '';
  const showApproved = statusUpper === 'APPROVED';
  const showPending = statusUpper === 'PENDING';
  const showRejected = statusUpper === 'REJECTED';
  const showDraft = statusUpper === 'DRAFT' || statusUpper === '';

  const canShowForm =
    !authRequired &&
    remote !== undefined &&
    !showApproved &&
    !showPending &&
    (showRejected || showDraft || remote === null);

  const onResubmit = async () => {
    if (!remote?._id) return;
    setResubmitting(true);
    setSubmitError(null);
    try {
      await resubmitVerificationDraft(remote._id);
      await refreshRemote();
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Could not unlock verification');
    } finally {
      setResubmitting(false);
    }
  };

  const onSubmit = async (data: VerificationFormValues) => {
    setSubmitError(null);
    setSubmitSuccess(null);

    if (!files.FRONT || !files.BACK || !files.SELFIE) {
      setSubmitError('Please upload front, back, and selfie images.');
      return;
    }

    setIsSubmitting(true);
    try {
      let userId = reduxUser?._id;
      if (!userId) {
        const profile = await getFromApi<{ user: IUser }>('/api/users/getCurrentUserProfile');
        userId = profile.user._id;
      }

      const phone = `${data.countryCode}${data.phoneNumber.replace(/\s/g, '')}`;
      await syncProfileFromVerificationForm(userId, {
        firstName: data.firstName,
        lastName: data.lastName,
        phone,
      });

      let verificationId: string | undefined;

      if (remote?._id && (statusUpper === 'DRAFT' || statusUpper === 'REJECTED')) {
        verificationId = remote._id;
      } else if (!remote) {
        verificationId = await createVerificationRequest({
          verificationType: mapDocumentTypeForApi(data.documentType),
          documentNumber: data.documentNumber.trim(),
          countryCode: data.country,
        });
      } else {
        verificationId = remote._id;
      }

      if (!verificationId) {
        throw new Error('Missing verification id');
      }

      await uploadVerificationDocument(verificationId, 'FRONT', files.FRONT);
      await uploadVerificationDocument(verificationId, 'BACK', files.BACK);
      await uploadVerificationDocument(verificationId, 'SELFIE', files.SELFIE);

      await submitVerificationForReview(verificationId);

      setSubmitSuccess('Verification submitted. Our team will review your documents.');
      setFiles({ FRONT: null, BACK: null, SELFIE: null });
      await refreshRemote();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Submission failed';
      if (msg.includes('400') || msg.toLowerCase().includes('already')) {
        try {
          const again = await getMyVerificationStatus();
          setRemote(again);
          setSubmitError(
            'A verification request already exists. Status was refreshed — try again or continue from your draft.'
          );
        } catch {
          setSubmitError(msg);
        }
      } else {
        setSubmitError(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className='flex-1 bg-[#eceef2] px-4 py-6 md:px-8 md:py-10'>
      <div className='mx-auto w-full max-w-5xl'>
        <Card className='rounded-2xl border border-gray-100 bg-white p-6 shadow-md md:p-10'>
          <h1 className='mb-6 text-3xl font-bold text-[#10294b] md:sr-only'>
            ID verification
          </h1>

          {authRequired && (
            <div className='mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900'>
              You must be signed in to verify your identity.{' '}
              <Link href='/signin' className='font-semibold text-primary underline'>
                Sign in
              </Link>
            </div>
          )}

          {loadError && (
            <p className='mb-4 text-sm text-destructive'>{loadError}</p>
          )}

          {showApproved && (
            <div className='rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-4 text-emerald-900'>
              <p className='font-semibold'>Your identity is verified.</p>
              <p className='mt-1 text-sm'>You can use all features that require a verified account.</p>
            </div>
          )}

          {showPending && (
            <div className='rounded-lg border border-sky-200 bg-sky-50 px-4 py-4 text-sky-950'>
              <p className='font-semibold'>Verification in progress</p>
              <p className='mt-1 text-sm'>
                We are reviewing your documents. You will be notified when the status changes.
              </p>
            </div>
          )}

          {showRejected && (
            <div className='mb-6 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm'>
              <p className='font-semibold text-destructive'>Verification was rejected</p>
              {remote?.reviewNote ? (
                <p className='mt-1 text-muted-foreground'>{remote.reviewNote}</p>
              ) : null}
              <Button
                type='button'
                variant='secondary'
                className='mt-3'
                disabled={resubmitting}
                onClick={() => void onResubmit()}
              >
                {resubmitting ? 'Working…' : 'Reset to draft and resubmit'}
              </Button>
            </div>
          )}

          {canShowForm && (
            <form onSubmit={handleSubmit(onSubmit)} className='grid gap-8 md:grid-cols-2 md:gap-10 md:items-start'>
              <div className='flex flex-col gap-5'>
                <div className='flex flex-col gap-1.5'>
                  <Label htmlFor='firstName'>First name</Label>
                  <Input
                    id='firstName'
                    placeholder='Enter your first name'
                    {...register('firstName')}
                    aria-invalid={!!errors.firstName}
                  />
                  {errors.firstName && (
                    <p className='text-xs text-destructive'>{errors.firstName.message}</p>
                  )}
                </div>

                <div className='flex flex-col gap-1.5'>
                  <Label htmlFor='lastName'>Last name</Label>
                  <Input
                    id='lastName'
                    placeholder='Enter your last name'
                    {...register('lastName')}
                    aria-invalid={!!errors.lastName}
                  />
                  {errors.lastName && (
                    <p className='text-xs text-destructive'>{errors.lastName.message}</p>
                  )}
                </div>

                <div className='flex flex-col gap-2'>
                  <span className='text-sm font-medium text-muted-foreground'>Gender</span>
                  <div className='grid grid-cols-2 gap-3'>
                    {(['male', 'female'] as const).map((g) => (
                      <button
                        key={g}
                        type='button'
                        onClick={() => setValue('gender', g, { shouldValidate: true })}
                        className={cn(
                          'flex h-12 items-center justify-between rounded-lg border-2 bg-background px-4 text-left text-sm font-medium transition-colors',
                          gender === g
                            ? 'border-primary bg-primary/5 text-foreground'
                            : 'border-input text-muted-foreground hover:border-primary/40'
                        )}
                      >
                        <span className='capitalize'>{g === 'male' ? 'Male' : 'Female'}</span>
                        <span
                          className={cn(
                            'flex h-4 w-4 shrink-0 rounded border-2',
                            gender === g ? 'border-primary bg-primary' : 'border-muted-foreground/40'
                          )}
                        />
                      </button>
                    ))}
                  </div>
                  {errors.gender && (
                    <p className='text-xs text-destructive'>{errors.gender.message}</p>
                  )}
                </div>

                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                  <div className='flex flex-col gap-1.5'>
                    <Label htmlFor='dateOfBirth'>Date of birth</Label>
                    <div className='relative'>
                      <Input
                        id='dateOfBirth'
                        type='date'
                        className='pr-10 [color-scheme:light]'
                        {...register('dateOfBirth')}
                        aria-invalid={!!errors.dateOfBirth}
                      />
                      <span className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground'>
                        📅
                      </span>
                    </div>
                    {errors.dateOfBirth && (
                      <p className='text-xs text-destructive'>{errors.dateOfBirth.message}</p>
                    )}
                  </div>
                  <Controller
                    name='country'
                    control={control}
                    render={({ field }) => (
                      <SelectField
                        id='country'
                        label='Country'
                        value={field.value}
                        onChange={field.onChange}
                        options={COUNTRIES as unknown as { value: string; label: string }[]}
                      />
                    )}
                  />
                </div>
                {errors.country && (
                  <p className='text-xs text-destructive'>{errors.country.message}</p>
                )}

                <div className='flex flex-col gap-1.5'>
                  <Label htmlFor='address'>Address</Label>
                  <Input
                    id='address'
                    placeholder='Enter your address'
                    {...register('address')}
                    aria-invalid={!!errors.address}
                  />
                  {errors.address && (
                    <p className='text-xs text-destructive'>{errors.address.message}</p>
                  )}
                </div>

                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                  <div className='flex flex-col gap-1.5 sm:col-span-1'>
                    <Label htmlFor='postalCode'>Postal code</Label>
                    <Input
                      id='postalCode'
                      placeholder='Enter code'
                      {...register('postalCode')}
                      aria-invalid={!!errors.postalCode}
                    />
                    {errors.postalCode && (
                      <p className='text-xs text-destructive'>{errors.postalCode.message}</p>
                    )}
                  </div>
                </div>

                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                  <div className='flex flex-col gap-1.5'>
                    <Label htmlFor='phoneNumber'>Phone number</Label>
                    <Input
                      id='phoneNumber'
                      type='tel'
                      placeholder='Enter phone number'
                      {...register('phoneNumber')}
                      aria-invalid={!!errors.phoneNumber}
                    />
                    {errors.phoneNumber && (
                      <p className='text-xs text-destructive'>{errors.phoneNumber.message}</p>
                    )}
                  </div>
                  <Controller
                    name='countryCode'
                    control={control}
                    render={({ field }) => (
                      <SelectField
                        id='countryCode'
                        label='Country code'
                        value={field.value}
                        onChange={field.onChange}
                        options={COUNTRY_CODES as unknown as { value: string; label: string }[]}
                      />
                    )}
                  />
                </div>
              </div>

              <div className='flex flex-col gap-5 md:pt-0'>
                <div className='grid grid-cols-2 gap-3 md:grid-cols-1 md:gap-5'>
                  <div className='flex min-w-0 flex-col gap-1.5'>
                    <Controller
                      name='documentType'
                      control={control}
                      render={({ field }) => (
                        <SelectField
                          id='documentType'
                          label='Select document type'
                          value={field.value}
                          onChange={field.onChange}
                          options={DOCUMENT_TYPES as unknown as { value: string; label: string }[]}
                        />
                      )}
                    />
                    {errors.documentType && (
                      <p className='text-xs text-destructive'>{errors.documentType.message}</p>
                    )}
                  </div>

                  <div className='flex flex-col gap-1.5'>
                    <Label htmlFor='documentNumber'>Document number</Label>
                    <Input
                      id='documentNumber'
                      placeholder='As shown on your ID'
                      {...register('documentNumber')}
                      aria-invalid={!!errors.documentNumber}
                    />
                    {errors.documentNumber && (
                      <p className='text-xs text-destructive'>{errors.documentNumber.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <p className='mb-2 text-sm font-medium text-muted-foreground'>Upload documents</p>
                  <p className='mb-3 text-xs text-muted-foreground'>
                    JPG, PNG, or PDF. Required: front, back, and a selfie holding your ID.
                  </p>
                  <div className='grid grid-cols-2 gap-3 md:grid-cols-3'>
                    {SIDES.map(({ side, label }) => (
                      <UploadSlot
                        key={side}
                        side={side}
                        label={label}
                        file={files[side]}
                        onPick={onPickFile}
                        disabled={isSubmitting}
                      />
                    ))}
                  </div>
                </div>

                <p className='text-center text-sm italic text-muted-foreground md:text-left'>
                  Upload proof of identity for verification
                </p>
                <p className='text-center text-xs italic text-muted-foreground md:hidden'>
                  Upload document
                </p>
              </div>

              {submitError && (
                <div className='col-span-full rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive'>
                  {submitError}
                </div>
              )}
              {submitSuccess && (
                <div className='col-span-full rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900'>
                  {submitSuccess}
                </div>
              )}

              {showRejected && (
                <p className='col-span-full text-sm text-muted-foreground'>
                  Use &quot;Reset to draft and resubmit&quot; above before sending new documents.
                </p>
              )}

              <div className='col-span-full flex justify-end pt-2'>
                <Button
                  type='submit'
                  size='lg'
                  className='min-w-[160px] rounded-md'
                  disabled={isSubmitting || showRejected}
                >
                  {isSubmitting ? 'Submitting…' : 'Submit'}
                </Button>
              </div>
            </form>
          )}

          {remote === undefined && !loadError && !authRequired && (
            <p className='text-sm text-muted-foreground'>Loading…</p>
          )}
        </Card>
      </div>
    </main>
  );
}
