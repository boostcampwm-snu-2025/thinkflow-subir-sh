import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiPost } from '../../../shared/api/client';
import type { Item, ItemType, Priority } from '../../../shared/types';
import { itemsQueryKey } from './useItemsQuery';

interface CreateItemInput {
  type: ItemType;
  title: string;
  content?: string;
  taskDetail?: {
    dueDate?: string | null;
    priority?: Priority | null;
  };
}

export function useCreateItemMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateItemInput) =>
      apiPost<Item, CreateItemInput>("/items", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: itemsQueryKey });
    },
  });
}