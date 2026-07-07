import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  pgEnum,
  date,
  unique,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ---------- ENUMS ----------
export const roleEnum = pgEnum("role", [
  "STUDENT",
  "FACULTY",
  "HOD",
  "ADMIN",
  "SUPER_ADMIN",
]);

export const attendanceStatusEnum = pgEnum("attendance_status", [
  "PRESENT",
  "ABSENT",
  "LATE",
  "MEDICAL_LEAVE",
  "ON_DUTY",
  "HOLIDAY",
]);

export const leaveStatusEnum = pgEnum("leave_status", [
  "PENDING",
  "APPROVED",
  "REJECTED",
]);

// ---------- CORE ----------
export const departments = pgTable("departments", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 150 }).notNull().unique(),
  code: varchar("code", { length: 20 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 150 }).notNull(),
  email: varchar("email", { length: 200 }).notNull().unique(),
  password: text("password").notNull(),
  role: roleEnum("role").notNull().default("STUDENT"),
  departmentId: uuid("department_id").references(() => departments.id),
  isActive: boolean("is_active").notNull().default(true),
  emailVerified: boolean("email_verified").notNull().default(false),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const refreshTokens = pgTable("refresh_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const students = pgTable("students", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull()
    .unique(),
  departmentId: uuid("department_id").references(() => departments.id),
  rollNumber: varchar("roll_number", { length: 50 }).notNull().unique(),
  semester: integer("semester").notNull().default(1),
  section: varchar("section", { length: 10 }).notNull().default("A"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const faculty = pgTable("faculty", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull()
    .unique(),
  departmentId: uuid("department_id").references(() => departments.id),
  designation: varchar("designation", { length: 100 }).default("Faculty"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const subjects = pgTable("subjects", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 150 }).notNull(),
  code: varchar("code", { length: 30 }).notNull().unique(),
  departmentId: uuid("department_id").references(() => departments.id),
  facultyId: uuid("faculty_id").references(() => faculty.id),
  semester: integer("semester").notNull().default(1),
  section: varchar("section", { length: 10 }).notNull().default("A"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const attendance = pgTable(
  "attendance",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    studentId: uuid("student_id")
      .references(() => students.id, { onDelete: "cascade" })
      .notNull(),
    subjectId: uuid("subject_id")
      .references(() => subjects.id, { onDelete: "cascade" })
      .notNull(),
    date: date("date").notNull(),
    status: attendanceStatusEnum("status").notNull(),
    createdBy: uuid("created_by").references(() => users.id),
    updatedBy: uuid("updated_by").references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    uniqueMark: unique().on(t.studentId, t.subjectId, t.date),
  })
);

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id),
  action: varchar("action", { length: 100 }).notNull(),
  entity: varchar("entity", { length: 100 }).notNull(),
  entityId: uuid("entity_id"),
  metadata: text("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const leaveRequests = pgTable("leave_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  studentId: uuid("student_id")
    .references(() => students.id, { onDelete: "cascade" })
    .notNull(),
  fromDate: date("from_date").notNull(),
  toDate: date("to_date").notNull(),
  reason: text("reason").notNull(),
  status: leaveStatusEnum("status").notNull().default("PENDING"),
  reviewedBy: uuid("reviewed_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ---------- RELATIONS ----------
export const usersRelations = relations(users, ({ one }) => ({
  department: one(departments, {
    fields: [users.departmentId],
    references: [departments.id],
  }),
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  user: one(users, { fields: [students.userId], references: [users.id] }),
  department: one(departments, {
    fields: [students.departmentId],
    references: [departments.id],
  }),
  attendance: many(attendance),
}));

export const facultyRelations = relations(faculty, ({ one, many }) => ({
  user: one(users, { fields: [faculty.userId], references: [users.id] }),
  department: one(departments, {
    fields: [faculty.departmentId],
    references: [departments.id],
  }),
  subjects: many(subjects),
}));

export const subjectsRelations = relations(subjects, ({ one, many }) => ({
  department: one(departments, {
    fields: [subjects.departmentId],
    references: [departments.id],
  }),
  faculty: one(faculty, {
    fields: [subjects.facultyId],
    references: [faculty.id],
  }),
  attendance: many(attendance),
}));

export const attendanceRelations = relations(attendance, ({ one }) => ({
  student: one(students, {
    fields: [attendance.studentId],
    references: [students.id],
  }),
  subject: one(subjects, {
    fields: [attendance.subjectId],
    references: [subjects.id],
  }),
}));
