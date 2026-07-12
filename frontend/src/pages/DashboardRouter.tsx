
import type { ReactNode } from "react";
import {
  Users,
  UserCheck,
  UserX,
  TrendingUp,
  TrendingDown,
  CalendarDays,
  BarChart3,
  Sparkles,
  ArrowRight,
  Clock,
  CalendarCheck,
  FileText,
  Bell,
  Settings2,
  Dot,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

/* ------------------------------------------------------------------ */
/*  Static placeholder data — no backend calls in this view           */
/* ------------------------------------------------------------------ */

const STATS = [
  {
    label: "Total Students",
    value: "1,284",
    delta: "+4.2%",
    trend: "up" as const,
    icon: Users,
  },
  {
    label: "Average Attendance",
    value: "87.3%",
    delta: "+1.8%",
    trend: "up" as const,
    icon: TrendingUp,
  },
  {
    label: "Present Today",
    value: "1,096",
    delta: "-2.1%",
    trend: "down" as const,
    icon: UserCheck,
  },
  {
    label: "Absent Today",
    value: "188",
    delta: "+0.6%",
    trend: "down" as const,
    icon: UserX,
  },
];

const TREND = [62, 74, 68, 81, 77, 85, 90, 83, 88, 92, 86, 94];
const TREND_LABELS = ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8", "W9", "W10", "W11", "W12"];

const CALENDAR_DAYS = Array.from({ length: 30 }, (_, i) => {
  const day = i + 1;
  const level = [0, 1, 2, 3][(day * 7) % 4]; // deterministic placeholder pattern
  return { day, level };
});

type RecentRow = {
  student: string;
  subject: string;
  status: "PRESENT" | "ABSENT" | "LATE";
  time: string;
};

const RECENT: RecentRow[] = [
  { student: "Ananya Rao", subject: "Data Structures", status: "PRESENT", time: "09:02 AM" },
  { student: "Rohit Mehta", subject: "Operating Systems", status: "LATE", time: "10:14 AM" },
  { student: "Sara Khan", subject: "Data Structures", status: "PRESENT", time: "09:01 AM" },
  { student: "Devansh Iyer", subject: "Computer Networks", status: "ABSENT", time: "—" },
  { student: "Priya Nair", subject: "Operating Systems", status: "PRESENT", time: "10:03 AM" },
];

const QUICK_ACTIONS = [
  { label: "Mark Attendance", desc: "Open today's class list", icon: CalendarCheck },
  { label: "View Reports", desc: "Weekly & monthly summaries", icon: FileText },
  { label: "Manage Students", desc: "Add, edit, or remove records", icon: Users },
  { label: "Notifications", desc: "Send an announcement", icon: Bell },
];

const INSIGHTS = [
  "Attendance dipped 6% on Fridays over the last month — consider reviewing the Friday schedule.",
  "Section B's Operating Systems class has the lowest average attendance this semester.",
  "3 students are within 2% of falling below the 75% eligibility threshold.",
];

/* ------------------------------------------------------------------ */
/*  Reusable components                                                */
/* ------------------------------------------------------------------ */

function GlassCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.35)] transition-all duration-300 hover:border-white/20 hover:bg-white/[0.06] ${className}`}
    >
      {children}
    </div>
  );
}

function SectionHeading({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-5">
      <div>
        <h3 className="font-display text-base font-semibold text-white">{title}</h3>
        {subtitle && <p className="text-xs text-white/40 mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

function StatCard({
  label,
  value,
  delta,
  trend,
  icon: Icon,
}: {
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down";
  icon: any;
}) {
  const positive = trend === "up";
  return (
    <GlassCard className="p-5 group cursor-default hover:-translate-y-0.5">
      <div className="flex items-center justify-between mb-4">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-emerald-400/20 border border-white/10 flex items-center justify-center">
          <Icon size={18} className="text-indigo-300" />
        </div>
        <span
          className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
            positive ? "bg-emerald-400/10 text-emerald-300" : "bg-rose-400/10 text-rose-300"
          }`}
        >
          {positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {delta}
        </span>
      </div>
      <div className="font-display text-2xl font-semibold text-white">{value}</div>
      <div className="text-xs text-white/40 mt-1">{label}</div>
    </GlassCard>
  );
}

function TrendChartPlaceholder() {
  const max = Math.max(...TREND);
  return (
    <GlassCard className="p-6">
      <SectionHeading
        title="Attendance trend"
        subtitle="Weekly average across all departments"
        action={<BarChart3 size={16} className="text-white/30" />}
      />
      <div className="flex items-end gap-2.5 h-40">
        {TREND.map((v, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
            <div
              className="w-full rounded-t-md bg-gradient-to-t from-indigo-500/70 to-emerald-400/70 transition-all duration-300 group-hover:from-indigo-400 group-hover:to-emerald-300"
              style={{ height: `${(v / max) * 100}%` }}
            />
            <span className="text-[10px] text-white/30">{TREND_LABELS[i]}</span>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-white/25 mt-4 text-center">
        Placeholder visualization — connect live attendance data to replace.
      </p>
    </GlassCard>
  );
}

function CalendarPlaceholder() {
  const levelColor = [
    "bg-white/5",
    "bg-emerald-400/25",
    "bg-emerald-400/50",
    "bg-emerald-400/80",
  ];
  return (
    <GlassCard className="p-6">
      <SectionHeading
        title="Attendance calendar"
        subtitle="This month"
        action={<CalendarDays size={16} className="text-white/30" />}
      />
      <div className="grid grid-cols-7 gap-1.5">
        {CALENDAR_DAYS.map(({ day, level }) => (
          <div
            key={day}
            title={`Day ${day}`}
            className={`aspect-square rounded-md ${levelColor[level]} flex items-center justify-center text-[10px] text-white/50 hover:scale-110 transition-transform duration-200 cursor-default`}
          >
            {day}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-4 text-[10px] text-white/30">
        <span>Less</span>
        {levelColor.map((c, i) => (
          <span key={i} className={`h-2.5 w-2.5 rounded-sm ${c}`} />
        ))}
        <span>More</span>
      </div>
    </GlassCard>
  );
}

function StatusPill({ status }: { status: RecentRow["status"] }) {
  const styles: Record<RecentRow["status"], string> = {
    PRESENT: "bg-emerald-400/10 text-emerald-300",
    ABSENT: "bg-rose-400/10 text-rose-300",
    LATE: "bg-amber-400/10 text-amber-300",
  };
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full ${styles[status]}`}>
      <Dot size={14} className="-mx-1.5" />
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

function RecentAttendanceTable() {
  return (
    <GlassCard className="p-6">
      <SectionHeading title="Recent attendance" subtitle="Latest check-ins across all classes" />
      <div className="overflow-x-auto -mx-2">
        <table className="w-full text-sm min-w-[480px]">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wide text-white/30">
              <th className="px-2 pb-3 font-medium">Student</th>
              <th className="px-2 pb-3 font-medium">Subject</th>
              <th className="px-2 pb-3 font-medium">Status</th>
              <th className="px-2 pb-3 font-medium text-right">Time</th>
            </tr>
          </thead>
          <tbody>
            {RECENT.map((row, i) => (
              <tr
                key={i}
                className="border-t border-white/5 hover:bg-white/[0.03] transition-colors"
              >
                <td className="px-2 py-3 font-medium text-white">{row.student}</td>
                <td className="px-2 py-3 text-white/50">{row.subject}</td>
                <td className="px-2 py-3">
                  <StatusPill status={row.status} />
                </td>
                <td className="px-2 py-3 text-right text-white/40 flex items-center justify-end gap-1.5">
                  <Clock size={12} /> {row.time}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}

function QuickActionCard({ label, desc, icon: Icon }: { label: string; desc: string; icon: any }) {
  return (
    <button className="group text-left w-full">
      <GlassCard className="p-5 h-full hover:-translate-y-0.5">
        <div className="flex items-center justify-between">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-indigo-500/20 to-emerald-400/20 border border-white/10 flex items-center justify-center">
            <Icon size={16} className="text-emerald-300" />
          </div>
          <ArrowRight
            size={15}
            className="text-white/20 -translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-200"
          />
        </div>
        <div className="mt-4 text-sm font-semibold text-white">{label}</div>
        <div className="text-xs text-white/40 mt-1">{desc}</div>
      </GlassCard>
    </button>
  );
}

function AIInsightsCard() {
  return (
    <GlassCard className="p-6 relative overflow-hidden">
      <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-indigo-500/20 blur-3xl" />
      <SectionHeading
        title="AI insights"
        subtitle="Automatically generated from attendance patterns"
        action={
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-400 to-emerald-400 flex items-center justify-center">
            <Sparkles size={15} className="text-[#0a0a0f]" />
          </div>
        }
      />
      <ul className="space-y-3 relative">
        {INSIGHTS.map((text, i) => (
          <li
            key={i}
            className="flex items-start gap-3 text-sm text-white/70 rounded-xl px-3 py-2.5 hover:bg-white/[0.04] transition-colors"
          >
            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
            {text}
          </li>
        ))}
      </ul>
    </GlassCard>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */

export function DashboardRouter() {
  const { user } = useAuth();
  const firstName = user?.name?.split(" ")[0] || "there";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-white">
            Welcome back, {firstName}
          </h1>
          <p className="text-sm text-white/40 mt-1">
            Here's what's happening across the institution today.
          </p>
        </div>
        <button className="flex items-center gap-2 text-xs font-medium text-white/50 hover:text-white border border-white/10 rounded-xl px-3.5 py-2 hover:bg-white/5 transition-colors">
          <Settings2 size={14} /> Customize
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {STATS.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2">
          <TrendChartPlaceholder />
        </div>
        <CalendarPlaceholder />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2">
          <RecentAttendanceTable />
        </div>
        <AIInsightsCard />
      </div>

      <div>
        <h3 className="font-display text-base font-semibold text-white mb-4">Quick actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {QUICK_ACTIONS.map((a) => (
            <QuickActionCard key={a.label} {...a} />
          ))}
        </div>
      </div>
    </div>
  );
}