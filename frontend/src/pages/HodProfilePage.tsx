import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { api } from "../lib/api";
import {
  Mail,
  Building2,
  BadgeCheck,
  Users,
  UserCog,
  BookOpen,
  AlertTriangle,
  RefreshCcw,
  IdCard,
  Briefcase,
  GraduationCap,
  ClipboardList,
  FileBarChart,
  ArrowRight,
} from "lucide-react";

// Matches the /hod/me response shape given in the brief exactly. Defined
// locally since it hasn't been confirmed against `../lib/types`.
interface HodProfile {
  id: string;
  designation: string;
  user: {
    name: string;
    email: string;
  };
  department: {
    name: string;
  };
  stats: {
    students: number;
    faculty: number;
    subjects: number;
  };
}

function initials(name: string) {
  return name
    .replace(/^Dr\.\s*/i, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function HodProfilePage() {
  const {
    data,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery<HodProfile>({
    queryKey: ["hod-profile"],
    queryFn: async () => (await api.get("/hod/me")).data,
  });

  if (isLoading) return <ProfileSkeleton />;
  if (isError) return <ProfileError onRetry={() => refetch()} retrying={isFetching} />;
  if (!data) return <ProfileEmpty />;

  return (
    <div className="min-h-screen bg-[#0a0b10] bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.18),transparent)] text-white">
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl sm:p-8"
        >
          <motion.div
            className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-indigo-500/25 blur-3xl"
            animate={{ opacity: [0.5, 0.9, 0.5] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-cyan-400/15 blur-3xl"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />

          <div className="relative flex flex-col items-center gap-5 text-center sm:flex-row sm:items-center sm:text-left">
            <div
              className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-white/10 text-2xl font-semibold text-white shadow-[0_8px_30px_rgba(99,102,241,0.4)]"
              style={{ background: "linear-gradient(135deg, #7C3AED, #06B6D4)" }}
            >
              {initials(data.user.name)}
            </div>

            <div className="flex-1">
              <h1 className="font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">{data.user.name}</h1>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <span className="flex items-center gap-1.5 rounded-full border border-indigo-400/30 bg-indigo-400/10 px-3 py-1 text-xs font-medium text-indigo-300">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  {data.designation}
                </span>
                <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-white/60">
                  <Building2 className="h-3.5 w-3.5" />
                  {data.department.name}
                </span>
                <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-white/60">
                  <Mail className="h-3.5 w-3.5" />
                  {data.user.email}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard icon={<Users className="h-5 w-5" />} label="Total students" value={data.stats.students} gradient="from-indigo-500/25 to-indigo-500/0" iconAccent="text-indigo-300" delay={0} />
          <StatCard icon={<UserCog className="h-5 w-5" />} label="Total faculty" value={data.stats.faculty} gradient="from-cyan-500/25 to-cyan-500/0" iconAccent="text-cyan-300" delay={0.05} />
          <StatCard icon={<BookOpen className="h-5 w-5" />} label="Total subjects" value={data.stats.subjects} gradient="from-violet-500/25 to-violet-500/0" iconAccent="text-violet-300" delay={0.1} />
          <StatCard icon={<Building2 className="h-5 w-5" />} label="Department" value={data.department.name} gradient="from-emerald-500/25 to-emerald-500/0" iconAccent="text-emerald-300" delay={0.15} small />
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* Department information */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl"
          >
            <div className="mb-4 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-white/40" />
              <h2 className="font-display font-semibold text-white">Department information</h2>
            </div>
            <dl className="space-y-3">
              <InfoRow label="Department" value={data.department.name} icon={<Building2 className="h-3.5 w-3.5" />} />
              <InfoRow label="Designation" value={data.designation} icon={<Briefcase className="h-3.5 w-3.5" />} />
              <InfoRow label="Email" value={data.user.email} icon={<Mail className="h-3.5 w-3.5" />} />
              <InfoRow label="HOD ID" value={data.id} icon={<IdCard className="h-3.5 w-3.5" />} />
              {/* No status field exists on /hod/me — this reflects that the
                  account is authenticated and viewing this page, not a value
                  read from the API. */}
              <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                <dt className="flex items-center gap-2 text-xs text-white/40">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  Status
                </dt>
                <dd className="flex items-center gap-1.5 text-sm font-medium text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Active
                </dd>
              </div>
            </dl>
          </motion.div>

          {/* Professional information */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl"
          >
            <div className="mb-4 flex items-center gap-2">
              <IdCard className="h-4 w-4 text-white/40" />
              <h2 className="font-display font-semibold text-white">Professional information</h2>
            </div>
            <dl className="space-y-3">
              <InfoRow label="Employee ID" value={data.id} icon={<IdCard className="h-3.5 w-3.5" />} />
              <InfoRow label="Designation" value={data.designation} icon={<Briefcase className="h-3.5 w-3.5" />} />
              <InfoRow label="Department" value={data.department.name} icon={<Building2 className="h-3.5 w-3.5" />} />
              <InfoRow label="Email" value={data.user.email} icon={<Mail className="h-3.5 w-3.5" />} />
              <InfoRow label="Role" value="Head of Department" icon={<GraduationCap className="h-3.5 w-3.5" />} />
            </dl>
          </motion.div>
        </div>

        {/* Quick actions */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl"
        >
          <div className="mb-4 flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-white/40" />
            <h2 className="font-display font-semibold text-white">Quick actions</h2>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <QuickAction icon={<Users className="h-5 w-5" />} label="Manage students" accent="text-indigo-300" />
            <QuickAction icon={<UserCog className="h-5 w-5" />} label="Manage faculty" accent="text-cyan-300" />
            <QuickAction icon={<BookOpen className="h-5 w-5" />} label="Manage subjects" accent="text-violet-300" />
            <QuickAction icon={<FileBarChart className="h-5 w-5" />} label="Generate reports" accent="text-emerald-300" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  gradient,
  iconAccent,
  delay,
  small,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  gradient: string;
  iconAccent: string;
  delay: number;
  small?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -3 }}
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.25)]"
    >
      <div className={`absolute -top-8 -right-8 h-24 w-24 rounded-full bg-gradient-to-br ${gradient} blur-2xl`} />
      <div className="relative flex items-center gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 ${iconAccent}`}>{icon}</div>
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-wide text-white/40">{label}</p>
          <p className={`truncate font-semibold text-white tabular-nums ${small ? "text-base" : "text-xl"}`}>{value}</p>
        </div>
      </div>
    </motion.div>
  );
}

function QuickAction({ icon, label, accent }: { icon: React.ReactNode; label: string; accent: string }) {
  return (
    <motion.button
      type="button"
      whileHover={{ y: -3, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className="group flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3.5 text-left transition-colors hover:border-white/20 hover:bg-white/[0.06]"
    >
      <span className="flex items-center gap-3">
        <span className={`flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 ${accent}`}>{icon}</span>
        <span className="text-sm font-medium text-white/80">{label}</span>
      </span>
      <ArrowRight className="h-4 w-4 text-white/20 transition-transform group-hover:translate-x-0.5 group-hover:text-white/50" />
    </motion.button>
  );
}

function InfoRow({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
      <dt className="flex items-center gap-2 text-xs text-white/40">
        {icon}
        {label}
      </dt>
      <dd className="truncate text-sm font-medium text-white/85">{value}</dd>
    </div>
  );
}

function ProfileError({ onRetry, retrying }: { onRetry: () => void; retrying: boolean }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0b10] px-4 text-white">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center gap-4 rounded-2xl border border-rose-400/20 bg-rose-400/5 p-8 text-center backdrop-blur-xl"
      >
        <AlertTriangle className="h-8 w-8 text-rose-300" />
        <div>
          <p className="font-display font-semibold text-white">Couldn't load your profile</p>
          <p className="mt-1 text-sm text-white/40">Something went wrong fetching your HOD details.</p>
        </div>
        <motion.button
          type="button"
          onClick={onRetry}
          disabled={retrying}
          whileTap={{ scale: 0.96 }}
          className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/[0.08] disabled:opacity-50"
        >
          <RefreshCcw className={`h-4 w-4 ${retrying ? "animate-spin" : ""}`} />
          {retrying ? "Retrying…" : "Try again"}
        </motion.button>
      </motion.div>
    </div>
  );
}

function ProfileEmpty() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0b10] px-4 text-white">
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center backdrop-blur-xl">
        <IdCard className="h-8 w-8 text-white/15" />
        <p className="font-display font-semibold text-white">No profile data</p>
        <p className="max-w-xs text-sm text-white/40">We couldn't find any HOD profile details to show here.</p>
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-[#0a0b10] text-white">
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-6">
          <div className="h-32 rounded-2xl border border-white/10 bg-white/[0.03]" />
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 rounded-2xl border border-white/10 bg-white/[0.03]" />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div className="h-56 rounded-2xl border border-white/10 bg-white/[0.03]" />
            <div className="h-56 rounded-2xl border border-white/10 bg-white/[0.03]" />
          </div>
          <div className="h-40 rounded-2xl border border-white/10 bg-white/[0.03]" />
        </div>
      </div>
    </div>
  );
}