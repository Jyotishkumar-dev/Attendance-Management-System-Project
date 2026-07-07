export type Role = "STUDENT" | "FACULTY" | "HOD" | "ADMIN" | "SUPER_ADMIN";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  departmentId?: string | null;
  avatarUrl?: string | null;
}

export interface Department {
  id: string;
  name: string;
  code: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  departmentId: string;
  facultyId?: string | null;
  semester: number;
  section: string;
}

export type AttendanceStatus =
  | "PRESENT"
  | "ABSENT"
  | "LATE"
  | "MEDICAL_LEAVE"
  | "ON_DUTY"
  | "HOLIDAY";

export interface StudentSummary {
  total: number;
  present: number;
  absent: number;
  late: number;
  percentage: number;
  subjects: { name: string; total: number; present: number; percentage: number }[];
  recent: { date: string; status: AttendanceStatus; subject: string }[];
}

export interface StudentRow {
  id: string;
  rollNumber: string;
  semester: number;
  section: string;
  name: string;
  email: string;
  department?: string;
}

export interface AdminOverview {
  totalStudents: number;
  totalFaculty: number;
  todayAttendancePercentage: number;
  todayMarked: number;
  overallAttendancePercentage: number;
}
