'use client';

import { Link } from '@/i18n/navigation';
import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { HugeiconsIcon } from '@hugeicons/react';
import { Upload01Icon } from '@hugeicons/core-free-icons';
import { useTranslations } from 'next-intl';

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

// We will define COUNTRIES and DOCUMENT_TYPES inside the component using translations.

const getVerificationSchema = (t: any) => z.object({
  firstName: z.string().min(2, t('validation.required')),
  lastName: z.string().min(2, t('validation.required')),
  gender: z.enum(['male', 'female'], { message: t('validation.selectGender') }),
  dateOfBirth: z.string().min(1, t('validation.required')),
  country: z
    .string()
    .min(1, t('validation.selectCountry'))
    .refine((c) => c !== 'OTHER', {
      message: t('validation.countryISO'),
    }),
  address: z.string().min(3, t('validation.required')),
  postalCode: z.string().min(2, t('validation.required')),
  phoneNumber: z.string().min(5, t('validation.required')),
  countryCode: z.string().min(1, t('validation.required')),
  documentType: z.string().min(1, t('validation.selectDocType')),
  documentNumber: z.string().min(3, t('validation.enterDocNumber')),
});

type VerificationFormValues = z.infer<ReturnType<typeof getVerificationSchema>>;

type DocumentSide = 'FRONT' | 'BACK' | 'SELFIE';

// SIDES defined inside component to use translations

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
  const t = useTranslations('Verification');
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

  const COUNTRIES = useMemo(() => [
    { value: '', label: t('selectCountry') },
    { value: 'SI', label: t('countries.SI') },
    { value: 'AT', label: t('countries.AT') },
    { value: 'DE', label: t('countries.DE') },
    { value: 'IT', label: t('countries.IT') },
    { value: 'HR', label: t('countries.HR') },
    { value: 'HU', label: t('countries.HU') },
    { value: 'OTHER', label: t('countries.OTHER') },
  ], [t]);

  const COUNTRY_CODES = useMemo(() => [
    { value: '', label: t('selectCode') },
    { value: '+386', label: '+386 (SI)' },
    { value: '+43', label: '+43 (AT)' },
    { value: '+49', label: '+49 (DE)' },
    { value: '+39', label: '+39 (IT)' },
    { value: '+385', label: '+385 (HR)' },
  ], [t]);

  const DOCUMENT_TYPES = useMemo(() => [
    { value: '', label: t('selectType') },
    { value: 'PASSPORT', label: t('docTypes.PASSPORT') },
    { value: 'NATIONAL_ID', label: t('docTypes.NATIONAL_ID') },
    { value: 'DRIVERS_LICENSE', label: t('docTypes.DRIVERS_LICENSE') },
  ], [t]);

  const SIDES = useMemo((): { side: DocumentSide; label: string }[] => [
    { side: 'FRONT', label: t('sides.FRONT') },
    { side: 'BACK', label: t('sides.BACK') },
    { side: 'SELFIE', label: t('sides.SELFIE') },
  ], [t]);

  const schema = useMemo(() => getVerificationSchema(t), [t]);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<VerificationFormValues>({
    resolver: zodResolver(schema),
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
      setLoadError(msg || t('errors.loadStatus'));
      setRemote(null);
    }
  }, [t]);

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
      setSubmitError(e instanceof Error ? e.message : t('errors.unlockDraft'));
    } finally {
      setResubmitting(false);
    }
  };

  const onSubmit = async (data: VerificationFormValues) => {
    setSubmitError(null);
    setSubmitSuccess(null);

    if (!files.FRONT || !files.BACK || !files.SELFIE) {
      setSubmitError(t('errors.missingImages'));
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
        throw new Error(t('errors.missingId'));
      }

      await uploadVerificationDocument(verificationId, 'FRONT', files.FRONT);
      await uploadVerificationDocument(verificationId, 'BACK', files.BACK);
      await uploadVerificationDocument(verificationId, 'SELFIE', files.SELFIE);

      await submitVerificationForReview(verificationId);

      setSubmitSuccess(t('success.submitted'));
      setFiles({ FRONT: null, BACK: null, SELFIE: null });
      await refreshRemote();
    } catch (e) {
      const msg = e instanceof Error ? e.message : t('errors.submitFailed');
      if (msg.includes('400') || msg.toLowerCase().includes('already')) {
        try {
          const again = await getMyVerificationStatus();
          setRemote(again);
          setSubmitError(t('errors.alreadyExists'));
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
            {t('page.title')}
          </h1>

          {authRequired && (
            <div className='mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900'>
              {t('page.authRequired')}{' '}
              <Link href='/signin' className='font-semibold text-primary underline'>
                {t('page.signIn')}
              </Link>
            </div>
          )}

          {loadError && (
            <p className='mb-4 text-sm text-destructive'>{loadError}</p>
          )}

          {showApproved && (
            <div className='rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-4 text-emerald-900'>
              <p className='font-semibold'>{t('page.verifiedTitle')}</p>
              <p className='mt-1 text-sm'>{t('page.verifiedDesc')}</p>
            </div>
          )}

          {showPending && (
            <div className='rounded-lg border border-sky-200 bg-sky-50 px-4 py-4 text-sky-950'>
              <p className='font-semibold'>{t('page.pendingTitle')}</p>
              <p className='mt-1 text-sm'>
                {t('page.pendingDesc')}
              </p>
            </div>
          )}

          {showRejected && (
            <div className='mb-6 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm'>
              <p className='font-semibold text-destructive'>{t('page.rejectedTitle')}</p>
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
                {resubmitting ? t('page.working') : t('page.resetDraft')}
              </Button>
            </div>
          )}

          {canShowForm && (
            <form onSubmit={handleSubmit(onSubmit)} className='grid gap-8 md:grid-cols-2 md:gap-10 md:items-start'>
              <div className='flex flex-col gap-5'>
                <div className='flex flex-col gap-1.5'>
                  <Label htmlFor='firstName'>{t('page.fields.firstName')}</Label>
                  <Input
                    id='firstName'
                    placeholder={t('page.fields.firstNamePlaceholder')}
                    {...register('firstName')}
                    aria-invalid={!!errors.firstName}
                  />
                  {errors.firstName && (
                    <p className='text-xs text-destructive'>{errors.firstName.message}</p>
                  )}
                </div>

                <div className='flex flex-col gap-1.5'>
                  <Label htmlFor='lastName'>{t('page.fields.lastName')}</Label>
                  <Input
                    id='lastName'
                    placeholder={t('page.fields.lastNamePlaceholder')}
                    {...register('lastName')}
                    aria-invalid={!!errors.lastName}
                  />
                  {errors.lastName && (
                    <p className='text-xs text-destructive'>{errors.lastName.message}</p>
                  )}
                </div>

                <div className='flex flex-col gap-2'>
                  <span className='text-sm font-medium text-muted-foreground'>{t('page.fields.gender')}</span>
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
                        <span className='capitalize'>{g === 'male' ? t('page.fields.male') : t('page.fields.female')}</span>
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
                    <Label htmlFor='dateOfBirth'>{t('page.fields.dob')}</Label>
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
                        label={t('page.fields.country')}
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
                  <Label htmlFor='address'>{t('page.fields.address')}</Label>
                  <Input
                    id='address'
                    placeholder={t('page.fields.addressPlaceholder')}
                    {...register('address')}
                    aria-invalid={!!errors.address}
                  />
                  {errors.address && (
                    <p className='text-xs text-destructive'>{errors.address.message}</p>
                  )}
                </div>

                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                  <div className='flex flex-col gap-1.5 sm:col-span-1'>
                    <Label htmlFor='postalCode'>{t('page.fields.postalCode')}</Label>
                    <Input
                      id='postalCode'
                      placeholder={t('page.fields.postalCodePlaceholder')}
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
                    <Label htmlFor='phoneNumber'>{t('page.fields.phone')}</Label>
                    <Input
                      id='phoneNumber'
                      type='tel'
                      placeholder={t('page.fields.phonePlaceholder')}
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
                        label={t('page.fields.countryCode')}
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
                          label={t('page.fields.docType')}
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
                    <Label htmlFor='documentNumber'>{t('page.fields.docNumber')}</Label>
                    <Input
                      id='documentNumber'
                      placeholder={t('page.fields.docNumberPlaceholder')}
                      {...register('documentNumber')}
                      aria-invalid={!!errors.documentNumber}
                    />
                    {errors.documentNumber && (
                      <p className='text-xs text-destructive'>{errors.documentNumber.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <p className='mb-2 text-sm font-medium text-muted-foreground'>{t('page.uploadDocTitle')}</p>
                  <p className='mb-3 text-xs text-muted-foreground'>
                    {t('page.uploadDocDesc')}
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
                  {t('page.uploadProof')}
                </p>
                <p className='text-center text-xs italic text-muted-foreground md:hidden'>
                  {t('page.uploadDocMobile')}
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
                  {t('page.useResetDraft')}
                </p>
              )}

              <div className='col-span-full flex justify-end pt-2'>
                <Button
                  type='submit'
                  size='lg'
                  className='min-w-[160px] rounded-md'
                  disabled={isSubmitting || showRejected}
                >
                  {isSubmitting ? t('page.submitting') : t('page.submit')}
                </Button>
              </div>
            </form>
          )}

          {remote === undefined && !loadError && !authRequired && (
            <p className='text-sm text-muted-foreground'>{t('page.loading')}</p>
          )}
        </Card>
      </div>
    </main>
  );
}
