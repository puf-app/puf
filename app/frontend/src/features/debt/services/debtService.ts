import { getFromApi, patchToApi, postToApi } from '@/lib/api/client';
import { IDebt } from '@/types';
import { IDebtsResponse } from '../types';

export const getDebts = () => getFromApi<IDebtsResponse>('/api/debts/getDebts');

export const createDebt = (data: any) =>
  postToApi<{ message: string; debt: IDebt }>('/api/debts/createDebt', data);

export const updateDebt = (
  id: string,
  data: Partial<Pick<IDebt, 'title' | 'amount' | 'description'>>,
) => patchToApi<IDebt>(`/api/debts/updateDebt/${id}`, data);

export const completeDebt = (id: string) =>
  patchToApi<IDebt>(`/api/debts/completeDebt/${id}`, {});
