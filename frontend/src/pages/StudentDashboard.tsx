import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import type { StudentSummary } from "../lib/types";
import { AttendanceRing } from "../components/AttendanceRing";
import { StatusBadge } from "../components/StatusBadge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function StudentDashboard() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery<StudentSummary>({
    queryKey: ["student-summary"],
    queryFn: async () => (await api.get("/attendance/me/summary")).data,
  });

  if (isLoading) return <DashboardSkeleton />;
  if (!data) return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold">Welcome back, {user?.name?.split(" ")[0]}</h1>
        <p className="text-sm text-[var(--color-muted)] mt-1">Here's how your attendance looks right now.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="card p-6 flex items-center gap-5 md:col-span-1">
          <AttendanceRing percentage={data.percentage} label="Overall" />
          <div>
            <div className="text-sm text-[var(--color-muted)]">
              {data.percentage >= 75 ? "You're in good standing." : "Below the 75% requirement."}
            </div>
          </div>
        </div>

        <div className="card p-6 grid grid-cols-3 gap-4 md:col-span-2">
          <Stat label="Present" value={data.present} tone="signal" />
          <Stat label="Absent" value={data.absent} tone="danger" />
          <Stat label="Late" value={data.late} tone="warn" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card p-6">
          <h3 className="font-display font-semibold mb-4">Subject-wise attendance</h3>
          {data.subjects.length === 0 ? (
            <EmptyState text="No attendance recorded yet." />
          ) : (
            <div style={{ width: "100%", height: 240 }}>
              <ResponsiveContainer>
                <BarChart data={data.subjects} margin={{ left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="percentage" fill="var(--color-brand)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="card p-6">
          <h3 className="font-display font-semibold mb-4">Recent activity</h3>
          {data.recent.length === 0 ? (
            <EmptyState text="Nothing recorded yet." />
          ) : (
            <ul className="space-y-3">
              {data.recent.map((r, i) => (
                <li key={i} className="flex items-center justify-between text-sm">
                  <div>
                    <div className="font-medium">{r.subject}</div>
                    <div className="text-xs text-[var(--color-muted)]">{r.date}</div>
                  </div>
                  <StatusBadge status={r.status} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: "signal" | "danger" | "warn" }) {
  const color =
    tone === "signal" ? "var(--color-signal)" : tone === "danger" ? "var(--color-danger)" : "var(--color-warn)";
  return (
    <div className="flex flex-col justify-center">
      <div className="font-display text-3xl font-semibold" style={{ color }}>
        {value}
      </div>
      <div className="text-xs text-[var(--color-muted)] mt-1">{label}</div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="text-sm text-[var(--color-muted)] py-10 text-center">{text}</div>;
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-8 w-64 bg-black/5 rounded" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="card p-6 h-40" />
        <div className="card p-6 h-40 md:col-span-2" />
      </div>
    </div>
  );
}
