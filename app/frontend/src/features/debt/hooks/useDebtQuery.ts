import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getDebts, createDebt, updateDebt, completeDebt } from '../services/debtService';

export const useDebtsQuery = () => 
  useQuery({
    queryKey: ['debts'],
    queryFn: getDebts,
  });

export const useCreateDebtMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createDebt,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
    },
  });
};

export const useUpdateDebtMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateDebt(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
      queryClient.invalidateQueries({ queryKey: ['debts', id] });
    },
  });
};

export const useCompleteDebtMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => completeDebt(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
      queryClient.invalidateQueries({ queryKey: ['debts', id] });
    },
  });
};
