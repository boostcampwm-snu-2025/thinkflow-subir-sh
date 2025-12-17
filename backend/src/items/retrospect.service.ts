import { prisma } from "../prisma/index.js";
import { ItemType, RetrospectDraftStatus } from "../generated/enums.js";
import { geminiGenerateText } from "../llm/gemini.js";
import { buildRetrospectPrompt } from "../llm/retrospect.prompt.js";

const priorityLabel = (p: any) => {
  switch (p) {
    case "HIGH": return "높음";
    case "MEDIUM": return "중간";
    case "LOW": return "낮음";
    default: return "없음";
  }
};

const ymd = (d?: Date | null) => (d ? d.toISOString().slice(0, 10) : "없음");

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
  async ensureDraft(taskId: number, opts: { force?: boolean } = {}) {
    const task = await prisma.item.findUnique({
        where: { id: taskId },
        include: {
        tags: { include: { tag: true } },
        taskDetail: { include: { retrospectDraft: true } },
        },
    });

    if (!task) throw new Error("NOT_FOUND");
    if (task.type !== ItemType.TASK) throw new Error("NOT_A_TASK");
    if (!task.taskDetail) throw new Error("TASK_DETAIL_MISSING");

    // 이미 회고 포스트가 저장돼 있으면 초안 생성 불필요
    if (task.taskDetail.retrospectPostId) {
        return { status: "HAS_POST" as const, draft: task.taskDetail.retrospectDraft ?? null };
    }

    const existing = task.taskDetail.retrospectDraft;

    // 캐시된 READY가 있고 force 아니면 그대로 반환
    if (!opts.force && existing?.status === RetrospectDraftStatus.READY) {
        return { status: "CACHED" as const, draft: existing };
    }

    // 이미 생성중이면 그대로 반환 (중복 호출 방지)
    if (!opts.force && existing?.status === RetrospectDraftStatus.PENDING) {
        return { status: "PENDING" as const, draft: existing };
    }

    // PENDING으로 먼저 박아두기(동시 요청 방지)
    await prisma.retrospectDraft.upsert({
        where: { taskId },
        update: {
        status: RetrospectDraftStatus.PENDING,
        errorMessage: null,
        },
        create: {
        taskId,
        status: RetrospectDraftStatus.PENDING,
        },
    });

    // comments 타임라인(최근 30개, 오래된→최신)
    const comments = await prisma.comment.findMany({
        where: { itemId: taskId },
        orderBy: { createdAt: "asc" },
        take: 30,
    });

    const dueDate = task.taskDetail.dueDate ? task.taskDetail.dueDate.toISOString().slice(0, 10) : "없음";
    const priority =
        task.taskDetail.priority === "HIGH" ? "높음"
        : task.taskDetail.priority === "MEDIUM" ? "중간"
        : task.taskDetail.priority === "LOW" ? "낮음"
        : "없음";

    const prompt = buildRetrospectPrompt({
        taskId,
        title: task.title,
        content: task.content ?? null,
        createdAt: task.createdAt,
        dueDate,
        priority,
        status: String(task.taskDetail.status),
        tags: (task.tags ?? []).map((t) => `#${t.tag.name}`),
        comments: comments.map((c) => ({
        at: c.createdAt.toISOString().replace("T", " ").slice(0, 16),
        content: c.content,
        })),
    });

    try {
        const text = await geminiGenerateText(prompt);

        const saved = await prisma.retrospectDraft.update({
        where: { taskId },
        data: {
            status: RetrospectDraftStatus.READY,
            draftTitle: `회고: ${task.title}`,
            draftContent: text, // ✅ Gemini raw 텍스트 그대로 저장
            errorMessage: null,
        },
        });

        return { status: "READY" as const, draft: saved };
    } catch (e: any) {
        const saved = await prisma.retrospectDraft.update({
        where: { taskId },
        data: {
            status: RetrospectDraftStatus.FAILED,
            errorMessage: String(e?.message ?? "GEMINI_FAILED"),
        },
        });

        // FE가 실패 UI 띄우기 쉽게 200으로 내려주게끔 service는 결과 반환
        return { status: "FAILED" as const, draft: saved };
    }
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
