import { useState } from "react";
import clsx from "clsx";
import { Pencil, Trash2 } from "lucide-react";
import type {
  Item,
  ItemType,
  Priority,
  TaskStatus,
} from "../../../shared/types";
import {
  useCreateTaskDetailMutation,
  useUpdateTaskDetailMutation,
  useDeleteTaskDetailMutation,
} from "../api/useTaskDetailMutations";

interface TaskCardProps {
  item: Item;
  onUpdate: (input: {
    id: number;
    title?: string;
    content?: string | null;
    type: ItemType;
    taskDetail?: {
      dueDate?: string | null;
      priority?: Priority | null;
    };
  }) => void;
  onDelete: (id: number) => void;
  isUpdating: boolean;
  isDeleting: boolean;
  onEditTags: (item: Item) => void;
  onCreateRetrospect: (id: number) => void;
}

export function TaskCard({
  item,
  onUpdate,
  onDelete,
  isUpdating,
  isDeleting,
  onEditTags,
  onCreateRetrospect,
}: TaskCardProps) {
  const createDetail = useCreateTaskDetailMutation();
  const updateDetail = useUpdateTaskDetailMutation();
  const deleteDetail = useDeleteTaskDetailMutation();

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(item.title);
  const [editContent, setEditContent] = useState(item.content ?? "");

  const [editDueDate, setEditDueDate] = useState(
    item.taskDetail?.dueDate
      ? item.taskDetail.dueDate.slice(0, 10) // YYYY-MM-DD
      : ""
  );

  const [editPriority, setEditPriority] = useState<Priority | "">(
    item.taskDetail?.priority ?? ""
  );

  const createdAt = new Date(item.createdAt).toLocaleString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
  });

  const dueLabel =
    item.taskDetail?.dueDate == null
      ? "기한 없음"
      : new Date(item.taskDetail.dueDate).toLocaleDateString("ko-KR", {
          month: "2-digit",
          day: "2-digit",
        });

  const priority = item.taskDetail?.priority ?? null;
  const currentStatus: TaskStatus = item.taskDetail?.status ?? "READY";
  const isDone = currentStatus === "DONE";

  const handleSave = () => {
    const t = editTitle.trim();
    const c = editContent.trim();
    if (!t) return;

    // 1) Item 기본 필드 업데이트
    onUpdate({
      id: item.id,
      title: t,
      content: c || null,
      type: "TASK",
    });

    // 2) TaskDetail 부분 계산
    const prevDetail = item.taskDetail ?? null;
    const hadDetail = !!prevDetail;
    const hasNewDetail = !!(editDueDate || editPriority);

    if (!hadDetail && hasNewDetail) {
      // 없던 거 새로 만듦 → POST
      createDetail.mutate({
        itemId: item.id,
        dueDate: editDueDate || null,
        priority: (editPriority || null) as Priority | null,
      });
    } else if (hadDetail && hasNewDetail) {
      // 원래 있던 거 수정 → PATCH
      updateDetail.mutate({
        itemId: item.id,
        dueDate: editDueDate || null,
        priority: (editPriority || null) as Priority | null,
      });
    } else if (hadDetail && !hasNewDetail) {
      // 원래 있었는데 다 비워버림 → DELETE
      deleteDetail.mutate({ itemId: item.id });
    }

    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditTitle(item.title);
    setEditContent(item.content ?? "");
    setEditDueDate(
      item.taskDetail?.dueDate ? item.taskDetail.dueDate.slice(0, 10) : ""
    );
    setEditPriority(item.taskDetail?.priority ?? "");
  };

  // TaskStatus: DONE <> READY 토글
  const handleToggleStatus = () => {
    const nextStatus: TaskStatus = isDone ? "READY" : "DONE";

    if (!item.taskDetail) {
      // 아직 TaskDetail row가 없으면 새로 생성
      createDetail.mutate({
        itemId: item.id,
        status: nextStatus,
        // 필요하다면 기존 editDueDate / editPriority를 같이 넘겨도 됨
      });
    } else {
      // 이미 TaskDetail이 있으면 status만 업데이트
      updateDetail.mutate({
        itemId: item.id,
        status: nextStatus,
      });
    }
  };

  // TaskStatus: READY / IN_PROGRESS / PENDING 변경
  const handleChangeStatus = (next: TaskStatus) => {
    if (next === "DONE") return;
    updateDetail.mutate({
      itemId: item.id,
      status: next,
    });
  };

  return (
    <article
      id={`task-${item.id}`}
      className={clsx(
        "flex h-full flex-col rounded-2xl border p-4 shadow-sm transition-colors",

        currentStatus === "DONE" && "border-emerald-100 bg-emerald-50",

        currentStatus === "IN_PROGRESS" && "border-blue-100 bg-blue-50",

        currentStatus === "PENDING" && "border-amber-100 bg-amber-50",

        currentStatus === "READY" && "border-slate-100 bg-slate-50"
      )}
    >
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
              placeholder="할 일을 입력하세요"
            />
            <textarea
              className="h-20 w-full resize-none rounded-md border border-slate-300 bg-white px-2 py-1 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="메모가 있다면 함께 적어주세요"
            />

            {/* ⭐ 기한 */}
            <div className="flex flex-wrap gap-2 text-[11px] text-slate-600">
              <div className="flex items-center gap-1">
                <span className="text-slate-500">기한</span>
                <input
                  type="date"
                  className="rounded-md border border-slate-300 px-2 py-1 text-[11px] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                />
              </div>

              {/* 우선순위 */}
              <div className="flex items-center gap-1">
                <span className="text-slate-500">우선순위</span>
                <select
                  className="rounded-md border border-slate-300 bg-white px-2 py-1 text-[11px] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400"
                  value={editPriority}
                  onChange={(e) =>
                    setEditPriority((e.target.value || "") as Priority | "")
                  }
                >
                  <option value="">선택 안 함</option>
                  <option value="HIGH">높음</option>
                  <option value="MEDIUM">중간</option>
                  <option value="LOW">낮음</option>
                </select>
              </div>
            </div>
          </>
        ) : (
          <div className="flex gap-2">
            {/* ⭐ 완료 체크박스 */}
            <input
              type="checkbox"
              checked={isDone}
              onChange={handleToggleStatus}
              className="mt-[2px] h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />

            <div className="space-y-1">
              <h3
                className={clsx(
                  "text-sm font-semibold",
                  isDone ? "text-slate-400 line-through" : "text-slate-900"
                )}
              >
                {item.title || "(제목 없음)"}
              </h3>
              {item.content && (
                <p
                  className={clsx(
                    "whitespace-pre-line text-sm",
                    isDone ? "text-slate-300 line-through" : "text-slate-700"
                  )}
                >
                  {item.content}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 하단 메타 정보 */}
      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-2">
          <span>{createdAt} 생성</span>
          <span className="h-1 w-1 rounded-full bg-slate-300" />
          <span>
            기한: <span className="font-medium text-slate-600">{dueLabel}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {!isDone && priority && (
            <span
              className={clsx(
                "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold",
                priority === "HIGH" && "bg-red-100 text-red-700",
                priority === "MEDIUM" && "bg-amber-100 text-amber-700",
                priority === "LOW" && "bg-emerald-100 text-emerald-700"
              )}
            >
              {priority === "HIGH"
                ? "높음"
                : priority === "MEDIUM"
                ? "중간"
                : "낮음"}
            </span>
          )}

          {/* ⭐ 상태 선택 버튼들 (DONE 아닐 때만) */}
          {!isDone && (
            <div className="flex gap-1 text-[10px]">
              {[
                { key: "READY", label: "대기" },
                { key: "IN_PROGRESS", label: "진행중" },
                { key: "PENDING", label: "보류" },
              ].map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => handleChangeStatus(s.key as TaskStatus)}
                  className={clsx(
                    "rounded-full px-2 py-0.5",
                    currentStatus === s.key
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}

          {/* DONE일 때는 위에서 말한 초록 뱃지 하나만 */}
          {isDone && (
            <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
              완료
            </span>
          )}

          {isDone && !isEditing && (
            <button
              onClick={() => onCreateRetrospect(item.id)}
              className="rounded px-2 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100"
            >
              회고 생성
            </button>
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
                    : "bg-emerald-600 hover:bg-emerald-700"
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
