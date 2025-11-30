import { Router } from "express";
import { tagsController } from "./tags.controller.js";

const router = Router();

/**
 * TAG CRUD
 */
router.get("/", tagsController.getAll);
router.get("/:id", tagsController.getById);
router.post("/", tagsController.create);
router.patch("/:id", tagsController.update);
router.delete("/:id", tagsController.delete);

/**
 * ITEM-TAG RELATIONS (N:N)
 * /tags/item/:itemId/tag/:tagId
 */
router.post("/item/:itemId/:tagId", tagsController.addTagToItem);
router.delete("/item/:itemId/:tagId", tagsController.removeTagFromItem);

export default router;
