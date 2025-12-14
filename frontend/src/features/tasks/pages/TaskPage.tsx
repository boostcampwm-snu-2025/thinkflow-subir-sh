import { useMemo, useState } from "react";
import { useItemsQuery } from "../../items/api/useItemsQuery";
import {
  useTagsQuery,
  useCreateTagMutation,
  useUpdateTagMutation,
  useDeleteTagMutation,
} from "../../tags/api/useTagsQuery";
import { useCreateItemMutation } from "../../items/api/useCreateItemMutation";
import { useUpdateItemMutation } from "../../items/api/useUpdateItemMutation";
import { useDeleteItemMutation } from "../../items/api/useDeleteItemMutation";
import { TagBar } from "../../tags/components/TagBar";
import { TagEditModal } from "../../tags/components/TagEditModal";
import { TagDeleteModal } from "../../tags/components/TagDeleteModal";
import { ItemTagSelectModal } from "../../items/components/ItemTagSelectModal";
import type { Item, ItemType, Priority, Tag } from "../../../shared/types";
import { TaskCreateModal } from "../components/TaskCreateModal";
import { TaskList } from "../components/TaskList";
import { useCreateTaskDetailMutation } from "../api/useTaskDetailMutations";
import { useItemDeleteModal } from '../../items/api/useItemDeleteModal.js';
import { ItemDeleteModal } from '../../items/components/ItemDeleteModal.js';

const TASKS_PER_PAGE = 5;

type TaskSortKey = "created_desc" | "created_asc";

export function TaskPage() {
  const { data: itemsData, isLoading } = useItemsQuery();
  const { data: tagsData } = useTagsQuery();
  const createItem = useCreateItemMutation();
  const createTaskDetail = useCreateTaskDetailMutation();
  const updateItem = useUpdateItemMutation();
  const deleteItem = useDeleteItemMutation();
  const createTag = useCreateTagMutation();
  const updateTag = useUpdateTagMutation();
  const deleteTag = useDeleteTagMutation();
  const del = useItemDeleteModal();

  const allTags = tagsData ?? [];
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [searchText, setSearchText] = useState("");
  const [sortKey, setSortKey] = useState<TaskSortKey>("created_desc");
  const [page, setPage] = useState(1);

  // 태그 CRUD 모달 상태
  const [tagModalMode, setTagModalMode] = useState<"create" | "edit">("create");
  const [editingTag, setEditingTag] = useState<Tag | undefined>(undefined);
  const [tagEditOpen, setTagEditOpen] = useState(false);
  const [tagDeleteOpen, setTagDeleteOpen] = useState(false);

  // 아이템 태그 모달
  const [tagTargetItem, setTagTargetItem] = useState<Item | null>(null);

  // 새 태스크 모달
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const handleToggleFilterTag = (tagId: number) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId],
    );
  };

  const filteredTasks: Item[] = useMemo(() => {
    if (!itemsData) return [];

    let tasks = itemsData.filter((item) => item.type === "TASK");

    const q = searchText.trim().toLowerCase();
    if (q) {
      tasks = tasks.filter((item) => {
        const text = (item.title ?? "") + " " + (item.content ?? "");
        return text.toLowerCase().includes(q);
      });
    }

    if (selectedTagIds.length > 0) {
      tasks = tasks.filter((item) => {
        const itemTagIds = (item.tags ?? []).map((t) => t.tagId);
        return selectedTagIds.some((id) => itemTagIds.includes(id));
      });
    }

    tasks = tasks.slice().sort((a, b) => {
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();

      if (sortKey === "created_desc") {
        return bTime - aTime;
      }
      return aTime - bTime;
    });

    return tasks;
  }, [itemsData, searchText, selectedTagIds, sortKey]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredTasks.length / TASKS_PER_PAGE),
  );
  const currentPage = Math.min(page, totalPages);
  const pagedTasks = filteredTasks.slice(
    (currentPage - 1) * TASKS_PER_PAGE,
    currentPage * TASKS_PER_PAGE,
  );

  const openDeleteById = (id: number) => {
    const item = filteredTasks.find((it) => it.id === id);
    if (!item) return;
    del.openModal(item);
  };

  const confirmDelete = async () => {
    if (!del.target) return;
    await deleteItem.mutateAsync({ id: del.target.id });
    del.closeModal();
  };

  const handleCreateTask = async (data: {
    title: string;
    content?: string | null;
    dueDate?: string | null;
    priority?: Priority | null;
  }) => {
    const payload: { type: ItemType; title: string; content?: string } = {
      type: "TASK",
      title: data.title,
    };

    if (data.content && data.content.trim()) {
      payload.content = data.content.trim();
    }

    // 1) Item 먼저 생성
    const created = await createItem.mutateAsync(payload);

    // 2) TaskDetail 별도 API로 생성
    if (created) {
      await createTaskDetail.mutateAsync({
        itemId: created.id,
        dueDate: data.dueDate ?? null,
        priority: data.priority ?? null,
      });
    }

    setCreateModalOpen(false);
  };

  const handleUpdateTask = (input: {
    id: number;
    title?: string;
    content?: string | null;
    type: ItemType;
    taskDetail?: {
      dueDate?: string | null;
      priority?: Priority | null;
    };
  }) => {
    updateItem.mutate(input);
  };

  const handleOpenTagCreate = () => {
    setTagModalMode("create");
    setEditingTag(undefined);
    setTagEditOpen(true);
  };

  const handleOpenTagEdit = (tag: Tag) => {
    setTagModalMode("edit");
    setEditingTag(tag);
    setTagEditOpen(true);
  };

  const handleOpenTagDelete = (tag: Tag) => {
    setEditingTag(tag);
    setTagDeleteOpen(true);
  };

  const handleOpenItemTagModal = (item: Item) => {
    setTagTargetItem(item);
  };

  const handleCloseItemTagModal = () => {
    setTagTargetItem(null);
  };

  const handleTagEditSubmit = (input: { name: string; color: string }) => {
    if (tagModalMode === "create") {
      createTag.mutate(input, {
        onSuccess: () => {
          setTagEditOpen(false);
        },
      });
    } else if (tagModalMode === "edit" && editingTag) {
      updateTag.mutate(
        { id: editingTag.id, ...input },
        {
          onSuccess: () => {
            setTagEditOpen(false);
          },
        },
      );
    }
  };

  const handleTagDeleteConfirm = () => {
    if (!editingTag) return;
    deleteTag.mutate(
      { id: editingTag.id },
      {
        onSuccess: () => {
          setTagDeleteOpen(false);
        },
      },
    );
  };

  return (
    <div className="space-y-4">
      {/* 프로젝트 타임라인 (placeholder) */}
      <section className="rounded-2xl bg-white p-4 shadow-sm md:p-6">
        <h2 className="mb-3 text-sm font-semibold text-slate-900">
          프로젝트 타임라인
        </h2>
        <div className="flex h-16 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-xs text-slate-400">
          타임라인 뷰는 나중에 구현 예정입니다.
        </div>
      </section>

      {/* 캘린더 + 할 일 목록 */}
      <section className="grid gap-4 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1.8fr)]">
        {/* 캘린더 placeholder */}
        <div className="rounded-2xl bg-white p-4 shadow-sm md:p-6">
          <h2 className="mb-3 text-sm font-semibold text-slate-900">
            캘린더
          </h2>
          <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-xs text-slate-400">
            캘린더 뷰는 나중에 구현 예정입니다.
          </div>
        </div>

        {/* 할 일 목록 */}
        <div className="rounded-2xl bg-white p-4 shadow-sm md:p-6">
          {/* 헤더 영역: 검색, 태그, 정렬, 새 태스크 */}
          <div className="mb-4 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-slate-900">
                할 일 목록
              </h2>
              <button
                type="button"
                onClick={() => setCreateModalOpen(true)}
                className="rounded-full bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
              >
                + 새 태스크
              </button>
            </div>

            {/* 검색 */}
            <input
              className="w-full rounded-full border border-slate-200 px-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400"
              placeholder="제목이나 내용으로 검색..."
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                setPage(1);
              }}
            />

            {/* 태그 필터 + 정렬 */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <TagBar
                tags={allTags}
                selectedTagIds={selectedTagIds}
                onToggleTag={handleToggleFilterTag}
                onClickCreate={handleOpenTagCreate}
                onClickEdit={handleOpenTagEdit}
                onClickDelete={handleOpenTagDelete}
              />

              <select
                className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400"
                value={sortKey}
                onChange={(e) =>
                  setSortKey(e.target.value as TaskSortKey)
                }
              >
                <option value="created_desc">최근 추가 순</option>
                <option value="created_asc">오래된 순</option>
              </select>
            </div>
          </div>

          {/* 리스트 */}
          {isLoading ? (
            <div className="flex h-32 items-center justify-center text-sm text-slate-400">
              로딩 중...
            </div>
          ) : (
            <>
              <TaskList
                items={pagedTasks}
                onUpdate={handleUpdateTask}
                onDelete={openDeleteById}
                isUpdating={updateItem.isPending}
                isDeleting={deleteItem.isPending}
                onEditTags={handleOpenItemTagModal}
              />

              {/* 페이지네이션 */}
              <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                <span>
                  총 {filteredTasks.length}개 중{" "}
                  {(currentPage - 1) * TASKS_PER_PAGE + 1}-
                  {Math.min(
                    currentPage * TASKS_PER_PAGE,
                    filteredTasks.length,
                  )}
                  개
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() =>
                      setPage((p) => Math.max(1, p - 1))
                    }
                    className="rounded-md border border-slate-200 px-2 py-1 disabled:opacity-40"
                  >
                    이전
                  </button>
                  <span>
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={currentPage >= totalPages}
                    onClick={() =>
                      setPage((p) => Math.min(totalPages, p + 1))
                    }
                    className="rounded-md border border-slate-200 px-2 py-1 disabled:opacity-40"
                  >
                    다음
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
      {/* 모달들 */}
      <TaskCreateModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateTask}
        submitting={createItem.isPending}
      />

      <ItemDeleteModal
        open={del.open}
        item={del.target}
        onClose={del.closeModal}
        onConfirm={confirmDelete}
        submitting={deleteItem.isPending}
      />

      <TagEditModal
        open={tagEditOpen}
        mode={tagModalMode}
        initialTag={
          tagModalMode === "edit" ? editingTag : undefined
        }
        onClose={() => setTagEditOpen(false)}
        onSubmit={handleTagEditSubmit}
        submitting={createTag.isPending || updateTag.isPending}
      />

      <TagDeleteModal
        open={tagDeleteOpen}
        tag={editingTag}
        onClose={() => setTagDeleteOpen(false)}
        onConfirm={handleTagDeleteConfirm}
        submitting={deleteTag.isPending}
      />

      <ItemTagSelectModal
        open={tagTargetItem !== null}
        item={tagTargetItem}
        allTags={allTags}
        onClose={handleCloseItemTagModal}
      />
    </div>
  );
}