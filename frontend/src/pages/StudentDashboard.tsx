import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import type { StudentSummary } from "../lib/types";
import { AttendanceRing } from "../components/AttendanceRing";
import { StatusBadge } from "../components/StatusBadge";
import {
  BarChart,
  Bar,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Sparkles,
  TrendingUp,
  CalendarDays,
  AlertTriangle,
  RefreshCcw,
  Printer,
  ArrowRight,
  Clock,
  CheckCircle2,
} from "lucide-react";

const LOW_ATTENDANCE_THRESHOLD = 75;

export function StudentDashboard() {
  const { user } = useAuth();
  const { data, isLoading, refetch, isFetching } = useQuery<StudentSummary>({
    queryKey: ["student-summary"],
    queryFn: async () => (await api.get("/attendance/me/summary")).data,
  });

  // --- Derived, presentation-only data. Everything below reads only from
  // the `data` already returned by /attendance/me/summary — no new
  // endpoints, no changes to StudentSummary, no new fields sent anywhere.
  const todayIso = new Date().toISOString().slice(0, 10);

  const todaysClasses = useMemo(() => {
    if (!data) return [];
    return data.recent.filter((r) => r.date === todayIso);
  }, [data, todayIso]);

  const lowAttendanceSubjects = useMemo(() => {
    if (!data) return [];
    return data.subjects.filter((s) => s.percentage < LOW_ATTENDANCE_THRESHOLD);
  }, [data]);

  // Group recent records by date to drive both the trend line and the
  // month calendar, computing a same-day presence rate from real entries.
  const dailyStats = useMemo(() => {
    if (!data) return new Map<string, { present: number; total: number }>();
    const map = new Map<string, { present: number; total: number }>();
    for (const r of data.recent) {
      const bucket = map.get(r.date) || { present: 0, total: 0 };
      bucket.total += 1;
      if (r.status === "PRESENT") bucket.present += 1;
      map.set(r.date, bucket);
    }
    return map;
  }, [data]);

  const trendData = useMemo(() => {
    return Array.from(dailyStats.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-14)
      .map(([date, { present, total }]) => ({
        date: date.slice(5),
        percentage: total > 0 ? Math.round((present / total) * 100) : 0,
      }));
  }, [dailyStats]);

  const calendarDays = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const leadingBlanks = firstDay.getDay();
    const days: { iso: string | null; day: number | null; rate: number | null }[] = [];
    for (let i = 0; i < leadingBlanks; i++) days.push({ iso: null, day: null, rate: null });
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const bucket = dailyStats.get(iso);
      days.push({
        iso,
        day: d,
        rate: bucket ? (bucket.total > 0 ? bucket.present / bucket.total : null) : null,
      });
    }
    return { days, monthLabel: now.toLocaleDateString(undefined, { month: "long", year: "numeric" }) };
  }, [dailyStats]);

  if (isLoading) return <DashboardSkeleton />;
  if (!data) return null;

  const firstName = user?.name?.split(" ")[0];
  const isLow = data.percentage < LOW_ATTENDANCE_THRESHOLD;

  return (
    <div className="min-h-screen bg-[#0a0b10] bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.18),transparent)] text-white">
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome banner */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
          <div className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-indigo-300">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-semibold tracking-tight text-white">
                  Welcome back{firstName ? `, ${firstName}` : ""}
                </h1>
                <p className="mt-1 text-sm text-white/50">Here's how your attendance looks right now.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white/60">
              <CalendarDays className="h-4 w-4 text-white/40" />
              {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
            </div>
          </div>
        </div>

        {/* Low attendance alert */}
        {isLow && (
          <div className="flex items-start gap-3 rounded-2xl border border-rose-400/30 bg-rose-400/10 p-4 backdrop-blur-xl">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-300" />
            <div>
              <p className="text-sm font-semibold text-rose-200">
                Your overall attendance is {Math.round(data.percentage)}%, below the {LOW_ATTENDANCE_THRESHOLD}% requirement.
              </p>
              {lowAttendanceSubjects.length > 0 && (
                <p className="mt-1 text-xs text-rose-200/70">
                  Falling short in: {lowAttendanceSubjects.map((s) => s.name).join(", ")}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Top row: ring + stats + today's classes */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <div className="flex items-center gap-5 rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl md:col-span-1">
            <AttendanceRing percentage={data.percentage} label="Overall" />
            <div>
              <div className={`text-sm font-medium ${isLow ? "text-rose-300" : "text-emerald-300"}`}>
                {isLow ? "Below the 75% requirement." : "You're in good standing."}
              </div>
              <div className="mt-1 flex items-center gap-1 text-xs text-white/40">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {data.present} of {data.present + data.absent + data.late} sessions attended
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl md:col-span-2">
            <Stat label="Present" value={data.present} tone="emerald" />
            <Stat label="Absent" value={data.absent} tone="rose" />
            <Stat label="Late" value={data.late} tone="amber" />
          </div>
        </div>

        {/* Today's classes + quick actions */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl lg:col-span-2">
            <div className="mb-4 flex items-center gap-2">
              <Clock className="h-4 w-4 text-white/40" />
              <h3 className="font-display font-semibold text-white">Today's classes</h3>
            </div>
            {todaysClasses.length === 0 ? (
              <EmptyState text="No classes recorded for today yet." />
            ) : (
              <ul className="space-y-2.5">
                {todaysClasses.map((r, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 transition-colors hover:bg-white/[0.05]"
                  >
                    <span className="text-sm font-medium text-white/80">{r.subject}</span>
                    <StatusBadge status={r.status} />
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
            <h3 className="mb-4 font-display font-semibold text-white">Quick actions</h3>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => refetch()}
                disabled={isFetching}
                className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/[0.07] hover:text-white disabled:opacity-50"
              >
                <span className="flex items-center gap-2">
                  <RefreshCcw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
                  Refresh data
                </span>
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/[0.07] hover:text-white"
              >
                <span className="flex items-center gap-2">
                  <Printer className="h-4 w-4" />
                  Print summary
                </span>
              </button>
              <a
                href="#subject-wise"
                className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-gradient-to-r from-indigo-500/20 to-cyan-400/20 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:from-indigo-500/30 hover:to-cyan-400/30"
              >
                <span className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  View full breakdown
                </span>
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Subject-wise + trend */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div id="subject-wise" className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
            <h3 className="mb-4 font-display font-semibold text-white">Subject-wise attendance</h3>
            {data.subjects.length === 0 ? (
              <EmptyState text="No attendance recorded yet." />
            ) : (
              <div style={{ width: "100%", height: 240 }}>
                <ResponsiveContainer>
                  <BarChart data={data.subjects} margin={{ left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: "rgba(255,255,255,0.4)" }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "rgba(255,255,255,0.4)" }} />
                    <Tooltip
                      contentStyle={{
                        background: "#12131c",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 10,
                        color: "#fff",
                      }}
                    />
                    <Bar dataKey="percentage" radius={[6, 6, 0, 0]}>
                      {data.subjects.map((s, i) => (
                        <Cell
                          key={i}
                          fill={s.percentage < LOW_ATTENDANCE_THRESHOLD ? "#fb7185" : "#818cf8"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-white/40" />
              <h3 className="font-display font-semibold text-white">Attendance trend</h3>
            </div>
            {trendData.length === 0 ? (
              <EmptyState text="Not enough history to chart a trend yet." />
            ) : (
              <div style={{ width: "100%", height: 240 }}>
                <ResponsiveContainer>
                  <LineChart data={trendData} margin={{ left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                    <XAxis dataKey="date" tick={{ fontSize: 12, fill: "rgba(255,255,255,0.4)" }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "rgba(255,255,255,0.4)" }} />
                    <Tooltip
                      contentStyle={{
                        background: "#12131c",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 10,
                        color: "#fff",
                      }}
                    />
                    <Line type="monotone" dataKey="percentage" stroke="#22d3ee" strokeWidth={2.5} dot={{ r: 3, fill: "#22d3ee" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Calendar + recent */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display font-semibold text-white">Attendance calendar</h3>
              <span className="text-xs text-white/40">{calendarDays.monthLabel}</span>
            </div>
            <div className="grid grid-cols-7 gap-1.5 text-center">
              {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                <div key={i} className="text-[10px] font-medium text-white/30">
                  {d}
                </div>
              ))}
              {calendarDays.days.map((cell, i) =>
                cell.day === null ? (
                  <div key={i} />
                ) : (
                  <div
                    key={i}
                    title={cell.rate === null ? "No record" : `${Math.round(cell.rate * 100)}% present`}
                    className={`flex aspect-square items-center justify-center rounded-lg text-[11px] font-medium ${
                      cell.iso === todayIso
                        ? "ring-1 ring-cyan-300"
                        : ""
                    } ${
                      cell.rate === null
                        ? "bg-white/[0.03] text-white/25"
                        : cell.rate >= 0.75
                        ? "bg-emerald-400/20 text-emerald-300"
                        : cell.rate > 0
                        ? "bg-amber-400/20 text-amber-300"
                        : "bg-rose-400/20 text-rose-300"
                    }`}
                  >
                    {cell.day}
                  </div>
                )
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
            <h3 className="mb-4 font-display font-semibold text-white">Recent activity</h3>
            {data.recent.length === 0 ? (
              <EmptyState text="Nothing recorded yet." />
            ) : (
              <ul className="space-y-2.5">
                {data.recent.map((r, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 transition-colors hover:bg-white/[0.05]"
                  >
                    <div>
                      <div className="text-sm font-medium text-white/80">{r.subject}</div>
                      <div className="text-xs text-white/35">{r.date}</div>
                    </div>
                    <StatusBadge status={r.status} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: "emerald" | "rose" | "amber" }) {
  const styles = {
    emerald: "text-emerald-300",
    rose: "text-rose-300",
    amber: "text-amber-300",
  }[tone];
  return (
    <div className="flex flex-col justify-center">
      <div className={`font-display text-3xl font-semibold tabular-nums ${styles}`}>{value}</div>
      <div className="mt-1 text-xs text-white/40">{label}</div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="py-10 text-center text-sm text-white/30">{text}</div>;
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-[#0a0b10] text-white">
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-6">
          <div className="h-24 rounded-2xl border border-white/10 bg-white/[0.03]" />
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <div className="h-40 rounded-2xl border border-white/10 bg-white/[0.03] md:col-span-1" />
            <div className="h-40 rounded-2xl border border-white/10 bg-white/[0.03] md:col-span-2" />
          </div>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div className="h-64 rounded-2xl border border-white/10 bg-white/[0.03]" />
            <div className="h-64 rounded-2xl border border-white/10 bg-white/[0.03]" />
          </div>
        </div>
      </div>
    </div>
  );
}