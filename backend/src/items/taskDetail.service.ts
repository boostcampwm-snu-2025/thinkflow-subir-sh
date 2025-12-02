import { prisma } from "../prisma/index.js";
import { TaskStatus, Priority } from "../generated/enums.js";
import type { RepeatRule } from "../../../shared/types/repeatRule.js";

export const taskDetailService = {
  async get(itemId: number) {
    return prisma.taskDetail.findUnique({
      where: { itemId },
    });
  },

  async create(itemId: number, data: {
    dueDate?: Date | null;
    status?: TaskStatus;
    repeatRule?: RepeatRule;
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
    status?: TaskStatus;
    repeatRule?: RepeatRule;
    priority: Priority | null;
  }>) {
    return prisma.taskDetail.update({
      where: { itemId },
      data: {
        ...data,
      },
    });
  },

  async delete(itemId: number) {
    return prisma.taskDetail.delete({
      where: { itemId },
    });
  }
};