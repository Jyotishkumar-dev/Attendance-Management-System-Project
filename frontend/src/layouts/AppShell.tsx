import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  CalendarCheck,
  Users,
  BookOpen,
  Building2,
  LogOut,
  Search,
  Bell,
  ChevronDown,
  Menu,
  X,
  Settings,
  User as UserIcon,
} from "lucide-react";

type NavItem = { to: string; label: string; icon: any };

const NAV: Record<string, NavItem[]> = {
  STUDENT: [{ to: "/", label: "Dashboard", icon: LayoutDashboard }],
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

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Ambient background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-indigo-600/10 blur-3xl" />
        <div className="absolute top-1/2 -right-32 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Floating glass sidebar */}
      <aside
        className={`fixed z-50 top-0 bottom-0 left-0 w-72 p-4 transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl shadow-[0_8px_40px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between px-5 py-5">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-400 to-emerald-400 flex items-center justify-center font-display font-bold text-[#0a0a0f] text-sm">
                S
              </div>
              <div>
                <div className="font-display text-sm font-semibold tracking-tight leading-none">
                  SmartAttend
                </div>
                <div className="text-[11px] text-white/40 mt-1">Attendance Platform</div>
              </div>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden text-white/50 hover:text-white transition-colors"
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          </div>

          <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
            {items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-white/50 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-gradient-to-b from-indigo-400 to-emerald-400 transition-all duration-300" />
                    )}
                    <item.icon
                      size={17}
                      className={`transition-transform duration-200 ${
                        isActive ? "" : "group-hover:translate-x-0.5"
                      }`}
                    />
                    {item.label}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="px-3 py-4 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:bg-white/5 hover:text-red-300 w-full transition-colors"
            >
              <LogOut size={17} /> Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Main column */}
      <div className="lg:pl-[19rem]">
        {/* Top navbar */}
        <header className="sticky top-0 z-30 px-4 pt-4 lg:pl-0 lg:pr-6">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl px-4 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden text-white/60 hover:text-white transition-colors"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>

            <div className="relative flex-1 max-w-md">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
              />
              <input
                type="text"
                placeholder="Search students, subjects…"
                className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-10 pr-4 text-sm text-white placeholder-white/30 outline-none transition focus:border-indigo-400/50 focus:bg-white/10 focus:ring-2 focus:ring-indigo-400/20"
              />
            </div>

            <div className="flex-1" />

            <button
              className="relative rounded-xl p-2 text-white/60 hover:bg-white/5 hover:text-white transition-colors"
              aria-label="Notifications"
            >
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </button>

            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen((v) => !v)}
                className="flex items-center gap-2.5 rounded-xl py-1.5 pl-1.5 pr-2.5 hover:bg-white/5 transition-colors"
                aria-haspopup="true"
                aria-expanded={profileOpen}
              >
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-400 to-emerald-400 flex items-center justify-center font-display font-semibold text-[#0a0a0f] text-xs">
                  {initials(user?.name)}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-medium leading-none truncate max-w-[9rem]">
                    {user?.name}
                  </div>
                  <div className="text-[11px] text-white/40 mt-1">{roleLabel(user?.role)}</div>
                </div>
                <ChevronDown
                  size={15}
                  className={`text-white/40 transition-transform duration-200 ${
                    profileOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-white/10 bg-[#12131a]/95 backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.5)] overflow-hidden">
                  <div className="px-4 py-3 border-b border-white/10">
                    <div className="text-sm font-medium truncate">{user?.name}</div>
                    <div className="text-xs text-white/40 truncate mt-0.5">{user?.email}</div>
                  </div>
                  
                 <button
                   onClick={() => {
                     setProfileOpen(false);

                     if (user?.role === "STUDENT") {
                       navigate("/student/profile");
                      } else if (user?.role === "FACULTY") {
                        navigate("/faculty/profile");
                      }
                    }}
                    className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-white/70 hover:bg-white/5 hover:text-white transition-colors"
                  >
                    <UserIcon size={16} /> Profile
                  </button>
                  
                  <button className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-white/70 hover:bg-white/5 hover:text-white transition-colors">
                    <Settings size={16} /> Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-300 hover:bg-white/5 transition-colors border-t border-white/10"
                  >
                    <LogOut size={16} /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="px-4 py-6 lg:pl-0 lg:pr-6">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 sm:p-8 min-h-[calc(100vh-8rem)]">
            <Outlet />
          </div>
        </main>
      </div>
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

function initials(name?: string) {
  if (!name) return "";
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}