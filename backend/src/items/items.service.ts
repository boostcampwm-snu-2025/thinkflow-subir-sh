import { prisma } from "../prisma/index.js";
import { ItemType } from "../generated/enums.js"; 
import type { ItemListQuery } from "./items.types.js";

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

  async getList(params: ItemListQuery) {
    const { page, limit, sort, order, type, tag, q } = params;

    const where: any = {};

    // type 필터
    if (type) where.type = type;

    // 검색
    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { content: { contains: q, mode: "insensitive" } },
      ];
    }

    // 태그 필터 (N:N)
    if (tag) {
      where.tags = {
        some: { tagId: tag },
      };
    }

    const total = await prisma.item.count({ where });

    const data = await prisma.item.findMany({
      where,
      orderBy: {
        [sort]: order,
      },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        taskDetail: true,
        tags: { include: { tag: true } },
        comments: true,
      },
    });

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
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