import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { Department } from "../lib/types";
import {
  Plus,
  Search,
  Building2,
  Users2,
  GraduationCap,
  CheckCircle2,
  Eye,
  Pencil,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Inbox,
  AlertTriangle,
  LayoutGrid,
  List as ListIcon,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
// The backend contract for Department only guarantees { id, name, code }.
// The extra fields below are displayed opportunistically if the API returns
// them, and fall back gracefully to "—" / 0 / "active" if it doesn't, so this
// component works today and keeps working if the backend adds them later.
type DepartmentUI = Department & {
  hod?: string;
  totalStudents?: number;
  totalFaculty?: number;
  status?: "active" | "inactive";
};

const PAGE_SIZE = 8;

// ---------------------------------------------------------------------------
// Small reusable pieces
// ---------------------------------------------------------------------------
function StatCard({
  icon: Icon,
  label,
  value,
  gradient,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string | number;
  gradient: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:bg-white/[0.06]">
      <div
        className={`absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-20 blur-2xl transition-opacity duration-300 group-hover:opacity-30 ${gradient}`}
      />
      <div className="relative flex items-center gap-4">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
          <Icon size={20} className="text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
          <p className="mt-0.5 font-display text-2xl font-semibold text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: "active" | "inactive" }) {
  const active = status === "active";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
        active
          ? "bg-emerald-400/10 text-emerald-300 ring-1 ring-inset ring-emerald-400/20"
          : "bg-slate-400/10 text-slate-400 ring-1 ring-inset ring-slate-400/20"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-emerald-400" : "bg-slate-500"}`} />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function IconButton({
  icon: Icon,
  label,
  onClick,
  tone = "default",
}: {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  onClick: () => void;
  tone?: "default" | "danger";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-300 transition-all duration-200 hover:scale-105 hover:border-white/20 ${
        tone === "danger" ? "hover:bg-rose-500/10 hover:text-rose-300" : "hover:bg-white/[0.08] hover:text-white"
      }`}
    >
      <Icon size={14} />
    </button>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#05070d]/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#0b0f1a]/95 p-6 shadow-2xl backdrop-blur-xl">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export function DepartmentsPage() {
  const qc = useQueryClient();

  // create form state (existing logic, preserved)
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // edit state
  const [editing, setEditing] = useState<DepartmentUI | null>(null);
  const [editName, setEditName] = useState("");
  const [editCode, setEditCode] = useState("");

  // view / delete state
  const [viewing, setViewing] = useState<DepartmentUI | null>(null);
  const [deleting, setDeleting] = useState<DepartmentUI | null>(null);

  // ui state
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [layout, setLayout] = useState<"table" | "cards">("table");

  const { data, isLoading } = useQuery<Department[]>({
    queryKey: ["departments"],
    queryFn: async () => (await api.get("/departments")).data,
  });

  const create = useMutation({
    mutationFn: async () => api.post("/departments", { name, code }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["departments"] });
      setName("");
      setCode("");
      setShowAddModal(false);
    },
  });

  const update = useMutation({
    mutationFn: async (vars: { id: string | number; name: string; code: string }) =>
      api.patch(`/departments/${vars.id}`, { name: vars.name, code: vars.code }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["departments"] });
      setEditing(null);
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string | number) => api.delete(`/departments/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["departments"] });
      setDeleting(null);
    },
  });

  const departments = (data ?? []) as DepartmentUI[];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return departments;
    return departments.filter(
      (d) => d.name.toLowerCase().includes(q) || d.code.toLowerCase().includes(q)
    );
  }, [departments, search]);

  const stats = useMemo(() => {
    const totalStudents = departments.reduce((sum, d) => sum + (d.totalStudents ?? 0), 0);
    const totalFaculty = departments.reduce((sum, d) => sum + (d.totalFaculty ?? 0), 0);
    const activeCount = departments.filter((d) => (d.status ?? "active") === "active").length;
    return {
      total: departments.length,
      totalStudents,
      totalFaculty,
      activeCount,
    };
  }, [departments]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function onSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  function openEdit(d: DepartmentUI) {
    setEditing(d);
    setEditName(d.name);
    setEditCode(d.code);
  }

  return (
    <div className="relative min-h-screen bg-[#05070d] text-slate-100">
      {/* Ambient background signature: soft network glow + faint blueprint grid */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 right-0 h-96 w-96 rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute -bottom-32 left-0 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Department Management
            </h1>
            <p className="mt-1 text-sm text-slate-400">Manage academic departments, staffing, and status.</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search by name or code..."
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2.5 pl-9 pr-4 text-sm text-white placeholder:text-slate-500 backdrop-blur-xl transition-colors focus:border-indigo-400/50 focus:outline-none focus:ring-2 focus:ring-indigo-400/20 sm:w-64"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-500/20 transition-all duration-200 hover:shadow-indigo-500/40 hover:brightness-110 active:scale-95"
            >
              <Plus size={16} /> Add Department
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Building2} label="Total Departments" value={stats.total} gradient="from-indigo-500 to-violet-500" />
          <StatCard icon={Users2} label="Total Students" value={stats.totalStudents} gradient="from-cyan-500 to-blue-500" />
          <StatCard icon={GraduationCap} label="Total Faculty" value={stats.totalFaculty} gradient="from-fuchsia-500 to-pink-500" />
          <StatCard icon={CheckCircle2} label="Active Departments" value={stats.activeCount} gradient="from-emerald-500 to-teal-500" />
        </div>

        {/* Content panel */}
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              {filtered.length} department{filtered.length === 1 ? "" : "s"}
            </p>
            <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] p-1">
              <button
                onClick={() => setLayout("table")}
                aria-label="Table view"
                className={`rounded-md p-1.5 transition-colors ${
                  layout === "table" ? "bg-white/10 text-white" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <ListIcon size={14} />
              </button>
              <button
                onClick={() => setLayout("cards")}
                aria-label="Card view"
                className={`rounded-md p-1.5 transition-colors ${
                  layout === "cards" ? "bg-white/10 text-white" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <LayoutGrid size={14} />
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center gap-2 px-6 py-16 text-sm text-slate-400">
              <Loader2 size={16} className="animate-spin" /> Loading departments...
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5">
                <Inbox size={22} className="text-slate-500" />
              </div>
              <p className="font-display text-base font-medium text-white">
                {search ? "No departments match your search" : "No departments yet"}
              </p>
              <p className="max-w-xs text-sm text-slate-400">
                {search
                  ? "Try a different name or code, or clear the search."
                  : "Add your first department to start organizing students and faculty."}
              </p>
              {!search && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="mt-2 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-500/20 transition-all hover:brightness-110"
                >
                  <Plus size={16} /> Add Department
                </button>
              )}
            </div>
          ) : layout === "table" ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-5 py-3 font-medium">Department</th>
                    <th className="px-5 py-3 font-medium">Code</th>
                    <th className="px-5 py-3 font-medium">HOD</th>
                    <th className="px-5 py-3 font-medium">Students</th>
                    <th className="px-5 py-3 font-medium">Faculty</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((d) => (
                    <tr
                      key={d.id}
                      className="border-b border-white/5 transition-colors last:border-0 hover:bg-white/[0.03]"
                    >
                      <td className="px-5 py-3 font-medium text-white">{d.name}</td>
                      <td className="px-5 py-3">
                        <span className="rounded-md bg-white/5 px-2 py-0.5 font-mono text-xs text-slate-300">
                          {d.code}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-300">{d.hod ?? "—"}</td>
                      <td className="px-5 py-3 text-slate-300">{d.totalStudents ?? "—"}</td>
                      <td className="px-5 py-3 text-slate-300">{d.totalFaculty ?? "—"}</td>
                      <td className="px-5 py-3">
                        <StatusPill status={d.status ?? "active"} />
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <IconButton icon={Eye} label="View department" onClick={() => setViewing(d)} />
                          <IconButton icon={Pencil} label="Edit department" onClick={() => openEdit(d)} />
                          <IconButton icon={Trash2} label="Delete department" tone="danger" onClick={() => setDeleting(d)} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
              {paged.map((d) => (
                <div
                  key={d.id}
                  className="group rounded-xl border border-white/10 bg-white/[0.03] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.05]"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-display font-semibold text-white">{d.name}</p>
                      <span className="mt-1 inline-block rounded-md bg-white/5 px-2 py-0.5 font-mono text-xs text-slate-300">
                        {d.code}
                      </span>
                    </div>
                    <StatusPill status={d.status ?? "active"} />
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500">HOD</p>
                      <p className="mt-0.5 text-slate-200">{d.hod ?? "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500">Students</p>
                      <p className="mt-0.5 text-slate-200">{d.totalStudents ?? "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500">Faculty</p>
                      <p className="mt-0.5 text-slate-200">{d.totalFaculty ?? "—"}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-1.5 border-t border-white/5 pt-3">
                    <IconButton icon={Eye} label="View department" onClick={() => setViewing(d)} />
                    <IconButton icon={Pencil} label="Edit department" onClick={() => openEdit(d)} />
                    <IconButton icon={Trash2} label="Delete department" tone="danger" onClick={() => setDeleting(d)} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {filtered.length > 0 && (
            <div className="flex items-center justify-between border-t border-white/10 px-5 py-3">
              <p className="text-xs text-slate-500">
                Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} of{" "}
                {filtered.length}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-slate-300 transition-colors hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="px-3 text-xs text-slate-400">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-slate-300 transition-colors hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent"
                  aria-label="Next page"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Department modal */}
      {showAddModal && (
        <Modal title="Add Department" onClose={() => setShowAddModal(false)}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              create.mutate();
            }}
            className="space-y-4"
          >
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-400">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Computer Science"
                required
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-indigo-400/50 focus:outline-none focus:ring-2 focus:ring-indigo-400/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-400">Code</label>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="CSE"
                required
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-indigo-400/50 focus:outline-none focus:ring-2 focus:ring-indigo-400/20"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300 transition-colors hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={create.isPending}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-500/20 transition-all hover:brightness-110 disabled:opacity-60"
              >
                {create.isPending && <Loader2 size={14} className="animate-spin" />}
                Add Department
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Department modal */}
      {editing && (
        <Modal title="Edit Department" onClose={() => setEditing(null)}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              update.mutate({ id: editing.id, name: editName, code: editCode });
            }}
            className="space-y-4"
          >
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-400">Name</label>
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white focus:border-indigo-400/50 focus:outline-none focus:ring-2 focus:ring-indigo-400/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-400">Code</label>
              <input
                value={editCode}
                onChange={(e) => setEditCode(e.target.value)}
                required
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white focus:border-indigo-400/50 focus:outline-none focus:ring-2 focus:ring-indigo-400/20"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300 transition-colors hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={update.isPending}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-500/20 transition-all hover:brightness-110 disabled:opacity-60"
              >
                {update.isPending && <Loader2 size={14} className="animate-spin" />}
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* View Department modal */}
      {viewing && (
        <Modal title="Department Details" onClose={() => setViewing(null)}>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="text-slate-400">Name</span>
              <span className="font-medium text-white">{viewing.name}</span>
            </div>
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="text-slate-400">Code</span>
              <span className="font-mono text-slate-200">{viewing.code}</span>
            </div>
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="text-slate-400">HOD</span>
              <span className="text-slate-200">{viewing.hod ?? "—"}</span>
            </div>
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="text-slate-400">Students</span>
              <span className="text-slate-200">{viewing.totalStudents ?? "—"}</span>
            </div>
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="text-slate-400">Faculty</span>
              <span className="text-slate-200">{viewing.totalFaculty ?? "—"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Status</span>
              <StatusPill status={viewing.status ?? "active"} />
            </div>
          </div>
        </Modal>
      )}

      {/* Delete confirmation modal */}
      {deleting && (
        <Modal title="Delete Department" onClose={() => setDeleting(null)}>
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-xl border border-rose-400/20 bg-rose-500/10 p-3">
              <AlertTriangle size={18} className="mt-0.5 shrink-0 text-rose-300" />
              <p className="text-sm text-rose-100">
                This will permanently remove <span className="font-medium">{deleting.name}</span> ({deleting.code}).
                This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleting(null)}
                className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300 transition-colors hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={() => remove.mutate(deleting.id)}
                disabled={remove.isPending}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-rose-500/20 transition-all hover:brightness-110 disabled:opacity-60"
              >
                {remove.isPending && <Loader2 size={14} className="animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
