import type { Request, Response } from "express";
import { tagsService } from "./tags.service.js";
import { success, fail } from "../utils/response.js";

export const tagsController = {
  async getAll(req: Request, res: Response) {
    const list = await tagsService.getAll();
    res.json(success(list));
  },

  async getById(req: Request, res: Response) {
    const id = Number(req.params.id);
    const tag = await tagsService.getById(id);
    if (!tag) return res.status(404).json(fail("Tag not found"));
    res.json(success(tag));
  },

  async create(req: Request, res: Response) {
    const { name, color } = req.body;
    const tag = await tagsService.create({ name, color });
    res.status(201).json(success(tag));
  },

  async update(req: Request, res: Response) {
    const id = Number(req.params.id);
    const tag = await tagsService.update(id, req.body);
    res.json(success(tag));
  },

  async delete(req: Request, res: Response) {
    const id = Number(req.params.id);
    await tagsService.delete(id);
    res.status(204).send();
  },

  async addTagToItem(req: Request, res: Response) {
    const itemId = Number(req.params.itemId);
    const tagId = Number(req.params.tagId);
    const relation = await tagsService.addTagToItem(itemId, tagId);
    res.status(201).json(success(relation));
  },

  async removeTagFromItem(req: Request, res: Response) {
    const itemId = Number(req.params.itemId);
    const tagId = Number(req.params.tagId);
    await tagsService.removeTagFromItem(itemId, tagId);
    res.status(204).send();
  },
};
