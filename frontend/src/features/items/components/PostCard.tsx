import { useState } from 'react';
import clsx from 'clsx';
import { Pencil, Trash2 } from "lucide-react";
import type { Item, ItemType } from '../../../shared/types';

interface PostCardProps {
  item: Item;
  onUpdate: (input: {
    id: number;
    title?: string;
    content?: string | null;
    type: ItemType;
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
  const [editContent, setEditContent] = useState(item.content ?? "");

  const createdAt = new Date(item.createdAt).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const handleSave = () => {
    const t = editTitle.trim();
    const c = editContent.trim();
    if (!t) return;
    const nextType: ItemType = c ? "POST" : "MEMO";

    onUpdate({
      id: item.id,
      title: t,
      content: c || null,
      type: nextType,
    });

    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditTitle(item.title);
    setEditContent(item.content ?? "");
  };

  return (
    <article className="flex h-full flex-col rounded-2xl border border-slate-100 bg-slate-50 p-4 shadow-sm">
      {/* 상단 타입 표시 */}
      <div className="mb-2 flex items-center justify-between">
        <span
          className={clsx(
            "inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
            item.type === "MEMO"
              ? "bg-amber-100 text-amber-800"
              : "bg-indigo-100 text-indigo-800"
          )}
        >
          {item.type === "MEMO" ? "메모" : "포스트"}
        </span>

        {/* 수정/삭제 버튼 (아이콘) */}
        {!isEditing && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="rounded p-1 text-slate-600 hover:bg-slate-200"
              title="수정"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={() => onDelete(item.id)}
              disabled={isDeleting}
              className={clsx(
                "rounded p-1 text-red-600 hover:bg-red-100",
                isDeleting && "opacity-50"
              )}
              title="삭제"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
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
              {item.title || "(제목 없음)"}
            </h3>
            {item.content && (
              <p className="whitespace-pre-line text-sm text-slate-700">
                {item.content}
              </p>
            )}
          </>
        )}
      </div>

      {/* 하단 푸터 */}
      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
        <span>{createdAt}</span>

        {isEditing ? (
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={isUpdating}
              className={clsx(
                "rounded px-2 py-1 text-[11px] font-semibold text-white",
                isUpdating ? "bg-slate-400" : "bg-emerald-600 hover:bg-emerald-700"
              )}
            >
              {isUpdating ? "저장중" : "저장"}
            </button>
            <button
              onClick={handleCancel}
              className="rounded px-2 py-1 text-[11px] text-slate-600 hover:bg-slate-100"
            >
              취소
            </button>
          </div>
        ) : null}
      </div>
    </article>
  );
}