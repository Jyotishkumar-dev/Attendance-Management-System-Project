import { Router } from "express";
import { db } from "../db";
import {
  authenticate,
  authorize,
  AuthRequest,
} from "../middleware/auth";

import {
  faculty,
  users,
  departments,
  students,
  subjects,
} from "../db/schema";

import { eq } from "drizzle-orm";

const router = Router();

/**
 * GET /api/hod/me
 */
router.get(
  "/me",
  authenticate,
  authorize("HOD"),
  async (req: AuthRequest, res, next) => {

    console.log("========== HOD ==========");
    console.log(req.user);

    
    try {
      if (!req.user) {
        return res.status(401).json({
          message: "Unauthorized",
        });
      }

      // Find HOD faculty record
      const result = await db
        .select({
          id: faculty.id,
          designation: faculty.designation,
          departmentId: faculty.departmentId,
          userName: users.name,
          userEmail: users.email,
          departmentName: departments.name,
       })
       .from(faculty)
       .leftJoin(users, eq(faculty.userId, users.id))
       .leftJoin(departments, eq(faculty.departmentId, departments.id))
       .where(eq(faculty.userId, req.user.userId))
       .limit(1);

      const hod = result[0];

     console.log("HOD Record =", hod);

      console.log("HOD Record =", hod);

      if (!hod) {
        return res.status(404).json({
          message: "HOD profile not found",
        });
      }

      // Student count
      const studentList = await db
        .select()
        .from(students)
        .where(eq(students.departmentId, hod.departmentId!));

      // Faculty count
      const facultyList = await db
        .select()
        .from(faculty)
        .where(eq(faculty.departmentId, hod.departmentId!));

      // Subject count
      const subjectList = await db
        .select()
        .from(subjects)
        .where(eq(subjects.departmentId, hod.departmentId!));

       res.json({
       id: hod.id,
       designation: hod.designation ?? "HOD",
       user: {
         name: hod.userName,
         email: hod.userEmail,
       },
       department: {
       name: hod.departmentName ?? "N/A",
       },
        stats: {
          students: studentList.length,
          faculty: facultyList.length,
          subjects: subjectList.length,
        },
      });
    } catch (err) {
        console.error("HOD ERROR:", err);
        return res.status(500).json({
          error: err,
          message: "HOD Route Failed",
       });
     }
  }
);

export default router;