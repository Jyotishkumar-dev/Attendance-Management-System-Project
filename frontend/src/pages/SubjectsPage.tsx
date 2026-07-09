import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { Department } from "../lib/types";
import {
  Plus,
  Search,
  ChevronDown,
  BookOpen,
  Building2,
  Layers,
  GraduationCap,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  PackageOpen,
  X,
  SlidersHorizontal,
} from "lucide-react";

interface SubjectRow {
  id: string;
  name: string;
  code: string;
  semester: number;
  section: string;
  department?: { name: string };
  faculty?: { user: { name: string } } | null;
}

interface FacultyOption {
  id: string;
  name: string;
}

const PAGE_SIZE = 6;

/**
 * NOTE: "Credits" and "Status" are not part of the current backend schema
 * (SubjectRow has no `credits` field, and there is no active/inactive flag).
 * To satisfy the visual spec without inventing backend state:
 *  - Credits is a deterministic, UI-only placeholder derived from the subject id
 *    (stable across renders, NOT persisted or sent to the API).
 *  - Status is derived honestly from real data: whether a faculty member is
 *    assigned to the subject ("Assigned" / "Unassigned"), rather than a fake flag.
 * If you want real credits tracked, add a `credits` column to the `subjects`
 * table and expose it from GET /subjects — happy to wire that up.
 */
function placeholderCredits(id: string): number {
  const sum = id.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return 2 + (sum % 3); // 2–4
}

export function SubjectsPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    name: "",
    code: "",
    departmentId: "",
    facultyId: "",
    semester: 1,
    section: "A",
  });

  const { data: departments } = useQuery<Department[]>({
    queryKey: ["departments"],
    queryFn: async () => (await api.get("/departments")).data,
  });

  const { data: facultyList } = useQuery<FacultyOption[]>({
    queryKey: ["faculty"],
    queryFn: async () => (await api.get("/faculty")).data,
  });

  const { data: subjects, isLoading } = useQuery<SubjectRow[]>({
    queryKey: ["subjects"],
    queryFn: async () => (await api.get("/subjects")).data,
  });

  const create = useMutation({
    mutationFn: async () =>
      api.post("/subjects", {
        ...form,
        facultyId: form.facultyId || undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subjects"] });
      setForm({ name: "", code: "", departmentId: "", facultyId: "", semester: 1, section: "A" });
      setShowAddForm(false);
    },
  });

  // --- UI-only state (search / filter / pagination / add-panel toggle) ---
  const [showAddForm, setShowAddForm] = useState(false);
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("");
  const [page, setPage] = useState(1);

  const semesterOptions = useMemo(() => {
    const set = new Set((subjects || []).map((s) => s.semester));
    return Array.from(set).sort((a, b) => a - b);
  }, [subjects]);

  const filtered = useMemo(() => {
    return (subjects || []).filter((s) => {
      const matchesSearch =
        !search ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.code.toLowerCase().includes(search.toLowerCase());
      const matchesDept = !departmentFilter || s.department?.name === departmentFilter;
      const matchesSem = !semesterFilter || String(s.semester) === semesterFilter;
      return matchesSearch && matchesDept && matchesSem;
    });
  }, [subjects, search, departmentFilter, semesterFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const totalSubjects = subjects?.length || 0;
  const activeSubjects = (subjects || []).filter((s) => !!s.faculty).length;
  const departmentsCovered = new Set((subjects || []).map((s) => s.department?.name).filter(Boolean)).size;
  const totalCredits = (subjects || []).reduce((sum, s) => sum + placeholderCredits(s.id), 0);

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
          <h1 className="font-display text-2xl font-semibold text-white">Subjects</h1>
          <p className="text-sm text-white/40 mt-1">Manage subjects and assign faculty.</p>
        </div>
        <button
          onClick={() => setShowAddForm((v) => !v)}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-emerald-400 px-4 py-2.5 text-sm font-semibold text-[#0a0a0f] transition hover:opacity-90"
        >
          {showAddForm ? <X size={16} /> : <Plus size={16} />}
          {showAddForm ? "Close" : "Add Subject"}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Subjects" value={String(totalSubjects)} icon={BookOpen} tone="indigo" />
        <StatCard label="Active Subjects" value={String(activeSubjects)} icon={GraduationCap} tone="emerald" />
        <StatCard label="Departments Covered" value={String(departmentsCovered)} icon={Building2} tone="amber" />
        <StatCard label="Total Credits" value={String(totalCredits)} icon={Layers} tone="indigo" />
      </div>

      {/* Add subject panel — same form fields & submit handler as before, restyled */}
      {showAddForm && (
        <GlassCard className="p-5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              create.mutate();
            }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
          >
            <Field label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
            <Field label="Code" value={form.code} onChange={(v) => setForm({ ...form, code: v })} required />
            <div>
              <label className="text-xs font-semibold text-white/60 mb-1.5 block">Department</label>
              <select
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-indigo-400/50 focus:bg-white/10 focus:ring-2 focus:ring-indigo-400/20"
                value={form.departmentId}
                onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
                required
              >
                <option value="" className="bg-[#12131a]">Select…</option>
                {departments?.map((d) => (
                  <option key={d.id} value={d.id} className="bg-[#12131a]">{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-white/60 mb-1.5 block">Faculty</label>
              <select
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-indigo-400/50 focus:bg-white/10 focus:ring-2 focus:ring-indigo-400/20"
                value={form.facultyId}
                onChange={(e) => setForm({ ...form, facultyId: e.target.value })}
              >
                <option value="" className="bg-[#12131a]">Unassigned</option>
                {facultyList?.map((f) => (
                  <option key={f.id} value={f.id} className="bg-[#12131a]">{f.name}</option>
                ))}
              </select>
            </div>
            <Field
              label="Semester"
              type="number"
              value={String(form.semester)}
              onChange={(v) => setForm({ ...form, semester: Number(v) })}
            />
            <Field label="Section" value={form.section} onChange={(v) => setForm({ ...form, section: v })} />
            <div className="flex items-end sm:col-span-2 lg:col-span-2">
              <button
                type="submit"
                disabled={create.isPending}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-emerald-400 px-4 py-2.5 text-sm font-semibold text-[#0a0a0f] transition hover:opacity-90 disabled:opacity-50"
              >
                <Plus size={16} /> {create.isPending ? "Adding…" : "Add subject"}
              </button>
            </div>
          </form>
        </GlassCard>
      )}

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
              placeholder="Search by name or code…"
              className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/30 outline-none transition focus:border-indigo-400/50 focus:bg-white/10 focus:ring-2 focus:ring-indigo-400/20"
            />
          </div>
          <Dropdown
            label="All Departments"
            value={departmentFilter}
            options={(departments || []).map((d) => d.name)}
            onChange={updateFilter(setDepartmentFilter)}
          />
          <Dropdown
            label="All Semesters"
            value={semesterFilter}
            options={semesterOptions.map((s) => String(s))}
            onChange={updateFilter(setSemesterFilter)}
            format={(v) => `Semester ${v}`}
          />
          <button className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors">
            <SlidersHorizontal size={14} /> More filters
          </button>
        </div>
      </GlassCard>

      {/* Table */}
      <GlassCard className="overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-sm text-white/40 text-center">Loading…</div>
        ) : paginated.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[920px]">
              <thead className="sticky top-0 z-10 bg-[#12131a]/95 backdrop-blur-xl">
                <tr className="text-left text-[11px] uppercase tracking-wide text-white/30 border-b border-white/10">
                  <th className="px-5 py-3.5 font-medium">Code</th>
                  <th className="px-5 py-3.5 font-medium">Name</th>
                  <th className="px-5 py-3.5 font-medium">Department</th>
                  <th className="px-5 py-3.5 font-medium">Semester</th>
                  <th className="px-5 py-3.5 font-medium">Credits</th>
                  <th className="px-5 py-3.5 font-medium">Faculty Assigned</th>
                  <th className="px-5 py-3.5 font-medium">Status</th>
                  <th className="px-5 py-3.5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((s) => (
                  <tr key={s.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.03] transition-colors group">
                    <td className="px-5 py-3.5 font-mono text-xs text-white/50">{s.code}</td>
                    <td className="px-5 py-3.5 font-medium text-white">{s.name}</td>
                    <td className="px-5 py-3.5 text-white/60">{s.department?.name || "—"}</td>
                    <td className="px-5 py-3.5 text-white/60">
                      {s.semester} / {s.section}
                    </td>
                    <td className="px-5 py-3.5 text-white/60">{placeholderCredits(s.id)}</td>
                    <td className="px-5 py-3.5 text-white/60">{s.faculty?.user?.name || "—"}</td>
                    <td className="px-5 py-3.5">
                      <StatusBadge assigned={!!s.faculty} />
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
        {!isLoading && filtered.length > 0 && (
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

function StatusBadge({ assigned }: { assigned: boolean }) {
  return assigned ? (
    <span className="inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-400/10 text-emerald-300">
      Assigned
    </span>
  ) : (
    <span className="inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full bg-amber-400/10 text-amber-300">
      Unassigned
    </span>
  );
}

function Dropdown({
  label,
  value,
  options,
  onChange,
  format,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  format?: (v: string) => string;
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
            {format ? format(o) : o}
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
        <PackageOpen size={22} className="text-white/30" />
      </div>
      <div className="text-sm font-semibold text-white/70">No subjects found</div>
      <p className="text-xs text-white/40 mt-1.5 max-w-xs">
        Try adjusting your search or filters, or add a new subject to get started.
      </p>
    </div>
  );
}

function IconButton({ icon: Icon, tone = "default" }: { icon: any; tone?: "default" | "danger" }) {
  return (
    <button
      type="button"
      className={`h-8 w-8 rounded-lg flex items-center justify-center border border-white/10 bg-white/5 transition-colors ${
        tone === "danger" ? "text-white/40 hover:text-rose-300 hover:bg-rose-400/10" : "text-white/40 hover:text-white hover:bg-white/10"
      }`}
    >
      <Icon size={14} />
    </button>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-white/60 mb-1.5 block">{label}</label>
      <input
        type={type}
        className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder-white/30 outline-none transition focus:border-indigo-400/50 focus:bg-white/10 focus:ring-2 focus:ring-indigo-400/20"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      />
    </div>
  );
}