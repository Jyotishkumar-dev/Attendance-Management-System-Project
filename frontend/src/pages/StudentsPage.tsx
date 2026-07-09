import { useMemo, useState } from "react";
import {
  Search,
  Plus,
  Users,
  TrendingUp,
  UserCheck,
  AlertTriangle,
  ChevronDown,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  UserX,
  SlidersHorizontal,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Placeholder data — no API calls in this view                      */
/* ------------------------------------------------------------------ */

type Status = "Active" | "At Risk" | "Inactive";

interface Student {
  id: string;
  name: string;
  rollNumber: string;
  department: string;
  year: string;
  attendance: number;
  status: Status;
}

const DEPARTMENTS = ["Computer Science", "Electronics", "Mechanical", "Civil"];
const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

const STUDENTS: Student[] = [
  { id: "1", name: "Ananya Rao", rollNumber: "CSE2024-01", department: "Computer Science", year: "2nd Year", attendance: 92, status: "Active" },
  { id: "2", name: "Rohit Mehta", rollNumber: "CSE2024-02", department: "Computer Science", year: "2nd Year", attendance: 68, status: "At Risk" },
  { id: "3", name: "Sara Khan", rollNumber: "ECE2023-14", department: "Electronics", year: "3rd Year", attendance: 88, status: "Active" },
  { id: "4", name: "Devansh Iyer", rollNumber: "CSE2024-03", department: "Computer Science", year: "2nd Year", attendance: 55, status: "At Risk" },
  { id: "5", name: "Priya Nair", rollNumber: "MEC2022-09", department: "Mechanical", year: "4th Year", attendance: 96, status: "Active" },
  { id: "6", name: "Karan Malhotra", rollNumber: "CIV2023-21", department: "Civil", year: "3rd Year", attendance: 40, status: "Inactive" },
  { id: "7", name: "Ishita Verma", rollNumber: "ECE2023-15", department: "Electronics", year: "3rd Year", attendance: 81, status: "Active" },
  { id: "8", name: "Aditya Kulkarni", rollNumber: "CSE2024-04", department: "Computer Science", year: "1st Year", attendance: 73, status: "At Risk" },
  { id: "9", name: "Neha Joshi", rollNumber: "MEC2022-10", department: "Mechanical", year: "4th Year", attendance: 91, status: "Active" },
  { id: "10", name: "Farhan Ali", rollNumber: "CIV2023-22", department: "Civil", year: "3rd Year", attendance: 64, status: "At Risk" },
  { id: "11", name: "Meera Pillai", rollNumber: "ECE2023-16", department: "Electronics", year: "2nd Year", attendance: 97, status: "Active" },
  { id: "12", name: "Vikram Singh", rollNumber: "CSE2024-05", department: "Computer Science", year: "1st Year", attendance: 35, status: "Inactive" },
];

const PAGE_SIZE = 6;

/* ------------------------------------------------------------------ */
/*  Reusable components                                                */
/* ------------------------------------------------------------------ */

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.35)] transition-all duration-300 ${className}`}
    >
      {children}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  icon: any;
  tone: "indigo" | "emerald" | "amber" | "rose";
}) {
  const tones: Record<string, string> = {
    indigo: "from-indigo-500/20 to-indigo-400/10 text-indigo-300",
    emerald: "from-emerald-500/20 to-emerald-400/10 text-emerald-300",
    amber: "from-amber-500/20 to-amber-400/10 text-amber-300",
    rose: "from-rose-500/20 to-rose-400/10 text-rose-300",
  };
  return (
    <GlassCard className="p-5 hover:-translate-y-0.5 hover:border-white/20">
      <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${tones[tone]} border border-white/10 flex items-center justify-center mb-4`}>
        <Icon size={18} />
      </div>
      <div className="font-display text-2xl font-semibold text-white">{value}</div>
      <div className="text-xs text-white/40 mt-1">{label}</div>
    </GlassCard>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div className="h-9 w-9 shrink-0 rounded-full bg-gradient-to-br from-indigo-400 to-emerald-400 flex items-center justify-center font-display text-xs font-semibold text-[#0a0a0f]">
      {initials}
    </div>
  );
}

function StatusBadge({ status }: { status: Status }) {
  const styles: Record<Status, string> = {
    Active: "bg-emerald-400/10 text-emerald-300",
    "At Risk": "bg-amber-400/10 text-amber-300",
    Inactive: "bg-rose-400/10 text-rose-300",
  };
  return (
    <span className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full ${styles[status]}`}>
      {status}
    </span>
  );
}

function AttendanceBar({ value }: { value: number }) {
  const color = value >= 75 ? "bg-emerald-400" : value >= 60 ? "bg-amber-400" : "bg-rose-400";
  return (
    <div className="flex items-center gap-2 min-w-[110px]">
      <div className="h-1.5 flex-1 rounded-full bg-white/10 overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs text-white/50 w-9 text-right">{value}%</span>
    </div>
  );
}

function Dropdown({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none rounded-xl border border-white/10 bg-white/5 pl-3.5 pr-9 py-2.5 text-sm text-white outline-none transition focus:border-indigo-400/50 focus:bg-white/10 focus:ring-2 focus:ring-indigo-400/20 cursor-pointer"
      >
        <option value="" className="bg-[#12131a]">
          {label}
        </option>
        {options.map((o) => (
          <option key={o} value={o} className="bg-[#12131a]">
            {o}
          </option>
        ))}
      </select>
      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
        <UserX size={22} className="text-white/30" />
      </div>
      <div className="text-sm font-semibold text-white/70">No students found</div>
      <p className="text-xs text-white/40 mt-1.5 max-w-xs">
        Try adjusting your search or filters, or add a new student to get started.
      </p>
    </div>
  );
}

function IconButton({ icon: Icon, tone = "default" }: { icon: any; tone?: "default" | "danger" }) {
  return (
    <button
      className={`h-8 w-8 rounded-lg flex items-center justify-center border border-white/10 bg-white/5 transition-colors ${
        tone === "danger" ? "text-white/40 hover:text-rose-300 hover:bg-rose-400/10" : "text-white/40 hover:text-white hover:bg-white/10"
      }`}
    >
      <Icon size={14} />
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */

export function StudentsPage() {
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return STUDENTS.filter((s) => {
      const matchesSearch =
        !search ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.rollNumber.toLowerCase().includes(search.toLowerCase());
      const matchesDept = !department || s.department === department;
      const matchesYear = !year || s.year === year;
      return matchesSearch && matchesDept && matchesYear;
    });
  }, [search, department, year]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const avgAttendance = Math.round(STUDENTS.reduce((sum, s) => sum + s.attendance, 0) / STUDENTS.length);
  const atRisk = STUDENTS.filter((s) => s.attendance < 75).length;
  const active = STUDENTS.filter((s) => s.status === "Active").length;

  function updateFilter(setter: (v: string) => void) {
    return (v: string) => {
      setter(v);
      setPage(1);
    };
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-white">Students</h1>
          <p className="text-sm text-white/40 mt-1">Manage student accounts, enrollment, and attendance standing.</p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-emerald-400 px-4 py-2.5 text-sm font-semibold text-[#0a0a0f] transition hover:opacity-90">
          <Plus size={16} /> Add Student
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Students" value={String(STUDENTS.length)} icon={Users} tone="indigo" />
        <StatCard label="Average Attendance" value={`${avgAttendance}%`} icon={TrendingUp} tone="emerald" />
        <StatCard label="Active Students" value={String(active)} icon={UserCheck} tone="emerald" />
        <StatCard label="At Risk (< 75%)" value={String(atRisk)} icon={AlertTriangle} tone="amber" />
      </div>

      {/* Toolbar */}
      <GlassCard className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name or roll number…"
              className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/30 outline-none transition focus:border-indigo-400/50 focus:bg-white/10 focus:ring-2 focus:ring-indigo-400/20"
            />
          </div>
          <Dropdown label="All Departments" value={department} options={DEPARTMENTS} onChange={updateFilter(setDepartment)} />
          <Dropdown label="All Years" value={year} options={YEARS} onChange={updateFilter(setYear)} />
          <button className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors">
            <SlidersHorizontal size={14} /> More filters
          </button>
        </div>
      </GlassCard>

      {/* Table */}
      <GlassCard className="overflow-hidden">
        {paginated.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[820px]">
              <thead className="sticky top-0 z-10 bg-[#12131a]/95 backdrop-blur-xl">
                <tr className="text-left text-[11px] uppercase tracking-wide text-white/30 border-b border-white/10">
                  <th className="px-5 py-3.5 font-medium">Student</th>
                  <th className="px-5 py-3.5 font-medium">Roll Number</th>
                  <th className="px-5 py-3.5 font-medium">Department</th>
                  <th className="px-5 py-3.5 font-medium">Year</th>
                  <th className="px-5 py-3.5 font-medium">Attendance</th>
                  <th className="px-5 py-3.5 font-medium">Status</th>
                  <th className="px-5 py-3.5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((s) => (
                  <tr key={s.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.03] transition-colors group">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={s.name} />
                        <span className="font-medium text-white">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-white/50">{s.rollNumber}</td>
                    <td className="px-5 py-3.5 text-white/60">{s.department}</td>
                    <td className="px-5 py-3.5 text-white/60">{s.year}</td>
                    <td className="px-5 py-3.5">
                      <AttendanceBar value={s.attendance} />
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={s.status} />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                        <IconButton icon={Eye} />
                        <IconButton icon={Pencil} />
                        <IconButton icon={Trash2} tone="danger" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {filtered.length > 0 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-white/10">
            <span className="text-xs text-white/40">
              Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-8 w-8 rounded-lg flex items-center justify-center border border-white/10 bg-white/5 text-white/50 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-medium transition-colors ${
                    p === currentPage
                      ? "bg-gradient-to-r from-indigo-500 to-emerald-400 text-[#0a0a0f]"
                      : "border border-white/10 bg-white/5 text-white/50 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="h-8 w-8 rounded-lg flex items-center justify-center border border-white/10 bg-white/5 text-white/50 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
}