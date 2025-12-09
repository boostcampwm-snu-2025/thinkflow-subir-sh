import type { Tag } from "../../../shared/types";
import clsx from "clsx";
import { Modal } from "../../../shared/ui/Modal";

interface TagDeleteModalProps {
  open: boolean;
  tag?: Tag;
  onClose: () => void;
  onConfirm: () => void;
  submitting: boolean;
}

export function TagDeleteModal({
  open,
  tag,
  onClose,
  onConfirm,
  submitting,
}: TagDeleteModalProps) {
  if (!tag) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <h2 className="mb-3 text-base font-semibold text-slate-900">
        태그 삭제
      </h2>
      <p className="mb-4 text-sm text-slate-600">
        <span className="font-semibold">"{tag.name}"</span> 태그를 삭제할까요?
        <br />
        이 태그가 달려 있는 아이템에서도 태그가 제거됩니다.
      </p>

      <div className="flex justify-end gap-2 text-sm">
        <button
          type="button"
          onClick={onClose}
          className="rounded-md px-3 py-1.5 text-slate-600 hover:bg-slate-100"
        >
          취소
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={submitting}
          className={clsx(
            "rounded-md px-3 py-1.5 font-semibold text-white",
            submitting
              ? "bg-slate-400"
              : "bg-red-600 hover:bg-red-700",
          )}
        >
          {submitting ? "삭제 중..." : "삭제"}
        </button>
      </div>
    </Modal>
  );
}