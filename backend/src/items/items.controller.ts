import type { Request, Response } from "express";
import { ItemType } from "../generated/client.js";
import type { ItemListQuery, ItemSortableField, SortOrder } from "./items.types.js";
import { itemService } from "./items.service.js";
import { success, fail } from "../utils/response.js";

export const itemsController = {
  async getAll(req: Request, res: Response) {
    const items = await itemService.getAll();
    res.json(success(items));
  },

  async getList(req: Request, res: Response) {
    const {
      page = "1",
      limit = "20",
      sort = "createdAt",
      order = "desc",
      type,
      tag,
      q,
    } = req.query;

    const query: ItemListQuery = {
      page: Number(page),
      limit: Number(limit),
      sort: sort as ItemSortableField,
      order: order as SortOrder,
      type: typeof type === "string" ? (type as ItemType) : undefined,
      tag: tag ? Number(tag) : undefined,
      q: q ? String(q) : undefined,
    };

    const result = await itemService.getList(query);

    res.json(success(result.data, result.meta));
  },

  async getById(req: Request, res: Response) {
    const id = Number(req.params.id);
    const item = await itemService.getById(id);
    if (!item) return res.status(404).json(fail("Item not found")); //@TODO : 여기서 하면 안됨!! 
    res.json(success(item));
  },

  async create(req: Request, res: Response) {
    const { type, title, content } = req.body;
    const item = await itemService.create({ type, title, content });
    res.status(201).json(success(item));
  },

  async update(req: Request, res: Response) {
    const id = Number(req.params.id);
    const { title, content, type } = req.body;
    const item = await itemService.update(id, { title, content, type });
    res.json(success(item));
  },

  async delete(req: Request, res: Response) {
    const id = Number(req.params.id);
    await itemService.delete(id);
    res.status(204).send();
  },

  async getTags(req: Request, res: Response) {
    const itemId = Number(req.params.id);
    const tags = await itemService.getTags(itemId);
    res.json(success(tags.map(t => t.tag)));  // tag만 반환
  },
};