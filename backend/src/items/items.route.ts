import { Router } from "express";
import { itemsController } from "./items.controller.js";

const router = Router();

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

export default router;