'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { store } from '@/stores/store';
import { useEffect } from 'react';

import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { clearUser, setUser } from '@/stores/slices/userSlice';

const queryClient = new QueryClient();

interface IProviders {
  children: React.ReactNode;
}

const AUTH_STORAGE_KEY = 'puf_user';

function AuthPersistence() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.user);

  useEffect(() => {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return;

    try {
      dispatch(setUser(JSON.parse(raw)));
    } catch {
      // Ignore invalid localStorage payloads
    }
  }, [dispatch]);

  useEffect(() => {
    if (!user) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return;
    }

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  }, [user]);

  return null;
}

export default function Providers({ children }: IProviders) {
  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <AuthPersistence />
        {children}
      </Provider>
    </QueryClientProvider>
  );
}
