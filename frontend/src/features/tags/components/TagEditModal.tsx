import type { FormEvent } from "react";
import { useState, useEffect } from "react";
import type { Tag } from "../../../shared/types";
import clsx from "clsx";
import { Modal } from "../../../shared/ui/Modal";

interface TagEditModalProps {
  open: boolean;
  mode: "create" | "edit";
  initialTag?: Pick<Tag, "name" | "color">;
  onClose: () => void;
  onSubmit: (data: { name: string; color: string }) => void;
  submitting: boolean;
}

export function TagEditModal({
  open,
  mode,
  initialTag,
  onClose,
  onSubmit,
  submitting,
}: TagEditModalProps) {
  const [name, setName] = useState(initialTag?.name ?? "");
  const [color, setColor] = useState(initialTag?.color ?? "#6366f1");

  useEffect(() => {
    if (open) {
      setName(initialTag?.name ?? "");
      setColor(initialTag?.color ?? "#6366f1");
    }
  }, [open, initialTag]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), color });
  };

  const title = mode === "create" ? "새 태그 만들기" : "태그 편집";
  const confirmLabel = mode === "create" ? "추가" : "수정";

  return (
    <Modal open={open} onClose={onClose}>
      <h2 className="mb-4 text-base font-semibold text-slate-900">
        {title}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-600">
            이름
          </label>
          <input
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 공부, 아이디어, 사이드 프로젝트"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-600">
            색깔
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              className="h-8 w-10 cursor-pointer rounded border border-slate-300 bg-transparent"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
            <input
              className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="#6366f1"
            />
          </div>
        </div>

        <div className="mt-2 flex justify-end gap-2 text-sm">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-3 py-1.5 text-slate-600 hover:bg-slate-100"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={submitting || !name.trim()}
            className={clsx(
              "rounded-md px-3 py-1.5 font-semibold text-white",
              submitting || !name.trim()
                ? "bg-slate-400"
                : "bg-slate-900 hover:bg-slate-800",
            )}
          >
            {submitting ? "저장 중..." : confirmLabel}
          </button>
        </div>
      </form>
    </Modal>
  );
}