import type { Request, Response } from "express";
import { itemService } from "./items.service.js";

export const itemsController = {
  async getAll(req: Request, res: Response) {
    const items = await itemService.getAll();
    res.json(items);
  },

  async getById(req: Request, res: Response) {
    const id = Number(req.params.id);
    const item = await itemService.getById(id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json(item);
  },

  async create(req: Request, res: Response) {
    const { type, title, content } = req.body;
    const item = await itemService.create({ type, title, content });
    res.status(201).json(item);
  },

  async update(req: Request, res: Response) {
    const id = Number(req.params.id);
    const { title, content } = req.body;
    const item = await itemService.update(id, { title, content });
    res.json(item);
  },

  async delete(req: Request, res: Response) {
    const id = Number(req.params.id);
    await itemService.delete(id);
    res.status(204).send();
  },
};