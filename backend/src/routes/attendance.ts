import { Router } from "express";
import { z } from "zod";
import { and, eq, sql } from "drizzle-orm";
import { db } from "../db";
import { attendance, students, faculty, subjects, auditLogs } from "../db/schema";
import { authenticate, authorize, AuthRequest } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";

const router = Router();

const statusEnum = z.enum([
  "PRESENT",
  "ABSENT",
  "LATE",
  "MEDICAL_LEAVE",
  "ON_DUTY",
  "HOLIDAY",
]);

const markSchema = z.object({
  subjectId: z.string().uuid(),
  date: z.string(), // YYYY-MM-DD
  records: z
    .array(
      z.object({
        studentId: z.string().uuid(),
        status: statusEnum,
      })
    )
    .min(1),
});

async function log(userId: string, action: string, entity: string, entityId?: string, metadata?: any) {
  await db.insert(auditLogs).values({
    userId,
    action,
    entity,
    entityId,
    metadata: metadata ? JSON.stringify(metadata) : null,
  });
}

// Faculty marks/updates attendance for a subject+date (bulk, one row per student)
router.post(
  "/",
  authenticate,
  authorize("FACULTY", "ADMIN", "SUPER_ADMIN", "HOD"),
  async (req: AuthRequest, res, next) => {
    try {
      const data = markSchema.parse(req.body);
      const userId = req.user!.userId;

      const results = [];
      for (const record of data.records) {
        const existing = await db.query.attendance.findFirst({
          where: and(
            eq(attendance.studentId, record.studentId),
            eq(attendance.subjectId, data.subjectId),
            eq(attendance.date, data.date)
          ),
        });

        if (existing) {
          const [updated] = await db
            .update(attendance)
            .set({ status: record.status, updatedBy: userId, updatedAt: new Date() })
            .where(eq(attendance.id, existing.id))
            .returning();
          await log(userId, "UPDATE", "attendance", existing.id, {
            from: existing.status,
            to: record.status,
          });
          results.push(updated);
        } else {
          const [created] = await db
            .insert(attendance)
            .values({
              studentId: record.studentId,
              subjectId: data.subjectId,
              date: data.date,
              status: record.status,
              createdBy: userId,
              updatedBy: userId,
            })
            .returning();
          await log(userId, "CREATE", "attendance", created.id, { status: record.status });
          results.push(created);
        }
      }

      res.status(201).json({ count: results.length, records: results });
    } catch (err) {
      next(err);
    }
  }
);

// Get attendance for a subject on a specific date (faculty view of the class list)
router.get(
  "/subject/:subjectId",
  authenticate,
  authorize("FACULTY", "ADMIN", "SUPER_ADMIN", "HOD"),
  async (req, res, next) => {
    try {
      const { date } = req.query;
      if (!date) throw new AppError("date query param required", 400);

      const rows = await db.query.attendance.findMany({
        where: and(
          eq(attendance.subjectId, (req.params.subjectId as string)),
          eq(attendance.date, date as string)
        ),
        with: { student: { with: { user: true } } },
      });
      res.json(rows);
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  "/:id",
  authenticate,
  authorize("FACULTY", "ADMIN", "SUPER_ADMIN", "HOD"),
  async (req: AuthRequest, res, next) => {
    try {
      await db.delete(attendance).where(eq(attendance.id, (req.params.id as string)));
      await log(req.user!.userId, "DELETE", "attendance", (req.params.id as string));
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
);

// Student's own attendance summary + subject-wise breakdown
router.get(
  "/me/summary",
  authenticate,
  authorize("STUDENT"),
  async (req: AuthRequest, res, next) => {
    try {
      const student = await db.query.students.findFirst({
        where: eq(students.userId, req.user!.userId),
      });
      if (!student) throw new AppError("Student profile not found", 404);

      const rows = await db.query.attendance.findMany({
        where: eq(attendance.studentId, student.id),
        with: { subject: true },
      });

      const total = rows.length;
      const present = rows.filter((r) =>
        ["PRESENT", "LATE", "ON_DUTY"].includes(r.status)
      ).length;
      const absent = rows.filter((r) => r.status === "ABSENT").length;
      const late = rows.filter((r) => r.status === "LATE").length;
      const percentage = total ? Math.round((present / total) * 1000) / 10 : 0;

      const bySubject: Record<string, { name: string; total: number; present: number; percentage: number }> = {};
      for (const r of rows) {
        const key = r.subject.id;
        if (!bySubject[key]) {
          bySubject[key] = { name: r.subject.name, total: 0, present: 0, percentage: 0 };
        }
        bySubject[key].total += 1;
        if (["PRESENT", "LATE", "ON_DUTY"].includes(r.status)) bySubject[key].present += 1;
      }
      for (const key of Object.keys(bySubject)) {
        const s = bySubject[key];
        s.percentage = s.total ? Math.round((s.present / s.total) * 1000) / 10 : 0;
      }

      res.json({
        total,
        present,
        absent,
        late,
        percentage,
        subjects: Object.values(bySubject),
        recent: rows
          .sort((a, b) => (a.date < b.date ? 1 : -1))
          .slice(0, 10)
          .map((r) => ({ date: r.date, status: r.status, subject: r.subject.name })),
      });
    } catch (err) {
      next(err);
    }
  }
);

// Admin/HOD: department-wide attendance stats for analytics dashboard
router.get(
  "/analytics/overview",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN", "HOD"),
  async (_req, res, next) => {
    try {
      const totalStudents = await db.select({ count: sql<number>`count(*)` }).from(students);
      const totalFaculty = await db.select({ count: sql<number>`count(*)` }).from(faculty);

      const today = new Date().toISOString().slice(0, 10);
      const todayRows = await db.query.attendance.findMany({
        where: eq(attendance.date, today),
      });
      const todayPresent = todayRows.filter((r) =>
        ["PRESENT", "LATE", "ON_DUTY"].includes(r.status)
      ).length;
      const todayPct = todayRows.length
        ? Math.round((todayPresent / todayRows.length) * 1000) / 10
        : 0;

      const allRows = await db.select().from(attendance);
      const overallPresent = allRows.filter((r) =>
        ["PRESENT", "LATE", "ON_DUTY"].includes(r.status)
      ).length;
      const overallPct = allRows.length
        ? Math.round((overallPresent / allRows.length) * 1000) / 10
        : 0;

      res.json({
        totalStudents: Number(totalStudents[0]?.count || 0),
        totalFaculty: Number(totalFaculty[0]?.count || 0),
        todayAttendancePercentage: todayPct,
        todayMarked: todayRows.length,
        overallAttendancePercentage: overallPct,
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
