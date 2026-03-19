import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getAllUsers,
  getVerificationDetails,
  listVerifications,
  reviewVerification,
  updateUserProfile,
} from '../services/adminService';

export const useUsersQuery = () =>
  useQuery({
    queryKey: ['admin', 'users'],
    queryFn: getAllUsers,
  });

export const useVerificationsQuery = (status?: string) =>
  useQuery({
    queryKey: ['admin', 'verifications', status],
    queryFn: () => listVerifications(status),
  });

export const useVerificationDetailsQuery = (id: string | null) =>
  useQuery({
    queryKey: ['admin', 'verification', id],
    queryFn: () => getVerificationDetails(id!),
    enabled: Boolean(id),
  });

export const useUpdateUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      data,
    }: {
      userId: string;
      data: Parameters<typeof updateUserProfile>[1];
    }) => updateUserProfile(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
};

export const useReviewVerificationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
      reviewNote,
    }: {
      id: string;
      status: 'APPROVED' | 'REJECTED';
      reviewNote?: string;
    }) => reviewVerification(id, status, reviewNote),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'verifications'] });
    },
  });
};
