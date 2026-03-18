'use client';

import { useQuery } from '@tanstack/react-query';
import { DEBTS_REFRESH_INTERVAL_MS } from '@/config/constants';
import { getDebtDetails } from '../services/debtsService';

export const useDebtDetailsQuery = (
  debtId: string | null,
  userId: string,
  enabled: boolean
) => {
  return useQuery({
    queryKey: ['debts', 'details', userId, debtId],
    queryFn: () => getDebtDetails(debtId!, userId),
    enabled: enabled && Boolean(debtId),
    refetchInterval: DEBTS_REFRESH_INTERVAL_MS,
    staleTime: 10000,
  });
};
