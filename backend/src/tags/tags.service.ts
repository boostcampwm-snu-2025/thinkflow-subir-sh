import { prisma } from "../prisma/index.js";

export const tagsService = {
  getAll() {
    return prisma.tag.findMany({
      include: {
        items: { include: { item: true } },
      },
    });
  },

  getById(id: number) {
    return prisma.tag.findUnique({
      where: { id },
      include: {
        items: { include: { item: true } },
      },
    });
  },

  create(data: { name: string; color: string }) {
    const userId = 1; // @TODO

    return prisma.tag.create({
      data: {
        ...data,
        userId,
      },
    });
  },

  update(id: number, data: Partial<{ name: string; color: string }>) {
    return prisma.tag.update({
      where: { id },
      data,
    });
  },

  delete(id: number) {
    return prisma.tag.delete({
      where: { id },
    });
  },

  // N:N 연결
  addTagToItem(itemId: number, tagId: number) {
    return prisma.itemTag.create({
      data: { itemId, tagId },
    });
  },

  removeTagFromItem(itemId: number, tagId: number) {
    return prisma.itemTag.delete({
      where: {
        itemId_tagId: { itemId, tagId },
      },
    });
  },
};
