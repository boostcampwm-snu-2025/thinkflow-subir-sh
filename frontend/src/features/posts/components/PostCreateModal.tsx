import type { FormEvent } from "react";
import { useState } from "react";
import clsx from "clsx";
import { Modal } from "../../../shared/ui/Modal";

interface PostCreateModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; content?: string | null }) => void;
  submitting: boolean;
}

export function PostCreateModal({
  open,
  onClose,
  onSubmit,
  submitting,
}: PostCreateModalProps) {
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

    onSubmit({
      title: t,
      content: c || null,
    });

    reset();
  };

  if (!open) return null;

  return (
    <Modal open={open} onClose={handleClose}>
      <h2 className="mb-4 text-base font-semibold text-slate-900">
        새 메모 / 포스트 추가
      </h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* 제목 */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-600">제목</label>
          <input
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 오늘 회고, 아침에 떠오른 아이디어 등"
          />
        </div>

        {/* 내용 */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-600">
            내용 (비우면 메모로 저장)
          </label>
          <textarea
            className="h-24 w-full resize-none rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="간단한 생각부터 긴 회고까지 자유롭게 적어보세요"
          />
        </div>

        {/* 버튼 영역 */}
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
