import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Eye,
  Pencil,
  Trash2,
  Users,
  UserCheck,
  UserX,
  BookOpen,
  ChevronDown,
  Plus,
  Building2,
} from "lucide-react";

interface PlaceholderFaculty {
  id: string;
  name: string;
  email: string;
  designation: string;
  department: string;
  subjectsAssigned: number;
  status: "Active" | "Inactive";
}

const INITIAL_FACULTY: PlaceholderFaculty[] = [
  { id: "1", name: "Dr. Anil Kapoor", email: "anil.kapoor@smartattend.dev", designation: "Professor", department: "Computer Science", subjectsAssigned: 3, status: "Active" },
  { id: "2", name: "Dr. Sunita Rao", email: "sunita.rao@smartattend.dev", designation: "Associate Professor", department: "Computer Science", subjectsAssigned: 4, status: "Active" },
  { id: "3", name: "Rahul Khanna", email: "rahul.khanna@smartattend.dev", designation: "Assistant Professor", department: "Electronics", subjectsAssigned: 2, status: "Active" },
  { id: "4", name: "Neha Joshi", email: "neha.joshi@smartattend.dev", designation: "Assistant Professor", department: "Computer Science", subjectsAssigned: 3, status: "Inactive" },
  { id: "5", name: "Dr. Vikas Malhotra", email: "vikas.malhotra@smartattend.dev", designation: "Professor", department: "Mechanical", subjectsAssigned: 2, status: "Active" },
  { id: "6", name: "Pooja Bhatt", email: "pooja.bhatt@smartattend.dev", designation: "Assistant Professor", department: "Electronics", subjectsAssigned: 1, status: "Inactive" },
  { id: "7", name: "Dr. Sameer Iqbal", email: "sameer.iqbal@smartattend.dev", designation: "Associate Professor", department: "Computer Science", subjectsAssigned: 5, status: "Active" },
  { id: "8", name: "Kavita Desai", email: "kavita.desai@smartattend.dev", designation: "Assistant Professor", department: "Mechanical", subjectsAssigned: 2, status: "Active" },
];

function initials(name: string) {
  return name
    .replace(/^Dr\.\s*/i, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

function hueFromSeed(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 360;
  return h;
}

function statusStyle(status: PlaceholderFaculty["status"]) {
  return status === "Active"
    ? "bg-emerald-400/15 text-emerald-300 border-emerald-400/30"
    : "bg-white/10 text-white/40 border-white/15";
}

export function HodFacultyPage() {
  // Simulated loading only — this page has no real data source yet.
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const id = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(id);
  }, []);

  // Local, in-memory only. Delete just removes the row from this array —
  // nothing is persisted or sent anywhere.
  const [faculty, setFaculty] = useState<PlaceholderFaculty[]>(INITIAL_FACULTY);
  const [search, setSearch] = useState("");
  const [designation, setDesignation] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");

  const designations = useMemo(() => Array.from(new Set(faculty.map((f) => f.designation))), [faculty]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return faculty.filter((f) => {
      const matchesQuery = !q || f.name.toLowerCase().includes(q) || f.email.toLowerCase().includes(q);
      const matchesDesignation = designation === "all" || f.designation === designation;
      const matchesStatus = status === "all" || f.status === status;
      return matchesQuery && matchesDesignation && matchesStatus;
    });
  }, [faculty, search, designation, status]);

  const totalCount = faculty.length;
  const activeCount = faculty.filter((f) => f.status === "Active").length;
  const inactiveCount = totalCount - activeCount;
  const avgSubjects = totalCount === 0 ? 0 : faculty.reduce((sum, f) => sum + f.subjectsAssigned, 0) / totalCount;

  const hasAnyFaculty = totalCount > 0;
  const hasFilters = search !== "" || designation !== "all" || status !== "all";

  function handleDelete(id: string) {
    setFaculty((prev) => prev.filter((f) => f.id !== id));
  }

  if (loading) return <FacultySkeleton />;

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
            <h1 className="font-display text-2xl font-semibold tracking-tight text-white">Faculty</h1>
            <p className="mt-1 text-sm text-white/50">Manage faculty members across your department.</p>
          </div>
          <button
            type="button"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(99,102,241,0.35)] transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            Add faculty
          </button>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard icon={<Users className="h-5 w-5" />} label="Total faculty" value={totalCount} gradient="from-indigo-500/25 to-indigo-500/0" iconAccent="text-indigo-300" delay={0} />
          <StatCard icon={<UserCheck className="h-5 w-5" />} label="Active faculty" value={activeCount} gradient="from-emerald-500/25 to-emerald-500/0" iconAccent="text-emerald-300" delay={0.05} />
          <StatCard icon={<UserX className="h-5 w-5" />} label="Inactive faculty" value={inactiveCount} gradient="from-rose-500/25 to-rose-500/0" iconAccent="text-rose-300" delay={0.1} />
          <StatCard icon={<BookOpen className="h-5 w-5" />} label="Avg. subjects / faculty" value={avgSubjects.toFixed(1)} gradient="from-cyan-500/25 to-cyan-500/0" iconAccent="text-cyan-300" delay={0.15} />
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
              placeholder="Search by name or email…"
              className="w-full rounded-lg border border-white/10 bg-white/[0.04] py-2 pl-9 pr-3 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-indigo-400/50"
            />
          </div>

          <div className="flex gap-3">
            <div className="relative">
              <select
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className="appearance-none rounded-lg border border-white/10 bg-white/[0.04] py-2 pl-3 pr-8 text-sm text-white outline-none transition-colors focus:border-indigo-400/50"
              >
                <option value="all" className="bg-[#12131c]">All designations</option>
                {designations.map((d) => (
                  <option key={d} value={d} className="bg-[#12131c]">{d}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30" />
            </div>

            <div className="relative">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="appearance-none rounded-lg border border-white/10 bg-white/[0.04] py-2 pl-3 pr-8 text-sm text-white outline-none transition-colors focus:border-indigo-400/50"
              >
                <option value="all" className="bg-[#12131c]">All statuses</option>
                <option value="Active" className="bg-[#12131c]">Active</option>
                <option value="Inactive" className="bg-[#12131c]">Inactive</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30" />
            </div>
          </div>
        </motion.div>

        {/* Results */}
        {!hasAnyFaculty ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl">
            <EmptyState text="No faculty members yet. Add your first faculty member to get started." icon={<Users className="h-8 w-8 text-white/15" />} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl">
            <EmptyState text="No faculty match your filters. Try a different name, email, designation, or status." icon={<Search className="h-8 w-8 text-white/15" />} />
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl md:block">
              <table className="w-full text-sm">
                <thead className="bg-[#0e0f18]/80">
                  <tr className="border-b border-white/10 text-left text-[11px] uppercase tracking-wide text-white/40">
                    <th className="px-5 py-3 font-medium">Faculty</th>
                    <th className="px-5 py-3 font-medium">Designation</th>
                    <th className="px-5 py-3 font-medium">Department</th>
                    <th className="px-5 py-3 font-medium">Subjects</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence initial={false}>
                    {filtered.map((f, i) => {
                      const hue = hueFromSeed(f.id);
                      return (
                        <motion.tr
                          key={f.id}
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
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                                style={{ backgroundColor: `hsl(${hue} 65% 40%)` }}
                              >
                                {initials(f.name)}
                              </div>
                              <div>
                                <div className="font-medium text-white/90">{f.name}</div>
                                <div className="text-xs text-white/35">{f.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-white/60">{f.designation}</td>
                          <td className="px-5 py-3 text-white/60">
                            <span className="flex items-center gap-1.5">
                              <Building2 className="h-3.5 w-3.5 text-white/30" />
                              {f.department}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-white/60">{f.subjectsAssigned}</td>
                          <td className="px-5 py-3">
                            <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${statusStyle(f.status)}`}>
                              {f.status}
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
                                onClick={() => handleDelete(f.id)}
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
                {filtered.map((f, i) => {
                  const hue = hueFromSeed(f.id);
                  return (
                    <motion.div
                      key={f.id}
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
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                            style={{ backgroundColor: `hsl(${hue} 65% 40%)` }}
                          >
                            {initials(f.name)}
                          </div>
                          <div>
                            <div className="font-medium text-white/90">{f.name}</div>
                            <div className="text-xs text-white/40">{f.designation}</div>
                          </div>
                        </div>
                        <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${statusStyle(f.status)}`}>
                          {f.status}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center gap-4 text-xs text-white/40">
                        <span className="flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5" /> {f.department}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <BookOpen className="h-3.5 w-3.5" /> {f.subjectsAssigned} subjects
                        </span>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <ActionButton icon={<Eye className="h-3.5 w-3.5" />} label="View" hoverAccent="hover:border-indigo-400/40 hover:text-indigo-300" fill />
                        <ActionButton icon={<Pencil className="h-3.5 w-3.5" />} label="Edit" hoverAccent="hover:border-cyan-400/40 hover:text-cyan-300" fill />
                        <ActionButton
                          icon={<Trash2 className="h-3.5 w-3.5" />}
                          label="Delete"
                          hoverAccent="hover:border-rose-400/40 hover:text-rose-300"
                          onClick={() => handleDelete(f.id)}
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

function FacultySkeleton() {
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