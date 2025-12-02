import type { Request, Response } from "express";
import { taskDetailService } from "./taskDetail.service.js";
import { success, fail } from "../utils/response.js";

export const taskDetailController = {
  async get(req: Request, res: Response) {
    const itemId = Number(req.params.id);
    const detail = await taskDetailService.get(itemId);
    if (!detail) return res.status(404).json(fail("Task not found"));
    res.json(success(detail));
  },

  async create(req: Request, res: Response) {
    const itemId = Number(req.params.id);
    const detail = await taskDetailService.create(itemId, req.body);
    res.status(201).json(success(detail));
  },

  async update(req: Request, res: Response) {
    const itemId = Number(req.params.id);
    const detail = await taskDetailService.update(itemId, req.body);
    res.json(success(detail));
  },

  async delete(req: Request, res: Response) {
    const itemId = Number(req.params.id);
    await taskDetailService.delete(itemId);
    res.status(204).send();
  },
};