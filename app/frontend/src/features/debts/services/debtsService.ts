import { getFromApi } from '@/lib/api/client';
import type { IDebtDetailsData, IDebtFilters, IDebtsListData } from '../types';

export const getDebts = (filters: IDebtFilters, userId: string) => {
  return getFromApi<IDebtsListData>('/debts', {
    userId,
    search: filters.search,
    status: filters.status,
    minAmount: filters.minAmount || undefined,
    maxAmount: filters.maxAmount || undefined,
    fromDate: filters.fromDate || undefined,
    toDate: filters.toDate || undefined,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
  });
};

export const getDebtDetails = (debtId: string, userId: string) => {
  return getFromApi<IDebtDetailsData>(`/debts/${debtId}`, { userId });
};
