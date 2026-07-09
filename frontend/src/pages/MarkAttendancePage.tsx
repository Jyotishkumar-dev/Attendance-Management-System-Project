import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { AttendanceStatus, Subject, StudentRow } from "../lib/types";
import {
  CalendarDays,
  Clock,
  Users,
  UserCheck,
  UserX,
  Percent,
  Search,
  RotateCcw,
  Save,
  ChevronLeft,
  ChevronRight,
  Layers,
  BookOpen,
  GraduationCap,
  Building2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ClipboardList,
} from "lucide-react";

const STATUS_OPTIONS: AttendanceStatus[] = [
  "PRESENT",
  "ABSENT",
  "LATE",
  "MEDICAL_LEAVE",
  "ON_DUTY",
];

// Dark-glass status tokens. PRESENT/ABSENT map to the two states called out
// in the brief; the remaining statuses keep their own identity so no
// existing functionality is lost by collapsing them into a binary toggle.
const STATUS_STYLES: Record<AttendanceStatus, { active: string; dot: string; label: string }> = {
  PRESENT: { active: "bg-emerald-400/15 text-emerald-300 border-emerald-400/40 shadow-[0_0_0_1px_rgba(52,211,153,0.15)]", dot: "bg-emerald-400", label: "Present" },
  ABSENT: { active: "bg-rose-400/15 text-rose-300 border-rose-400/40 shadow-[0_0_0_1px_rgba(251,113,133,0.15)]", dot: "bg-rose-400", label: "Absent" },
  LATE: { active: "bg-amber-400/15 text-amber-300 border-amber-400/40 shadow-[0_0_0_1px_rgba(251,191,36,0.15)]", dot: "bg-amber-400", label: "Late" },
  MEDICAL_LEAVE: { active: "bg-sky-400/15 text-sky-300 border-sky-400/40 shadow-[0_0_0_1px_rgba(56,189,248,0.15)]", dot: "bg-sky-400", label: "Medical" },
  ON_DUTY: { active: "bg-violet-400/15 text-violet-300 border-violet-400/40 shadow-[0_0_0_1px_rgba(167,139,250,0.15)]", dot: "bg-violet-400", label: "On duty" },
  HOLIDAY: { active: "bg-gray-400/15 text-gray-300 border-gray-400/40", dot: "bg-gray-400", label: "Holiday" },
};

const PAGE_SIZE = 8;

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

// Deterministic avatar hue from the student id so the same student always
// gets the same color, without needing any new data from the backend.
function avatarHue(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 360;
  return h;
}

function useClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function ProgressRing({ percent }: { percent: number }) {
  const size = 64;
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.max(0, Math.min(100, percent)) / 100) * c;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="url(#ringGradient)"
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
        <defs>
          <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-semibold text-white tabular-nums">{Math.round(percent)}%</span>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  accent: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.25)]">
      <div className={`absolute -top-8 -right-8 h-24 w-24 rounded-full blur-2xl opacity-30 ${accent}`} />
      <div className="relative flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 ${accent.replace("bg-", "text-")}`}>
          {icon}
        </div>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-white/40">{label}</p>
          <p className="text-xl font-semibold text-white tabular-nums">{value}</p>
        </div>
      </div>
    </div>
  );
}

export function MarkAttendancePage() {
  const [params, setParams] = useSearchParams();
  const queryClient = useQueryClient();
  const today = new Date().toISOString().slice(0, 10);
  const clock = useClock();

  const [date, setDate] = useState(today);
  const [subjectId, setSubjectId] = useState(params.get("subjectId") || "");
  const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>({});
  const [saved, setSaved] = useState(false);

  // --- Presentation-only additions below: search, pagination, remarks and
  // the lecture selector are local UI state. They do not alter the
  // subject/date driven query keys, the mutation payload, or any type. ---
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [lecture, setLecture] = useState("1");
  const [remarks, setRemarks] = useState<Record<string, string>>({});

  const { data: subjects } = useQuery<Subject[]>({
    queryKey: ["my-subjects"],
    queryFn: async () => (await api.get("/faculty/me/subjects")).data,
  });

  useEffect(() => {
    if (!subjectId && subjects && subjects.length > 0) {
      setSubjectId(subjects[0].id);
    }
  }, [subjects, subjectId]);

  useEffect(() => {
    if (subjectId) setParams({ subjectId }, { replace: true });
  }, [subjectId]);

  const { data: students, isLoading: loadingStudents } = useQuery<StudentRow[]>({
    queryKey: ["students"],
    queryFn: async () => (await api.get("/students")).data,
  });

  const { data: existing } = useQuery({
    queryKey: ["attendance", subjectId, date],
    queryFn: async () =>
      (await api.get(`/attendance/subject/${subjectId}`, { params: { date } })).data,
    enabled: !!subjectId && !!date,
  });

  useEffect(() => {
    if (existing) {
      const map: Record<string, AttendanceStatus> = {};
      for (const row of existing) map[row.studentId] = row.status;
      setStatuses(map);
    } else {
      setStatuses({});
    }
  }, [existing]);

  const relevantStudents = useMemo(() => {
    const subj = subjects?.find((s) => s.id === subjectId);
    if (!subj || !students) return students || [];
    return students.filter((s) => s.semester === subj.semester && s.section === subj.section);
  }, [students, subjects, subjectId]);

  const selectedSubject = subjects?.find((s) => s.id === subjectId);

  const filteredStudents = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return relevantStudents;
    return relevantStudents.filter(
      (s) => s.name.toLowerCase().includes(q) || String(s.rollNumber).toLowerCase().includes(q)
    );
  }, [relevantStudents, search]);

  useEffect(() => {
    setPage(1);
  }, [search, subjectId, date]);

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / PAGE_SIZE));
  const pagedStudents = useMemo(
    () => filteredStudents.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filteredStudents, page]
  );

  const presentCount = relevantStudents.filter((s) => (statuses[s.id] || "PRESENT") === "PRESENT").length;
  const absentCount = relevantStudents.filter((s) => (statuses[s.id] || "PRESENT") === "ABSENT").length;
  const totalCount = relevantStudents.length;
  const attendancePct = totalCount === 0 ? 0 : (presentCount / totalCount) * 100;
  const allMarked = totalCount > 0 && Object.keys(statuses).length >= totalCount;

  const mutation = useMutation({
    mutationFn: async () => {
      const records = relevantStudents.map((s) => ({
        studentId: s.id,
        status: statuses[s.id] || "PRESENT",
      }));
      return api.post("/attendance", { subjectId, date, records });
    },
    onSuccess: () => {
      setSaved(true);
      queryClient.invalidateQueries({ queryKey: ["attendance", subjectId, date] });
      setTimeout(() => setSaved(false), 2500);
    },
  });

  function setAll(status: AttendanceStatus) {
    const next: Record<string, AttendanceStatus> = {};
    for (const s of relevantStudents) next[s.id] = status;
    setStatuses(next);
  }

  function handleCancel() {
    if (existing) {
      const map: Record<string, AttendanceStatus> = {};
      for (const row of existing) map[row.studentId] = row.status;
      setStatuses(map);
    } else {
      setStatuses({});
    }
    setRemarks({});
    setSearch("");
  }

  return (
    <div className="min-h-screen bg-[#0a0b10] bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.18),transparent)] text-white">
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <ProgressRing percent={attendancePct} />
            <div>
              <h1 className="font-display text-2xl font-semibold tracking-tight text-white">Mark attendance</h1>
              <p className="mt-1 text-sm text-white/50">
                Select a subject and date, then mark each student.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm">
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">
              <CalendarDays className="h-4 w-4 text-white/40" />
              <span className="text-white/70">
                {clock.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">
              <Clock className="h-4 w-4 text-white/40" />
              <span className="tabular-nums text-white/70">
                {clock.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </span>
            </div>
            <div
              className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${
                allMarked
                  ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                  : "border-amber-400/30 bg-amber-400/10 text-amber-300"
              }`}
            >
              {allMarked ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <span className="font-medium">{allMarked ? "All marked" : "Marking in progress"}</span>
            </div>
          </div>
        </div>

        {/* Top controls */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-white/40">
                <Building2 className="h-3 w-3" /> Department
              </label>
              <select
                className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none transition-colors focus:border-indigo-400/50"
                defaultValue="all"
              >
                <option value="all" className="bg-[#12131c]">All departments</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-white/40">
                <GraduationCap className="h-3 w-3" /> Year
              </label>
              <select
                className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none transition-colors focus:border-indigo-400/50"
                value={selectedSubject ? `Sem ${selectedSubject.semester}` : ""}
                disabled
              >
                <option className="bg-[#12131c]">{selectedSubject ? `Sem ${selectedSubject.semester}` : "—"}</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-white/40">
                <Layers className="h-3 w-3" /> Section
              </label>
              <select
                className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none transition-colors focus:border-indigo-400/50"
                value={selectedSubject ? selectedSubject.section : ""}
                disabled
              >
                <option className="bg-[#12131c]">{selectedSubject ? selectedSubject.section : "—"}</option>
              </select>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-white/40">
                <BookOpen className="h-3 w-3" /> Subject
              </label>
              <select
                className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none transition-colors focus:border-indigo-400/50"
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
              >
                {subjects?.map((s) => (
                  <option key={s.id} value={s.id} className="bg-[#12131c]">
                    {s.name} · Sem {s.semester} · Sec {s.section}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-white/40">
                <CalendarDays className="h-3 w-3" /> Date
              </label>
              <input
                type="date"
                className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none transition-colors [color-scheme:dark] focus:border-indigo-400/50"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                max={today}
              />
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-white/40">
                <ClipboardList className="h-3 w-3" /> Lecture
              </label>
              <select
                className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none transition-colors focus:border-indigo-400/50"
                value={lecture}
                onChange={(e) => setLecture(e.target.value)}
              >
                {["1", "2", "3", "4"].map((l) => (
                  <option key={l} value={l} className="bg-[#12131c]">
                    Lecture {l}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard icon={<Users className="h-5 w-5" />} label="Total students" value={totalCount} accent="bg-indigo-400" />
          <StatCard icon={<UserCheck className="h-5 w-5" />} label="Present" value={presentCount} accent="bg-emerald-400" />
          <StatCard icon={<UserX className="h-5 w-5" />} label="Absent" value={absentCount} accent="bg-rose-400" />
          <StatCard icon={<Percent className="h-5 w-5" />} label="Attendance %" value={`${Math.round(attendancePct)}%`} accent="bg-cyan-400" />
        </div>

        {/* Search + bulk actions */}
        <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              placeholder="Search by name or roll number…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/[0.04] py-2 pl-9 pr-3 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-indigo-400/50"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setAll("PRESENT")}
              className="rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-xs font-medium text-emerald-300 transition-colors hover:bg-emerald-400/20"
            >
              Mark all present
            </button>
            <button
              type="button"
              onClick={() => setAll("ABSENT")}
              className="rounded-lg border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-xs font-medium text-rose-300 transition-colors hover:bg-rose-400/20"
            >
              Mark all absent
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl">
          {loadingStudents ? (
            <div className="flex flex-col items-center justify-center gap-3 p-16 text-sm text-white/40">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-300" />
              Loading students…
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 p-16 text-center">
              <Users className="h-8 w-8 text-white/15" />
              <p className="text-sm font-medium text-white/60">
                {search ? "No students match your search" : "No students found for this subject's semester/section"}
              </p>
              <p className="text-xs text-white/30">
                {search ? "Try a different name or roll number." : "Pick a different subject or check enrollment."}
              </p>
            </div>
          ) : (
            <>
              <div className="max-h-[520px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 z-10 bg-[#0e0f18]/95 backdrop-blur-xl">
                    <tr className="border-b border-white/10 text-left text-[11px] uppercase tracking-wide text-white/40">
                      <th className="px-5 py-3 font-medium">Student</th>
                      <th className="px-5 py-3 font-medium">Roll no.</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                      <th className="px-5 py-3 font-medium">Remarks</th>
                      <th className="px-5 py-3 font-medium">Last attendance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedStudents.map((s) => {
                      const hue = avatarHue(s.id);
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
                              <span className="font-medium text-white/90">{s.name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3 font-mono text-xs text-white/50">{s.rollNumber}</td>
                          <td className="px-5 py-3">
                            <div className="flex flex-wrap gap-1.5">
                              {STATUS_OPTIONS.map((opt) => {
                                const active = (statuses[s.id] || "PRESENT") === opt;
                                const style = STATUS_STYLES[opt];
                                return (
                                  <button
                                    key={opt}
                                    type="button"
                                    onClick={() => setStatuses((prev) => ({ ...prev, [s.id]: opt }))}
                                    className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all ${
                                      active
                                        ? style.active
                                        : "border-white/10 bg-white/[0.02] text-white/40 hover:border-white/20 hover:text-white/70"
                                    }`}
                                  >
                                    <span className={`h-1.5 w-1.5 rounded-full ${active ? style.dot : "bg-white/20"}`} />
                                    {style.label}
                                  </button>
                                );
                              })}
                            </div>
                          </td>
                          <td className="px-5 py-3">
                            <input
                              type="text"
                              value={remarks[s.id] || ""}
                              onChange={(e) => setRemarks((prev) => ({ ...prev, [s.id]: e.target.value }))}
                              placeholder="Add a note…"
                              className="w-full rounded-lg border border-transparent bg-white/[0.03] px-2.5 py-1.5 text-xs text-white/70 placeholder-white/20 outline-none transition-colors focus:border-indigo-400/40 focus:bg-white/[0.06]"
                            />
                          </td>
                          <td className="px-5 py-3 text-xs text-white/30">—</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between border-t border-white/10 px-5 py-3">
                <p className="text-xs text-white/40">
                  Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredStudents.length)} of {filteredStudents.length}
                </p>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-white/50 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="px-2 text-xs tabular-nums text-white/50">
                    {page} / {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-white/50 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Bottom summary + actions */}
        <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-5 text-sm">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className="text-white/50">Present</span>
              <span className="font-semibold text-white tabular-nums">{presentCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-rose-400" />
              <span className="text-white/50">Absent</span>
              <span className="font-semibold text-white tabular-nums">{absentCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-cyan-400" />
              <span className="text-white/50">Attendance</span>
              <span className="font-semibold text-white tabular-nums">{Math.round(attendancePct)}%</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {saved && (
              <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-300">
                <CheckCircle2 className="h-4 w-4" /> Saved
              </span>
            )}
            {mutation.isError && (
              <span className="flex items-center gap-1.5 text-sm font-medium text-rose-300">
                <AlertCircle className="h-4 w-4" /> Failed to save. Try again.
              </span>
            )}
            <button
              type="button"
              onClick={handleCancel}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-medium text-white/60 transition-colors hover:bg-white/[0.07] hover:text-white"
            >
              <RotateCcw className="h-4 w-4" />
              Cancel
            </button>
            <button
              type="button"
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending || relevantStudents.length === 0}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-cyan-400 px-5 py-2 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(99,102,241,0.35)] transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
            >
              {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {mutation.isPending ? "Saving…" : "Save attendance"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
