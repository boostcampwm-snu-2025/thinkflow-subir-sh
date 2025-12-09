import type { FormEvent } from "react";
import { useState } from "react";
import clsx from "clsx";
import { Modal } from "../../../shared/ui/Modal";

interface TaskCreateModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; content?: string | null }) => void;
  submitting: boolean;
}

export function TaskCreateModal({
  open,
  onClose,
  onSubmit,
  submitting,
}: TaskCreateModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const reset = () => {
    setTitle("");
    setContent("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const t = title.trim();
    const c = content.trim();
    if (!t) return;

    onSubmit({ title: t, content: c || undefined });
    reset();
  };

  if (!open) return null;

  return (
    <Modal open={open} onClose={handleClose}>
      <h2 className="mb-4 text-base font-semibold text-slate-900">
        새 태스크 추가
      </h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-600">
            제목
          </label>
          <input
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 리액트 과제 끝내기"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-600">
            내용 (선택)
          </label>
          <textarea
            className="h-24 w-full resize-none rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="메모나 세부 작업이 있다면 적어주세요"
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
            {submitting ? "추가 중..." : "추가"}
          </button>
        </div>
      </form>
    </Modal>
  );
}