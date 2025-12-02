import { prisma } from "../prisma/index.js";
import { ItemType } from "../generated/enums.js"; 
// 이렇게 해야 하나...? @prisma/client로 안되나

export const itemService = {
  async getAll() {
    return prisma.item.findMany({
      include: {
        taskDetail: true,
        tags: { include: { tag: true } },
        comments: true,
      },
    });
  },

  async getById(id: number) {
    return prisma.item.findUnique({
      where: { id },
      include: {
        taskDetail: true,
        tags: { include: { tag: true } },
        comments: true,
      },
    });
  },

  async create(data: {
    type: ItemType;
    title: string;
    content?: string | null;
  }) {
    const userId = 1; // @TODO: 이렇게 하면 안됨! 
    return prisma.item.create({
      data: {
        ...data,
        userId,
      },
    });
  },

  async update(id: number, data: Partial<{ title: string; content: string }>) {
    return prisma.item.update({
      where: { id },
      data,
    });
  },

  async delete(id: number) {
    return prisma.item.delete({
      where: { id },
    });
  },

  async getTags(itemId: number) {
  return prisma.itemTag.findMany({
    where: { itemId },
    include: {
      tag: true,
    },
  });
}
};