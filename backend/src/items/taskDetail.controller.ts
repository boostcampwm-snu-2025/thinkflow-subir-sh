import type { Request, Response } from "express";
import { taskDetailService } from "./taskDetail.service.js";
import { success, fail } from "../utils/response.js";

function parseDueDate(raw: unknown): Date | null | undefined {
  if (raw === undefined) return undefined; // 아예 건드리지 않음
  if (raw === null || raw === "") return null;

  if (typeof raw === "string") {
    // "YYYY-MM-DD" → Date 로 변환
    // 여기서는 로컬 자정 기준으로 예시
    return new Date(raw + "T00:00:00");
  }

  // 이미 Date인 경우 등
  return raw as Date;
}

export const taskDetailController = {
  async get(req: Request, res: Response) {
    const itemId = Number(req.params.id);
    const detail = await taskDetailService.get(itemId);
    if (!detail) return res.status(404).json(fail("Task not found"));
    res.json(success(detail));
  },

  async create(req: Request, res: Response) {
    const itemId = Number(req.params.id);
    const { dueDate, ...rest } = req.body;
    const detail = await taskDetailService.create(itemId, {
      ...rest,
      dueDate: parseDueDate(dueDate),
    });
    res.status(201).json(success(detail));
  },

  async update(req: Request, res: Response) {
    const itemId = Number(req.params.id);
    const { dueDate, ...rest } = req.body;
    const detail = await taskDetailService.update(itemId, {
      ...rest,
      dueDate: parseDueDate(dueDate),
    });
    res.json(success(detail));
  },

  async delete(req: Request, res: Response) {
    const itemId = Number(req.params.id);
    await taskDetailService.delete(itemId);
    res.status(204).send();
  },
};