import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import type { Subject } from "../lib/types";
import { Link } from "react-router-dom";
import { CalendarCheck } from "lucide-react";

export function FacultyDashboard() {
  const { user } = useAuth();
  const { data: subjects, isLoading } = useQuery<Subject[]>({
    queryKey: ["my-subjects"],
    queryFn: async () => (await api.get("/faculty/me/subjects")).data,
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold">Welcome, {user?.name}</h1>
        <p className="text-sm text-[var(--color-muted)] mt-1">
          Today's classes and quick access to attendance marking.
        </p>
      </div>

      <div className="card p-6">
        <h3 className="font-display font-semibold mb-4">Your subjects</h3>
        {isLoading ? (
          <div className="text-sm text-[var(--color-muted)]">Loading…</div>
        ) : !subjects || subjects.length === 0 ? (
          <div className="text-sm text-[var(--color-muted)] py-6 text-center">
            No subjects assigned yet. Contact your administrator.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subjects.map((s) => (
              <div key={s.id} className="border border-[var(--color-border)] rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium">{s.name}</div>
                  <div className="text-xs text-[var(--color-muted)] mt-0.5">
                    {s.code} · Semester {s.semester} · Section {s.section}
                  </div>
                </div>
                <Link
                  to={`/mark-attendance?subjectId=${s.id}`}
                  className="btn-ghost flex items-center gap-2 text-sm"
                >
                  <CalendarCheck size={16} /> Mark
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
