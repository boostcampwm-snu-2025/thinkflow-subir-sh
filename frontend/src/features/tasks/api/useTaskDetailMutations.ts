import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiPost, apiPatch, apiDelete } from "../../../shared/api/client";
import type { Priority } from "../../../shared/types";
import { itemsQueryKey } from "../../items/api/useItemsQuery";

interface TaskDetailInput {
  itemId: number;
  dueDate?: string | null;
  priority?: Priority | null;
}

export function useCreateTaskDetailMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: TaskDetailInput) =>
      apiPost(`/items/${data.itemId}/task-detail`, {
        dueDate: data.dueDate ?? null,
        priority: data.priority ?? null,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: itemsQueryKey });
    },
  });
}

export function useUpdateTaskDetailMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: TaskDetailInput) =>
      apiPatch(`/items/${data.itemId}/task-detail`, {
        dueDate: data.dueDate ?? null,
        priority: data.priority ?? null,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: itemsQueryKey });
    },
  });
}

export function useDeleteTaskDetailMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId }: { itemId: number }) =>
      apiDelete(`/items/${itemId}/task-detail`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: itemsQueryKey });
    },
  });
}