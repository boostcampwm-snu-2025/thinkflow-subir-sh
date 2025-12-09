import { useState } from "react";
import clsx from "clsx";
import { Pencil, Trash2 } from "lucide-react";
import type { Item, ItemType } from "../../../shared/types";

interface TaskCardProps {
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
  onEditTags: (item: Item) => void;
}

export function TaskCard({
  item,
  onUpdate,
  onDelete,
  isUpdating,
  isDeleting,
  onEditTags,
}: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(item.title);
  const [editContent, setEditContent] = useState(item.content ?? "");

  const createdAt = new Date(item.createdAt).toLocaleString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
  });

  const dueLabel =
    item.taskDetail?.dueDate != null
      ? new Date(item.taskDetail.dueDate).toLocaleDateString("ko-KR", {
          month: "2-digit",
          day: "2-digit",
        })
      : "기한 없음";

  const priority = item.taskDetail?.priority ?? null;

  const handleSave = () => {
    const t = editTitle.trim();
    const c = editContent.trim();
    if (!t) return;

    onUpdate({
      id: item.id,
      title: t,
      content: c || null,
      type: "TASK",
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
      {/* 상단: 태그 + 우측 아이콘 */}
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1 text-[10px]">
          {(item.tags ?? []).map((it) => (
            <span
              key={it.tagId}
              style={{ backgroundColor: it.tag!.color }}
              className="inline-flex items-center rounded-full px-2 py-0.5 font-medium text-white"
            >
              {it.tag!.name}
            </span>
          ))}

          <button
            type="button"
            onClick={() => onEditTags(item)}
            className="inline-flex items-center rounded-full border border-dashed border-slate-300 px-2 py-0.5 text-[10px] text-slate-500 hover:bg-slate-100"
          >
            + 태그
          </button>
        </div>

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
                isDeleting && "opacity-50",
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
              placeholder="할 일을 입력하세요"
            />
            <textarea
              className="h-20 w-full resize-none rounded-md border border-slate-300 bg-white px-2 py-1 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="메모가 있다면 함께 적어주세요"
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

      {/* 하단 메타 정보 */}
      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-2">
          <span>{createdAt} 생성</span>
          <span className="h-1 w-1 rounded-full bg-slate-300" />
          <span>
            기한:{" "}
            <span className="font-medium text-slate-600">{dueLabel}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {priority && (
            <span
              className={clsx(
                "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold",
                priority === "HIGH" && "bg-red-100 text-red-700",
                priority === "MEDIUM" && "bg-amber-100 text-amber-700",
                priority === "LOW" && "bg-emerald-100 text-emerald-700",
              )}
            >
              {priority === "HIGH"
                ? "높음"
                : priority === "MEDIUM"
                ? "중간"
                : "낮음"}
            </span>
          )}

          {isEditing && (
            <div className="flex items-center gap-1">
              <button
                onClick={handleSave}
                disabled={isUpdating}
                className={clsx(
                  "rounded px-2 py-1 text-[11px] font-semibold text-white",
                  isUpdating
                    ? "bg-slate-400"
                    : "bg-emerald-600 hover:bg-emerald-700",
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
          )}
        </div>
      </div>
    </article>
  );
}
