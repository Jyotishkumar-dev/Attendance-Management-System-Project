import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Eye,
  Pencil,
  Users,
  GraduationCap,
  Layers,
  ChevronDown,
} from "lucide-react";

// No backend wiring per the brief — placeholder data only. Shape mirrors
// what a real /hod/students endpoint would plausibly return (id, name,
// rollNumber, semester, section, attendancePercentage, email).
interface PlaceholderStudent {
  id: string;
  name: string;
  rollNumber: string;
  semester: number;
  section: string;
  attendancePercentage: number;
  email: string;
}

const PLACEHOLDER_STUDENTS: PlaceholderStudent[] = [
  { id: "1", name: "Aarav Sharma", rollNumber: "CS2201", semester: 4, section: "A", attendancePercentage: 92, email: "aarav.sharma@smartattend.dev" },
  { id: "2", name: "Priya Nair", rollNumber: "CS2202", semester: 4, section: "A", attendancePercentage: 78, email: "priya.nair@smartattend.dev" },
  { id: "3", name: "Rohan Verma", rollNumber: "CS2203", semester: 4, section: "B", attendancePercentage: 61, email: "rohan.verma@smartattend.dev" },
  { id: "4", name: "Sneha Iyer", rollNumber: "CS2204", semester: 4, section: "B", attendancePercentage: 88, email: "sneha.iyer@smartattend.dev" },
  { id: "5", name: "Karthik Reddy", rollNumber: "CS2205", semester: 6, section: "A", attendancePercentage: 54, email: "karthik.reddy@smartattend.dev" },
  { id: "6", name: "Ananya Gupta", rollNumber: "CS2206", semester: 6, section: "A", attendancePercentage: 95, email: "ananya.gupta@smartattend.dev" },
  { id: "7", name: "Vikram Singh", rollNumber: "CS2207", semester: 6, section: "B", attendancePercentage: 70, email: "vikram.singh@smartattend.dev" },
  { id: "8", name: "Meera Pillai", rollNumber: "CS2208", semester: 2, section: "A", attendancePercentage: 83, email: "meera.pillai@smartattend.dev" },
  { id: "9", name: "Arjun Das", rollNumber: "CS2209", semester: 2, section: "B", attendancePercentage: 66, email: "arjun.das@smartattend.dev" },
  { id: "10", name: "Divya Menon", rollNumber: "CS2210", semester: 2, section: "B", attendancePercentage: 91, email: "divya.menon@smartattend.dev" },
];

function initials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
}

function hueFromSeed(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 360;
  return h;
}

function attendanceStyle(pct: number) {
  if (pct >= 75) return "bg-emerald-400/15 text-emerald-300 border-emerald-400/30";
  if (pct >= 60) return "bg-amber-400/15 text-amber-300 border-amber-400/30";
  return "bg-rose-400/15 text-rose-300 border-rose-400/30";
}

export function HodStudentsPage() {
  // Simulated loading only — there's no real fetch behind this page yet.
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const id = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(id);
  }, []);

  const [search, setSearch] = useState("");
  const [semester, setSemester] = useState<string>("all");
  const [section, setSection] = useState<string>("all");

  const semesters = useMemo(
    () => Array.from(new Set(PLACEHOLDER_STUDENTS.map((s) => s.semester))).sort((a, b) => a - b),
    []
  );
  const sections = useMemo(
    () => Array.from(new Set(PLACEHOLDER_STUDENTS.map((s) => s.section))).sort(),
    []
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return PLACEHOLDER_STUDENTS.filter((s) => {
      const matchesQuery = !q || s.name.toLowerCase().includes(q) || s.rollNumber.toLowerCase().includes(q);
      const matchesSemester = semester === "all" || s.semester === Number(semester);
      const matchesSection = section === "all" || s.section === section;
      return matchesQuery && matchesSemester && matchesSection;
    });
  }, [search, semester, section]);

  if (loading) return <StudentsSkeleton />;

  return (
    <div className="min-h-screen bg-[#0a0b10] bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.18),transparent)] text-white">
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-white">Students</h1>
          <p className="text-sm text-white/50">Browse and manage students across your department.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or roll number…"
              className="w-full rounded-lg border border-white/10 bg-white/[0.04] py-2 pl-9 pr-3 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-indigo-400/50"
            />
          </div>

          <div className="flex gap-3">
            <div className="relative">
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="appearance-none rounded-lg border border-white/10 bg-white/[0.04] py-2 pl-3 pr-8 text-sm text-white outline-none transition-colors focus:border-indigo-400/50"
              >
                <option value="all" className="bg-[#12131c]">All semesters</option>
                {semesters.map((s) => (
                  <option key={s} value={s} className="bg-[#12131c]">Sem {s}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30" />
            </div>

            <div className="relative">
              <select
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="appearance-none rounded-lg border border-white/10 bg-white/[0.04] py-2 pl-3 pr-8 text-sm text-white outline-none transition-colors focus:border-indigo-400/50"
              >
                <option value="all" className="bg-[#12131c]">All sections</option>
                {sections.map((s) => (
                  <option key={s} value={s} className="bg-[#12131c]">Sec {s}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30" />
            </div>
          </div>
        </div>

        {/* Results */}
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl">
            <EmptyState
              hasFilters={search !== "" || semester !== "all" || section !== "all"}
            />
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl md:block">
              <table className="w-full text-sm">
                <thead className="bg-[#0e0f18]/80">
                  <tr className="border-b border-white/10 text-left text-[11px] uppercase tracking-wide text-white/40">
                    <th className="px-5 py-3 font-medium">Student</th>
                    <th className="px-5 py-3 font-medium">Roll no.</th>
                    <th className="px-5 py-3 font-medium">Sem / Section</th>
                    <th className="px-5 py-3 font-medium">Attendance</th>
                    <th className="px-5 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s) => {
                    const hue = hueFromSeed(s.id);
                    return (
                      <tr key={s.id} className="group border-b border-white/[0.06] transition-colors last:border-0 hover:bg-white/[0.03]">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div
                              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                              style={{ backgroundColor: `hsl(${hue} 65% 40%)` }}
                            >
                              {initials(s.name)}
                            </div>
                            <div>
                              <div className="font-medium text-white/90">{s.name}</div>
                              <div className="text-xs text-white/35">{s.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3 font-mono text-xs text-white/50">{s.rollNumber}</td>
                        <td className="px-5 py-3 text-white/60">
                          Sem {s.semester} · Sec {s.section}
                        </td>
                        <td className="px-5 py-3">
                          <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${attendanceStyle(s.attendancePercentage)}`}>
                            {s.attendancePercentage}%
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-white/60 transition-colors hover:border-indigo-400/40 hover:text-indigo-300"
                            >
                              <Eye className="h-3.5 w-3.5" /> View
                            </button>
                            <button
                              type="button"
                              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-white/60 transition-colors hover:border-cyan-400/40 hover:text-cyan-300"
                            >
                              <Pencil className="h-3.5 w-3.5" /> Edit
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="space-y-3 md:hidden">
              {filtered.map((s) => {
                const hue = hueFromSeed(s.id);
                return (
                  <div key={s.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                          style={{ backgroundColor: `hsl(${hue} 65% 40%)` }}
                        >
                          {initials(s.name)}
                        </div>
                        <div>
                          <div className="font-medium text-white/90">{s.name}</div>
                          <div className="font-mono text-xs text-white/40">{s.rollNumber}</div>
                        </div>
                      </div>
                      <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${attendanceStyle(s.attendancePercentage)}`}>
                        {s.attendancePercentage}%
                      </span>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-xs text-white/40">
                      <GraduationCap className="h-3.5 w-3.5" /> Sem {s.semester}
                      <Layers className="ml-2 h-3.5 w-3.5" /> Sec {s.section}
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-medium text-white/60 transition-colors hover:border-indigo-400/40 hover:text-indigo-300"
                      >
                        <Eye className="h-3.5 w-3.5" /> View
                      </button>
                      <button
                        type="button"
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-medium text-white/60 transition-colors hover:border-cyan-400/40 hover:text-cyan-300"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
      <Users className="h-8 w-8 text-white/15" />
      <p className="text-sm font-medium text-white/60">
        {hasFilters ? "No students match your filters" : "No students found"}
      </p>
      <p className="text-xs text-white/30">
        {hasFilters ? "Try a different name, roll number, semester, or section." : "Students will appear here once added."}
      </p>
    </div>
  );
}

function StudentsSkeleton() {
  return (
    <div className="min-h-screen bg-[#0a0b10] text-white">
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-6">
          <div className="h-10 w-48 rounded-lg bg-white/[0.03]" />
          <div className="h-14 rounded-2xl border border-white/10 bg-white/[0.03]" />
          <div className="space-y-2 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-12 rounded-lg bg-white/[0.03]" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}