import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { AttendanceStatus, Subject, StudentRow } from "../lib/types";

const STATUS_OPTIONS: AttendanceStatus[] = [
  "PRESENT",
  "ABSENT",
  "LATE",
  "MEDICAL_LEAVE",
  "ON_DUTY",
];

const STATUS_COLORS: Record<AttendanceStatus, string> = {
  PRESENT: "bg-[var(--color-signal)] text-white border-[var(--color-signal)]",
  ABSENT: "bg-[var(--color-danger)] text-white border-[var(--color-danger)]",
  LATE: "bg-[var(--color-warn)] text-white border-[var(--color-warn)]",
  MEDICAL_LEAVE: "bg-sky-600 text-white border-sky-600",
  ON_DUTY: "bg-violet-600 text-white border-violet-600",
  HOLIDAY: "bg-gray-400 text-white border-gray-400",
};

export function MarkAttendancePage() {
  const [params, setParams] = useSearchParams();
  const queryClient = useQueryClient();
  const today = new Date().toISOString().slice(0, 10);

  const [date, setDate] = useState(today);
  const [subjectId, setSubjectId] = useState(params.get("subjectId") || "");
  const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>({});
  const [saved, setSaved] = useState(false);

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Mark attendance</h1>
        <p className="text-sm text-[var(--color-muted)] mt-1">
          Select a subject and date, then mark each student.
        </p>
      </div>

      <div className="card p-5 flex flex-wrap gap-4 items-end">
        <div className="min-w-[220px]">
          <label className="label mb-1 block">Subject</label>
          <select className="input" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
            {subjects?.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} · Sem {s.semester} · Sec {s.section}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label mb-1 block">Date</label>
          <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} max={today} />
        </div>

        <div className="flex-1" />

        <div className="flex gap-2">
          {STATUS_OPTIONS.slice(0, 2).map((s) => (
            <button
              key={s}
              onClick={() => setAll(s)}
              className="btn-ghost text-xs"
              type="button"
            >
              Mark all {s === "PRESENT" ? "present" : "absent"}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        {loadingStudents ? (
          <div className="p-8 text-sm text-[var(--color-muted)]">Loading students…</div>
        ) : relevantStudents.length === 0 ? (
          <div className="p-8 text-sm text-[var(--color-muted)] text-center">
            No students found for this subject's semester/section.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-left text-xs text-[var(--color-muted)] uppercase tracking-wide">
                <th className="px-5 py-3">Roll No.</th>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {relevantStudents.map((s) => (
                <tr key={s.id} className="border-b border-[var(--color-border)] last:border-0">
                  <td className="px-5 py-3 font-mono text-xs">{s.rollNumber}</td>
                  <td className="px-5 py-3 font-medium">{s.name}</td>
                  <td className="px-5 py-3">
                    <div className="flex gap-1.5 flex-wrap">
                      {STATUS_OPTIONS.map((opt) => {
                        const active = (statuses[s.id] || "PRESENT") === opt;
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setStatuses((prev) => ({ ...prev, [s.id]: opt }))}
                            className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-colors ${
                              active
                                ? STATUS_COLORS[opt]
                                : "bg-white text-[var(--color-muted)] border-[var(--color-border)] hover:bg-[var(--color-paper)]"
                            }`}
                          >
                            {opt.replace("_", " ")}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending || relevantStudents.length === 0}
          className="btn-primary"
        >
          {mutation.isPending ? "Saving…" : "Save attendance"}
        </button>
        {saved && <span className="text-sm text-[var(--color-signal)] font-medium">Saved ✓</span>}
        {mutation.isError && (
          <span className="text-sm text-[var(--color-danger)]">Failed to save. Try again.</span>
        )}
      </div>
    </div>
  );
}
