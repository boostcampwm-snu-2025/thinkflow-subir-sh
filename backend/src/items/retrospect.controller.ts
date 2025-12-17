import type { Request, Response } from "express";
import { success, fail } from "../utils/response.js";
import { retrospectService } from "./retrospect.service.js";

// 너 프로젝트에 success/fail 유틸 있으면 그걸로 바꿔도 됨
const ok = (data: any) => ({ ok: true, data });
const err = (message: string) => ({ ok: false, message });

export const retrospectController = {
  async get(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (!Number.isFinite(id)) return res.status(400).json(err("INVALID_ID"));

      const state = await retrospectService.getState(id);
      if (!state) return res.status(404).json(err("NOT_FOUND"));

      return res.json(ok(state));
    } catch (e: any) {
      if (e?.message === "NOT_A_TASK") return res.status(400).json(err("NOT_A_TASK"));
      if (e?.message === "TASK_DETAIL_MISSING") return res.status(400).json(err("TASK_DETAIL_MISSING"));
      return res.status(500).json(err("INTERNAL_ERROR"));
    }
  },

  async ensureDraft(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (!Number.isFinite(id)) return res.status(400).json(fail("INVALID_ID"));

      const force = req.query.force === "1" || req.query.force === "true";
      const result = await retrospectService.ensureDraft(id, { force });

      return res.json(success(result));
    } catch (e: any) {
      if (e?.message === "NOT_FOUND") return res.status(404).json(fail("NOT_FOUND"));
      if (e?.message === "NOT_A_TASK") return res.status(400).json(fail("NOT_A_TASK"));
      if (e?.message === "TASK_DETAIL_MISSING") return res.status(400).json(fail("TASK_DETAIL_MISSING"));
      if (e?.message === "GEMINI_API_KEY_MISSING") return res.status(500).json(fail("GEMINI_API_KEY_MISSING"));
      return res.status(500).json(fail("INTERNAL_ERROR"));
    }
  },

  async save(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (!Number.isFinite(id)) return res.status(400).json(err("INVALID_ID"));

      const title = String(req.body?.title ?? "").trim();
      const content = String(req.body?.content ?? "");

      if (!title) return res.status(400).json(err("TITLE_REQUIRED"));

      const result = await retrospectService.save(id, { title, content });
      return res.json(ok(result));
    } catch (e: any) {
      if (e?.message === "NOT_FOUND") return res.status(404).json(err("NOT_FOUND"));
      if (e?.message === "NOT_A_TASK") return res.status(400).json(err("NOT_A_TASK"));
      if (e?.message === "TASK_DETAIL_MISSING") return res.status(400).json(err("TASK_DETAIL_MISSING"));
      return res.status(500).json(err("INTERNAL_ERROR"));
    }
  },
};
