import { Router } from "express";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { subjects } from "../db/schema";
import { authenticate, authorize } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";

const router = Router();

const schema = z.object({
  name: z.string().min(2),
  code: z.string().min(1).max(30),
  departmentId: z.string().uuid(),
  facultyId: z.string().uuid().optional(),
  semester: z.number().int().min(1).max(12),
  section: z.string().min(1).max(10),
});

router.get("/", authenticate, async (req, res, next) => {
  try {
    const rows = await db.query.subjects.findMany({
      with: { department: true, faculty: { with: { user: true } } },
    });
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.post(
  "/",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN", "HOD"),
  async (req, res, next) => {
    try {
      const data = schema.parse(req.body);
      const [row] = await db.insert(subjects).values(data).returning();
      res.status(201).json(row);
    } catch (err) {
      next(err);
    }
  }
);

router.put(
  "/:id",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN", "HOD"),
  async (req, res, next) => {
    try {
      const data = schema.partial().parse(req.body);
      const [row] = await db
        .update(subjects)
        .set(data)
        .where(eq(subjects.id, (req.params.id as string)))
        .returning();
      if (!row) throw new AppError("Subject not found", 404);
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
      await db.delete(subjects).where(eq(subjects.id, (req.params.id as string)));
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
);

export default router;
