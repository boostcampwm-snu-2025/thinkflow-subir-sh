import { ItemType } from "../generated/client.js";

export type SortOrder = "asc" | "desc";

export type ItemSortableField =
  | "createdAt"
  | "updatedAt"
  | "dueDate";

export interface ItemListQuery {
  page: number;
  limit: number;
  sort: ItemSortableField;
  order: SortOrder;
  type?: ItemType | undefined; // "memo" | "task" | "post" 인데, Prisma schema 변경 시 자동 반영 됨! 
  tag?: number | undefined;
  q?: string | undefined;
}
