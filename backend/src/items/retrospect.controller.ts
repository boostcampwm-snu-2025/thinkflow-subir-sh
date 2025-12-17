import type { Request, Response } from "express";
import { retrospectService } from "./retrospect.service.js";
import { success, fail } from "../utils/response.js";

export const retrospectController = {
  async get(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (!Number.isFinite(id)) return res.status(400).json(fail("INVALID_ID"));

      const state = await retrospectService.getState(id);
      if (!state) return res.status(404).json(fail("NOT_FOUND"));

      return res.json(success(state));
    } catch (e: any) {
      if (e?.message === "NOT_A_TASK") return res.status(400).json(fail("NOT_A_TASK"));
      if (e?.message === "TASK_DETAIL_MISSING") return res.status(400).json(fail("TASK_DETAIL_MISSING"));
      return res.status(500).json(fail("INTERNAL_ERROR"));
    }
  },

  async ensureDraft(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (!Number.isFinite(id)) return res.status(400).json(fail("INVALID_ID"));

      // force 옵션 쓰려면 service도 받게 확장
      const force = req.query.force === "1" || req.query.force === "true";
      const result = await retrospectService.ensureDraft(id, { force });

      return res.json(success(result));
    } catch (e: any) {
      if (e?.message === "NOT_FOUND") return res.status(404).json(fail("NOT_FOUND"));
      if (e?.message === "NOT_A_TASK") return res.status(400).json(fail("NOT_A_TASK"));
      if (e?.message === "TASK_DETAIL_MISSING") return res.status(400).json(fail("TASK_DETAIL_MISSING"));
      return res.status(500).json(fail("INTERNAL_ERROR"));
    }
  },

  async save(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (!Number.isFinite(id)) return res.status(400).json(fail("INVALID_ID"));

      const title = String(req.body?.title ?? "").trim();
      const content = String(req.body?.content ?? "");

      if (!title) return res.status(400).json(fail("TITLE_REQUIRED"));

      const result = await retrospectService.save(id, { title, content });
      return res.json(success(result));
    } catch (e: any) {
      if (e?.message === "NOT_FOUND") return res.status(404).json(fail("NOT_FOUND"));
      if (e?.message === "NOT_A_TASK") return res.status(400).json(fail("NOT_A_TASK"));
      if (e?.message === "TASK_DETAIL_MISSING") return res.status(400).json(fail("TASK_DETAIL_MISSING"));
      return res.status(500).json(fail("INTERNAL_ERROR"));
    }
  },
};