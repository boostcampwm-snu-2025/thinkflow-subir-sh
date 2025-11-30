import { prisma } from "../prisma/index.js";
import { ItemType } from "../generated/enums.js"; 
// 이렇게 해야 하나...? @prisma/client로 안되나

export const itemService = {
  getAll() {
    return prisma.item.findMany({
      include: {
        taskDetail: true,
        tags: { include: { tag: true } },
        comments: true,
      },
    });
  },

  getById(id: number) {
    return prisma.item.findUnique({
      where: { id },
      include: {
        taskDetail: true,
        tags: { include: { tag: true } },
        comments: true,
      },
    });
  },

  create(data: {
    type: ItemType;
    title: string;
    content?: string | null;
  }) {
    return prisma.item.create({
      data,
    });
  },

  update(id: number, data: Partial<{ title: string; content: string }>) {
    return prisma.item.update({
      where: { id },
      data,
    });
  },

  delete(id: number) {
    return prisma.item.delete({
      where: { id },
    });
  },
};