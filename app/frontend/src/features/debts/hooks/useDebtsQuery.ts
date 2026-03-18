'use client';

import { useQuery } from '@tanstack/react-query';
import { DEBTS_REFRESH_INTERVAL_MS } from '@/config/constants';
import { getDebts } from '../services/debtsService';
import type { IDebtFilters } from '../types';

export const useDebtsQuery = (
  filters: IDebtFilters,
  userId: string,
  enabled: boolean
) => {
  return useQuery({
    queryKey: ['debts', 'list', userId, filters],
    queryFn: () => getDebts(filters, userId),
    enabled,
    refetchInterval: DEBTS_REFRESH_INTERVAL_MS,
    staleTime: 10000,
  });
};
