import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiPost } from "../../../shared/api/client";
import { itemsQueryKey } from "./useItemsQuery";

export function useAddTagToItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, tagId }: { itemId: number; tagId: number }) =>
      apiPost(`/tags/item/${itemId}/${tagId}`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: itemsQueryKey });
    }
  });
}