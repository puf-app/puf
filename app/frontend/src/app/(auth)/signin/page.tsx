'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

// form validation
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// shadcn/ui
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { useAppDispatch } from '@/hooks/redux';
import { setUser } from '@/stores/slices/userSlice';
import { getFromApi, postToApi } from '@/lib/api/client';
import { IUser } from '@/types';

const signinSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type SigninFormValues = z.infer<typeof signinSchema>;

export default function SigninPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SigninFormValues>({
    resolver: zodResolver(signinSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = async (data: SigninFormValues) => {
    // Backend login: /api/auth/loginUser
    type LoginResponse = {
      message?: string;
      requires2FA?: boolean;
      user?: { username?: string; admin?: boolean } & Record<string, unknown>;
    };

    type UserProfileResponse = {
      user: IUser;
    };

    setApiError(null);
    try {
      const res = await postToApi<LoginResponse>('/api/auth/loginUser', {
        username: data.username,
        password: data.password,
      });

      if (res.requires2FA) {
        // 2FA page is not implemented yet; keep UX simple for now.
        // Later we can redirect to a dedicated /2fa route.
        setApiError(
          'Two-factor authentication is required (2FA not implemented yet).',
        );
        return;
      }

      if (res.user) {
        const user = await getFromApi<UserProfileResponse>(
          '/api/users/getCurrentUserProfile',
        );
        dispatch(setUser(user.user as any));
      }

      router.push('/');
    } catch (e) {
      setApiError(e instanceof Error ? e.message : 'Login failed');
    }
  };

  return (
    <main className='min-h-screen bg-background flex flex-col'>
      <section className='flex-1 flex flex-col items-center justify-start md:justify-center px-4 py-8 md:py-12 w-full'>
        {/* Mobile: no card */}
        <div className='w-full max-w-md md:hidden flex flex-col'>
          <h1 className='text-3xl font-semibold text-foreground text-center mt-8 mb-10'>
            Sign in
          </h1>

          <form className='space-y-6' onSubmit={handleSubmit(onSubmit)}>
            <div className='flex flex-col gap-2'>
              <Label className='text-sm' htmlFor='username-mobile'>
                Username
              </Label>
              <Input
                id='username-mobile'
                type='text'
                placeholder='Enter your username'
                className='h-10'
                {...register('username')}
              />
              {errors.username && (
                <p className='text-xs text-destructive'>
                  {errors.username.message}
                </p>
              )}
            </div>

            <div className='flex flex-col gap-2'>
              <Label className='text-sm' htmlFor='password-mobile'>
                Password
              </Label>
              <Input
                id='password-mobile'
                type='password'
                placeholder='Enter your password'
                className='h-10'
                {...register('password')}
              />
              {errors.password && (
                <p className='text-xs text-destructive'>
                  {errors.password.message}
                </p>
              )}
              {apiError && (
                <p className='text-xs text-destructive mt-2'>{apiError}</p>
              )}
            </div>

            <p className='text-xs text-center pt-10'>
              Don&apos;t have an account?{' '}
              <Link href='/signup' className='underline text-primary'>
                Sign up
              </Link>
            </p>

            <div className='pt-10'>
              <Button type='submit' className='w-full h-11'>
                Sign in
              </Button>
            </div>
          </form>
        </div>

        {/* Desktop/tablet: card */}
        <Card className='hidden md:block w-full max-w-xl shadow-md py-10 px-10'>
          <CardHeader className='pb-6'>
            <CardTitle className='text-3xl font-semibold text-foreground text-center'>
              Sign in
            </CardTitle>
          </CardHeader>
          <CardContent className='pt-0'>
            <form className='space-y-8' onSubmit={handleSubmit(onSubmit)}>
              <div className='flex flex-col gap-2'>
                <Label className='text-sm' htmlFor='username'>
                  Username
                </Label>
                <Input
                  id='username'
                  type='text'
                  placeholder='Enter your username'
                  className='h-10'
                  {...register('username')}
                />
                {errors.username && (
                  <p className='text-xs text-destructive'>
                    {errors.username.message}
                  </p>
                )}
              </div>

              <div className='flex flex-col gap-2'>
                <Label className='text-sm' htmlFor='password'>
                  Password
                </Label>
                <Input
                  id='password'
                  type='password'
                  placeholder='Enter your password'
                  className='h-10'
                  {...register('password')}
                />
                {errors.password && (
                  <p className='text-xs text-destructive'>
                    {errors.password.message}
                  </p>
                )}
                {apiError && (
                  <p className='text-xs text-destructive mt-2'>{apiError}</p>
                )}
              </div>

              <Button type='submit' className='w-full h-11'>
                Sign in
              </Button>

              <p className='text-sm text-center'>
                Don&apos;t have an account?{' '}
                <Link href='/signup' className='underline text-primary'>
                  Sign up
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
