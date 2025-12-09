import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiDelete } from "../../../shared/api/client";
import { itemsQueryKey } from "./useItemsQuery";

export function useRemoveTagFromItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, tagId }: { itemId: number; tagId: number }) =>
      apiDelete(`/tags/item/${itemId}/${tagId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: itemsQueryKey });
    }
  });
}