import { Router } from "express";
import { itemsController } from "./items.controller.js";
import { taskDetailController } from "./taskDetail.controller.js";

const router = Router();

/**
 * ITEM ROUTES
 */

/**
 * @openapi
 * /items:
 *   get:
 *     summary: Get all items
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/", itemsController.getAll);

/**
 * @openapi
 * /items/{id}:
 *   get:
 *     summary: Get item by ID
 */
router.get("/:id", itemsController.getById);

/**
 * @openapi
 * /items:
 *   post:
 *     summary: Create a new item
 */
router.post("/", itemsController.create);

/**
 * @openapi
 * /items/{id}:
 *   patch:
 *     summary: Update an item
 */
router.patch("/:id", itemsController.update);

/**
 * @openapi
 * /items/{id}:
 *   delete:
 *     summary: Delete an item
 */
router.delete("/:id", itemsController.delete);

/**
 * TASK DETAIL ROUTES
 * /items/:id/task-detail
 */

/**
 * @openapi
 * /items/{id}/task-detail:
 *   get:
 *     summary: Get task detail for specific item
 */
router.get("/:id/task-detail", taskDetailController.get);

/**
 * @openapi
 * /items/{id}/task-detail:
 *   post:
 *     summary: Create task detail for specific item
 */
router.post("/:id/task-detail", taskDetailController.create);

/**
 * @openapi
 * /items/{id}/task-detail:
 *   patch:
 *     summary: Update task detail for specific item
 */
router.patch("/:id/task-detail", taskDetailController.update);

/**
 * @openapi
 * /items/{id}/task-detail:
 *   delete:
 *     summary: Delete task detail
 */
router.delete("/:id/task-detail", taskDetailController.delete);


export default router;