import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import type { Subject } from "../lib/types";
import { Link } from "react-router-dom";
import {
  CalendarCheck,
  BookOpen,
  Users,
  ClipboardList,
  Clock,
  FileBarChart,
  Layers,
  Sparkles,
} from "lucide-react";

export function FacultyDashboard() {
  const { user } = useAuth();
  const { data: subjects, isLoading } = useQuery<Subject[]>({
    queryKey: ["my-subjects"],
    queryFn: async () => (await api.get("/faculty/me/subjects")).data,
  });

  const today = useMemo(
    () => new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" }),
    []
  );

  const subjectCount = subjects?.length || 0;

  return (
    <div className="relative min-h-full">
      {/* Animated gradient background with floating blurred blobs */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[#0B1120]">
        <div className="absolute -top-32 -left-24 h-96 w-96 rounded-full bg-indigo-600/25 blur-3xl animate-[pulse_9s_ease-in-out_infinite]" />
        <div className="absolute top-1/3 -right-24 h-[26rem] w-[26rem] rounded-full bg-emerald-500/20 blur-3xl animate-[pulse_11s_ease-in-out_infinite]" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-cyan-500/15 blur-3xl animate-[pulse_13s_ease-in-out_infinite]" />
      </div>

      <div className="space-y-8">
        {/* Hero */}
        <div>
          <div className="text-xs font-medium text-white/40 mb-2">{today}</div>
          <h1 className="font-display text-3xl font-semibold text-white">
            Welcome back, {user?.name}
          </h1>
          <p className="text-sm text-white/50 mt-2">
            Today's classes and quick access to attendance marking.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {isLoading ? (
            <>
              <StatSkeleton />
              <StatSkeleton />
              <StatSkeleton />
              <StatSkeleton />
            </>
          ) : (
            <>
              <StatCard
                icon={Layers}
                gradient="from-indigo-500 to-indigo-300"
                value={String(subjectCount)}
                label="Assigned Subjects"
              />
              <StatCard
                icon={Clock}
                gradient="from-emerald-500 to-emerald-300"
                value={String(subjectCount)}
                label="Today's Classes"
              />
              <StatCard
                icon={ClipboardList}
                gradient="from-cyan-500 to-cyan-300"
                value="—"
                label="Pending Attendance"
                preview
              />
              <StatCard
                icon={Users}
                gradient="from-indigo-500 to-cyan-400"
                value="—"
                label="Total Students"
                preview
              />
            </>
          )}
        </div>

        {/* Quick actions */}
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-white/40 mb-3">
            Quick actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <QuickAction to="/mark-attendance" icon={CalendarCheck} label="Mark Attendance" desc="Open today's class list" />
            <QuickAction to="#subjects" icon={BookOpen} label="My Subjects" desc="Jump to your subject list" />
            <QuickAction icon={FileBarChart} label="View Reports" desc="Coming soon" disabled />
          </div>
        </div>

        {/* Subjects */}
        <div id="subjects">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-white/40 mb-3">
            Your subjects
          </h2>
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SubjectSkeleton />
                <SubjectSkeleton />
              </div>
            ) : !subjects || subjects.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {subjects.map((s) => (
                  <div
                    key={s.id}
                    className="group relative rounded-xl border border-white/10 bg-white/[0.03] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.06] hover:shadow-[0_8px_24px_rgba(79,70,229,0.15)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-medium text-white truncate">{s.name}</div>
                        <span className="inline-block mt-2 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-gradient-to-r from-indigo-500/20 to-cyan-400/20 text-indigo-200 border border-white/10">
                          {s.code}
                        </span>
                        <div className="text-xs text-white/40 mt-2">
                          Semester {s.semester} · Section {s.section}
                        </div>
                      </div>
                      <Link
                        to={`/mark-attendance?subjectId=${s.id}`}
                        className="shrink-0 flex items-center gap-2 text-sm font-medium text-white/70 hover:text-white border border-white/10 rounded-lg px-3 py-2 hover:bg-white/10 transition-colors"
                      >
                        <CalendarCheck size={15} /> Mark
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Reusable components                                                */
/* ------------------------------------------------------------------ */

function StatCard({
  icon: Icon,
  gradient,
  value,
  label,
  preview,
}: {
  icon: any;
  gradient: string;
  value: string;
  label: string;
  preview?: boolean;
}) {
  return (
    <div className="group rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.35)] transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:border-white/20">
      <div className="flex items-center justify-between mb-4">
        <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
          <Icon size={19} className="text-[#0B1120]" />
        </div>
        {preview && (
          <span className="text-[10px] font-semibold uppercase tracking-wide text-white/30 border border-white/10 rounded-full px-2 py-0.5">
            Preview
          </span>
        )}
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
  desc,
  disabled,
}: {
  to?: string;
  icon: any;
  label: string;
  desc: string;
  disabled?: boolean;
}) {
  const content = (
    <div
      className={`group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.35)] transition-all duration-300 ${
        disabled
          ? "opacity-50 cursor-not-allowed"
          : "hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.08] cursor-pointer"
      }`}
    >
      <div className="h-11 w-11 shrink-0 rounded-xl bg-gradient-to-br from-indigo-500/20 to-cyan-400/20 border border-white/10 flex items-center justify-center">
        <Icon size={18} className="text-indigo-300" />
      </div>
      <div className="min-w-0">
        <div className="text-sm font-semibold text-white">{label}</div>
        <div className="text-xs text-white/40 mt-0.5">{desc}</div>
      </div>
    </div>
  );

  if (disabled || !to) return content;
  return <Link to={to}>{content}</Link>;
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-cyan-400/20 border border-white/10 flex items-center justify-center mb-4">
        <Sparkles size={26} className="text-indigo-300" />
      </div>
      <div className="text-sm font-semibold text-white/80">No subjects assigned</div>
      <p className="text-xs text-white/40 mt-1.5 max-w-xs">
        You don't have any subjects assigned yet. Contact your administrator to get set up.
      </p>
    </div>
  );
}

function StatSkeleton() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl p-5 animate-pulse">
      <div className="h-11 w-11 rounded-xl bg-white/10 mb-4" />
      <div className="h-7 w-14 rounded bg-white/10 mb-2" />
      <div className="h-3 w-24 rounded bg-white/5" />
    </div>
  );
}

function SubjectSkeleton() {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 animate-pulse">
      <div className="h-4 w-32 rounded bg-white/10 mb-3" />
      <div className="h-5 w-16 rounded-full bg-white/10 mb-3" />
      <div className="h-3 w-40 rounded bg-white/5" />
    </div>
  );
}