'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { store } from '@/stores/store';

const queryClient = new QueryClient();

interface IProviders {
  children: React.ReactNode;
}

export default function Providers({ children }: IProviders) {
  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>{children}</Provider>
    </QueryClientProvider>
  );
}
