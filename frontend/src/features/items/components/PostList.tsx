import type { Item, ItemType } from '../../../shared/types';
import { PostCard } from './PostCard.js';

interface PostListProps {
  items: Item[];
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

export function PostList({
  items,
  onUpdate,
  onDelete,
  isUpdating,
  isDeleting,
  onEditTags,
}: PostListProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map((item) => (
        <PostCard
          key={item.id}
          item={item}
          onUpdate={onUpdate}
          onDelete={onDelete}
          isUpdating={isUpdating}
          isDeleting={isDeleting}
          onEditTags={onEditTags}
        />
      ))}
    </div>
  );
}