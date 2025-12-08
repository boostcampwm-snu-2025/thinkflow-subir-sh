import type { ChangeEvent } from 'react';
import clsx from 'clsx';

interface PostHeaderProps {
  searchText: string;
  onSearchChange: (value: string) => void;
  aiCount: number;
  onClickNewPost: () => void;
}

export function PostHeader({
  searchText,
  onSearchChange,
  aiCount,
  onClickNewPost,
}: PostHeaderProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };

  return (
    <div className="space-y-3">
      {/* 제목 영역 */}
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-slate-900">
          메모 &amp; 포스트
        </h2>
      </div>

      {/* 검색 인풋 */}
      <div>
        <input
          type="text"
          value={searchText}
          onChange={handleChange}
          placeholder="제목이나 내용으로 검색..."
          className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-1 focus:ring-blue-300"
        />
      </div>

      {/* 태그 영역 자리 (나중에 진짜 태그 넣을 예정) */}
      <div className="flex flex-wrap gap-2 text-xs text-slate-400">
        {/* TODO: TagFilterBar로 교체 예정 */}
        <span className="rounded-full bg-slate-100 px-3 py-1">
          태그 필터는 나중에 추가 예정
        </span>
      </div>

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
            'flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold text-white shadow-sm',
            'bg-slate-900 hover:bg-slate-800',
          )}
        >
          <span className="text-base leading-none">＋</span>
          <span>새 포스트</span>
        </button>
      </div>
    </div>
  );
}
