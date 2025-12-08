import { useMemo, useState } from 'react';
import { useItemsQuery } from '../api/useItemsQuery';
import { useCreateItemMutation } from '../api/useCreateItemMutation';
import { useUpdateItemMutation } from '../api/useUpdateItemMutation';
import { useDeleteItemMutation } from '../api/useDeleteItemMutation';
import type { Item } from '../../../shared/types';
import { PostHeader } from '../components/PostHeader.js';
import { QuickMemoInput } from '../components/QuickMemoInput.js';
import { PostList } from '../components/PostList.js';

export function PostPage() {
  const [searchText, setSearchText] = useState('');
  // 태그/정렬 등은 이후에 여기서 확장 예정

  const { data, isLoading, error } = useItemsQuery();
  const createItem = useCreateItemMutation();
  const updateItem = useUpdateItemMutation();
  const deleteItem = useDeleteItemMutation();

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

    // 3) 최신순 정렬 (createdAt desc)
    return items
      .slice()
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime(),
      );
  }, [data, searchText]);

  const handleCreateQuickMemo = (body: string) => {
    if (!body.trim()) return;
    // 빠른 생성: MEMO, title만 사용
    createItem.mutate({
      type: 'MEMO',
      title: body.trim(),
    });
  };

  const handleCreatePost = () => {
    // TODO: 모달 오픈 예정
    alert('새 포스트 모달은 나중에 구현할 예정이에요 🙃');
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* 메인 카드(헤더 + 빠른 메모 입력) */}
      <div className="mb-6 rounded-2xl bg-white p-4 shadow-sm md:p-6">
        <PostHeader
          searchText={searchText}
          onSearchChange={setSearchText}
          aiCount={0}
          onClickNewPost={handleCreatePost}
        />

        <div className="mt-4">
          <QuickMemoInput
            isSubmitting={createItem.isPending}
            onCreate={handleCreateQuickMemo}
          />
        </div>
      </div>

      {/* 리스트 영역 */}
      <div className="rounded-2xl bg-white p-4 shadow-sm md:p-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">메모 &amp; 포스트</h2>
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
          />
        )}
      </div>
    </div>
  );
}
