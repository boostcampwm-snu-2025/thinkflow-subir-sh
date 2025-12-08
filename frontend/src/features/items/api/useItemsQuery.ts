import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../../../shared/api/client';
import type { Item } from '../../../shared/types';

export const itemsQueryKey = ['items'] as const;

export function useItemsQuery() {
  return useQuery({
    queryKey: itemsQueryKey,
    queryFn: () => apiGet<Item[]>('/items'),
  });
}