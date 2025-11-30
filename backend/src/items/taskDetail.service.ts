import { prisma } from "../prisma/index.js";
import { Priority } from "../generated/enums.js";

export const taskDetailService = {
  async get(itemId: number) {
    return prisma.taskDetail.findUnique({
      where: { itemId },
    });
  },

  async create(itemId: number, data: {
    dueDate?: Date | null;
    repeatUnit?: string | null;
    priority?: Priority | null;
  }) {
    return prisma.taskDetail.create({
      data: {
        itemId,
        ...data,
      },
    });
  },

  async update(itemId: number, data: Partial<{
    dueDate: Date | null;
    isDone: boolean;
    repeatUnit: string | null;
    priority: Priority | null;
  }>) {
    return prisma.taskDetail.update({
      where: { itemId },
      data,
    });
  },

  async delete(itemId: number) {
    return prisma.taskDetail.delete({
      where: { itemId },
    });
  }
};