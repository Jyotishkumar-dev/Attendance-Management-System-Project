import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { Department } from "../lib/types";
import { Plus } from "lucide-react";

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
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Subjects</h1>
        <p className="text-sm text-[var(--color-muted)] mt-1">Manage subjects and assign faculty.</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          create.mutate();
        }}
        className="card p-5 grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        <Field label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
        <Field label="Code" value={form.code} onChange={(v) => setForm({ ...form, code: v })} required />
        <div>
          <label className="label mb-1 block">Department</label>
          <select className="input" value={form.departmentId} onChange={(e) => setForm({ ...form, departmentId: e.target.value })} required>
            <option value="">Select…</option>
            {departments?.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label mb-1 block">Faculty</label>
          <select className="input" value={form.facultyId} onChange={(e) => setForm({ ...form, facultyId: e.target.value })}>
            <option value="">Unassigned</option>
            {facultyList?.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
        </div>
        <Field label="Semester" type="number" value={String(form.semester)} onChange={(v) => setForm({ ...form, semester: Number(v) })} />
        <Field label="Section" value={form.section} onChange={(v) => setForm({ ...form, section: v })} />
        <div className="flex items-end">
          <button type="submit" disabled={create.isPending} className="btn-primary flex items-center gap-2 w-full justify-center">
            <Plus size={16} /> Add subject
          </button>
        </div>
      </form>

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="p-6 text-sm text-[var(--color-muted)]">Loading…</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-left text-xs text-[var(--color-muted)] uppercase tracking-wide">
                <th className="px-5 py-3">Code</th>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Department</th>
                <th className="px-5 py-3">Faculty</th>
                <th className="px-5 py-3">Sem / Sec</th>
              </tr>
            </thead>
            <tbody>
              {subjects?.map((s) => (
                <tr key={s.id} className="border-b border-[var(--color-border)] last:border-0">
                  <td className="px-5 py-3 font-mono text-xs">{s.code}</td>
                  <td className="px-5 py-3 font-medium">{s.name}</td>
                  <td className="px-5 py-3">{s.department?.name}</td>
                  <td className="px-5 py-3">{s.faculty?.user?.name || "—"}</td>
                  <td className="px-5 py-3">{s.semester} / {s.section}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
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
      <label className="label mb-1 block">{label}</label>
      <input type={type} className="input" value={value} onChange={(e) => onChange(e.target.value)} required={required} />
    </div>
  );
}
