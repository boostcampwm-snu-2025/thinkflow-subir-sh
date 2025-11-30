import { prisma } from "../prisma/index.js";

export const commentsService = {
  async getByItem(itemId: number) {
    return prisma.comment.findMany({
      where: { itemId },
      orderBy: { createdAt: "desc" },
    });
  },

  async getById(id: number) {
    return prisma.comment.findUnique({
      where: { id },
    });
  },

  async create(itemId: number, data: { content: string }) {
    return prisma.comment.create({
      data: {
        itemId,
        content: data.content,
      },
    });
  },

  async update(id: number, data: { content?: string }) {
    return prisma.comment.update({
      where: { id },
      data,
    });
  },

  async delete(id: number) {
    return prisma.comment.delete({
      where: { id },
    });
  },
};
