import { useAuth } from "../context/AuthContext";
import { StudentDashboard } from "./StudentDashboard";
import { FacultyDashboard } from "./FacultyDashboard";
import { AdminDashboard } from "./AdminDashboard";

export function DashboardRouter() {
  const { user } = useAuth();
  if (!user) return null;

  switch (user.role) {
    case "STUDENT":
      return <StudentDashboard />;
    case "FACULTY":
      return <FacultyDashboard />;
    case "ADMIN":
    case "SUPER_ADMIN":
    case "HOD":
      return <AdminDashboard />;
    default:
      return null;
  }
}
