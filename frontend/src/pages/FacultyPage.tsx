import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { Department } from "../lib/types";
import { Plus } from "lucide-react";

interface FacultyRow {
  id: string;
  name: string;
  email: string;
  designation: string;
  department?: string;
}

export function FacultyPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    departmentId: "",
    designation: "Assistant Professor",
  });

  const { data: departments } = useQuery<Department[]>({
    queryKey: ["departments"],
    queryFn: async () => (await api.get("/departments")).data,
  });

  const { data: faculty, isLoading } = useQuery<FacultyRow[]>({
    queryKey: ["faculty"],
    queryFn: async () => (await api.get("/faculty")).data,
  });

  const create = useMutation({
    mutationFn: async () => api.post("/faculty", form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["faculty"] });
      setForm({ name: "", email: "", password: "", departmentId: "", designation: "Assistant Professor" });
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Faculty</h1>
        <p className="text-sm text-[var(--color-muted)] mt-1">Manage faculty accounts.</p>
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
        <Field label="Designation" value={form.designation} onChange={(v) => setForm({ ...form, designation: v })} />
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
        <div className="flex items-end">
          <button type="submit" disabled={create.isPending} className="btn-primary flex items-center gap-2 w-full justify-center">
            <Plus size={16} /> Add faculty
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
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Designation</th>
                <th className="px-5 py-3">Department</th>
              </tr>
            </thead>
            <tbody>
              {faculty?.map((f) => (
                <tr key={f.id} className="border-b border-[var(--color-border)] last:border-0">
                  <td className="px-5 py-3 font-medium">{f.name}</td>
                  <td className="px-5 py-3 text-[var(--color-muted)]">{f.email}</td>
                  <td className="px-5 py-3">{f.designation}</td>
                  <td className="px-5 py-3">{f.department}</td>
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
