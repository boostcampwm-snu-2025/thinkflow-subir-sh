import { useEffect, useState } from "react";
import type { Item, Tag } from "../../../shared/types";
import { Modal } from "../../../shared/ui/Modal";
import { useAddTagToItem } from "../api/useAddTagToItem";
import { useRemoveTagFromItem } from "../api/useRemoveTagFromItem";
import clsx from "clsx";

export function ItemTagSelectModal({
  open,
  item,
  allTags,
  onClose,
}: {
  open: boolean;
  item: Item | null;
  allTags: Tag[];
  onClose: () => void;
}) {
  const addTag = useAddTagToItem();
  const removeTag = useRemoveTagFromItem();

  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  useEffect(() => {
    if (open && item) {
      const ids = (item.tags ?? []).map((t) => t.tagId);
      setSelectedIds(ids);
    }
  }, [open, item]);

  if (!open || !item) return null;

  const toggle = (tag: Tag) => {
    const active = selectedIds.includes(tag.id);

    if (active) {
      // optimistic remove
      setSelectedIds((prev) => prev.filter((id) => id !== tag.id));
      removeTag.mutate({ itemId: item.id, tagId: tag.id });
    } else {
      // optimistic add
      setSelectedIds((prev) => [...prev, tag.id]);
      addTag.mutate({ itemId: item.id, tagId: tag.id });
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <h2 className="mb-3 text-base font-semibold text-slate-900">
        태그 관리
      </h2>

      <div className="mb-4 flex flex-wrap gap-2 text-xs">
        {allTags.map((tag) => {
          const active = selectedIds.includes(tag.id);

          return (
            <button
              key={tag.id}
              onClick={() => toggle(tag)}
              style={{ backgroundColor: tag.color }}
              className={clsx(
                "inline-flex items-center rounded-full px-3 py-1 text-white",
                active ? "ring-2 ring-slate-900" : "opacity-60 hover:opacity-100"
              )}
            >
              {tag.name}
            </button>
          );
        })}
      </div>

      <div className="flex justify-end">
        <button
          className="rounded-md px-3 py-1.5 text-slate-600 hover:bg-slate-100"
          onClick={onClose}
        >
          닫기
        </button>
      </div>
    </Modal>
  );
}
