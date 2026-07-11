import { motion, type Variants } from "framer-motion";
import {
  GraduationCap,
  Users,
  BookOpen,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Building2,
  Sparkles,
  AlertTriangle,
  CalendarCheck,
  FileText,
  UserPlus,
  ArrowRight,
  Star,
} from "lucide-react";

/**
 * PLACEHOLDER DATA ONLY — per instructions, no API calls in this page.
 * Every figure below is static and illustrative; wire real endpoints
 * when ready (department stats, faculty performance, and low-attendance
 * lists all have natural backing queries already used elsewhere in the
 * app, e.g. /attendance/analytics/overview, /students, /faculty).
 */

const STATS = [
  { label: "Total Students", value: "842", delta: "+3.1%", trend: "up" as const, icon: GraduationCap },
  { label: "Total Faculty", value: "38", delta: "+1", trend: "up" as const, icon: Users },
  { label: "Total Subjects", value: "24", delta: "0", trend: "up" as const, icon: BookOpen },
  { label: "Attendance %", value: "84.6%", delta: "-1.2%", trend: "down" as const, icon: TrendingUp },
];

const TREND = [72, 78, 74, 81, 85, 79, 83, 88, 84, 90, 86, 84];
const TREND_LABELS = ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8", "W9", "W10", "W11", "W12"];

const DEPARTMENTS = [
  { name: "Computer Science", students: 312, faculty: 14, attendance: 88 },
  { name: "Electronics", students: 204, faculty: 9, attendance: 82 },
  { name: "Mechanical", students: 186, faculty: 8, attendance: 79 },
  { name: "Civil", students: 140, faculty: 7, attendance: 85 },
];

const FACULTY_PERFORMANCE = [
  { name: "Dr. Anita Verma", subject: "Data Structures", classesHeld: 42, attendanceManaged: 94 },
  { name: "Prof. Rajesh Kumar", subject: "Operating Systems", classesHeld: 39, attendanceManaged: 89 },
  { name: "Dr. Meenal Joshi", subject: "Digital Circuits", classesHeld: 36, attendanceManaged: 91 },
  { name: "Prof. Suresh Nair", subject: "Thermodynamics", classesHeld: 40, attendanceManaged: 86 },
  { name: "Dr. Nisha Pillai", subject: "Computer Networks", classesHeld: 37, attendanceManaged: 96 },
];

const LOW_ATTENDANCE = [
  { name: "Devansh Iyer", roll: "CSE2024-03", attendance: 55 },
  { name: "Farhan Ali", roll: "CIV2023-22", attendance: 64 },
  { name: "Karan Malhotra", roll: "CIV2023-21", attendance: 40 },
  { name: "Vikram Singh", roll: "CSE2024-05", attendance: 35 },
];

const RECENT_ACTIVITY = [
  { icon: UserPlus, text: "New student registered", sub: "Computer Science · 2h ago", tone: "indigo" as const },
  { icon: CalendarCheck, text: "Faculty marked attendance", sub: "Operating Systems · 3h ago", tone: "emerald" as const },
  { icon: Building2, text: "Department report generated", sub: "Electronics · 6h ago", tone: "cyan" as const },
  { icon: BookOpen, text: "New subject added", sub: "Data Structures · 1d ago", tone: "indigo" as const },
];

const INSIGHTS = [
  "Attendance across all departments dips 6% on Fridays — consider reviewing the Friday schedule.",
  "Mechanical Engineering has the lowest average attendance this semester at 79%.",
  "4 students are within 5% of falling below the 75% eligibility threshold.",
];

const QUICK_ACTIONS = [
  { label: "Manage Students", desc: "View and edit student records", icon: GraduationCap },
  { label: "Manage Faculty", desc: "View and edit faculty records", icon: Users },
  { label: "Manage Subjects", desc: "Assign subjects and faculty", icon: BookOpen },
  { label: "Attendance Reports", desc: "Generate department reports", icon: FileText },
];

const containerStagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export function HodDashboardPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0b0c14] text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-40 -left-40 h-[32rem] w-[32rem] rounded-full bg-purple-600/20 blur-3xl animate-[pulse_9s_ease-in-out_infinite]" />
        <div className="absolute top-1/3 -right-32 h-[28rem] w-[28rem] rounded-full bg-cyan-500/15 blur-3xl animate-[pulse_11s_ease-in-out_infinite]" />
        <div className="absolute -bottom-40 left-1/4 h-[30rem] w-[30rem] rounded-full bg-indigo-600/20 blur-3xl animate-[pulse_13s_ease-in-out_infinite]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.18),transparent)]" />
      </div>

      <motion.div
        variants={containerStagger}
        initial="hidden"
        animate="show"
        className="relative z-10 mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8"
      >
        <motion.div
          variants={fadeUp}
          className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-6 sm:p-8 backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.35)]"
        >
          <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-gradient-to-br from-purple-500/25 to-cyan-400/15 blur-3xl" />
          <div className="relative flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="text-xs font-medium text-white/40 mb-2">
                {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-semibold text-white">
                Welcome back, HOD
              </h1>
              <p className="text-sm text-white/50 mt-2">
                Here's how your department is performing across attendance and staffing.
              </p>
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-white/30 border border-white/10 rounded-full px-2.5 py-1">
              Preview data
            </span>
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {STATS.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <motion.div variants={fadeUp} className="xl:col-span-2">
            <TrendChart />
          </motion.div>
          <motion.div variants={fadeUp}>
            <AIInsightsCard />
          </motion.div>
        </div>

        <motion.div variants={fadeUp}>
          <SectionLabel text="Department overview" />
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {DEPARTMENTS.map((d) => (
              <DepartmentCard key={d.name} {...d} />
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <motion.div variants={fadeUp} className="xl:col-span-2">
            <FacultyPerformanceTable />
          </motion.div>
          <motion.div variants={fadeUp}>
            <LowAttendanceCard />
          </motion.div>
        </div>

        <motion.div
          variants={fadeUp}
          className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.35)]"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-white">Recent activity</h3>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-white/30 border border-white/10 rounded-full px-2 py-0.5">
              Preview
            </span>
          </div>
          <ul className="space-y-2">
            {RECENT_ACTIVITY.map((a, i) => (
              <ActivityRow key={i} {...a} />
            ))}
          </ul>
        </motion.div>

        <motion.div variants={fadeUp}>
          <SectionLabel text="Quick actions" />
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {QUICK_ACTIONS.map((a) => (
              <QuickActionCard key={a.label} {...a} />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

function SectionLabel({ text }: { text: string }) {
  return <h2 className="text-xs font-semibold uppercase tracking-wide text-white/40 mb-3">{text}</h2>;
}

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.35)] transition-all duration-300 hover:border-white/20 hover:bg-white/[0.06] ${className}`}
    >
      {children}
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
    <GlassCard className="p-5 hover:-translate-y-0.5">
      <div className="flex items-center justify-between mb-4">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-cyan-400/20 border border-white/10 flex items-center justify-center">
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

function TrendChart() {
  const max = Math.max(...TREND);
  return (
    <GlassCard className="p-6 h-full">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-display text-base font-semibold text-white">Weekly attendance trend</h3>
          <p className="text-xs text-white/40 mt-1">Average attendance across all departments</p>
        </div>
        <BarChart3 size={16} className="text-white/30" />
      </div>
      <div className="flex items-end gap-2.5 h-44">
        {TREND.map((v, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
            <div
              className="w-full rounded-t-md bg-gradient-to-t from-indigo-500/70 via-purple-500/60 to-cyan-400/70 transition-all duration-300 group-hover:from-indigo-400 group-hover:to-cyan-300"
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

function DepartmentCard({
  name,
  students,
  faculty,
  attendance,
}: {
  name: string;
  students: number;
  faculty: number;
  attendance: number;
}) {
  const tone = attendance >= 85 ? "emerald" : attendance >= 75 ? "amber" : "rose";
  const toneClasses: Record<string, string> = {
    emerald: "text-emerald-300 bg-emerald-400/10",
    amber: "text-amber-300 bg-amber-400/10",
    rose: "text-rose-300 bg-rose-400/10",
  };
  return (
    <GlassCard className="p-5 hover:-translate-y-0.5">
      <div className="flex items-center justify-between mb-3">
        <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-indigo-500/20 to-cyan-400/20 border border-white/10 flex items-center justify-center">
          <Building2 size={16} className="text-indigo-300" />
        </div>
        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${toneClasses[tone]}`}>
          {attendance}%
        </span>
      </div>
      <div className="font-medium text-white truncate">{name}</div>
      <div className="flex items-center gap-3 text-xs text-white/40 mt-2">
        <span>{students} students</span>
        <span>·</span>
        <span>{faculty} faculty</span>
      </div>
    </GlassCard>
  );
}

function FacultyPerformanceTable() {
  return (
    <GlassCard className="p-6 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-white">Faculty performance</h3>
        <span className="text-[10px] font-semibold uppercase tracking-wide text-white/30 border border-white/10 rounded-full px-2 py-0.5">
          Preview
        </span>
      </div>
      <div className="overflow-x-auto -mx-2">
        <table className="w-full text-sm min-w-[520px]">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wide text-white/30">
              <th className="px-2 pb-3 font-medium">Faculty</th>
              <th className="px-2 pb-3 font-medium">Subject</th>
              <th className="px-2 pb-3 font-medium text-right">Classes Held</th>
              <th className="px-2 pb-3 font-medium text-right">Attendance Managed</th>
            </tr>
          </thead>
          <tbody>
            {FACULTY_PERFORMANCE.map((f, i) => (
              <tr key={i} className="border-t border-white/5 hover:bg-white/[0.03] transition-colors">
                <td className="px-2 py-3 font-medium text-white">{f.name}</td>
                <td className="px-2 py-3 text-white/50">{f.subject}</td>
                <td className="px-2 py-3 text-right text-white/50">{f.classesHeld}</td>
                <td className="px-2 py-3 text-right">
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      f.attendanceManaged >= 90
                        ? "bg-emerald-400/10 text-emerald-300"
                        : "bg-amber-400/10 text-amber-300"
                    }`}
                  >
                    {f.attendanceManaged}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}

function LowAttendanceCard() {
  return (
    <GlassCard className="p-6 h-full">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle size={16} className="text-rose-300" />
        <h3 className="font-display font-semibold text-white">Students below 75%</h3>
      </div>
      <ul className="space-y-2">
        {LOW_ATTENDANCE.map((s, i) => (
          <li
            key={i}
            className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5 hover:bg-white/[0.05] transition-colors"
          >
            <div>
              <div className="text-sm font-medium text-white">{s.name}</div>
              <div className="text-xs text-white/35 font-mono">{s.roll}</div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-400/10 text-rose-300">
              {s.attendance}%
            </span>
          </li>
        ))}
      </ul>
    </GlassCard>
  );
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

function AIInsightsCard() {
  return (
    <GlassCard className="p-6 h-full relative overflow-hidden">
      <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-indigo-500/20 blur-3xl" />
      <div className="flex items-start justify-between mb-5 relative">
        <div>
          <h3 className="font-display text-base font-semibold text-white">AI insights</h3>
          <p className="text-xs text-white/40 mt-1">Patterns detected across departments</p>
        </div>
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-400 via-indigo-400 to-cyan-400 flex items-center justify-center shrink-0">
          <Sparkles size={15} className="text-[#0b0c14]" />
        </div>
      </div>
      <ul className="space-y-3 relative">
        {INSIGHTS.map((text, i) => (
          <li
            key={i}
            className="flex items-start gap-3 text-sm text-white/70 rounded-xl px-3 py-2.5 hover:bg-white/[0.04] transition-colors"
          >
            <Star size={14} className="mt-0.5 text-cyan-300 shrink-0" />
            {text}
          </li>
        ))}
      </ul>
    </GlassCard>
  );
}

function QuickActionCard({ label, desc, icon: Icon }: { label: string; desc: string; icon: any }) {
  return (
    <button type="button" className="group text-left w-full">
      <GlassCard className="p-5 h-full hover:-translate-y-0.5">
        <div className="flex items-center justify-between">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-indigo-500/20 to-cyan-400/20 border border-white/10 flex items-center justify-center">
            <Icon size={16} className="text-indigo-300" />
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