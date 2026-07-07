import { Router } from "express";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { departments } from "../db/schema";
import { authenticate, authorize } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";

const router = Router();

const schema = z.object({
  name: z.string().min(2),
  code: z.string().min(1).max(20),
});

router.get("/", authenticate, async (_req, res, next) => {
  try {
    const rows = await db.select().from(departments);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.post(
  "/",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN"),
  async (req, res, next) => {
    try {
      const data = schema.parse(req.body);
      const [row] = await db.insert(departments).values(data).returning();
      res.status(201).json(row);
    } catch (err) {
      next(err);
    }
  }
);

router.put(
  "/:id",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN"),
  async (req, res, next) => {
    try {
      const data = schema.partial().parse(req.body);
      const [row] = await db
        .update(departments)
        .set(data)
        .where(eq(departments.id, (req.params.id as string)))
        .returning();
      if (!row) throw new AppError("Department not found", 404);
      res.json(row);
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN"),
  async (req, res, next) => {
    try {
      await db.delete(departments).where(eq(departments.id, (req.params.id as string)));
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
);

export default router;
