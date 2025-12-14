import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { Modal } from "../../../shared/ui/Modal";
import type { Item, Priority } from "../../../shared/types";

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

  const template = useMemo(() => {
    if (!task) return "";

    const due = task.taskDetail?.dueDate ?? null;
    const pri = task.taskDetail?.priority ?? null;

    const tagNames =
      (task.tags ?? [])
        .map((it) => it.tag?.name)
        .filter(Boolean)
        .map((name) => `#${name}`)
        .join(" ") || "(없음)";

    const original = (task.content ?? "").trim();

    return [
      `기한: ${due ?? "없음"}, 우선순위: ${priorityLabel(pri)}`,
      `태그: ${tagNames}`,
      ``,
      `---`,
      `작업 내용`,
      original ? original : "(내용 없음)",
      ``,
      `---`,
      `회고`,
      `- 잘한 점:`,
      `- 아쉬운 점:`,
      `- 다음 행동:`,
      ``,
    ].join("\n");
  }, [task]);

  useEffect(() => {
    if (!open || !task) return;

    setTitle(`회고: ${task.title}`);
    setContent(template);
  }, [open, task, template]);

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

  if (!open || !task) return null;

  return (
    <Modal open={open} onClose={handleClose}>
      <h2 className="mb-4 text-base font-semibold text-slate-900">
        회고 포스트 만들기
      </h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-600">제목</label>
          <input
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 회고: 로그인 버그 해결"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-600">내용</label>
          <textarea
            className="h-64 w-full resize-none rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400"
            value={content}
            onChange={(e) => setContent(e.target.value)}
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
            disabled={submitting || !title.trim()}
            className={clsx(
              "rounded-md px-3 py-1.5 font-semibold text-white",
              submitting || !title.trim()
                ? "bg-slate-400"
                : "bg-slate-900 hover:bg-slate-800",
            )}
          >
            {submitting ? "저장 중..." : "저장"}
          </button>
        </div>
      </form>
    </Modal>
  );
}