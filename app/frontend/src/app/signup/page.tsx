'use client';

import React from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// shadcn/ui components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';

const signupSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(1, 'Full name is required'),
  phone: z.string().optional(),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
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

  const onSubmit = (data: SignupFormValues) => {
    // TODO: hook up to real API + Redux when backend is ready
    console.log('signup data', data);
  };

  return (
    <main className="min-h-screen bg-white flex flex-col">
      {/* Top bar */}
      <header className="h-16 md:h-20 bg-primary flex items-center justify-between px-4 md:px-12 text-primary-foreground">
        <div className="text-2xl font-semibold">Puf</div>
        <Link href="/">
          <Button
            className="px-6 py-2 h-auto rounded-md text-sm font-medium shadow-sm"
            variant="default"
          >
            Home
          </Button>
        </Link>
      </header>

      {/* Forms */}
      <section className="flex-1 flex flex-col items-center justify-start md:justify-center px-4 py-8 md:py-12 gap-4">
        {/* Mobile layout: no card, only fields */}
        <div className="w-full max-w-md md:hidden">
          <h1 className="text-2xl font-semibold text-[#10294b] text-center mb-6">
            Sign up
          </h1>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-1">
              <Label className="text-sm text-gray-700" htmlFor="username-mobile">
                Username
              </Label>
              <Input
                id="username-mobile"
                type="text"
                placeholder="Enter your username"
                className="h-10 border-input text-sm"
                {...register('username')}
              />
              {errors.username && (
                <p className="text-xs text-destructive mt-1">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <Label className="text-sm text-gray-700" htmlFor="email-mobile">
                Email address
              </Label>
              <Input
                id="email-mobile"
                type="email"
                placeholder="Enter your email address"
                className="h-10 border-input text-sm"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs text-destructive mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <Label className="text-sm text-gray-700" htmlFor="password-mobile">
                Password
              </Label>
              <Input
                id="password-mobile"
                type="password"
                placeholder="Enter your password"
                className="h-10 border-input text-sm"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-xs text-destructive mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="mt-4 h-10 w-full text-sm font-medium shadow-sm"
            >
              Sign up
            </Button>
          </form>

          <p className="mt-4 text-sm text-center w-full">
            Already have an account?{' '}
            <Link href="/login" className="underline text-[#1a448d]">
              Sign in
            </Link>
          </p>
        </div>

        {/* Desktop/tablet layout: card with all fields */}
        <Card className="hidden md:block w-full max-w-xl shadow-md">
          <CardHeader className="pb-6">
            <CardTitle className="text-3xl font-semibold text-[#10294b] text-center">
              Sign up
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-1">
                <Label className="text-sm text-gray-700" htmlFor="fullName">
                  Full name
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  className="h-10 border-input text-sm"
                  {...register('fullName')}
                />
                {errors.fullName && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <Label className="text-sm text-gray-700" htmlFor="username">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  className="h-10 border-input text-sm"
                  {...register('username')}
                />
                {errors.username && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.username.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <Label className="text-sm text-gray-700" htmlFor="email">
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  className="h-10 border-input text-sm"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <Label className="text-sm text-gray-700" htmlFor="phone">
                  Telephone number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter your telephone number"
                  className="h-10 border-input text-sm"
                  {...register('phone')}
                />
              </div>

              <div className="flex flex-col gap-1">
                <Label className="text-sm text-gray-700" htmlFor="password">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="h-10 border-input text-sm"
                  {...register('password')}
                />
                {errors.password && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="mt-4 h-10 w-full text-sm font-medium shadow-sm"
              >
                Sign up
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}