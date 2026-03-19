import { getFromApi, patchToApi } from '@/lib/api/client';
import type { IUser } from '@/types';
import type { IVerificationDetails, IVerificationWithUser } from '../types';

export const getAllUsers = () =>
  getFromApi<IUser[]>('/api/users/getAllUsers');

export const updateUserProfile = (
  userId: string,
  data: Partial<Pick<IUser, 'admin' | 'status'>>
) => patchToApi<IUser>(`/api/users/updateUserProfile/${userId}`, data);

export const listVerifications = (status?: string) =>
  getFromApi<IVerificationWithUser[]>('/api/verification/requests/list', {
    status,
  });

export const getVerificationDetails = (id: string) =>
  getFromApi<IVerificationDetails>(`/api/verification/details/${id}`);

export const reviewVerification = (
  id: string,
  status: 'APPROVED' | 'REJECTED',
  reviewNote?: string
) => patchToApi<IVerificationWithUser>(`/api/verification/review/${id}`, { status, reviewNote });
