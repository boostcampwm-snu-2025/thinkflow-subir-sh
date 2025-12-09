import type { Item, ItemType, Priority } from "../../../shared/types";
import { TaskCard } from "./TaskCard";

interface TaskListProps {
  items: Item[];
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
}

export function TaskList({
  items,
  onUpdate,
  onDelete,
  isUpdating,
  isDeleting,
  onEditTags,
}: TaskListProps) {
  if (items.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-400">
        아직 등록된 태스크가 없어요. 상단의 &quot;새 태스크&quot; 버튼으로 추가해보세요.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <TaskCard
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
