import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { AdminOverview } from "../lib/types";
import { AttendanceRing } from "../components/AttendanceRing";
import { Users, GraduationCap, TrendingUp } from "lucide-react";

export function AdminDashboard() {
  const { data, isLoading } = useQuery<AdminOverview>({
    queryKey: ["admin-overview"],
    queryFn: async () => (await api.get("/attendance/analytics/overview")).data,
  });

  if (isLoading || !data) {
    return <div className="text-sm text-[var(--color-muted)]">Loading…</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold">Institution overview</h1>
        <p className="text-sm text-[var(--color-muted)] mt-1">Live snapshot across all departments.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <MetricCard icon={GraduationCap} label="Total Students" value={data.totalStudents} />
        <MetricCard icon={Users} label="Total Faculty" value={data.totalFaculty} />
        <MetricCard icon={TrendingUp} label="Marked Today" value={data.todayMarked} />
        <div className="card p-5 flex items-center gap-4">
          <AttendanceRing percentage={data.overallAttendancePercentage} size={72} />
          <div>
            <div className="text-xs text-[var(--color-muted)]">Overall attendance</div>
            <div className="text-xs text-[var(--color-muted)] mt-0.5">All time</div>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="font-display font-semibold mb-1">Today's attendance</h3>
        <p className="text-sm text-[var(--color-muted)] mb-5">
          {data.todayAttendancePercentage}% of {data.todayMarked} marked records today.
        </p>
        <div className="w-full h-3 bg-[var(--color-paper)] rounded-full overflow-hidden border border-[var(--color-border)]">
          <div
            className="h-full bg-[var(--color-brand)] transition-all"
            style={{ width: `${Math.min(data.todayAttendancePercentage, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value }: { icon: any; label: string; value: number }) {
  return (
    <div className="card p-5">
      <div className="w-9 h-9 rounded-lg bg-[var(--color-brand-light)] flex items-center justify-center mb-3">
        <Icon size={18} className="text-[var(--color-brand)]" />
      </div>
      <div className="font-display text-2xl font-semibold">{value}</div>
      <div className="text-xs text-[var(--color-muted)] mt-0.5">{label}</div>
    </div>
  );
}
