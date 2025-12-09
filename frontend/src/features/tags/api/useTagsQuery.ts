import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPatch, apiDelete } from "../../../shared/api/client";
import type { Tag } from "../../../shared/types";

export const tagsQueryKey = ["tags"] as const;

export function useTagsQuery() {
  return useQuery({
    queryKey: tagsQueryKey,
    queryFn: () => apiGet<Tag[]>("/tags"),
  });
}

interface CreateTagInput {
  name: string;
  color: string;
}

export function useCreateTagMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTagInput) =>
      apiPost<Tag, CreateTagInput>("/tags", input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: tagsQueryKey });
    },
  });
}

interface UpdateTagInput {
  id: number;
  name?: string;
  color?: string;
}

export function useUpdateTagMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...patch }: UpdateTagInput) =>
      apiPatch<Tag, Partial<Omit<UpdateTagInput, "id">>>(`/tags/${id}`, patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: tagsQueryKey });
    },
  });
}

interface DeleteTagInput {
  id: number;
}

export function useDeleteTagMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: DeleteTagInput) =>
      apiDelete<void>(`/tags/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: tagsQueryKey });
    },
  });
}

export function useAddTagToItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, tagId }: { itemId: number; tagId: number }) =>
      apiPost(`/tags/item/${itemId}/${tagId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: itemsQueryKey });
    },
  });
}

export function useRemoveTagFromItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, tagId }: { itemId: number; tagId: number }) =>
      apiDelete(`/tags/item/${itemId}/${tagId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: itemsQueryKey });
    },
  });
}