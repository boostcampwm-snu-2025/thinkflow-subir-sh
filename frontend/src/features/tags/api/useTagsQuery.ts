import { useQuery } from "@tanstack/react-query";
import { apiGet } from "../../../shared/api/client";
import type { Tag } from "../../../shared/types";

export const tagsQueryKey = ["tags"] as const;

export function useTagsQuery() {
  return useQuery({
    queryKey: tagsQueryKey,
    queryFn: () => apiGet<Tag[]>("/tags"),
  });
}