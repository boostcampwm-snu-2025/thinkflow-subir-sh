import type { ChangeEvent } from "react";
import clsx from "clsx";
import type { Tag } from "../../../shared/types";
import { TagFilterBar } from "../../tags/components/TagFilterBar";
import { QuickMemoInput } from "./QuickMemoInput";

interface PostHeaderProps {
  searchText: string;
  onSearchChange: (value: string) => void;

  tags: Tag[];
  selectedTagIds: number[];
  onToggleTag: (tagId: number) => void;

  quickMemoSubmitting: boolean;
  onCreateQuickMemo: (body: string) => void;

  aiCount: number;
  onClickNewPost: () => void;
}

export function PostHeader({
  searchText,
  onSearchChange,
  tags,
  selectedTagIds,
  onToggleTag,
  quickMemoSubmitting,
  onCreateQuickMemo,
  aiCount,
  onClickNewPost,
}: PostHeaderProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-slate-900">
          메모 &amp; 포스트
        </h2>
      </div>

      {/* 검색 */}
      <input
        type="text"
        value={searchText}
        onChange={handleChange}
        placeholder="제목이나 내용으로 검색..."
        className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-1 focus:ring-blue-300"
      />

      {/* 태그 필터 */}
      {tags.length > 0 && (
        <TagFilterBar
          tags={tags}
          selectedTagIds={selectedTagIds}
          onToggleTag={onToggleTag}
        />
      )}

      {/* 빠른 메모 */}
      <QuickMemoInput
        isSubmitting={quickMemoSubmitting}
        onCreate={onCreateQuickMemo}
      />

      {/* 오른쪽 버튼들 */}
      <div className="mt-1 flex items-center justify-end gap-2">
        <button
          type="button"
          disabled
          className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-400"
        >
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[10px]">
            AI
          </span>
          <span>AI 분석 ({aiCount})</span>
        </button>

        <button
          type="button"
          onClick={onClickNewPost}
          className={clsx(
            "flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold text-white shadow-sm",
            "bg-slate-900 hover:bg-slate-800",
          )}
        >
          <span className="text-base leading-none">＋</span>
          <span>새 포스트</span>
        </button>
      </div>
    </div>
  );
}