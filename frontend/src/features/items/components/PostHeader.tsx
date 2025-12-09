import type { ChangeEvent } from "react";
import clsx from "clsx";
import type { Tag } from "../../../shared/types";
import { TagBar } from "../../tags/components/TagBar";
import { QuickMemoInput } from "./QuickMemoInput";

interface PostHeaderProps {
  searchText: string;
  onSearchChange: (value: string) => void;

  tags: Tag[];
  selectedTagIds: number[];
  onToggleTag: (tagId: number) => void;

  onRequestCreateTag: () => void;
  onRequestEditTag: (tag: Tag) => void;
  onRequestDeleteTag: (tag: Tag) => void;

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
  onRequestCreateTag,
  onRequestEditTag,
  onRequestDeleteTag,
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

      {/* 빠른 메모 */}
      <QuickMemoInput
        isSubmitting={quickMemoSubmitting}
        onCreate={onCreateQuickMemo}
      />

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
        <TagBar
          tags={tags}
          selectedTagIds={selectedTagIds}
          onToggleTag={onToggleTag}
          onClickCreate={onRequestCreateTag}
          onClickEdit={onRequestEditTag}
          onClickDelete={onRequestDeleteTag}
        />
      )}
      {tags.length === 0 && (
        <div className="flex justify-start">
          <button
            type="button"
            onClick={onRequestCreateTag}
            className="inline-flex items-center gap-1 rounded-full border border-dashed border-slate-300 bg-slate-50 px-3 py-1 text-xs text-slate-500 hover:bg-slate-100"
          >
            <span className="h-2 w-2 rounded-full border border-slate-400" />
            <span>+ 첫 태그 만들기</span>
          </button>
        </div>
      )}

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