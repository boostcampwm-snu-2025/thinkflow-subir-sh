import type { FormEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { Modal } from "../../../shared/ui/Modal";
import type { Item, Priority } from "../../../shared/types";
import {
  useEnsureRetrospectDraftMutation,
  useRetrospectStateQuery,
} from "../api/retrospectWithGemini";

interface RetrospectCreateModalProps {
  open: boolean;
  task: Item | null;
  onClose: () => void;
  onSubmit: (data: { title: string; content: string }) => void;
  submitting: boolean;
}

const priorityLabel = (p?: Priority | null) => {
  switch (p) {
    case "HIGH":
      return "높음";
    case "MEDIUM":
      return "중간";
    case "LOW":
      return "낮음";
    default:
      return "없음";
  }
};

export function RetrospectCreateModal({
  open,
  task,
  onClose,
  onSubmit,
  submitting,
}: RetrospectCreateModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const dirtyRef = useRef(false);
  const initializedRef = useRef(false);

  const ensureDraft = useEnsureRetrospectDraftMutation();
  const stateQuery = useRetrospectStateQuery(task?.id ?? null, open && !!task);

  const [polling, setPolling] = useState(false);
  const [draftError, setDraftError] = useState<string | null>(null);

  const template = useMemo(() => {
    if (!task) return "";

    const start = new Date(task.createdAt).toLocaleDateString("ko-KR", {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
    });

    const due =
      task.taskDetail?.dueDate == null
        ? "기한 없음"
        : new Date(task.taskDetail.dueDate).toLocaleDateString("ko-KR", {
            year: "2-digit",
            month: "2-digit",
            day: "2-digit",
          });

    const pri = task.taskDetail?.priority ?? null;

    const tagNames =
      (task.tags ?? [])
        .map((it) => it.tag?.name)
        .filter(Boolean)
        .map((name) => `#${name}`)
        .join(" ") || "(없음)";

    const original = (task.content ?? "").trim();

    return [
      `기한: ${start} ~ ${due ?? "없음"}, 우선순위: ${priorityLabel(pri)}`,
      `태그: ${tagNames}`,
      ``,
      `---`,
      `작업 내용`,
      original || "(내용 없음)",
      ``,
      `---`,
      `회고`,
      `- 잘한 점:`,
      `- 아쉬운 점:`,
      `- 다음 행동:`,
      ``,
    ].join("\n");
  }, [task]);

  // open 시 기본값 + 상태 초기화
  useEffect(() => {
    if (!open || !task) return;

    initializedRef.current = false;
    dirtyRef.current = false;
    setDraftError(null);
    setPolling(false);

    setTitle(`회고: ${task.title}`);
    setContent(template);
  }, [open, task, template]);

  // open되면: (1) 상태 조회해서 이미 post/draft가 있는지 확인 -> 없으면 (2) draft 생성 요청
  useEffect(() => {
    if (!open || !task) return;
    if (!stateQuery.data) return;
    if (initializedRef.current) return;

    initializedRef.current = true;

    const post = stateQuery.data.retrospectPost;
    const draft = stateQuery.data.draft;

    // 이미 저장된 회고 포스트가 있으면 그걸 먼저 보여주기
    if (post) {
      setTitle(post.title);
      setContent(post.content ?? "");
      return;
    }

    // READY draft가 있으면 그걸 채우기
    if (draft?.status === "READY" && draft.draftContent) {
      setTitle(draft.draftTitle ?? `회고: ${task.title}`);
      setContent(draft.draftContent);
      return;
    }

    // 없으면 생성 요청
    ensureDraft.mutate(
      { taskId: task.id },
      {
        onSuccess: (res) => {
          const d = res.draft;

          if (d?.status === "PENDING") {
            setPolling(true);
            return;
          }

          if (d?.status === "FAILED") {
            setDraftError(d.errorMessage || "초안 생성 실패");
            return;
          }

          if (d?.status === "READY" && d.draftContent && !dirtyRef.current) {
            setTitle(d.draftTitle ?? `회고: ${task.title}`);
            setContent(d.draftContent);
          }
        },
        onError: (e) => {
          setDraftError((e as Error).message || "초안 생성 실패");
        },
      },
    );
  }, [open, task, stateQuery.data, ensureDraft]);

  // polling: PENDING이면 주기적으로 state 다시 가져오기
  useEffect(() => {
    if (!open || !task) return;
    if (!polling) return;

    const t = setInterval(async () => {
      const res = await stateQuery.refetch();
      const d = res.data?.draft;

      if (!d) return;
      if (d.status === "PENDING") return;

      setPolling(false);

      if (d.status === "FAILED") {
        setDraftError(d.errorMessage || "초안 생성 실패");
        return;
      }

      if (d.status === "READY" && d.draftContent && !dirtyRef.current) {
        setTitle(d.draftTitle ?? `회고: ${task.title}`);
        setContent(d.draftContent);
      }
    }, 1500);

    return () => clearInterval(t);
  }, [open, task, polling, stateQuery]);

  const handleClose = () => {
    onClose();
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const t = title.trim();
    const c = content.trim();
    if (!t || !c) return;
    onSubmit({ title: t, content: c });
  };

  const handleForceRegenerate = () => {
    if (!task) return;

    // 사용자가 원하면 강제 재생성. (덮어쓰기 허용하려고 dirty 리셋)
    dirtyRef.current = false;
    setDraftError(null);
    setPolling(false);

    ensureDraft.mutate(
      { taskId: task.id, force: true },
      {
        onSuccess: (res) => {
          const d = res.draft;
          if (d?.status === "PENDING") {
            setPolling(true);
            return;
          }
          if (d?.status === "FAILED") {
            setDraftError(d.errorMessage || "초안 생성 실패");
            return;
          }
          if (d?.status === "READY" && d.draftContent) {
            setTitle(d.draftTitle ?? `회고: ${task.title}`);
            setContent(d.draftContent);
          }
        },
        onError: (e) => {
          setDraftError((e as Error).message || "초안 생성 실패");
        },
      },
    );
  };

  if (!open || !task) return null;

  const generating = ensureDraft.isPending || polling;

  return (
    <Modal open={open} onClose={handleClose}>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900">
          회고 포스트 만들기
        </h2>

        <div className="flex items-center gap-2">
          {generating && (
            <span className="text-xs text-slate-500">초안 생성 중...</span>
          )}
          <button
            type="button"
            onClick={handleForceRegenerate}
            className="rounded-md px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
          >
            LLM으로 생성
          </button>
        </div>
      </div>

      {draftError && (
        <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {draftError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-600">제목</label>
          <input
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400"
            value={title}
            onChange={(e) => {
              dirtyRef.current = true;
              setTitle(e.target.value);
            }}
            placeholder="예: 회고: 로그인 버그 해결"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-600">내용</label>
          <textarea
            className="h-64 w-full resize-none rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400"
            value={content}
            onChange={(e) => {
              dirtyRef.current = true;
              setContent(e.target.value);
            }}
            placeholder="회고 내용을 작성하세요"
          />
        </div>

        <div className="mt-2 flex justify-end gap-2 text-sm">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-md px-3 py-1.5 text-slate-600 hover:bg-slate-100"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={submitting || generating || !title.trim() || !content.trim()}
            className={clsx(
              "rounded-md px-3 py-1.5 font-semibold text-white",
              submitting || generating || !title.trim() || !content.trim()
                ? "bg-slate-400"
                : "bg-slate-900 hover:bg-slate-800",
            )}
          >
            {submitting ? "저장 중..." : generating ? "초안 생성 중..." : "저장"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
