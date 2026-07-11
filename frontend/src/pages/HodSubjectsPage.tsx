import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Eye,
  Pencil,
  Trash2,
  BookOpen,
  CheckCircle2,
  Users,
  TrendingUp,
  ChevronDown,
  Plus,
  GraduationCap,
  Layers,
} from "lucide-react";

interface PlaceholderSubject {
  id: string;
  name: string;
  code: string;
  semester: number;
  section: string;
  facultyName: string;
  attendancePercentage: number;
  status: "Active" | "Inactive";
}

const INITIAL_SUBJECTS: PlaceholderSubject[] = [
  { id: "1", name: "Data Structures", code: "CS201", semester: 3, section: "A", facultyName: "Dr. Anil Kapoor", attendancePercentage: 88, status: "Active" },
  { id: "2", name: "Database Systems", code: "CS202", semester: 3, section: "A", facultyName: "Dr. Sunita Rao", attendancePercentage: 76, status: "Active" },
  { id: "3", name: "Operating Systems", code: "CS301", semester: 5, section: "B", facultyName: "Rahul Khanna", attendancePercentage: 64, status: "Active" },
  { id: "4", name: "Computer Networks", code: "CS302", semester: 5, section: "B", facultyName: "Dr. Sameer Iqbal", attendancePercentage: 91, status: "Active" },
  { id: "5", name: "Digital Electronics", code: "EC201", semester: 3, section: "A", facultyName: "Neha Joshi", attendancePercentage: 58, status: "Inactive" },
  { id: "6", name: "Machine Learning", code: "CS401", semester: 7, section: "A", facultyName: "Dr. Anil Kapoor", attendancePercentage: 82, status: "Active" },
  { id: "7", name: "Thermodynamics", code: "ME201", semester: 3, section: "B", facultyName: "Dr. Vikas Malhotra", attendancePercentage: 70, status: "Active" },
  { id: "8", name: "Compiler Design", code: "CS402", semester: 7, section: "B", facultyName: "Kavita Desai", attendancePercentage: 45, status: "Inactive" },
];

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

function statusStyle(status: PlaceholderSubject["status"]) {
  return status === "Active"
    ? "bg-emerald-400/15 text-emerald-300 border-emerald-400/30"
    : "bg-white/10 text-white/40 border-white/15";
}

export function HodSubjectsPage() {
  // Simulated loading only — this page has no real data source yet.
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const id = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(id);
  }, []);

  // Local, in-memory only. Delete just removes the row from this array —
  // nothing is persisted or sent anywhere.
  const [subjects, setSubjects] = useState<PlaceholderSubject[]>(INITIAL_SUBJECTS);
  const [search, setSearch] = useState("");
  const [semester, setSemester] = useState<string>("all");
  const [section, setSection] = useState<string>("all");

  const semesters = useMemo(() => Array.from(new Set(subjects.map((s) => s.semester))).sort((a, b) => a - b), [subjects]);
  const sections = useMemo(() => Array.from(new Set(subjects.map((s) => s.section))).sort(), [subjects]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return subjects.filter((s) => {
      const matchesQuery = !q || s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q);
      const matchesSemester = semester === "all" || s.semester === Number(semester);
      const matchesSection = section === "all" || s.section === section;
      return matchesQuery && matchesSemester && matchesSection;
    });
  }, [subjects, search, semester, section]);

  const totalCount = subjects.length;
  const activeCount = subjects.filter((s) => s.status === "Active").length;
  const assignedFacultyCount = useMemo(() => new Set(subjects.map((s) => s.facultyName)).size, [subjects]);
  const avgAttendance = totalCount === 0 ? 0 : subjects.reduce((sum, s) => sum + s.attendancePercentage, 0) / totalCount;

  const hasAnySubjects = totalCount > 0;

  function handleDelete(id: string) {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
  }

  if (loading) return <SubjectsSkeleton />;

  return (
    <div className="min-h-screen bg-[#0a0b10] bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.18),transparent)] text-white">
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-white">Subjects</h1>
            <p className="mt-1 text-sm text-white/50">Manage subjects offered across your department.</p>
          </div>
          <button
            type="button"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(99,102,241,0.35)] transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            Add subject
          </button>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard icon={<BookOpen className="h-5 w-5" />} label="Total subjects" value={totalCount} gradient="from-indigo-500/25 to-indigo-500/0" iconAccent="text-indigo-300" delay={0} />
          <StatCard icon={<CheckCircle2 className="h-5 w-5" />} label="Active subjects" value={activeCount} gradient="from-emerald-500/25 to-emerald-500/0" iconAccent="text-emerald-300" delay={0.05} />
          <StatCard icon={<Users className="h-5 w-5" />} label="Assigned faculty" value={assignedFacultyCount} gradient="from-violet-500/25 to-violet-500/0" iconAccent="text-violet-300" delay={0.1} />
          <StatCard icon={<TrendingUp className="h-5 w-5" />} label="Avg. attendance" value={`${avgAttendance.toFixed(1)}%`} gradient="from-cyan-500/25 to-cyan-500/0" iconAccent="text-cyan-300" delay={0.15} />
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl sm:flex-row sm:items-center"
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by subject name or code…"
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
        </motion.div>

        {/* Results */}
        {!hasAnySubjects ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl">
            <EmptyState text="No subjects yet. Add your first subject to get started." icon={<BookOpen className="h-8 w-8 text-white/15" />} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl">
            <EmptyState text="No subjects match your filters. Try a different name, code, semester, or section." icon={<Search className="h-8 w-8 text-white/15" />} />
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl md:block">
              <table className="w-full text-sm">
                <thead className="bg-[#0e0f18]/80">
                  <tr className="border-b border-white/10 text-left text-[11px] uppercase tracking-wide text-white/40">
                    <th className="px-5 py-3 font-medium">Subject</th>
                    <th className="px-5 py-3 font-medium">Sem / Section</th>
                    <th className="px-5 py-3 font-medium">Faculty</th>
                    <th className="px-5 py-3 font-medium">Attendance</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence initial={false}>
                    {filtered.map((s, i) => {
                      const hue = hueFromSeed(s.id);
                      return (
                        <motion.tr
                          key={s.id}
                          layout
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.25, delay: i * 0.03 }}
                          className="group border-b border-white/[0.06] transition-colors last:border-0 hover:bg-white/[0.03]"
                        >
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              <div
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-semibold text-white"
                                style={{ backgroundColor: `hsl(${hue} 65% 40%)` }}
                              >
                                {s.code.slice(0, 2)}
                              </div>
                              <div>
                                <div className="font-medium text-white/90">{s.name}</div>
                                <div className="font-mono text-xs text-white/35">{s.code}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-white/60">
                            Sem {s.semester} · Sec {s.section}
                          </td>
                          <td className="px-5 py-3 text-white/60">{s.facultyName}</td>
                          <td className="px-5 py-3">
                            <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${attendanceStyle(s.attendancePercentage)}`}>
                              {s.attendancePercentage}%
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${statusStyle(s.status)}`}>
                              {s.status}
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex items-center justify-end gap-2">
                              <ActionButton icon={<Eye className="h-3.5 w-3.5" />} label="View" hoverAccent="hover:border-indigo-400/40 hover:text-indigo-300" />
                              <ActionButton icon={<Pencil className="h-3.5 w-3.5" />} label="Edit" hoverAccent="hover:border-cyan-400/40 hover:text-cyan-300" />
                              <ActionButton
                                icon={<Trash2 className="h-3.5 w-3.5" />}
                                label="Delete"
                                hoverAccent="hover:border-rose-400/40 hover:text-rose-300"
                                onClick={() => handleDelete(s.id)}
                              />
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="space-y-3 md:hidden">
              <AnimatePresence initial={false}>
                {filtered.map((s, i) => {
                  const hue = hueFromSeed(s.id);
                  return (
                    <motion.div
                      key={s.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.25, delay: i * 0.03 }}
                      className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-semibold text-white"
                            style={{ backgroundColor: `hsl(${hue} 65% 40%)` }}
                          >
                            {s.code.slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-medium text-white/90">{s.name}</div>
                            <div className="font-mono text-xs text-white/40">{s.code}</div>
                          </div>
                        </div>
                        <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${statusStyle(s.status)}`}>
                          {s.status}
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-white/40">
                        <span className="flex items-center gap-1.5">
                          <GraduationCap className="h-3.5 w-3.5" /> Sem {s.semester}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Layers className="h-3.5 w-3.5" /> Sec {s.section}
                        </span>
                        <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${attendanceStyle(s.attendancePercentage)}`}>
                          {s.attendancePercentage}% attendance
                        </span>
                      </div>
                      <div className="mt-2 text-xs text-white/40">{s.facultyName}</div>
                      <div className="mt-3 flex gap-2">
                        <ActionButton icon={<Eye className="h-3.5 w-3.5" />} label="View" hoverAccent="hover:border-indigo-400/40 hover:text-indigo-300" fill />
                        <ActionButton icon={<Pencil className="h-3.5 w-3.5" />} label="Edit" hoverAccent="hover:border-cyan-400/40 hover:text-cyan-300" fill />
                        <ActionButton
                          icon={<Trash2 className="h-3.5 w-3.5" />}
                          label="Delete"
                          hoverAccent="hover:border-rose-400/40 hover:text-rose-300"
                          onClick={() => handleDelete(s.id)}
                          fill
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  gradient,
  iconAccent,
  delay,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  gradient: string;
  iconAccent: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -3 }}
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.25)]"
    >
      <div className={`absolute -top-8 -right-8 h-24 w-24 rounded-full bg-gradient-to-br ${gradient} blur-2xl`} />
      <div className="relative flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 ${iconAccent}`}>{icon}</div>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-white/40">{label}</p>
          <p className="text-xl font-semibold text-white tabular-nums">{value}</p>
        </div>
      </div>
    </motion.div>
  );
}

function ActionButton({
  icon,
  label,
  hoverAccent,
  onClick,
  fill,
}: {
  icon: React.ReactNode;
  label: string;
  hoverAccent: string;
  onClick?: () => void;
  fill?: boolean;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      className={`flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-white/60 transition-colors ${hoverAccent} ${fill ? "flex-1 py-2" : ""}`}
    >
      {icon}
      {label}
    </motion.button>
  );
}

function EmptyState({ text, icon }: { text: string; icon: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
      {icon}
      <p className="max-w-sm text-sm text-white/40">{text}</p>
    </div>
  );
}

function SubjectsSkeleton() {
  return (
    <div className="min-h-screen bg-[#0a0b10] text-white">
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-6">
          <div className="flex items-center justify-between">
            <div className="h-8 w-40 rounded-lg bg-white/[0.03]" />
            <div className="h-10 w-32 rounded-xl bg-white/[0.03]" />
          </div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 rounded-2xl border border-white/10 bg-white/[0.03]" />
            ))}
          </div>
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