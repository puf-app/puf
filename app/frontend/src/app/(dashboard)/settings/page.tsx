'use client';

import React, { useEffect, useRef, useState } from 'react';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getFromApi, patchToApi } from '@/lib/api/client';
import { getProfileUserId, unwrapUserProfile } from '@/lib/api/extractProfile';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { clearUser, setUser } from '@/stores/slices/userSlice';
import { store } from '@/stores/store';
import type { IUser } from '@/types';
import { useRouter } from 'next/navigation';

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
  // Password is optional; we only send it if the user enters a new value.
  password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
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
  disabled,
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
  disabled?: boolean;
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
        disabled={disabled}
      >
        {buttonLabel}
      </Button>
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user: storeUser, isHydrated } = useAppSelector((state) => state.user);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    getValues,
    setValue,
    trigger,
    reset,
    formState: { errors },
  } = useForm<SettingsValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      phone: '',
      profileImageUrl: '',
      password: '',
    },
    mode: 'onBlur',
  });

  /** Avoid spamming GET /getCurrentUserProfile when Redux `user` object reference changes every dispatch. */
  const profileFetchDoneForMountRef = useRef(false);
  const profileFetchInFlightRef = useRef(false);

  const [lastSaved, setLastSaved] = useState<Partial<Record<FieldKey, number>>>({});
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  /** Allow editing whenever we're logged in and the form is ready (not while initial profile fetch runs). */
  const canEdit = Boolean(storeUser && !loadingProfile);

  const saveField = async (field: FieldKey) => {
    const ok = await trigger(field);
    if (!ok) return;

    if (!storeUser) {
      setApiError('Not signed in.');
      return;
    }

    const value = getValues(field);
    const stringValue = typeof value === 'string' ? value : '';

    // Only send password if user actually typed a new one.
    if (field === 'password') {
      if (!stringValue || stringValue.trim() === '') return;
    }

    const payload: Partial<Record<FieldKey, unknown>> = {
      [field]: value,
    };

    // Avoid sending empty optional fields.
    if (field === 'phone' && (!stringValue || stringValue.trim() === '')) {
      delete payload.phone;
    }
    if (
      field === 'profileImageUrl' &&
      (!stringValue || stringValue.trim() === '')
    ) {
      delete payload.profileImageUrl;
    }
    if (Object.keys(payload).length === 0) return;

    // Session user id must match the URL segment. Response shape may nest under
    // `user` / `profile`, and `_id` may be `{ $oid: "..." }` — see extractProfile.
    let raw: unknown;
    try {
      raw = await getFromApi<unknown>('/api/users/getCurrentUserProfile');
    } catch (e) {
      setApiError(
        e instanceof Error
          ? e.message
          : 'Could not verify your session. Please sign in again.'
      );
      return;
    }

    let idForPatch: string;
    try {
      idForPatch = getProfileUserId(raw);
    } catch {
      setApiError('Could not read your user id from the server response.');
      return;
    }

    const applyUpdated = (updated: IUser) => {
      dispatch(setUser(updated));
      reset({
        firstName: updated.firstName ?? '',
        lastName: updated.lastName ?? '',
        username: updated.username ?? '',
        email: updated.email ?? '',
        phone: updated.phone ?? '',
        profileImageUrl: updated.profileImageUrl ?? '',
        password: '',
      });
    };

    try {
      const updated = await patchToApi<IUser>(
        `/api/users/updateUserProfile/${encodeURIComponent(idForPatch)}`,
        payload as any
      );
      applyUpdated(updated);
    } catch (e) {
      const msg = e instanceof Error ? e.message : '';
      const low = msg.toLowerCase();
      const looksLikeOwnProfileDenial =
        low.includes('own profile') ||
        low.includes('only update your own') ||
        (low.includes('unauthorized') && low.includes('profile'));

      if (!looksLikeOwnProfileDenial) {
        setApiError(msg || 'Failed to update profile');
        return;
      }

      // Some backends only allow updating the session user via path without :userId.
      try {
        const updated = await patchToApi<IUser>(
          '/api/users/updateUserProfile',
          payload as any
        );
        applyUpdated(updated);
      } catch (e2) {
        setApiError(e2 instanceof Error ? e2.message : 'Failed to update profile');
        return;
      }
    }

    setLastSaved((prev) => ({ ...prev, [field]: Date.now() }));
  };

  // Only re-run when hydration / user id *string* changes — not when Redux replaces the whole `user` object.
  const storeUserId = storeUser?._id ?? null;

  useEffect(() => {
    let cancelled = false;

    if (!isHydrated) return;

    const user = store.getState().user.user;

    if (!user) {
      setLoadingProfile(false);
      setApiError(null);
      router.push('/signin');
      return;
    }

    const syncFormFromUser = (u: IUser) => {
      reset({
        firstName: u.firstName ?? '',
        lastName: u.lastName ?? '',
        username: u.username ?? '',
        email: u.email ?? '',
        phone: u.phone ?? '',
        profileImageUrl: u.profileImageUrl ?? '',
        password: '',
      });
    };

    // After the first successful/failed profile load this mount, only sync form when Redux user updates (same id).
    if (profileFetchDoneForMountRef.current) {
      syncFormFromUser(user);
      setLoadingProfile(false);
      return;
    }

    if (profileFetchInFlightRef.current) {
      return;
    }

    const loadProfile = async () => {
      profileFetchInFlightRef.current = true;
      setLoadingProfile(true);
      setApiError(null);
      try {
        const raw = await getFromApi<unknown>('/api/users/getCurrentUserProfile');
        if (cancelled) return;

        const profile = unwrapUserProfile(raw) as IUser;
        dispatch(setUser(profile));
        syncFormFromUser(profile);
        profileFetchDoneForMountRef.current = true;
      } catch (e) {
        if (cancelled) return;
        const message = e instanceof Error ? e.message : 'Failed to load profile';
        const lowerMessage = message.toLowerCase();

        profileFetchDoneForMountRef.current = true;

        if (lowerMessage.includes('unauthorized') || lowerMessage.includes('unauthenticated')) {
          dispatch(clearUser());
          router.push('/signin');
          return;
        }

        // Rate limit / server stress — stop loading and show message (do not retry in a loop).
        if (
          lowerMessage.includes('too many') ||
          lowerMessage.includes('rate limit') ||
          lowerMessage.includes('429')
        ) {
          setApiError(
            `${message} You can still try editing if you already have an account id, or wait and refresh the page.`
          );
          syncFormFromUser(user);
          return;
        }

        setApiError(message);
        syncFormFromUser(user);
      } finally {
        profileFetchInFlightRef.current = false;
        if (!cancelled) setLoadingProfile(false);
      }
    };

    void loadProfile();

    return () => {
      cancelled = true;
      // React Strict Mode remounts effects in dev; allow a second run to fetch again.
      profileFetchInFlightRef.current = false;
    };
  }, [dispatch, reset, router, isHydrated, storeUserId]);

  const uploadProof = () => {
    fileInputRef.current?.click();
  };

  return (
    <main className='w-full flex justify-center px-4 py-8 md:py-10'>
      <div className='w-full max-w-5xl flex flex-col gap-6 md:gap-8'>
        {apiError && (
          <div className='text-sm text-destructive mb-2'>
            {apiError}{' '}
            {(apiError.toLowerCase().includes('unauthorized') || apiError.toLowerCase().includes('unauthenticated')) && (
              <button
                className='underline'
                onClick={() => router.push('/signin')}
                type='button'
              >
                Sign in
              </button>
            )}
          </div>
        )}

        {loadingProfile && (
          <div className='text-sm text-muted-foreground'>
            Loading your settings...
          </div>
        )}

        {!loadingProfile && (
          <>
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
              disabled={!canEdit}
            />

            <FieldRow
              label='Change last name'
              fieldKey='lastName'
              placeholder='Enter your last name'
              register={register}
              error={errors.lastName?.message}
              onChangeClick={() => saveField('lastName')}
              disabled={!canEdit}
            />

            <FieldRow
              label='Change username'
              fieldKey='username'
              placeholder='Enter your username'
              register={register}
              error={errors.username?.message}
              onChangeClick={() => saveField('username')}
              disabled={!canEdit}
            />

            <FieldRow
              label='Change email address'
              fieldKey='email'
              placeholder='Enter your email'
              type='email'
              register={register}
              error={errors.email?.message}
              onChangeClick={() => saveField('email')}
              disabled={!canEdit}
            />

            <FieldRow
              label='Change telephone number'
              fieldKey='phone'
              placeholder='Enter your phone number'
              register={register}
              error={errors.phone?.message}
              onChangeClick={() => saveField('phone')}
              disabled={!canEdit}
            />

            <FieldRow
              label='Change profile photo'
              fieldKey='profileImageUrl'
              placeholder='Choose a file'
              register={register}
              error={errors.profileImageUrl?.message}
              onChangeClick={() => saveField('profileImageUrl')}
              disabled={!canEdit}
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
              disabled={!canEdit}
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
          </>
        )}
      </div>
    </main>
  );
}
