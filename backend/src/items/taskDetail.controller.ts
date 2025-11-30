import type { Request, Response } from "express";
import { taskDetailService } from "./taskDetail.service.js";

export const taskDetailController = {
  async get(req: Request, res: Response) {
    const itemId = Number(req.params.id);
    const detail = await taskDetailService.get(itemId);
    if (!detail) return res.status(404).json({ message: "Task detail not found" });
    res.json(detail);
  },

  async create(req: Request, res: Response) {
    const itemId = Number(req.params.id);
    const detail = await taskDetailService.create(itemId, req.body);
    res.status(201).json(detail);
  },

  async update(req: Request, res: Response) {
    const itemId = Number(req.params.id);
    const detail = await taskDetailService.update(itemId, req.body);
    res.json(detail);
  },

  async delete(req: Request, res: Response) {
    const itemId = Number(req.params.id);
    await taskDetailService.delete(itemId);
    res.status(204).send();
  },
};