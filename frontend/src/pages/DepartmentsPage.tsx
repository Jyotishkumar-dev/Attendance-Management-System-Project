import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { Department } from "../lib/types";
import { Plus } from "lucide-react";

export function DepartmentsPage() {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");

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
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Departments</h1>
        <p className="text-sm text-[var(--color-muted)] mt-1">Manage academic departments.</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          create.mutate();
        }}
        className="card p-5 flex flex-wrap gap-3 items-end"
      >
        <div className="flex-1 min-w-[180px]">
          <label className="label mb-1 block">Name</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Computer Science" required />
        </div>
        <div className="w-32">
          <label className="label mb-1 block">Code</label>
          <input className="input" value={code} onChange={(e) => setCode(e.target.value)} placeholder="CSE" required />
        </div>
        <button type="submit" disabled={create.isPending} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add
        </button>
      </form>

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="p-6 text-sm text-[var(--color-muted)]">Loading…</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-left text-xs text-[var(--color-muted)] uppercase tracking-wide">
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Code</th>
              </tr>
            </thead>
            <tbody>
              {data?.map((d) => (
                <tr key={d.id} className="border-b border-[var(--color-border)] last:border-0">
                  <td className="px-5 py-3 font-medium">{d.name}</td>
                  <td className="px-5 py-3 font-mono text-xs">{d.code}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
