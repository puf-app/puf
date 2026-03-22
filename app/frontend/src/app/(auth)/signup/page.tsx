'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// form validation
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// shadcn/ui components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { postToApi } from '@/lib/api/client';

const signupSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  // On mobile the UI only shows username/email/password, so allow empty fullName.
  fullName: z.union([
    z.string().min(1, 'Full name is required'),
    z.literal(''),
  ]),
  phone: z.string().optional().or(z.literal('')),
});

type SignupFormValues = z.infer<typeof signupSchema>;

function deriveFirstLast(fullName: string, email: string, username: string) {
  const cleanedFull = fullName.trim();
  if (cleanedFull) {
    const parts = cleanedFull.split(/\s+/).filter(Boolean);
    const firstName = parts[0] ?? 'User';
    const lastName = parts.length >= 2 ? parts[parts.length - 1] : firstName;
    return { firstName, lastName };
  }

  const emailLocal = (email.split('@')[0] ?? '').trim();
  const tokens = emailLocal
    ? emailLocal.split(/[._-]/).filter(Boolean)
    : username.split(/[._-]/).filter(Boolean);

  const firstName = tokens[0] ?? 'User';
  const lastName = tokens[1] ?? 'User';
  return { firstName, lastName };
}

export default function SignupPage() {
  const router = useRouter();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      fullName: '',
      phone: '',
    },
  });

  const onSubmit = async (data: SignupFormValues) => {
    setApiError(null);
    const { firstName, lastName } = deriveFirstLast(
      data.fullName,
      data.email,
      data.username,
    );

    const payload: Record<string, unknown> = {
      firstName,
      lastName,
      username: data.username,
      email: data.email,
      password: data.password,
    };

    if (data.phone && data.phone.trim()) {
      payload.phone = data.phone.trim();
    }

    try {
      await postToApi('/api/auth/registerUser', payload);
      router.push('/signin');
    } catch (e) {
      setApiError(e instanceof Error ? e.message : 'Registration failed');
    }
  };

  return (
    <main className='bg-white flex flex-col'>
      {/* Forms */}
      <section className='flex-1 flex flex-col items-center justify-start md:justify-center px-4 py-8 md:py-12 gap-4'>
        {/* Mobile layout: no card, only fields */}
        <div className='w-full max-w-md md:hidden'>
          <h1 className='text-2xl font-semibold text-[#10294b] text-center mb-6'>
            Sign up
          </h1>
          <form className='space-y-4' onSubmit={handleSubmit(onSubmit)}>
            <div className='flex flex-col gap-1'>
              <Label
                className='text-sm text-gray-700'
                htmlFor='username-mobile'
              >
                Username
              </Label>
              <Input
                id='username-mobile'
                type='text'
                placeholder='Enter your username'
                {...register('username')}
              />
              {errors.username && (
                <p className='text-xs text-destructive mt-1'>
                  {errors.username.message}
                </p>
              )}
            </div>

            <div className='flex flex-col gap-1'>
              <Label className='text-sm text-gray-700' htmlFor='email-mobile'>
                Email address
              </Label>
              <Input
                id='email-mobile'
                type='email'
                placeholder='Enter your email address'
                {...register('email')}
              />
              {errors.email && (
                <p className='text-xs text-destructive mt-1'>
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className='flex flex-col gap-1'>
              <Label
                className='text-sm text-gray-700'
                htmlFor='password-mobile'
              >
                Password
              </Label>
              <Input
                id='password-mobile'
                type='password'
                placeholder='Enter your password'
                {...register('password')}
              />
              {errors.password && (
                <p className='text-xs text-destructive mt-1'>
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type='submit'
              className='mt-4 h-10 w-full text-sm font-medium shadow-sm'
            >
              Sign up
            </Button>
            {apiError && (
              <p className='text-xs text-destructive mt-3'>{apiError}</p>
            )}
          </form>

          <p className='mt-4 text-sm text-center w-full'>
            Already have an account?{' '}
            <Link href='/signin' className='underline text-primary'>
              Sign in
            </Link>
          </p>
        </div>

        {/* Desktop/tablet layout: card with all fields */}
        <Card className='hidden md:block w-full max-w-xl shadow-md py-8 px-10'>
          <CardHeader className='pb-6'>
            <CardTitle className='text-3xl font-semibold text-[#10294b] text-center'>
              Sign up
            </CardTitle>
          </CardHeader>
          <CardContent className='pt-0'>
            <form className='space-y-8' onSubmit={handleSubmit(onSubmit)}>
              <div className='flex flex-col gap-1'>
                <Label htmlFor='fullName'>Full name</Label>
                <Input
                  id='fullName'
                  type='text'
                  placeholder='Enter your full name'
                  {...register('fullName')}
                />
                {errors.fullName && (
                  <p className='text-xs text-destructive mt-1'>
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              <div className='flex flex-col gap-1'>
                <Label htmlFor='username'>Username</Label>
                <Input
                  id='username'
                  type='text'
                  placeholder='Enter your username'
                  {...register('username')}
                />
                {errors.username && (
                  <p className='text-xs text-destructive mt-1'>
                    {errors.username.message}
                  </p>
                )}
              </div>

              <div className='flex flex-col gap-1'>
                <Label htmlFor='email'>Email address</Label>
                <Input
                  id='email'
                  type='email'
                  placeholder='Enter your email address'
                  {...register('email')}
                />
                {errors.email && (
                  <p className='text-xs text-destructive mt-1'>
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className='flex flex-col gap-1'>
                <Label htmlFor='phone'>Telephone number</Label>
                <Input
                  id='phone'
                  type='tel'
                  placeholder='Enter your telephone number'
                  {...register('phone')}
                />
              </div>

              <div className='flex flex-col gap-1'>
                <Label htmlFor='password'>Password</Label>
                <Input
                  id='password'
                  type='password'
                  placeholder='Enter your password'
                  {...register('password')}
                />
                {errors.password && (
                  <p className='text-xs text-destructive mt-1'>
                    {errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type='submit'
                className='mt-4 h-10 w-full text-sm font-medium shadow-sm'
              >
                Sign up
              </Button>
              {apiError && (
                <p className='text-xs text-destructive mt-3'>{apiError}</p>
              )}
            </form>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
