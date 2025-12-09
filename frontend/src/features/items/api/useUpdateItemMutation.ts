import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiPatch } from '../../../shared/api/client';
import type { Item, ItemType, Priority, TaskStatus } from '../../../shared/types';
import { itemsQueryKey } from './useItemsQuery';

interface UpdateItemInput {
  id: number;
  title?: string;
  content?: string | null;
  type: ItemType;
  taskDetail?: {
    dueDate?: string | null;
    priority?: Priority | null;
    status?: TaskStatus;
  };
}

export function useUpdateItemMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateItemInput) =>
      apiPatch<Item, Omit<UpdateItemInput, "id">>(
        `/items/${data.id}`,
        {
          title: data.title,
          content: data.content,
          type: data.type,
          taskDetail: data.taskDetail,
        },
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: itemsQueryKey });
    },
  });
}
