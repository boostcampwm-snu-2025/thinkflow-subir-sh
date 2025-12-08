import type { FormEvent } from 'react';
import { useState } from 'react';
import clsx from 'clsx';
import { useItemsQuery } from '../api/useItemsQuery';
import { useCreateItemMutation } from '../api/useCreateItemMutation';
import { useUpdateItemMutation } from '../api/useUpdateItemMutation';
import { useDeleteItemMutation } from '../api/useDeleteItemMutation';
import type { Item, ItemType } from '../../../shared/types';

type PostLikeItemType = Extract<ItemType, 'MEMO' | 'POST'>;

export function PostPage() {
  const { data, isLoading, error } = useItemsQuery();

  const createItem = useCreateItemMutation();
  const updateItem = useUpdateItemMutation();
  const deleteItem = useDeleteItemMutation();

  const postItems: Item[] =
    data?.filter((item) => item.type === 'MEMO' || item.type === 'POST') ?? [];

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-3xl px-4 py-6">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">ThinkFlow · 메모 & 포스트</h1>
            <p className="text-sm text-slate-500">
              간단 CRUD 데모 — MEMO / POST만 필터링해서 보여주는 페이지
            </p>
          </div>
        </header>

        <section className="mb-6 rounded-lg bg-white p-4 shadow">
          <h2 className="mb-3 text-lg font-semibold">새 메모/포스트 만들기</h2>
          <CreatePostForm
            onCreate={(data) => {
              createItem.mutate(data);
            }}
            isSubmitting={createItem.isPending}
          />
        </section>

        <section className="rounded-lg bg-white p-4 shadow">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">메모 & 포스트 목록</h2>
            {isLoading && (
              <span className="text-xs text-slate-400">불러오는 중...</span>
            )}
          </div>

          {error && (
            <div className="mb-3 rounded bg-red-50 px-3 py-2 text-sm text-red-700">
              데이터를 가져오는 중 에러가 발생했어요.
            </div>
          )}

          {!isLoading && postItems.length === 0 && (
            <div className="rounded border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500">
              아직 메모나 포스트가 없어요. 위에서 하나 만들어볼까?
            </div>
          )}

          {postItems.length > 0 && (
            <ul className="space-y-3">
              {postItems.map((item) => (
                <li key={item.id}>
                  <PostListItem
                    item={item}
                    onUpdate={(data) => updateItem.mutate(data)}
                    onDelete={(id) => deleteItem.mutate({ id })}
                    isUpdating={updateItem.isPending}
                    isDeleting={deleteItem.isPending}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

interface CreatePostFormProps {
  onCreate: (input: {
    type: PostLikeItemType;
    title: string;
    content?: string;
  }) => void;
  isSubmitting: boolean;
}

function CreatePostForm({ onCreate, isSubmitting }: CreatePostFormProps) {
  const [type, setType] = useState<PostLikeItemType>('MEMO');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onCreate({
      type,
      title: title.trim(),
      content: content.trim() || undefined,
    });

    // 낙관적으로 폼 초기화 (에러 처리 고도화는 나중에)
    setTitle('');
    setContent('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-2">
        <button
          type="button"
          className={clsx(
            'flex-1 rounded border px-3 py-2 text-sm',
            type === 'MEMO'
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-slate-300 bg-white text-slate-700',
          )}
          onClick={() => setType('MEMO')}
        >
          MEMO
        </button>
        <button
          type="button"
          className={clsx(
            'flex-1 rounded border px-3 py-2 text-sm',
            type === 'POST'
              ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
              : 'border-slate-300 bg-white text-slate-700',
          )}
          onClick={() => setType('POST')}
        >
          POST
        </button>
      </div>

      <div className="space-y-1">
        <label className="block text-xs font-medium text-slate-600">
          제목
        </label>
        <input
          className="w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          placeholder="제목을 입력하세요"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="space-y-1">
        <label className="block text-xs font-medium text-slate-600">
          내용 (선택)
        </label>
        <textarea
          className="h-24 w-full resize-none rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          placeholder="간단한 메모나 포스트 내용을 적어보세요"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting || !title.trim()}
          className={clsx(
            'rounded px-4 py-2 text-sm font-medium text-white',
            isSubmitting || !title.trim()
              ? 'bg-slate-400'
              : 'bg-blue-600 hover:bg-blue-700',
          )}
        >
          {isSubmitting ? '생성 중...' : '생성'}
        </button>
      </div>
    </form>
  );
}

interface PostListItemProps {
  item: Item;
  onUpdate: (input: { id: number; title?: string; content?: string }) => void;
  onDelete: (id: number) => void;
  isUpdating: boolean;
  isDeleting: boolean;
}

function PostListItem({
  item,
  onUpdate,
  onDelete,
  isUpdating,
  isDeleting,
}: PostListItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(item.title);
  const [editContent, setEditContent] = useState(item.content ?? '');

  const handleSave = () => {
    if (!editTitle.trim()) return;
    onUpdate({
      id: item.id,
      title: editTitle.trim(),
      content: editContent.trim() || undefined,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditTitle(item.title);
    setEditContent(item.content ?? '');
  };

  return (
    <div className="flex gap-3 rounded border border-slate-200 bg-slate-50 p-3">
      <div className="mt-1">
        <span
          className={clsx(
            'inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold',
            item.type === 'MEMO'
              ? 'bg-amber-100 text-amber-800'
              : 'bg-indigo-100 text-indigo-800',
          )}
        >
          {item.type}
        </span>
      </div>

      <div className="flex-1 space-y-1">
        {isEditing ? (
          <>
            <input
              className="w-full rounded border border-slate-300 px-2 py-1 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
            />
            <textarea
              className="h-20 w-full resize-none rounded border border-slate-300 px-2 py-1 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
            <p className="text-[11px] text-slate-400">
              생성: {new Date(item.createdAt).toLocaleString()}
            </p>
          </>
        )}
      </div>

      <div className="flex flex-col items-end gap-1">
        {isEditing ? (
          <>
            <button
              type="button"
              onClick={handleSave}
              disabled={isUpdating}
              className={clsx(
                'w-16 rounded px-2 py-1 text-xs font-medium text-white',
                isUpdating ? 'bg-slate-400' : 'bg-emerald-600 hover:bg-emerald-700',
              )}
            >
              {isUpdating ? '저장중' : '저장'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="w-16 rounded px-2 py-1 text-xs text-slate-600 hover:bg-slate-100"
            >
              취소
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="w-16 rounded px-2 py-1 text-xs text-slate-700 hover:bg-slate-100"
            >
              수정
            </button>
            <button
              type="button"
              onClick={() => onDelete(item.id)}
              disabled={isDeleting}
              className={clsx(
                'w-16 rounded px-2 py-1 text-xs font-medium text-white',
                isDeleting ? 'bg-slate-400' : 'bg-red-600 hover:bg-red-700',
              )}
            >
              {isDeleting ? '삭제중' : '삭제'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}