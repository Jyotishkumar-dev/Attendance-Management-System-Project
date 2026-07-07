import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { Department, StudentRow } from "../lib/types";
import { Plus } from "lucide-react";

export function StudentsPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    departmentId: "",
    rollNumber: "",
    semester: 1,
    section: "A",
  });

  const { data: departments } = useQuery<Department[]>({
    queryKey: ["departments"],
    queryFn: async () => (await api.get("/departments")).data,
  });

  const { data: students, isLoading } = useQuery<StudentRow[]>({
    queryKey: ["students"],
    queryFn: async () => (await api.get("/students")).data,
  });

  const create = useMutation({
    mutationFn: async () => api.post("/students", form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["students"] });
      setForm({ name: "", email: "", password: "", departmentId: "", rollNumber: "", semester: 1, section: "A" });
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Students</h1>
        <p className="text-sm text-[var(--color-muted)] mt-1">Manage student accounts and enrollment.</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          create.mutate();
        }}
        className="card p-5 grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        <Field label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
        <Field label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
        <Field label="Password" type="password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} required />
        <Field label="Roll No." value={form.rollNumber} onChange={(v) => setForm({ ...form, rollNumber: v })} required />
        <div>
          <label className="label mb-1 block">Department</label>
          <select
            className="input"
            value={form.departmentId}
            onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
            required
          >
            <option value="">Select…</option>
            {departments?.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
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
        <div className="flex items-end">
          <button type="submit" disabled={create.isPending} className="btn-primary flex items-center gap-2 w-full justify-center">
            <Plus size={16} /> Add student
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
                <th className="px-5 py-3">Roll No.</th>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Department</th>
                <th className="px-5 py-3">Sem / Sec</th>
              </tr>
            </thead>
            <tbody>
              {students?.map((s) => (
                <tr key={s.id} className="border-b border-[var(--color-border)] last:border-0">
                  <td className="px-5 py-3 font-mono text-xs">{s.rollNumber}</td>
                  <td className="px-5 py-3 font-medium">{s.name}</td>
                  <td className="px-5 py-3 text-[var(--color-muted)]">{s.email}</td>
                  <td className="px-5 py-3">{s.department}</td>
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
      <input
        type={type}
        className="input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      />
    </div>
  );
}
