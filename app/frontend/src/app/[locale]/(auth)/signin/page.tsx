'use client';

import { Link } from '@/i18n/navigation';
import { useRouter } from '@/i18n/navigation';
import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';

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
import { loginWithCredentials } from '@/lib/auth/loginWithCredentials';

type SigninFormValues = {
  username: string;
  password: string;
}

export default function SigninPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [apiError, setApiError] = useState<string | null>(null);
  const t = useTranslations('Auth');

  const signinSchema = useMemo(() => z.object({
    username: z.string().min(3, t('validation.usernameMin')),
    password: z.string().min(6, t('validation.passwordMin')),
  }), [t]);

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
    setApiError(null);
    try {
      const { requires2FA } = await loginWithCredentials(dispatch, {
        username: data.username,
        password: data.password,
      });

      if (requires2FA) {
        setApiError(t('errors.twoFactorRequired'));
        return;
      }

      router.push('/');
    } catch (e) {
      setApiError(e instanceof Error ? e.message : t('errors.loginFailed'));
    }
  };

  return (
    <main className='min-h-screen bg-background flex flex-col'>
      <section className='flex-1 flex flex-col items-center justify-start md:justify-center px-4 py-8 md:py-12 w-full'>
        {/* Mobile: no card */}
        <div className='w-full max-w-md md:hidden flex flex-col'>
          <h1 className='text-3xl font-semibold text-foreground text-center mt-8 mb-10'>
            {t('actions.signIn')}
          </h1>

          <form className='space-y-6' onSubmit={handleSubmit(onSubmit)}>
            <div className='flex flex-col gap-2'>
              <Label className='text-sm' htmlFor='username-mobile'>
                {t('fields.username')}
              </Label>
              <Input
                id='username-mobile'
                type='text'
                placeholder={t('fields.usernamePlaceholder')}
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
                {t('fields.password')}
              </Label>
              <Input
                id='password-mobile'
                type='password'
                placeholder={t('fields.passwordPlaceholder')}
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
              {t('actions.noAccount')}{' '}
              <Link href='/signup' className='underline text-primary'>
                {t('actions.signUp')}
              </Link>
            </p>

            <div className='pt-10'>
              <Button type='submit' className='w-full h-11'>
                {t('actions.signIn')}
              </Button>
            </div>
          </form>
        </div>

        {/* Desktop/tablet: card */}
        <Card className='hidden md:block w-full max-w-xl shadow-md py-10 px-10'>
          <CardHeader className='pb-6'>
            <CardTitle className='text-3xl font-semibold text-foreground text-center'>
              {t('actions.signIn')}
            </CardTitle>
          </CardHeader>
          <CardContent className='pt-0'>
            <form className='space-y-8' onSubmit={handleSubmit(onSubmit)}>
              <div className='flex flex-col gap-2'>
                <Label className='text-sm' htmlFor='username'>
                  {t('fields.username')}
                </Label>
                <Input
                  id='username'
                  type='text'
                  placeholder={t('fields.usernamePlaceholder')}
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
                  {t('fields.password')}
                </Label>
                <Input
                  id='password'
                  type='password'
                  placeholder={t('fields.passwordPlaceholder')}
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
                {t('actions.signIn')}
              </Button>

              <p className='text-sm text-center'>
                {t('actions.noAccount')}{' '}
                <Link href='/signup' className='underline text-primary'>
                  {t('actions.signUp')}
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
