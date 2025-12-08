import { useState } from 'react';
import clsx from 'clsx';
import type { Item } from '../../../shared/types';

interface PostCardProps {
  item: Item;
  onUpdate: (input: {
    id: number;
    title?: string;
    content?: string;
  }) => void;
  onDelete: (id: number) => void;
  isUpdating: boolean;
  isDeleting: boolean;
}

export function PostCard({
  item,
  onUpdate,
  onDelete,
  isUpdating,
  isDeleting,
}: PostCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(item.title);
  const [editContent, setEditContent] = useState(item.content ?? '');

  const handleSave = () => {
    const t = editTitle.trim();
    const c = editContent.trim();
    if (!t) return;

    onUpdate({
      id: item.id,
      title: t,
      content: c || undefined,
    });

    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditTitle(item.title);
    setEditContent(item.content ?? '');
  };

  const createdDate = new Date(item.createdAt);

  return (
    <article className="flex h-full flex-col rounded-2xl border border-slate-100 bg-slate-50 p-4 shadow-sm">
      {/* 상단: 체크박스 + 타입 뱃지 자리 */}
      <div className="mb-2 flex items-center justify-between">
        <label className="flex items-center gap-2 text-xs text-slate-500">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-blue-500 focus:ring-blue-400"
          />
          <span>선택</span>
        </label>
        <span
          className={clsx(
            'inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
            item.type === 'MEMO'
              ? 'bg-amber-100 text-amber-800'
              : 'bg-indigo-100 text-indigo-800',
          )}
        >
          {item.type === 'MEMO' ? '메모' : '포스트'}
        </span>
      </div>

      {/* 본문 */}
      <div className="flex-1 space-y-2">
        {isEditing ? (
          <>
            <input
              className="w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
            />
            <textarea
              className="h-24 w-full resize-none rounded-md border border-slate-300 bg-white px-2 py-1 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
            />
          </>
        ) : (
          <>
            <h3 className="text-sm font-semibold text-slate-900">
              {item.title || '(제목 없음)'}
            </h3>
            {item.content && (
              <p className="text-sm text-slate-700 whitespace-pre-line">
                {item.content}
              </p>
            )}
          </>
        )}

        {/* 태그 표시 자리 (나중에 실제 태그로 교체) */}
        <div className="flex flex-wrap gap-1 text-[11px] text-slate-400">
          {item.tags && item.tags.length > 0 ? (
            item.tags.map((t) => (
              <span
                key={t.tagId}
                className="rounded-full bg-slate-200 px-2 py-0.5"
              >
                {t.tag?.name ?? '태그'}
              </span>
            ))
          ) : (
            <span className="rounded-full bg-slate-100 px-2 py-0.5">
              태그 없음
            </span>
          )}
        </div>
      </div>

      {/* 하단 메타/액션 */}
      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
        <div>
          {createdDate.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          })}
        </div>

        <div className="flex items-center gap-2">
          {/* TODO: 댓글 수, Task로 변환 등은 나중에 */}
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={handleSave}
                disabled={isUpdating}
                className={clsx(
                  'rounded px-2 py-1 text-[11px] font-semibold text-white',
                  isUpdating
                    ? 'bg-slate-400'
                    : 'bg-emerald-600 hover:bg-emerald-700',
                )}
              >
                {isUpdating ? '저장중' : '저장'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="rounded px-2 py-1 text-[11px] text-slate-600 hover:bg-slate-100"
              >
                취소
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="rounded px-2 py-1 text-[11px] text-slate-600 hover:bg-slate-100"
              >
                수정
              </button>
              <button
                type="button"
                onClick={() => onDelete(item.id)}
                disabled={isDeleting}
                className={clsx(
                  'rounded px-2 py-1 text-[11px] font-semibold text-white',
                  isDeleting
                    ? 'bg-slate-400'
                    : 'bg-red-600 hover:bg-red-700',
                )}
              >
                {isDeleting ? '삭제중' : '삭제'}
              </button>
            </>
          )}
        </div>
      </div>
    </article>
  );
}