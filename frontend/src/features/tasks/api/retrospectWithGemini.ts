import { useMutation, useQuery } from "@tanstack/react-query";
import { apiGet, apiPost } from "../../../shared/api/client";
import type { Item } from "../../../shared/types";

export type DraftStatus = "EMPTY" | "PENDING" | "READY" | "FAILED";

export interface RetrospectDraftDTO {
  taskId: number;
  status: DraftStatus;
  draftTitle: string | null;
  draftContent: string | null;
  errorMessage: string | null;
  updatedAt: string;
}

export interface EnsureDraftResultDTO {
  status: string; // "READY" | "PENDING" | "FAILED" | "CACHED" | ...
  draft: RetrospectDraftDTO | null;
}

export interface RetrospectStateDTO {
  task: Item;
  retrospectPost: Item | null;
  draft: RetrospectDraftDTO | null;
  retrospectPostId: number | null;
}

export function useEnsureRetrospectDraftMutation() {
  return useMutation({
    mutationFn: (args: { taskId: number; force?: boolean }) => {
      const qs = args.force ? "?force=1" : "";
      return apiPost<EnsureDraftResultDTO, Record<string, never>>(
        `/items/${args.taskId}/retrospect/draft${qs}`,
        {},
      );
    },
  });
}

export function useRetrospectStateQuery(taskId: number | null, enabled: boolean) {
  return useQuery({
    queryKey: ["retrospect", taskId],
    enabled: enabled && taskId != null,
    queryFn: () => apiGet<RetrospectStateDTO>(`/items/${taskId}/retrospect`),
    refetchOnWindowFocus: false,
  });
}
