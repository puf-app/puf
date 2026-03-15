'use client';

import React, { FormEvent } from 'react';
import Link from 'next/link';

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
        <Link
          href="/"
          className="px-6 py-2 rounded-md bg-[#2289f0] text-white text-sm font-medium shadow-sm hover:bg-[#1b6ec0] transition-colors"
        >
          Home
        </Link>
      </header>

      {/* Centered card */}
      <section className="flex-1 flex flex-col items-center justify-start md:justify-center px-4 py-8 md:py-12 gap-4">
        <div className="w-full max-w-md md:max-w-xl rounded-2xl bg-white shadow-md border border-gray-300 px-6 py-8 md:px-12 md:py-10">
          <h1 className="text-2xl md:text-3xl font-semibold text-[#10294b] text-center mb-6 md:mb-8">
            Sign up
          </h1>

          <form className="space-y-4 md:space-y-5" onSubmit={handleSubmit}>
            <div className="hidden md:flex flex-col gap-1">
              <label className="text-sm text-gray-700">Full name</label>
              <input
                type="text"
                placeholder="Enter your full name"
                className="h-10 rounded-md border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2289f0]"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-700">Username</label>
              <input
                type="text"
                placeholder="Enter your username"
                className="h-10 rounded-md border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2289f0]"
                required
              />
            </div>

            <div className="hidden md:flex flex-col gap-1">
              <label className="text-sm text-gray-700">Email address</label>
              <input
                type="email"
                placeholder="Enter your email address"
                className="h-10 rounded-md border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2289f0]"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-700">Telephone number</label>
              <input
                type="tel"
                placeholder="Enter your telephone number"
                className="h-10 rounded-md border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2289f0]"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-700">Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                className="h-10 rounded-md border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2289f0]"
                minLength={6}
                required
              />
            </div>

            <button
              type="submit"
              className="mt-4 h-10 w-full rounded-md bg-[#1a448d] text-white text-sm font-medium shadow-sm hover:bg-[#153770] transition-colors"
            >
              Sign up
            </button>
          </form>
        </div>

        {/* Mobile-only sign-in hint below card */}
        <p className="block md:hidden text-sm text-center w-full">
          Already have an account?{' '}
          <Link href="/login" className="underline text-[#1a448d]">
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
}