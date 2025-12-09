import clsx from "clsx";
import type { Tag } from "../../../shared/types";

interface TagFilterBarProps {
  tags: Tag[];
  selectedTagIds: number[];
  onToggleTag: (tagId: number) => void;
}

export function TagFilterBar({
  tags,
  selectedTagIds,
  onToggleTag,
}: TagFilterBarProps) {
  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 text-xs">
      {tags.map((tag) => {
        const active = selectedTagIds.includes(tag.id);
        return (
          <button
            key={tag.id}
            type="button"
            onClick={() => onToggleTag(tag.id)}
            className={clsx(
              "flex items-center gap-1 rounded-full border px-3 py-1 transition",
              active
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
            )}
          >
            {/* 색깔은 일단 점 표시 정도만 */}
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: tag.color }}
            />
            <span>{tag.name}</span>
          </button>
        );
      })}
    </div>
  );
}