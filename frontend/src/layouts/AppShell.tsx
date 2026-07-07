import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  CalendarCheck,
  Users,
  BookOpen,
  Building2,
  LogOut,
} from "lucide-react";

const NAV: Record<string, { to: string; label: string; icon: any }[]> = {
  STUDENT: [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
  ],
  FACULTY: [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/mark-attendance", label: "Mark Attendance", icon: CalendarCheck },
  ],
  HOD: [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/students", label: "Students", icon: Users },
    { to: "/subjects", label: "Subjects", icon: BookOpen },
  ],
  ADMIN: [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/students", label: "Students", icon: Users },
    { to: "/faculty", label: "Faculty", icon: Users },
    { to: "/subjects", label: "Subjects", icon: BookOpen },
    { to: "/departments", label: "Departments", icon: Building2 },
  ],
  SUPER_ADMIN: [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/students", label: "Students", icon: Users },
    { to: "/faculty", label: "Faculty", icon: Users },
    { to: "/subjects", label: "Subjects", icon: BookOpen },
    { to: "/departments", label: "Departments", icon: Building2 },
  ],
};

export function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const items = (user && NAV[user.role]) || [];

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen flex bg-[var(--color-paper)]">
      <aside className="w-64 shrink-0 bg-[var(--color-ink)] text-white flex flex-col">
        <div className="px-6 py-6 border-b border-white/10">
          <div className="font-display text-lg font-semibold tracking-tight">SmartAttend</div>
          <div className="text-xs text-white/50 mt-0.5">Attendance Platform</div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <item.icon size={17} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-white/10">
          <div className="px-3 py-2 mb-2">
            <div className="text-sm font-medium truncate">{user?.name}</div>
            <div className="text-xs text-white/50">{roleLabel(user?.role)}</div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:bg-white/5 hover:text-white w-full transition-colors"
          >
            <LogOut size={17} /> Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <div className="max-w-6xl mx-auto px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function roleLabel(role?: string) {
  if (!role) return "";
  return role
    .split("_")
    .map((w) => w[0] + w.slice(1).toLowerCase())
    .join(" ");
}
