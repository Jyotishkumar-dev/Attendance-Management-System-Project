import bcrypt from "bcryptjs";
import "dotenv/config";
import { db, pool } from "./index";
import { users, departments, students, faculty, subjects, attendance } from "./schema";

async function main() {
  console.log("Seeding database...");

  const password = await bcrypt.hash("password123", 10);

  // Departments
  const [cse] = await db
    .insert(departments)
    .values({ name: "Computer Science", code: "CSE" })
    .returning();
  const [ece] = await db
    .insert(departments)
    .values({ name: "Electronics", code: "ECE" })
    .returning();

  // Super Admin
  await db.insert(users).values({
    name: "Super Admin",
    email: "superadmin@smartattend.dev",
    password,
    role: "SUPER_ADMIN",
    emailVerified: true,
  });

  // Admin
  await db.insert(users).values({
    name: "College Admin",
    email: "admin@smartattend.dev",
    password,
    role: "ADMIN",
    emailVerified: true,
  });

  // HOD
  await db.insert(users).values({
    name: "Dr. HOD Sharma",
    email: "hod@smartattend.dev",
    password,
    role: "HOD",
    departmentId: cse.id,
    emailVerified: true,
  });

  // Faculty
  const [facUser] = await db
    .insert(users)
    .values({
      name: "Prof. Anita Verma",
      email: "faculty@smartattend.dev",
      password,
      role: "FACULTY",
      departmentId: cse.id,
      emailVerified: true,
    })
    .returning();
  const [fac] = await db
    .insert(faculty)
    .values({ userId: facUser.id, departmentId: cse.id, designation: "Assistant Professor" })
    .returning();

  // Subjects taught by this faculty
  const [subj1] = await db
    .insert(subjects)
    .values({
      name: "Data Structures",
      code: "CS201",
      departmentId: cse.id,
      facultyId: fac.id,
      semester: 3,
      section: "A",
    })
    .returning();
  const [subj2] = await db
    .insert(subjects)
    .values({
      name: "Operating Systems",
      code: "CS301",
      departmentId: cse.id,
      facultyId: fac.id,
      semester: 3,
      section: "A",
    })
    .returning();

  // Students
  const studentRows = [];
  for (let i = 1; i <= 5; i++) {
    const [u] = await db
      .insert(users)
      .values({
        name: `Student ${i}`,
        email: `student${i}@smartattend.dev`,
        password,
        role: "STUDENT",
        departmentId: cse.id,
        emailVerified: true,
      })
      .returning();
    const [s] = await db
      .insert(students)
      .values({
        userId: u.id,
        departmentId: cse.id,
        rollNumber: `CSE2024-0${i}`,
        semester: 3,
        section: "A",
      })
      .returning();
    studentRows.push(s);
  }

  // Sample attendance for the last 5 days across both subjects
  const statuses = ["PRESENT", "PRESENT", "ABSENT", "LATE", "PRESENT"] as const;
  for (let d = 0; d < 5; d++) {
    const date = new Date();
    date.setDate(date.getDate() - d);
    const dateStr = date.toISOString().slice(0, 10);

    for (const subj of [subj1, subj2]) {
      for (let i = 0; i < studentRows.length; i++) {
        await db.insert(attendance).values({
          studentId: studentRows[i].id,
          subjectId: subj.id,
          date: dateStr,
          status: statuses[(i + d) % statuses.length],
          createdBy: facUser.id,
          updatedBy: facUser.id,
        });
      }
    }
  }

  console.log("Seed complete.");
  console.log("Sample logins (password: password123):");
  console.log("  superadmin@smartattend.dev");
  console.log("  admin@smartattend.dev");
  console.log("  hod@smartattend.dev");
  console.log("  faculty@smartattend.dev");
  console.log("  student1@smartattend.dev ... student5@smartattend.dev");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => pool.end());
