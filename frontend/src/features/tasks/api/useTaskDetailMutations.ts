import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiPost, apiPatch, apiDelete } from "../../../shared/api/client";
import type { Priority, TaskStatus } from "../../../shared/types";
import { itemsQueryKey } from "../../items/api/useItemsQuery";

interface TaskDetailInput {
  itemId: number;
  dueDate?: string | null;
  priority?: Priority | null;
  status?: TaskStatus;
}

export function useCreateTaskDetailMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: TaskDetailInput) =>
      apiPost(`/items/${data.itemId}/task-detail`, {
        dueDate: data.dueDate ?? null,
        priority: data.priority ?? null,
        status: data.status,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: itemsQueryKey });
    },
  });
}

export function useUpdateTaskDetailMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: TaskDetailInput) => {
      const body: Record<string, unknown> = {};

      // undefined인 필드는 아예 안 보냄 → DB 값 유지
      if ("dueDate" in data) body.dueDate = data.dueDate;
      if ("priority" in data) body.priority = data.priority;
      if ("status" in data && data.status) body.status = data.status;

      return apiPatch(`/items/${data.itemId}/task-detail`, body);
    },
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