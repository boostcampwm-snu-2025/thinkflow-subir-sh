import { prisma } from "../prisma/index.js";
import { ItemType, RetrospectDraftStatus } from "../generated/enums.js";

const priorityLabel = (p: any) => {
  switch (p) {
    case "HIGH": return "높음";
    case "MEDIUM": return "중간";
    case "LOW": return "낮음";
    default: return "없음";
  }
};

const ymd = (d?: Date | null) => (d ? d.toISOString().slice(0, 10) : "없음");

function buildTemplate(task: {
  title: string;
  content?: string | null;
  tags: { tag: { name: string } }[];
  taskDetail: { dueDate?: Date | null; priority?: any | null; status: any };
}) {
  const due = ymd(task.taskDetail.dueDate);
  const pri = priorityLabel(task.taskDetail.priority);
  const status = task.taskDetail.status;

  const tagNames =
    task.tags?.map((t) => t.tag.name).filter(Boolean).map((n) => `#${n}`).join(" ") || "(없음)";

  const original = (task.content ?? "").trim() || "(내용 없음)";

  const draftTitle = `회고: ${task.title}`;
  const draftContent = [
    `기한: ${due}, 우선순위: ${pri}, 상태: ${status}`,
    `태그: ${tagNames}`,
    ``,
    `---`,
    `작업 내용`,
    original,
    ``,
    `---`,
    `회고`,
    `- 잘한 점:`,
    `- 아쉬운 점:`,
    `- 다음 행동:`,
    ``,
  ].join("\n");

  return { draftTitle, draftContent };
}

export const retrospectService = {
  async getState(taskId: number) {
    const task = await prisma.item.findUnique({
      where: { id: taskId },
      include: {
        tags: { include: { tag: true } },
        taskDetail: {
          include: {
            retrospectPost: {
              include: { tags: { include: { tag: true } } },
            },
            retrospectDraft: true,
          },
        },
      },
    });

    if (!task) return null;
    if (task.type !== ItemType.TASK) throw new Error("NOT_A_TASK");
    if (!task.taskDetail) throw new Error("TASK_DETAIL_MISSING");

    return {
      task,
      retrospectPost: task.taskDetail.retrospectPost ?? null,
      draft: task.taskDetail.retrospectDraft ?? null,
      retrospectPostId: task.taskDetail.retrospectPostId ?? null,
    };
  },

  // 초안이 없으면 템플릿으로 만들어 READY로 반환 (LLM 붙일 땐 여기서 PENDING으로 만들고 워커가 채움)
  async ensureDraft(taskId: number) {
    const task = await prisma.item.findUnique({
      where: { id: taskId },
      include: {
        tags: { include: { tag: true } },
        taskDetail: {
          include: { retrospectDraft: true },
        },
      },
    });

    if (!task) throw new Error("NOT_FOUND");
    if (task.type !== ItemType.TASK) throw new Error("NOT_A_TASK");
    if (!task.taskDetail) throw new Error("TASK_DETAIL_MISSING");

    // 이미 저장된 회고가 있으면, draft를 새로 만들지 않음
    if (task.taskDetail.retrospectPostId) {
      return { status: "HAS_POST" as const, draft: task.taskDetail.retrospectDraft ?? null };
    }

    const existing = task.taskDetail.retrospectDraft;
    if (existing && existing.status !== RetrospectDraftStatus.EMPTY) {
      return { status: "EXISTS" as const, draft: existing };
    }

    const { draftTitle, draftContent } = buildTemplate({
      title: task.title,
      content: task.content,
      tags: task.tags,
      taskDetail: {
        dueDate: task.taskDetail.dueDate,
        priority: task.taskDetail.priority,
        status: task.taskDetail.status,
      },
    });

    const draft = await prisma.retrospectDraft.upsert({
      where: { taskId },
      update: {
        status: RetrospectDraftStatus.READY,
        draftTitle,
        draftContent,
        errorMessage: null,
      },
      create: {
        taskId,
        status: RetrospectDraftStatus.READY,
        draftTitle,
        draftContent,
      },
    });

    return { status: "CREATED" as const, draft };
  },

  // 저장: 없으면 POST 생성 + 연결 + 태그 복사 / 있으면 해당 POST 업데이트
  async save(taskId: number, input: { title: string; content: string }) {
    const task = await prisma.item.findUnique({
      where: { id: taskId },
      include: {
        taskDetail: true,
        tags: true, // ItemTag (itemId, tagId)
      },
    });

    if (!task) throw new Error("NOT_FOUND");
    if (task.type !== ItemType.TASK) throw new Error("NOT_A_TASK");
    if (!task.taskDetail) throw new Error("TASK_DETAIL_MISSING");

    const tagIds = task.tags?.map((t: { tagId: any; }) => t.tagId) ?? [];

    return prisma.$transaction(async (tx) => {
      const td = await tx.taskDetail.findUnique({ where: { itemId: taskId } });
      if (!td) throw new Error("TASK_DETAIL_MISSING");

      const connectedPostId = td.retrospectPostId ?? null;

      if (connectedPostId) {
        const updated = await tx.item.update({
          where: { id: connectedPostId },
          data: {
            type: ItemType.POST,
            title: input.title,
            content: input.content,
          },
          include: { tags: { include: { tag: true } } },
        });

        // draft도 최신화 (초안=편집본 저장 상태로 유지)
        await tx.retrospectDraft.upsert({
          where: { taskId },
          update: {
            status: RetrospectDraftStatus.READY,
            draftTitle: input.title,
            draftContent: input.content,
            errorMessage: null,
          },
          create: {
            taskId,
            status: RetrospectDraftStatus.READY,
            draftTitle: input.title,
            draftContent: input.content,
          },
        });

        return { mode: "UPDATED" as const, post: updated };
      }

      // 아직 연결된 회고가 없으면 생성 + 연결
      const created = await tx.item.create({
        data: {
          type: ItemType.POST,
          title: input.title,
          content: input.content,
          userId: task.userId,
        },
      });

      await tx.taskDetail.update({
        where: { itemId: taskId },
        data: { retrospectPostId: created.id },
      });

      if (tagIds.length) {
        await tx.itemTag.createMany({
          data: tagIds.map((tagId: any) => ({ itemId: created.id, tagId })),
          skipDuplicates: true,
        });
      }

      const post = await tx.item.findUnique({
        where: { id: created.id },
        include: { tags: { include: { tag: true } } },
      });

      // draft 최신화
      await tx.retrospectDraft.upsert({
        where: { taskId },
        update: {
          status: RetrospectDraftStatus.READY,
          draftTitle: input.title,
          draftContent: input.content,
          errorMessage: null,
        },
        create: {
          taskId,
          status: RetrospectDraftStatus.READY,
          draftTitle: input.title,
          draftContent: input.content,
        },
      });

      return { mode: "CREATED" as const, post: post! };
    });
  },
};
