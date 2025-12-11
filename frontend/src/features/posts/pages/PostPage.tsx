import { useMemo, useState } from 'react';
import { useItemsQuery } from '../../items/api/useItemsQuery';
import { useCreateItemMutation } from '../../items/api/useCreateItemMutation';
import { useUpdateItemMutation } from '../../items/api/useUpdateItemMutation';
import { useDeleteItemMutation } from '../../items/api/useDeleteItemMutation';
import {
  useTagsQuery,
  useCreateTagMutation,
  useUpdateTagMutation,
  useDeleteTagMutation,
} from "../../tags/api/useTagsQuery";
import type { Item, Tag } from '../../../shared/types';
import { PostHeader } from '../components/PostHeader.js';
import { PostList } from '../components/PostList.js';
import { TagEditModal } from "../../tags/components/TagEditModal";
import { TagDeleteModal } from "../../tags/components/TagDeleteModal";
import { ItemTagSelectModal } from "../../items/components/ItemTagSelectModal.js";

export function PostPage() {
  const [searchText, setSearchText] = useState('');
  // 태그/정렬 등은 이후에 여기서 확장 예정
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);

  const { data, isLoading, error } = useItemsQuery();
  const { data: tagsData } = useTagsQuery();  
  const tags = tagsData ?? [];

  const createItem = useCreateItemMutation();
  const updateItem = useUpdateItemMutation();
  const deleteItem = useDeleteItemMutation();

  const createTag = useCreateTagMutation();
  const updateTag = useUpdateTagMutation();
  const deleteTag = useDeleteTagMutation();

  const [tagModalMode, setTagModalMode] = useState<"create" | "edit" | null>(null);
  const [tagModalTarget, setTagModalTarget] = useState<Tag | undefined>();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [tagTargetItem, setTagTargetItem] = useState<Item | null>(null);
  
  const openCreateTag = () => {
    setTagModalMode("create");
    setTagModalTarget(undefined);
  };

  const openEditTag = (tag: Tag) => {
    setTagModalMode("edit");
    setTagModalTarget(tag);
  };

  const openDeleteTag = (tag: Tag) => {
    setTagModalTarget(tag);
    setDeleteModalOpen(true);
  };

  const closeEditModal = () => {
    setTagModalMode(null);
    setTagModalTarget(undefined);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setTagModalTarget(undefined);
  };

  const handleToggleTag = (tagId: number) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId],
    );
  };

  const handleOpenTagModal = (item: Item) => {
    setTagTargetItem(item);
  };

  const handleCloseTagModal = () => {
    setTagTargetItem(null);
  };

  const filteredItems: Item[] = useMemo(() => {
    if (!data) return [];

    // 1) MEMO / POST만 사용
    let items = data.filter(
      (item) => item.type === 'MEMO' || item.type === 'POST',
    );

    // 2) 검색어 필터 (제목 + 내용)
    const q = searchText.trim().toLowerCase();
    if (q) {
      items = items.filter((item) => {
        const text =
          (item.title ?? '') + ' ' + (item.content ?? '');
        return text.toLowerCase().includes(q);
      });
    }

    // 3) 태그 필터: selectedTagIds가 하나라도 있으면,
    //    해당 태그들을 "하나 이상" 가지고 있는 아이템만 남김
    if (selectedTagIds.length > 0) {
      items = items.filter((item) => {
        if (!item.tags || item.tags.length === 0) return false;
        const itemTagIds = item.tags.map((t) => t.tagId);
        return selectedTagIds.some((id) => itemTagIds.includes(id));
      });
    }

    // 4) 최신순 정렬 (createdAt desc)
    return items
      .slice()
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime(),
      );
  }, [data, searchText, selectedTagIds]);

  const handleCreateQuickMemo = (body: string) => {
    if (!body.trim()) return;
    // 빠른 생성: MEMO, title만 사용
    createItem.mutate({
      type: 'MEMO',
      title: body.trim(),
    });
  };

  const handleCreatePost = () => {
    // @TODO: 모달 오픈 예정
    // 여기서도 메모 작성 가능할 것이긴 함...? (내용을 비우면)
    alert('새 포스트 모달은 나중에 구현할 예정이에요 🙃');
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* 헤더(검색 + 태그 필터링 + 메모/포스트 생성 등) */}
      <div className="mb-6 rounded-2xl bg-white p-4 shadow-sm md:p-6">
        <PostHeader
          searchText={searchText}
          onSearchChange={setSearchText}
          tags={tags}
          selectedTagIds={selectedTagIds}
          onToggleTag={handleToggleTag}
          onRequestCreateTag={openCreateTag}
          onRequestEditTag={openEditTag}
          onRequestDeleteTag={openDeleteTag}
          quickMemoSubmitting={createItem.isPending}
          onCreateQuickMemo={handleCreateQuickMemo}
          aiCount={0}
          onClickNewPost={handleCreatePost}
        />
      </div>

      {/* 리스트 영역 */}
      <div className="rounded-2xl bg-white p-4 shadow-sm md:p-6">
        <div className="flex items-center justify-between">
          {isLoading && (
            <span className="text-xs text-slate-400">
              불러오는 중...
            </span>
          )}
        </div>

        {error && (
          <div className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            데이터를 가져오는 중 에러가 발생했어요.
          </div>
        )}

        {!isLoading && filteredItems.length === 0 && (
          <div className="rounded-lg border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">
            조건에 맞는 메모/포스트가 없어요. 새로 하나 만들어볼까요?
          </div>
        )}

        {filteredItems.length > 0 && (
          <PostList
            items={filteredItems}
            onUpdate={(payload) => updateItem.mutate(payload)}
            onDelete={(id) => deleteItem.mutate({ id })}
            isUpdating={updateItem.isPending}
            isDeleting={deleteItem.isPending}
            onEditTags={handleOpenTagModal}
          />
        )}
      </div>
      
      {/* 태그 생성/편집 모달 */}
      <TagEditModal
        open={tagModalMode !== null}
        mode={tagModalMode ?? "create"}
        initialTag={
          tagModalMode === "edit" && tagModalTarget
            ? { name: tagModalTarget.name, color: tagModalTarget.color }
            : undefined
        }
        onClose={closeEditModal}
        submitting={
          createTag.isPending || updateTag.isPending
        }
        onSubmit={(form) => {
          if (tagModalMode === "create") {
            createTag.mutate(form, { onSuccess: closeEditModal });
          } else if (tagModalMode === "edit" && tagModalTarget) {
            updateTag.mutate(
              { id: tagModalTarget.id, ...form },
              { onSuccess: closeEditModal },
            );
          }
        }}
      />

      {/* 태그 삭제 모달 */}
      <TagDeleteModal
        open={deleteModalOpen}
        tag={tagModalTarget}
        onClose={closeDeleteModal}
        submitting={deleteTag.isPending}
        onConfirm={() => {
          if (!tagModalTarget) return;
          deleteTag.mutate(
            { id: tagModalTarget.id },
            { onSuccess: closeDeleteModal },
          );
        }}
      />

      {/* 아이템 태그 편집 모달 */}
      <ItemTagSelectModal
        open={tagTargetItem !== null}
        item={tagTargetItem}
        allTags={tags}
        onClose={handleCloseTagModal}
      />
    </div>
  );
}
