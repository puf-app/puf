'use client';

import React, { useEffect, useMemo, useState } from 'react';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { patchToApi, postToApi } from '@/lib/api/client';
import { setUser } from '@/stores/slices/userSlice';
import { IUser } from '@/types';
import { useTranslations } from 'next-intl';

type FieldKey = 
  | 'firstName' 
  | 'lastName' 
  | 'username' 
  | 'email' 
  | 'phone' 
  | 'profileImageUrl' 
  | 'password' 
  | 'oldPassword';

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className='flex flex-col gap-2'>
      <h2 className='text-3xl font-semibold text-foreground'>{children}</h2>
      <div className='h-px w-full bg-border' />
    </div>
  );
}

function FieldRow({
  label,
  fieldKey,
  placeholder,
  type = 'text',
  register,
  error,
  onChangeClick,
  buttonLabel = 'Change',
  buttonVariant = 'tertiary',
  withoutButton = false,
}: {
  label: string;
  fieldKey: FieldKey;
  placeholder: string;
  type?: React.ComponentProps<typeof Input>['type'];
  register: any;
  error?: string;
  onChangeClick: () => void;
  buttonLabel?: string;
  buttonVariant?: React.ComponentProps<typeof Button>['variant'];
  withoutButton?: boolean;
}) {
  return (
    <div className='grid grid-cols-1 md:grid-cols-[240px_1fr_120px] gap-2 md:gap-4 items-start md:items-center'>
      <Label className='text-base font-semibold md:font-semibold'>
        {label}:
      </Label>
      <div className='flex flex-col'>
        <Input
          type={type}
          placeholder={placeholder}
          className='h-10'
          {...register(fieldKey)}
        />
        {error && <p className='text-xs text-destructive mt-1'>{error}</p>}
      </div>
      {!withoutButton && (
        <Button
          type='button'
          variant={buttonVariant}
          size='lg'
          className='w-full md:w-auto'
          onClick={onChangeClick}
        >
          {buttonLabel}
        </Button>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const user = useAppSelector((state) => state.user.user);
  const dispatch = useAppDispatch();
  const t = useTranslations('Settings');

  const settingsSchema = useMemo(() => z.object({
    firstName: z.string().min(2, t('validation.firstNameMin')),
    lastName: z.string().min(2, t('validation.lastNameMin')),
    username: z.string().min(3, t('validation.usernameMin')),
    email: z.email(t('validation.emailInvalid')),
    phone: z
      .string()
      .min(6, t('validation.phoneShort'))
      .max(32, t('validation.phoneLong'))
      .optional()
      .or(z.literal('')),
    profileImageUrl: z.string().optional().or(z.literal('')),
    password: z.string().min(6, t('validation.passwordMin')),
    oldPassword: z.string().min(6, t('validation.oldPasswordMin')),
  }), [t]);

  type SettingsValues = z.infer<typeof settingsSchema>;

  const defaultValues = useMemo<SettingsValues>(
    () => ({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      username: user?.username || '',
      email: user?.email || '',
      phone: user?.phone || '',
      profileImageUrl: user?.profileImageUrl || '',
      password: '',
      oldPassword: '',
    }),
    [user],
  );

  const {
    register,
    getValues,
    setValue,
    trigger,
    reset,
    formState: { errors },
  } = useForm<SettingsValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues,
    mode: 'onBlur',
  });

  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || '',
        profileImageUrl: user.profileImageUrl || '',
        password: '',
        oldPassword: '',
      });
    }
  }, [user, reset]);

  const [lastSaved, setLastSaved] = useState<Partial<Record<FieldKey, number>>>(
    {},
  );
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const saveField = async (field: FieldKey) => {
    if (field === 'password') {
      setPasswordError(null);
      setPasswordSuccess(false);
      const ok = await trigger(['oldPassword', 'password']);
      if (!ok) return;

      try {
        await postToApi('/api/auth/changePassword', {
          oldPassword: getValues('oldPassword'),
          newPassword: getValues('password'),
        });
        setValue('password', '');
        setValue('oldPassword', '');
        setPasswordSuccess(true);
      } catch (e) {
        setPasswordError(
          e instanceof Error ? e.message : t('messages.passwordErrorDefault'),
        );
      }
      return;
    }

    const ok = await trigger(field);
    if (!ok) return;

    interface UpdatePayload {
      user: IUser;
    }

    const res = await patchToApi<UpdatePayload>(
      `/api/users/updateUserProfile/${user?._id}`,
      {
        [field]: getValues(field),
      },
    );

    dispatch(setUser(res.user));
    setLastSaved((prev) => ({ ...prev, [field]: Date.now() }));
  };

  return (
    <main className='w-full flex justify-center px-4 py-8 md:py-10'>
      <div className='w-full max-w-5xl flex flex-col gap-6 md:gap-8'>
        <Card className='p-6 md:p-8 shadow-md'>
          <SectionTitle>{t('sections.account')}</SectionTitle>

          <div className='mt-6 flex flex-col gap-5 md:gap-6'>
            <FieldRow
              label={t('fields.firstName')}
              fieldKey='firstName'
              placeholder={t('fields.firstNamePlaceholder')}
              register={register}
              error={errors.firstName?.message}
              onChangeClick={() => saveField('firstName')}
              buttonLabel={t('actions.change')}
            />

            <FieldRow
              label={t('fields.lastName')}
              fieldKey='lastName'
              placeholder={t('fields.lastNamePlaceholder')}
              register={register}
              error={errors.lastName?.message}
              onChangeClick={() => saveField('lastName')}
              buttonLabel={t('actions.change')}
            />

            <FieldRow
              label={t('fields.username')}
              fieldKey='username'
              placeholder={t('fields.usernamePlaceholder')}
              register={register}
              error={errors.username?.message}
              onChangeClick={() => saveField('username')}
              buttonLabel={t('actions.change')}
            />

            <FieldRow
              label={t('fields.email')}
              fieldKey='email'
              placeholder={t('fields.emailPlaceholder')}
              type='email'
              register={register}
              error={errors.email?.message}
              onChangeClick={() => saveField('email')}
              buttonLabel={t('actions.change')}
            />

            <FieldRow
              label={t('fields.phone')}
              fieldKey='phone'
              placeholder={t('fields.phonePlaceholder')}
              register={register}
              error={errors.phone?.message}
              onChangeClick={() => saveField('phone')}
              buttonLabel={t('actions.change')}
            />

            <FieldRow
              label={t('fields.profilePhoto')}
              fieldKey='profileImageUrl'
              placeholder={t('fields.profilePhotoPlaceholder')}
              register={register}
              error={errors.profileImageUrl?.message}
              onChangeClick={() => saveField('profileImageUrl')}
              buttonLabel={t('actions.change')}
            />

            {/* subtle saved feedback */}
            <div className='text-xs text-muted-foreground'>
              {lastSaved.firstName && (
                <span>
                  {t('messages.lastSaved')}{' '}
                  {new Date(lastSaved.firstName).toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
        </Card>

        <Card className='p-6 md:p-8 shadow-md'>
          <SectionTitle>{t('sections.security')}</SectionTitle>

          {passwordSuccess && (
            <div
              className='mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900'
              role='status'
            >
              {t('messages.passwordSuccess')}
            </div>
          )}
          {passwordError && (
            <div
              className='mt-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive'
              role='alert'
            >
              {passwordError}
            </div>
          )}

          <div className='mt-6 flex flex-col gap-5 md:gap-6'>
            <FieldRow
              label={t('fields.oldPassword')}
              fieldKey='oldPassword'
              placeholder={t('fields.oldPasswordPlaceholder')}
              type='password'
              register={register}
              error={errors.oldPassword?.message}
              onChangeClick={() => saveField('oldPassword')}
              withoutButton
            />

            <FieldRow
              label={t('fields.newPassword')}
              fieldKey='password'
              placeholder={t('fields.newPasswordPlaceholder')}
              type='password'
              register={register}
              error={errors.password?.message}
              onChangeClick={() => saveField('password')}
              buttonLabel={t('actions.change')}
            />
          </div>
        </Card>
      </div>
    </main>
  );
}
