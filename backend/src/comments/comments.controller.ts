import type { Request, Response } from "express";
import { commentsService } from "./comments.service.js";

export const commentsController = {
  async getByItem(req: Request, res: Response) {
    const itemId = Number(req.params.itemId);
    const comments = await commentsService.getByItem(itemId);
    res.json(comments);
  },

  async getById(req: Request, res: Response) {
    const id = Number(req.params.id);
    const comment = await commentsService.getById(id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });
    res.json(comment);
  },

  async create(req: Request, res: Response) {
    const itemId = Number(req.params.itemId);
    const { content } = req.body;

    const created = await commentsService.create(itemId, { content });
    res.status(201).json(created);
  },

  async update(req: Request, res: Response) {
    const id = Number(req.params.id);
    const updated = await commentsService.update(id, req.body);
    res.json(updated);
  },

  async delete(req: Request, res: Response) {
    const id = Number(req.params.id);
    await commentsService.delete(id);
    res.status(204).send();
  },
};
