import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { motion, type Variants } from "framer-motion";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import type { StudentSummary } from "../lib/types";
import {
  GraduationCap,
  Building2,
  Layers,
  Users2,
  Mail,
  BadgeCheck,
  Hash,
  TrendingUp,
  TrendingDown,
  Flame,
  Trophy,
  Lock,
  Printer,
  RefreshCcw,
  LogOut,
  Send,
  KeyRound,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";

/**
 * DATA PROVENANCE NOTE
 * ---------------------------------------------------------------------
 * Real, live data comes from two existing endpoints:
 *   GET /students/me               -> roll number, department, semester, section
 *   GET /attendance/me/summary      -> present/absent/late, subject breakdown, recent history
 * (the summary query shares its cache key with StudentDashboard, so no
 * extra network round-trip if that page was already visited.)
 *
 * Fields with no backing column yet — Enrollment Number, phone number,
 * profile photo upload — are shown as "—" or a disabled action rather
 * than invented values, each flagged with a small "Preview" pill so the
 * structure is ready to wire up once those fields exist.
 * Achievements are computed honestly from real attendance history
 * (streaks, thresholds) rather than a separate badges table.
 * ---------------------------------------------------------------------
 */

interface StudentProfile {
  id: string;
  rollNumber: string;
  semester: number;
  section: string;
  department?: { id: string; name: string; code: string } | null;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatarUrl?: string | null;
  };
}

const containerStagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export function StudentProfilePage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const { data: profile, isLoading: loadingProfile } = useQuery<StudentProfile>({
    queryKey: ["student-profile"],
    queryFn: async () => (await api.get("/students/me")).data,
  });

  const {
    data: summary,
    isLoading: loadingSummary,
    refetch,
    isFetching,
  } = useQuery<StudentSummary>({
    queryKey: ["student-summary"],
    queryFn: async () => (await api.get("/attendance/me/summary")).data,
  });

  const currentStreak = useMemo(() => {
    if (!summary) return 0;
    let streak = 0;
    for (const r of summary.recent) {
      if (r.status === "PRESENT" || r.status === "LATE") streak += 1;
      else break;
    }
    return streak;
  }, [summary]);

  const bestSubject = useMemo(() => {
    if (!summary || summary.subjects.length === 0) return null;
    return [...summary.subjects].sort((a, b) => b.percentage - a.percentage)[0];
  }, [summary]);

  const weakestSubject = useMemo(() => {
    if (!summary || summary.subjects.length === 0) return null;
    return [...summary.subjects].sort((a, b) => a.percentage - b.percentage)[0];
  }, [summary]);

  const achievements = useMemo(() => {
    if (!summary) return [];
    return [
      {
        icon: BadgeCheck,
        title: "75% Club",
        desc: "Overall attendance at or above 75%",
        earned: summary.percentage >= 75,
      },
      {
        icon: Flame,
        title: "On a Roll",
        desc: "3+ day attendance streak",
        earned: currentStreak >= 3,
      },
      {
        icon: Trophy,
        title: "Perfect Recent Run",
        desc: "Last 5 records all present",
        earned:
          summary.recent.length >= 5 &&
          summary.recent.slice(0, 5).every((r) => r.status === "PRESENT"),
      },
      {
        icon: TrendingUp,
        title: "Top Subject 90%+",
        desc: "At least one subject at 90%+ attendance",
        earned: summary.subjects.some((s) => s.percentage >= 90),
      },
    ];
  }, [summary, currentStreak]);

  async function handleSignOut() {
    await logout();
    navigate("/login");
  }

  const isLoading = loadingProfile || loadingSummary;

  if (isLoading) return <ProfileSkeleton />;

  const initials = (profile?.user.name || "")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const percentage = summary?.percentage ?? 0;
  const percentageTone =
    percentage >= 75 ? "emerald" : percentage >= 60 ? "amber" : "rose";

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
        className="relative z-10 mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8"
      >
        <motion.div
          variants={fadeUp}
          className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-6 sm:p-8 backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.35)]"
        >
          <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-gradient-to-br from-purple-500/25 to-cyan-400/15 blur-3xl" />
          <div className="relative flex flex-col sm:flex-row items-center sm:items-end gap-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="relative shrink-0"
            >
              <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-full bg-gradient-to-br from-purple-400 via-indigo-400 to-cyan-400 p-[3px] shadow-[0_8px_30px_rgba(99,102,241,0.35)]">
                <div className="h-full w-full rounded-full bg-[#0b0c14] flex items-center justify-center overflow-hidden">
                  {profile?.user.avatarUrl ? (
                    <img src={profile.user.avatarUrl} alt={profile.user.name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="font-display text-2xl sm:text-3xl font-semibold text-white">{initials}</span>
                  )}
                </div>
              </div>
              <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-emerald-400 border-2 border-[#0b0c14]" />
            </motion.div>

            <div className="flex-1 text-center sm:text-left">
              <h1 className="font-display text-2xl sm:text-3xl font-semibold text-white">
                {profile?.user.name}
              </h1>
              <p className="text-sm text-white/50 mt-1">{profile?.user.email}</p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
                <Pill icon={Hash}>{profile?.rollNumber}</Pill>
                <Pill icon={Building2}>{profile?.department?.name || "—"}</Pill>
                <Pill icon={Layers}>Semester {profile?.semester}</Pill>
                <Pill icon={Users2}>Section {profile?.section}</Pill>
              </div>
            </div>

            <div
              className={`shrink-0 rounded-2xl border px-5 py-4 text-center backdrop-blur-xl ${
                percentageTone === "emerald"
                  ? "border-emerald-400/30 bg-emerald-400/10"
                  : percentageTone === "amber"
                  ? "border-amber-400/30 bg-amber-400/10"
                  : "border-rose-400/30 bg-rose-400/10"
              }`}
            >
              <div
                className={`font-display text-3xl font-semibold ${
                  percentageTone === "emerald"
                    ? "text-emerald-300"
                    : percentageTone === "amber"
                    ? "text-amber-300"
                    : "text-rose-300"
                }`}
              >
                {percentage}%
              </div>
              <div className="text-[11px] text-white/40 mt-1">Overall attendance</div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <motion.div variants={fadeUp} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
            <SectionTitle title="Personal information" />
            <div className="space-y-3">
              <InfoRow icon={Users2} label="Full name" value={profile?.user.name || "—"} />
              <InfoRow icon={Mail} label="Email" value={profile?.user.email || "—"} />
              <InfoRow icon={Hash} label="Phone number" value="—" preview />
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
            <SectionTitle title="Academic information" />
            <div className="space-y-3">
              <InfoRow icon={Hash} label="Roll number" value={profile?.rollNumber || "—"} />
              <InfoRow icon={BadgeCheck} label="Enrollment number" value="—" preview />
              <InfoRow icon={Building2} label="Department" value={profile?.department?.name || "—"} />
              <InfoRow icon={Layers} label="Semester" value={String(profile?.semester ?? "—")} />
              <InfoRow icon={Users2} label="Section" value={profile?.section || "—"} />
            </div>
          </motion.div>
        </div>

        <motion.div variants={fadeUp}>
          <SectionTitle title="Attendance summary" standalone />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard icon={CheckCircle2} tone="emerald" label="Present" value={summary?.present ?? 0} />
            <StatCard icon={XCircle} tone="rose" label="Absent" value={summary?.absent ?? 0} />
            <StatCard icon={Clock} tone="amber" label="Late" value={summary?.late ?? 0} />
            <StatCard icon={GraduationCap} tone="indigo" label="Total sessions" value={summary?.total ?? 0} />
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
          <SectionTitle title="Subject-wise attendance" />
          {!summary || summary.subjects.length === 0 ? (
            <EmptyState text="No attendance recorded yet." />
          ) : (
            <div className="space-y-4">
              {summary.subjects.map((s, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1.5 text-sm">
                    <span className="text-white/80 font-medium">{s.name}</span>
                    <span className="text-white/40">{s.percentage}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden border border-white/10">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(s.percentage, 100)}%` }}
                      transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.05 }}
                      className={`h-full rounded-full ${
                        s.percentage >= 75
                          ? "bg-gradient-to-r from-emerald-400 to-emerald-300"
                          : s.percentage >= 60
                          ? "bg-gradient-to-r from-amber-400 to-amber-300"
                          : "bg-gradient-to-r from-rose-400 to-rose-300"
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <AnalyticsCard
            icon={Flame}
            tone="indigo"
            label="Current streak"
            value={`${currentStreak} ${currentStreak === 1 ? "day" : "days"}`}
            desc="Consecutive present/late records"
          />
          <AnalyticsCard
            icon={TrendingUp}
            tone="emerald"
            label="Strongest subject"
            value={bestSubject ? bestSubject.name : "—"}
            desc={bestSubject ? `${bestSubject.percentage}% attendance` : "Not enough data yet"}
          />
          <AnalyticsCard
            icon={TrendingDown}
            tone="rose"
            label="Needs attention"
            value={weakestSubject ? weakestSubject.name : "—"}
            desc={weakestSubject ? `${weakestSubject.percentage}% attendance` : "Not enough data yet"}
          />
        </motion.div>

        <motion.div variants={fadeUp} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
          <SectionTitle title="Achievements" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {achievements.map((a, i) => (
              <motion.div
                key={i}
                whileHover={a.earned ? { y: -3 } : undefined}
                className={`rounded-xl border p-4 transition-colors ${
                  a.earned
                    ? "border-indigo-400/30 bg-gradient-to-br from-indigo-500/10 to-cyan-400/10"
                    : "border-white/10 bg-white/[0.02] opacity-50"
                }`}
              >
                <div
                  className={`h-9 w-9 rounded-lg flex items-center justify-center mb-3 ${
                    a.earned ? "bg-gradient-to-br from-indigo-400 to-cyan-300 text-[#0b0c14]" : "bg-white/5 text-white/30"
                  }`}
                >
                  {a.earned ? <a.icon size={16} /> : <Lock size={14} />}
                </div>
                <div className="text-sm font-semibold text-white">{a.title}</div>
                <div className="text-xs text-white/40 mt-1">{a.desc}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
          <SectionTitle title="Account actions" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ActionButton
              icon={RefreshCcw}
              label="Refresh attendance data"
              onClick={() => refetch()}
              spinning={isFetching}
            />
            <ActionButton icon={Printer} label="Print attendance summary" onClick={() => window.print()} />
            <ActionButton
              icon={Send}
              label="Contact administrator"
              onClick={() => {
                window.location.href = "mailto:admin@smartattend.dev";
              }}
            />
            <ActionButton icon={KeyRound} label="Change password" disabled preview />
            <ActionButton icon={LogOut} label="Sign out" onClick={handleSignOut} tone="danger" />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

function SectionTitle({ title, standalone }: { title: string; standalone?: boolean }) {
  return (
    <h3 className={`font-display font-semibold text-white ${standalone ? "text-xs uppercase tracking-wide text-white/40 mb-3" : "mb-4"}`}>
      {title}
    </h3>
  );
}

function Pill({ icon: Icon, children }: { icon: any; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-white/70 border border-white/10 bg-white/5 rounded-full px-3 py-1.5">
      <Icon size={12} className="text-white/40" />
      {children}
    </span>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  preview,
}: {
  icon: any;
  label: string;
  value: string;
  preview?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
      <div className="flex items-center gap-2.5 text-sm text-white/50">
        <Icon size={15} className="text-white/30" />
        {label}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-white/85">{value}</span>
        {preview && (
          <span className="text-[10px] font-semibold uppercase tracking-wide text-white/30 border border-white/10 rounded-full px-2 py-0.5">
            Preview
          </span>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  tone,
  label,
  value,
}: {
  icon: any;
  tone: "emerald" | "rose" | "amber" | "indigo";
  label: string;
  value: number;
}) {
  const tones: Record<string, string> = {
    emerald: "from-emerald-500/20 to-emerald-400/10 text-emerald-300",
    rose: "from-rose-500/20 to-rose-400/10 text-rose-300",
    amber: "from-amber-500/20 to-amber-400/10 text-amber-300",
    indigo: "from-indigo-500/20 to-indigo-400/10 text-indigo-300",
  };
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.35)] transition-colors hover:border-white/20"
    >
      <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${tones[tone]} border border-white/10 flex items-center justify-center mb-3`}>
        <Icon size={17} />
      </div>
      <div className="font-display text-2xl font-semibold text-white">{value}</div>
      <div className="text-xs text-white/40 mt-1">{label}</div>
    </motion.div>
  );
}

function AnalyticsCard({
  icon: Icon,
  tone,
  label,
  value,
  desc,
}: {
  icon: any;
  tone: "emerald" | "rose" | "indigo";
  label: string;
  value: string;
  desc: string;
}) {
  const tones: Record<string, string> = {
    emerald: "from-emerald-500/20 to-emerald-400/10 text-emerald-300",
    rose: "from-rose-500/20 to-rose-400/10 text-rose-300",
    indigo: "from-indigo-500/20 to-indigo-400/10 text-indigo-300",
  };
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
      <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${tones[tone]} border border-white/10 flex items-center justify-center mb-3`}>
        <Icon size={17} />
      </div>
      <div className="text-xs text-white/40">{label}</div>
      <div className="font-display text-lg font-semibold text-white mt-0.5 truncate">{value}</div>
      <div className="text-xs text-white/35 mt-1">{desc}</div>
    </div>
  );
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
  disabled,
  spinning,
  preview,
  tone = "default",
}: {
  icon: any;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  spinning?: boolean;
  preview?: boolean;
  tone?: "default" | "danger";
}) {
  return (
    <motion.button
      type="button"
      whileHover={disabled ? undefined : { scale: 1.01 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
        disabled
          ? "border-white/10 bg-white/[0.02] text-white/30 cursor-not-allowed"
          : tone === "danger"
          ? "border-rose-400/20 bg-rose-400/5 text-rose-300 hover:bg-rose-400/10"
          : "border-white/10 bg-white/[0.03] text-white/70 hover:bg-white/[0.08] hover:text-white"
      }`}
    >
      <span className="flex items-center gap-2.5">
        <Icon size={16} className={spinning ? "animate-spin" : ""} />
        {label}
      </span>
      {preview && (
        <span className="text-[10px] font-semibold uppercase tracking-wide text-white/30 border border-white/10 rounded-full px-2 py-0.5">
          Soon
        </span>
      )}
    </motion.button>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="py-10 text-center text-sm text-white/30">{text}</div>;
}

function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-[#0b0c14] text-white">
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-6">
          <div className="h-40 rounded-2xl border border-white/10 bg-white/[0.04]" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="h-48 rounded-2xl border border-white/10 bg-white/[0.04]" />
            <div className="h-48 rounded-2xl border border-white/10 bg-white/[0.04]" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="h-24 rounded-2xl border border-white/10 bg-white/[0.04]" />
            <div className="h-24 rounded-2xl border border-white/10 bg-white/[0.04]" />
            <div className="h-24 rounded-2xl border border-white/10 bg-white/[0.04]" />
            <div className="h-24 rounded-2xl border border-white/10 bg-white/[0.04]" />
          </div>
          <div className="h-64 rounded-2xl border border-white/10 bg-white/[0.04]" />
        </div>
      </div>
    </div>
  );
}