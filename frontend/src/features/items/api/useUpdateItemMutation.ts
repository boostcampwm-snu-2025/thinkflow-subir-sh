import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiPatch } from '../../../shared/api/client';
import type { Item } from '../../../shared/types';
import { itemsQueryKey } from './useItemsQuery';

interface UpdateItemInput {
  id: number;
  title?: string;
  content?: string;
}

export function useUpdateItemMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...patch }: UpdateItemInput) =>
      apiPatch<Item, Partial<Omit<UpdateItemInput, 'id'>>>(
        `/items/${id}`,
        patch,
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: itemsQueryKey });
    },
  });
}