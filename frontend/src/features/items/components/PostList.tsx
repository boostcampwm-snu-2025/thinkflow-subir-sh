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
}

export function PostList({
  items,
  onUpdate,
  onDelete,
  isUpdating,
  isDeleting,
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
        />
      ))}
    </div>
  );
}