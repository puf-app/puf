'use client';

import React, { useMemo, useRef, useState } from 'react';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const settingsSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.email('Please enter a valid email'),
  phone: z
    .string()
    .min(6, 'Phone number is too short')
    .max(32, 'Phone number is too long')
    .optional()
    .or(z.literal('')),
  profileImageUrl: z.string().optional().or(z.literal('')),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type SettingsValues = z.infer<typeof settingsSchema>;

type FieldKey = keyof SettingsValues;

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
}: {
  label: string;
  fieldKey: FieldKey;
  placeholder: string;
  type?: React.ComponentProps<typeof Input>['type'];
  register: ReturnType<typeof useForm<SettingsValues>>['register'];
  error?: string;
  onChangeClick: () => void;
  buttonLabel?: string;
  buttonVariant?: React.ComponentProps<typeof Button>['variant'];
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
      <Button
        type='button'
        variant={buttonVariant}
        size='lg'
        className='w-full md:w-auto'
        onClick={onChangeClick}
      >
        {buttonLabel}
      </Button>
    </div>
  );
}

export default function SettingsPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const defaultValues = useMemo<SettingsValues>(
    () => ({
      firstName: 'Janez',
      lastName: 'Novak',
      username: 'DebtCollector3000',
      email: 'debtcollector300@mail.com',
      phone: '+386 31 123 456',
      profileImageUrl: 'https://i.pravatar.cc/300',
      password: '**********************',
    }),
    [],
  );

  const {
    register,
    getValues,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<SettingsValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues,
    mode: 'onBlur',
  });

  const [lastSaved, setLastSaved] = useState<Partial<Record<FieldKey, number>>>(
    {},
  );

  const saveField = async (field: FieldKey) => {
    const ok = await trigger(field);
    if (!ok) return;

    // TODO: replace with API call when backend is ready
    void getValues(field);

    setLastSaved((prev) => ({ ...prev, [field]: Date.now() }));
  };

  const uploadProof = () => {
    fileInputRef.current?.click();
  };

  return (
    <main className='w-full flex justify-center px-4 py-8 md:py-10'>
      <div className='w-full max-w-5xl flex flex-col gap-6 md:gap-8'>
        <Card className='p-6 md:p-8 shadow-md'>
          <SectionTitle>Account</SectionTitle>

          <div className='mt-6 flex flex-col gap-5 md:gap-6'>
            <FieldRow
              label='Change first name'
              fieldKey='firstName'
              placeholder='Enter your first name'
              register={register}
              error={errors.firstName?.message}
              onChangeClick={() => saveField('firstName')}
            />

            <FieldRow
              label='Change last name'
              fieldKey='lastName'
              placeholder='Enter your last name'
              register={register}
              error={errors.lastName?.message}
              onChangeClick={() => saveField('lastName')}
            />

            <FieldRow
              label='Change username'
              fieldKey='username'
              placeholder='Enter your username'
              register={register}
              error={errors.username?.message}
              onChangeClick={() => saveField('username')}
            />

            <FieldRow
              label='Change email address'
              fieldKey='email'
              placeholder='Enter your email'
              type='email'
              register={register}
              error={errors.email?.message}
              onChangeClick={() => saveField('email')}
            />

            <FieldRow
              label='Change telephone number'
              fieldKey='phone'
              placeholder='Enter your phone number'
              register={register}
              error={errors.phone?.message}
              onChangeClick={() => saveField('phone')}
            />

            <FieldRow
              label='Change profile photo'
              fieldKey='profileImageUrl'
              placeholder='Choose a file'
              register={register}
              error={errors.profileImageUrl?.message}
              onChangeClick={() => saveField('profileImageUrl')}
            />

            {/* subtle saved feedback */}
            <div className='text-xs text-muted-foreground'>
              {lastSaved.firstName && (
                <span>
                  Last saved:{' '}
                  {new Date(lastSaved.firstName).toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
        </Card>

        <Card className='p-6 md:p-8 shadow-md'>
          <SectionTitle>Security</SectionTitle>

          <div className='mt-6 flex flex-col gap-5 md:gap-6'>
            <FieldRow
              label='Change password'
              fieldKey='password'
              placeholder='Enter new password'
              type='password'
              register={register}
              error={errors.password?.message}
              onChangeClick={() => saveField('password')}
            />

            <div className='grid grid-cols-1 md:grid-cols-[240px_1fr_120px] gap-2 md:gap-4 items-start md:items-center'>
              <Label className='text-base font-semibold'>Verify account:</Label>
              <div className='text-sm text-muted-foreground md:pr-4'>
                Upload a photo of your ID document.
              </div>
              <div className='flex flex-col gap-2'>
                <input
                  ref={fileInputRef}
                  type='file'
                  accept='image/*,application/pdf'
                  className='hidden'
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setValue('profileImageUrl', file.name, {
                      shouldDirty: true,
                    });
                  }}
                />
                <Button
                  type='button'
                  variant='tertiary'
                  size='lg'
                  className='w-full md:w-auto'
                  onClick={uploadProof}
                >
                  Upload photo
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
