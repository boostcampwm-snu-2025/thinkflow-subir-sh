import type { Item, ItemType } from "../../../shared/types";
import clsx from "clsx";
import { Modal } from "../../../shared/ui/Modal";

interface ItemDeleteModalProps {
  open: boolean;
  item?: Item | null;
  onClose: () => void;
  onConfirm: () => void;
  submitting: boolean;
}

const typeLabel = (type: ItemType) => {
  switch (type) {
    case "TASK":
      return "태스크";
    case "POST":
      return "포스트";
    case "MEMO":
      return "메모";
    default:
      return "아이템";
  }
};

export function ItemDeleteModal({
  open,
  item,
  onClose,
  onConfirm,
  submitting,
}: ItemDeleteModalProps) {
  if (!open || !item) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <h2 className="mb-3 text-base font-semibold text-slate-900">
        {typeLabel(item.type)} 삭제
      </h2>

      <p className="mb-4 text-sm text-slate-600">
        <span className="font-semibold">"{item.title}"</span> {typeLabel(item.type)}
        를 삭제할까요?
        <br />
        삭제하면 복구할 수 없습니다.
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
            submitting ? "bg-slate-400" : "bg-red-600 hover:bg-red-700",
          )}
        >
          {submitting ? "삭제 중..." : "삭제"}
        </button>
      </div>
    </Modal>
  );
}