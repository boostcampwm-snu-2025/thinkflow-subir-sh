import { Router } from "express";
import { prisma } from "../prisma.js";

const router = Router();

/**
 * @openapi
 * /items:
 *   get:
 *     summary: Get all items
 *     responses:
 *       200:
 *         description: OK
 */
router.get("/", async (req, res) => {
  const items = await prisma.item.findMany();
  res.json(items);
});

export default router;