import { Router } from "express";
import { itemsController } from "./items.controller.js";
import { taskDetailController } from "./taskDetail.controller.js";
import { retrospectController } from "./retrospect.controller.js";

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
 *     summary: Get an item by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.get("/:id", itemsController.getById);

/**
 * @openapi
 * /items:
 *   post:
 *     summary: Create a new item
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [memo, task, post]
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
 * @openapi
 * /items/{id}/tags:
 *   get:
 *     summary: Get tags for a specific item
 */
router.get("/:id/tags", itemsController.getTags);

/**
 * TASK DETAIL ROUTES
 * /items/:id/task-detail
 */

/**
 * @openapi
 * /items/{id}/task-detail:
 *   get:
 *     summary: Get task detail for an item
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: OK
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

router.get("/:id/retrospect", retrospectController.get);
router.post("/:id/retrospect/draft", retrospectController.ensureDraft);
router.put("/:id/retrospect", retrospectController.save);

export default router;