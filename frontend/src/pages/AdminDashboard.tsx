import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import type { AdminOverview } from "../lib/types";
import { AttendanceRing } from "../components/AttendanceRing";
import {
  Users,
  GraduationCap,
  TrendingUp,
  Building2,
  BookOpen,
  FileBarChart,
  UserPlus,
  ClipboardCheck,
  FolderPlus,
  Server,
  Database,
  ShieldCheck,
  Wifi,
} from "lucide-react";

export function AdminDashboard() {
  const { data, isLoading } = useQuery<AdminOverview>({
    queryKey: ["admin-overview"],
    queryFn: async () => (await api.get("/attendance/analytics/overview")).data,
  });

  const today = useMemo(
    () => new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" }),
    []
  );

  if (isLoading || !data) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="relative min-h-full">
      {/* Animated gradient background */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[#09090B]">
        <div className="absolute -top-32 -left-24 h-96 w-96 rounded-full bg-indigo-600/25 blur-3xl animate-[pulse_9s_ease-in-out_infinite]" />
        <div className="absolute top-1/3 -right-24 h-[26rem] w-[26rem] rounded-full bg-emerald-500/20 blur-3xl animate-[pulse_11s_ease-in-out_infinite]" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-cyan-500/15 blur-3xl animate-[pulse_13s_ease-in-out_infinite]" />
      </div>

      <div className="space-y-8">
        {/* Hero */}
        <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl p-6 sm:p-8 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
          <div className="pointer-events-none absolute -top-10 -right-10 h-48 w-48 rounded-full bg-gradient-to-br from-indigo-500/30 to-cyan-400/20 blur-3xl" />
          <div className="relative">
            <div className="text-xs font-medium text-white/40 mb-2">{today}</div>
            <h1 className="font-display text-3xl font-semibold text-white">Institution overview</h1>
            <p className="text-sm text-white/50 mt-2">Live snapshot across all departments.</p>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <MetricCard
            icon={GraduationCap}
            gradient="from-indigo-500 to-indigo-300"
            label="Total Students"
            value={data.totalStudents}
          />
          <MetricCard
            icon={Users}
            gradient="from-emerald-500 to-emerald-300"
            label="Total Faculty"
            value={data.totalFaculty}
          />
          <MetricCard
            icon={TrendingUp}
            gradient="from-cyan-500 to-cyan-300"
            label="Marked Today"
            value={data.todayMarked}
          />
          <div className="group rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl p-5 flex items-center gap-4 shadow-[0_8px_30px_rgba(0,0,0,0.35)] transition-all duration-300 hover:-translate-y-1 hover:border-white/20">
            <AttendanceRing percentage={data.overallAttendancePercentage} size={72} />
            <div>
              <div className="text-xs text-white/40">Overall attendance</div>
              <div className="text-xs text-white/40 mt-0.5">All time</div>
            </div>
          </div>
        </div>

        {/* Today's attendance analytics */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
          <div className="flex items-start justify-between flex-wrap gap-3 mb-5">
            <div>
              <h3 className="font-display font-semibold text-white">Today's attendance</h3>
              <p className="text-sm text-white/45 mt-1">
                {data.todayAttendancePercentage}% of {data.todayMarked} marked records today.
              </p>
            </div>
            <span className="font-display text-2xl font-semibold bg-gradient-to-r from-indigo-300 to-emerald-300 bg-clip-text text-transparent">
              {data.todayAttendancePercentage}%
            </span>
          </div>
          <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 transition-all duration-700"
              style={{ width: `${Math.min(data.todayAttendancePercentage, 100)}%` }}
            />
          </div>
          <p className="text-xs text-white/30 mt-3">
            {data.todayAttendancePercentage >= 75
              ? "Attendance today is tracking within a healthy range."
              : "Attendance today is below the typical 75% benchmark."}
          </p>
        </div>

        {/* Quick actions */}
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-white/40 mb-3">Quick actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <QuickAction to="/students" icon={GraduationCap} label="Manage Students" />
            <QuickAction to="/faculty" icon={Users} label="Manage Faculty" />
            <QuickAction icon={FileBarChart} label="Attendance Reports" disabled />
            <QuickAction to="/departments" icon={Building2} label="Departments" />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          {/* Recent activity — placeholder, no activity feed API yet */}
          <div className="xl:col-span-2 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-white">Recent activity</h3>
              <span className="text-[10px] font-semibold uppercase tracking-wide text-white/30 border border-white/10 rounded-full px-2 py-0.5">
                Preview
              </span>
            </div>
            <ul className="space-y-2">
              <ActivityRow icon={UserPlus} text="New student registered" sub="Computer Science · 2h ago" tone="indigo" />
              <ActivityRow icon={ClipboardCheck} text="Faculty updated attendance" sub="Operating Systems · 4h ago" tone="emerald" />
              <ActivityRow icon={FolderPlus} text="Department created" sub="Electronics · 1d ago" tone="cyan" />
              <ActivityRow icon={BookOpen} text="New subject added" sub="Data Structures · 2d ago" tone="indigo" />
            </ul>
          </div>

          {/* System status */}
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
            <h3 className="font-display font-semibold text-white mb-4">System status</h3>
            <div className="space-y-3">
              <StatusRow icon={Server} label="Backend Connected" />
              <StatusRow icon={Database} label="Database Connected" />
              <StatusRow icon={ShieldCheck} label="Authentication Active" />
              <StatusRow icon={Wifi} label="API Running" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Reusable components                                                */
/* ------------------------------------------------------------------ */

function MetricCard({
  icon: Icon,
  gradient,
  label,
  value,
}: {
  icon: any;
  gradient: string;
  label: string;
  value: number;
}) {
  return (
    <div className="group rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.35)] transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:border-white/20">
      <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg mb-4`}>
        <Icon size={19} className="text-[#09090B]" />
      </div>
      <div className="font-display text-2xl font-semibold text-white">{value}</div>
      <div className="text-xs text-white/45 mt-1">{label}</div>
    </div>
  );
}

function QuickAction({
  to,
  icon: Icon,
  label,
  disabled,
}: {
  to?: string;
  icon: any;
  label: string;
  disabled?: boolean;
}) {
  const content = (
    <div
      className={`group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl p-4 shadow-[0_8px_30px_rgba(0,0,0,0.35)] transition-all duration-300 ${
        disabled
          ? "opacity-50 cursor-not-allowed"
          : "hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.08] cursor-pointer"
      }`}
    >
      <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-indigo-500/20 to-cyan-400/20 border border-white/10 flex items-center justify-center">
        <Icon size={17} className="text-indigo-300" />
      </div>
      <div className="text-sm font-semibold text-white">{label}</div>
    </div>
  );

  if (disabled || !to) return content;
  return <Link to={to}>{content}</Link>;
}

function ActivityRow({
  icon: Icon,
  text,
  sub,
  tone,
}: {
  icon: any;
  text: string;
  sub: string;
  tone: "indigo" | "emerald" | "cyan";
}) {
  const tones: Record<string, string> = {
    indigo: "from-indigo-500/20 to-indigo-400/10 text-indigo-300",
    emerald: "from-emerald-500/20 to-emerald-400/10 text-emerald-300",
    cyan: "from-cyan-500/20 to-cyan-400/10 text-cyan-300",
  };
  return (
    <li className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-white/[0.03] transition-colors">
      <div className={`h-9 w-9 shrink-0 rounded-lg bg-gradient-to-br ${tones[tone]} border border-white/10 flex items-center justify-center`}>
        <Icon size={15} />
      </div>
      <div className="min-w-0">
        <div className="text-sm text-white truncate">{text}</div>
        <div className="text-xs text-white/35 mt-0.5">{sub}</div>
      </div>
    </li>
  );
}

function StatusRow({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-3.5 py-2.5">
      <div className="flex items-center gap-2.5">
        <Icon size={15} className="text-white/40" />
        <span className="text-sm text-white/70">{label}</span>
      </div>
      <span className="flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-[11px] font-semibold text-emerald-300">Online</span>
      </span>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="min-h-full bg-[#09090B] -m-6 sm:-m-8 p-6 sm:p-8">
      <div className="space-y-8 animate-pulse">
        <div className="h-28 rounded-2xl border border-white/10 bg-white/5" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div className="h-28 rounded-2xl border border-white/10 bg-white/5" />
          <div className="h-28 rounded-2xl border border-white/10 bg-white/5" />
          <div className="h-28 rounded-2xl border border-white/10 bg-white/5" />
          <div className="h-28 rounded-2xl border border-white/10 bg-white/5" />
        </div>
        <div className="h-32 rounded-2xl border border-white/10 bg-white/5" />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="h-16 rounded-2xl border border-white/10 bg-white/5" />
          <div className="h-16 rounded-2xl border border-white/10 bg-white/5" />
          <div className="h-16 rounded-2xl border border-white/10 bg-white/5" />
          <div className="h-16 rounded-2xl border border-white/10 bg-white/5" />
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <div className="xl:col-span-2 h-64 rounded-2xl border border-white/10 bg-white/5" />
          <div className="h-64 rounded-2xl border border-white/10 bg-white/5" />
        </div>
      </div>
    </div>
  );
}