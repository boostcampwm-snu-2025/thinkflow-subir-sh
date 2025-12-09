import clsx from "clsx";
import { Pencil, Trash2 } from "lucide-react";
import type { Tag } from "../../../shared/types";

interface TagBarProps {
  tags: Tag[];
  selectedTagIds: number[];

  onToggleTag: (tagId: number) => void;

  onClickCreate: () => void;
  onClickEdit: (tag: Tag) => void;
  onClickDelete: (tag: Tag) => void;
}

export function TagBar({
  tags,
  selectedTagIds,
  onToggleTag,
  onClickCreate,
  onClickEdit,
  onClickDelete,
}: TagBarProps) {
  return (
    <div className="flex flex-wrap gap-2 text-xs">
      {tags.map((tag) => {
        const active = selectedTagIds.includes(tag.id);
        return (
          <div key={tag.id} className="relative inline-flex group">
            {/* 태그 버튼 */}
            <button
              type="button"
              onClick={() => onToggleTag(tag.id)}
              style={{ backgroundColor: tag.color }} 
              className={clsx(
                "flex items-center gap-1 rounded-full px-3 py-1 text-xs text-white transition",
                active
                  ? "ring-2 ring-slate-900"
                  : "opacity-80 hover:opacity-100 ring-1 ring-slate-200",
              )}
            >
              <span>{tag.name}</span>
            </button>

            {/* hover 메뉴: 아래쪽으로, hover 유지되도록 */}
            <div
              className={clsx(
                "absolute right-0 top-full mt-0.5",     // ⭐ gap 없이 거의 붙여버림
                "flex rounded-full bg-slate-900 px-2 py-1 text-[10px] text-white shadow",

                // ⭐ 나타날 때는 즉시
                "opacity-0 invisible translate-y-1",
                "group-hover:visible group-hover:opacity-100 group-hover:translate-y-0",

                // ⭐ 사라질 때는 120ms 딜레이 → 클릭 충분히 가능
                "transition-all duration-150 delay-0",
                "group-hover:delay-0",                 // 나타날 때는 delay 제거
                "group-not-hover:delay-150",           // hover 해제 후 사라지는 데 150ms 딜레이
              )}
            >
              <button
                type="button"
                onClick={() => onClickEdit(tag)}
                className="hover:text-amber-300"
                title="편집"
              >
                <Pencil size={16} />
              </button>
              <span className="mx-1 text-slate-500">·</span>
              <button
                type="button"
                onClick={() => onClickDelete(tag)}
                className="hover:text-red-300"
                title="삭제"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        );
      })}

      {/* 새 태그 버튼 */}
      <button
        type="button"
        onClick={onClickCreate}
        className="inline-flex items-center gap-1 rounded-full border border-dashed border-slate-300 bg-slate-50 px-3 py-1 text-xs text-slate-500 hover:bg-slate-100"
      >
        <span>+ 새 태그</span>
      </button>
    </div>
  );
}