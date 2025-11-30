import { Router } from "express";
import { commentsController } from "./comments.controller.js";

const router = Router();

/**
 * @openapi
 * /items/{itemId}/comments:
 *   get:
 *     summary: Get all comments for a specific item
 */
router.get("/items/:itemId/comments", commentsController.getByItem);

/**
 * @openapi
 * /items/{itemId}/comments:
 *   post:
 *     summary: Create a comment for a specific item
 */
router.post("/items/:itemId/comments", commentsController.create);

/**
 * @openapi
 * /comments/{id}:
 *   get:
 *     summary: Get a comment by id
 */
router.get("/comments/:id", commentsController.getById);

/**
 * @openapi
 * /comments/{id}:
 *   patch:
 *     summary: Update a comment
 */
router.patch("/comments/:id", commentsController.update);

/**
 * @openapi
 * /comments/{id}:
 *   delete:
 *     summary: Delete a comment
 */
router.delete("/comments/:id", commentsController.delete);

export default router;
