import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiDelete } from '../../../shared/api/client';
import { itemsQueryKey } from './useItemsQuery';

interface DeleteItemInput {
  id: number;
}

export function useDeleteItemMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: DeleteItemInput) => apiDelete<void>(`/items/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: itemsQueryKey });
    },
  });
}