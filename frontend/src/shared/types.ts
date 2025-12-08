/** Item 종류 (Prisma enum 그대로) */
export type ItemType = 'MEMO' | 'TASK' | 'POST';

/** Task 상태 */
export type TaskStatus = 'READY' | 'IN_PROGRESS' | 'DONE' | 'PENDING';

/** 우선순위 */
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';

/** Tag */
export interface Tag {
  id: number;
  name: string;
  color: string;

  userId: number;
}

/** Comment */
export interface Comment {
  id: number;
  itemId: number;
  content: string;
  createdAt: string;
  updatedAt: string;

  userId: number;
}

/** TaskDetail (1:1 Item) */
export interface TaskDetail {
  itemId: number;
  dueDate: string | null;
  status: TaskStatus;
  repeatRule?: RepeatRule | null; 
  priority?: Priority | null;
}

/** Item */
export interface Item {
  id: number;
  type: ItemType;
  title: string;
  content?: string | null;
  createdAt: string;
  updatedAt: string;

  userId: number;

  taskDetail?: TaskDetail | null;
  comments?: Comment[];
  tags?: ItemTag[]; // include 구조에 맞게 아래 타입 사용
}

/** Item-Tag 관계 (N:N) */
export interface ItemTag {
  itemId: number;
  tagId: number;
  item?: Item;
  tag?: Tag;
}

/** 공통 meta (필요하면 확장) */
export interface ApiMeta {
  page?: number;
  total?: number;
  pageSize?: number;
  [key: string]: any;
}

export type Weekday =
  | "MON"
  | "TUE"
  | "WED"
  | "THU"
  | "FRI"
  | "SAT"
  | "SUN";

export type RepeatRule =
  | { type: "DAILY" }
  | { type: "EVERY_N_DAYS"; n: number }
  | { type: "WEEKLY"; days: Weekday[] }
  | { type: "EVERY_N_WEEKS"; n: number; days: Weekday[] }
  | { type: "MONTHLY"; day: number }
  | { type: "YEARLY"; month: number; day: number };