'use client';

import React, { FormEvent } from 'react';
import Link from 'next/link';

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

export default function SignupPage() {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: hook up to real API + Redux when backend is ready
  };

  return (
    <main className="min-h-screen bg-white flex flex-col">
      {/* Top bar */}
      <header className="h-16 md:h-20 bg-[#212f47] flex items-center justify-between px-4 md:px-12">
        <div className="text-2xl font-semibold text-white">Puf</div>
        <Link href="/">
          <Button
            className="px-6 py-2 h-auto rounded-md bg-[#2289f0] text-white text-sm font-medium shadow-sm hover:bg-[#1b6ec0] transition-colors"
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
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-1">
              <Label className="text-sm text-gray-700" htmlFor="username-mobile">
                Username
              </Label>
              <Input
                id="username-mobile"
                type="text"
                placeholder="Enter your username"
                className="h-10 border-gray-300 text-sm focus-visible:ring-[#2289f0]"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <Label className="text-sm text-gray-700" htmlFor="email-mobile">
                Email address
              </Label>
              <Input
                id="email-mobile"
                type="email"
                placeholder="Enter your email address"
                className="h-10 border-gray-300 text-sm focus-visible:ring-[#2289f0]"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <Label className="text-sm text-gray-700" htmlFor="password-mobile">
                Password
              </Label>
              <Input
                id="password-mobile"
                type="password"
                placeholder="Enter your password"
                className="h-10 border-gray-300 text-sm focus-visible:ring-[#2289f0]"
                minLength={6}
                required
              />
            </div>

            <Button
              type="submit"
              className="mt-4 h-10 w-full bg-[#1a448d] text-white text-sm font-medium shadow-sm hover:bg-[#153770] transition-colors"
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
        <Card className="hidden md:block w-full max-w-xl border border-gray-300 shadow-md">
          <CardHeader className="pb-6">
            <CardTitle className="text-3xl font-semibold text-[#10294b] text-center">
              Sign up
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-1">
                <Label className="text-sm text-gray-700" htmlFor="fullName">
                  Full name
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  className="h-10 border-gray-300 text-sm focus-visible:ring-[#2289f0]"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <Label className="text-sm text-gray-700" htmlFor="username">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  className="h-10 border-gray-300 text-sm focus-visible:ring-[#2289f0]"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <Label className="text-sm text-gray-700" htmlFor="email">
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  className="h-10 border-gray-300 text-sm focus-visible:ring-[#2289f0]"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <Label className="text-sm text-gray-700" htmlFor="phone">
                  Telephone number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter your telephone number"
                  className="h-10 border-gray-300 text-sm focus-visible:ring-[#2289f0]"
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
                  className="h-10 border-gray-300 text-sm focus-visible:ring-[#2289f0]"
                  minLength={6}
                  required
                />
              </div>

              <Button
                type="submit"
                className="mt-4 h-10 w-full bg-[#1a448d] text-white text-sm font-medium shadow-sm hover:bg-[#153770] transition-colors"
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