import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { users, students } from "../db/schema";
import { authenticate, authorize, AuthRequest } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";

const router = Router();

const createSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  departmentId: z.string().uuid(),
  rollNumber: z.string().min(1),
  semester: z.number().int().min(1).max(12).default(1),
  section: z.string().min(1).max(10).default("A"),
});

// List students — Admin/Faculty/HOD
router.get(
  "/",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN", "HOD", "FACULTY"),
  async (req, res, next) => {
    try {
      const rows = await db.query.students.findMany({
        with: { user: true, department: true },
      });
      res.json(
        rows.map((r) => ({
          id: r.id,
          rollNumber: r.rollNumber,
          semester: r.semester,
          section: r.section,
          name: r.user.name,
          email: r.user.email,
          department: r.department?.name,
        }))
      );
    } catch (err) {
      next(err);
    }
  }
);

// Get own student profile
router.get("/me", authenticate, authorize("STUDENT"), async (req: AuthRequest, res, next) => {
  try {
    const row = await db.query.students.findFirst({
      where: eq(students.userId, req.user!.userId),
      with: { user: true, department: true },
    });
    if (!row) throw new AppError("Student profile not found", 404);
    res.json(row);
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
          role: "STUDENT",
          departmentId: data.departmentId,
        })
        .returning();

      const [student] = await db
        .insert(students)
        .values({
          userId: user.id,
          departmentId: data.departmentId,
          rollNumber: data.rollNumber,
          semester: data.semester,
          section: data.section,
        })
        .returning();

      res.status(201).json({ ...student, name: user.name, email: user.email });
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
      const student = await db.query.students.findFirst({
        where: eq(students.id, (req.params.id as string)),
      });
      if (!student) throw new AppError("Student not found", 404);
      await db.delete(users).where(eq(users.id, student.userId)); // cascades
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
);

export default router;
