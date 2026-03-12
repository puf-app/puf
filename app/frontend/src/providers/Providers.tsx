'use client';

import { Provider } from 'react-redux';
import { store } from '@/stores/store';

interface IProviders {
  children: React.ReactNode;
}

export default function Providers({ children }: IProviders) {
  return <Provider store={store}>{children}</Provider>;
}
