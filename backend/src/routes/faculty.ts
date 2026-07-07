import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { users, faculty, subjects } from "../db/schema";
import { authenticate, authorize, AuthRequest } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";

const router = Router();

const createSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  departmentId: z.string().uuid(),
  designation: z.string().optional(),
});

router.get(
  "/",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN", "HOD"),
  async (_req, res, next) => {
    try {
      const rows = await db.query.faculty.findMany({
        with: { user: true, department: true },
      });
      res.json(
        rows.map((r) => ({
          id: r.id,
          name: r.user.name,
          email: r.user.email,
          designation: r.designation,
          department: r.department?.name,
        }))
      );
    } catch (err) {
      next(err);
    }
  }
);

// Faculty's own subjects — used to populate "today's schedule / select subject"
router.get("/me/subjects", authenticate, authorize("FACULTY"), async (req: AuthRequest, res, next) => {
  try {
    const fac = await db.query.faculty.findFirst({
      where: eq(faculty.userId, req.user!.userId),
    });
    if (!fac) throw new AppError("Faculty profile not found", 404);

    const rows = await db.query.subjects.findMany({
      where: eq(subjects.facultyId, fac.id),
    });
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
      const data = createSchema.parse(req.body);
      const existing = await db.query.users.findFirst({
        where: eq(users.email, data.email),
      });
      if (existing) throw new AppError("Email already registered", 409);

      const hashed = await bcrypt.hash(data.password, 10);
      const [user] = await db
        .insert(users)
        .values({
          name: data.name,
          email: data.email,
          password: hashed,
          role: "FACULTY",
          departmentId: data.departmentId,
        })
        .returning();

      const [fac] = await db
        .insert(faculty)
        .values({
          userId: user.id,
          departmentId: data.departmentId,
          designation: data.designation || "Faculty",
        })
        .returning();

      res.status(201).json({ ...fac, name: user.name, email: user.email });
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
      const fac = await db.query.faculty.findFirst({
        where: eq(faculty.id, (req.params.id as string)),
      });
      if (!fac) throw new AppError("Faculty not found", 404);
      await db.delete(users).where(eq(users.id, fac.userId));
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
);

export default router;
