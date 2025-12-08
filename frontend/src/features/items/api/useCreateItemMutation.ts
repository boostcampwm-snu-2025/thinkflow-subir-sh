import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiPost } from '../../../shared/api/client';
import type { Item, ItemType } from '../../../shared/types';
import { itemsQueryKey } from './useItemsQuery';

interface CreateItemInput {
  type: ItemType;          // 'MEMO' | 'TASK' | 'POST'
  title: string;
  content?: string;
}

export function useCreateItemMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateItemInput) =>
      apiPost<Item, CreateItemInput>('/items', input),
    onSuccess: () => {
      // 간단 버전: 리스트 전체 리페치
      // @TODO: 최적화 무조건 가능할듯 
      qc.invalidateQueries({ queryKey: itemsQueryKey });
    },
  });
}