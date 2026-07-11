
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import {
  Mail,
  Building2,
  BookOpen,
  IdCard,
  Briefcase,
  Clock,
  Layers,
  Users2,
  AlertTriangle,
  Inbox,
} from "lucide-react";

/**
 * ENDPOINT NOTE
 * ---------------------------------------------------------------------
 * This page calls GET /faculty/me, as specified. That route does not
 * exist yet in the current backend — only GET /faculty/me/subjects is
 * implemented today. Until /faculty/me is added (returning user,
 * designation, department, and subjects[] in one payload), this page
 * will hit its error state in the running app. No backend or route
 * changes were made here per your instructions — this is UI-only,
 * built against the response shape you specified.
 * ---------------------------------------------------------------------
 */

interface FacultySubject {
  id: string;
  name: string;
  code: string;
  semester: number;
  section: string;
}

interface FacultyProfileResponse {
  id?: string;
  facultyId?: string;
  designation: string;
  user: {
    name: string;
    email: string;
  };
  department: {
    name: string;
  };
  subjects: FacultySubject[];
}

export function FacultyProfilePage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["faculty-profile"],
    queryFn: async () => (await api.get("/faculty/me")).data as FacultyProfileResponse,
  });

  const initials = useMemo(() => {
    if (!data?.user?.name) return "";
    return data.user.name
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }, [data]);

  if (isLoading) return <ProfileSkeleton />;
  if (isError) return <ErrorState onRetry={() => refetch()} message={extractErrorMessage(error)} />;
  if (!data) return null;

  const subjectCount = data.subjects?.length || 0;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0b0c14] text-white">
      {/* Background — consistent with the rest of SmartAttend's dark theme */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-40 -left-40 h-[32rem] w-[32rem] rounded-full bg-purple-600/20 blur-3xl animate-[pulse_9s_ease-in-out_infinite]" />
        <div className="absolute top-1/3 -right-32 h-[28rem] w-[28rem] rounded-full bg-cyan-500/15 blur-3xl animate-[pulse_11s_ease-in-out_infinite]" />
        <div className="absolute -bottom-40 left-1/4 h-[30rem] w-[30rem] rounded-full bg-indigo-600/20 blur-3xl animate-[pulse_13s_ease-in-out_infinite]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.18),transparent)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        {/* Hero card */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-6 sm:p-8 backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
          <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-gradient-to-br from-purple-500/25 to-cyan-400/15 blur-3xl" />
          <div className="relative flex flex-col sm:flex-row items-center sm:items-center gap-6">
            <div className="h-24 w-24 sm:h-28 sm:w-28 shrink-0 rounded-full bg-gradient-to-br from-purple-400 via-indigo-400 to-cyan-400 p-[3px] shadow-[0_8px_30px_rgba(99,102,241,0.35)]">
              <div className="h-full w-full rounded-full bg-[#0b0c14] flex items-center justify-center">
                <span className="font-display text-2xl sm:text-3xl font-semibold text-white">{initials}</span>
              </div>
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h1 className="font-display text-2xl sm:text-3xl font-semibold text-white">{data.user.name}</h1>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-200 bg-gradient-to-r from-indigo-500/20 to-cyan-400/20 border border-white/10 rounded-full px-3 py-1.5">
                  <Briefcase size={12} />
                  {data.designation || "Faculty"}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-white/70 border border-white/10 bg-white/5 rounded-full px-3 py-1.5">
                  <Building2 size={12} className="text-white/40" />
                  {data.department?.name || "—"}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-white/70 border border-white/10 bg-white/5 rounded-full px-3 py-1.5">
                  <Mail size={12} className="text-white/40" />
                  {data.user.email}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard icon={BookOpen} tone="indigo" label="Assigned Subjects" value={String(subjectCount)} />
          <StatCard icon={Building2} tone="emerald" label="Department" value={data.department?.name || "—"} />
          <StatCard icon={Briefcase} tone="amber" label="Role" value={data.designation || "Faculty"} />
          <StatCard icon={Clock} tone="rose" label="Experience" value="—" preview />
        </div>

        {/* Assigned subjects */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-white">Assigned subjects</h3>
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="text-xs font-medium text-white/40 hover:text-white transition-colors disabled:opacity-40"
            >
              {isFetching ? "Refreshing…" : "Refresh"}
            </button>
          </div>

          {subjectCount === 0 ? (
            <SubjectsEmptyState />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {data.subjects.map((s) => (
                <div
                  key={s.id}
                  className="group rounded-xl border border-white/10 bg-white/[0.02] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.06] hover:shadow-[0_8px_24px_rgba(99,102,241,0.15)]"
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-indigo-500/20 to-cyan-400/20 border border-white/10 flex items-center justify-center shrink-0">
                      <BookOpen size={16} className="text-indigo-300" />
                    </div>
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/50 font-mono">
                      {s.code}
                    </span>
                  </div>
                  <div className="font-medium text-white truncate">{s.name}</div>
                  <div className="flex items-center gap-3 text-xs text-white/40 mt-2">
                    <span className="flex items-center gap-1">
                      <Layers size={12} /> Semester {s.semester}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users2 size={12} /> Section {s.section}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Professional information */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
          <h3 className="font-display font-semibold text-white mb-4">Professional information</h3>
          <div className="space-y-3">
            <InfoRow icon={IdCard} label="Faculty ID" value={data.facultyId || data.id || "—"} preview={!data.facultyId && !data.id} />
            <InfoRow icon={Briefcase} label="Designation" value={data.designation || "—"} />
            <InfoRow icon={Building2} label="Department" value={data.department?.name || "—"} />
            <InfoRow icon={Mail} label="Email" value={data.user.email} />
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
  tone,
  label,
  value,
  preview,
}: {
  icon: any;
  tone: "indigo" | "emerald" | "amber" | "rose";
  label: string;
  value: string;
  preview?: boolean;
}) {
  const tones: Record<string, string> = {
    indigo: "from-indigo-500/20 to-indigo-400/10 text-indigo-300",
    emerald: "from-emerald-500/20 to-emerald-400/10 text-emerald-300",
    amber: "from-amber-500/20 to-amber-400/10 text-amber-300",
    rose: "from-rose-500/20 to-rose-400/10 text-rose-300",
  };
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.35)] transition-all duration-300 hover:-translate-y-1 hover:border-white/20">
      <div className="flex items-center justify-between mb-3">
        <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${tones[tone]} border border-white/10 flex items-center justify-center`}>
          <Icon size={17} />
        </div>
        {preview && (
          <span className="text-[10px] font-semibold uppercase tracking-wide text-white/30 border border-white/10 rounded-full px-2 py-0.5">
            Preview
          </span>
        )}
      </div>
      <div className="font-display text-lg font-semibold text-white truncate">{value}</div>
      <div className="text-xs text-white/40 mt-1">{label}</div>
    </div>
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

function SubjectsEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
        <Inbox size={22} className="text-white/30" />
      </div>
      <div className="text-sm font-semibold text-white/70">No subjects assigned</div>
      <p className="text-xs text-white/40 mt-1.5 max-w-xs">
        You don't have any subjects assigned yet. Contact your administrator to get set up.
      </p>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0b0c14] text-white flex items-center justify-center px-4">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-40 -left-40 h-[32rem] w-[32rem] rounded-full bg-purple-600/20 blur-3xl" />
        <div className="absolute -bottom-40 right-1/4 h-[28rem] w-[28rem] rounded-full bg-rose-500/10 blur-3xl" />
      </div>
      <div className="relative z-10 max-w-sm w-full rounded-2xl border border-rose-400/20 bg-rose-400/5 backdrop-blur-2xl p-8 text-center">
        <div className="h-12 w-12 rounded-2xl bg-rose-400/10 border border-rose-400/20 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={22} className="text-rose-300" />
        </div>
        <h2 className="font-display text-lg font-semibold text-white">Couldn't load your profile</h2>
        <p className="text-sm text-white/50 mt-2">{message}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 w-full rounded-xl bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 py-2.5 text-sm font-semibold text-[#0b0c14] transition hover:opacity-90"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

function extractErrorMessage(error: unknown): string {
  const anyErr = error as any;
  return (
    anyErr?.response?.data?.message ||
    anyErr?.message ||
    "Something went wrong while fetching your faculty profile."
  );
}

function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-[#0b0c14] text-white">
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-6">
          <div className="h-40 rounded-2xl border border-white/10 bg-white/[0.04]" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="h-24 rounded-2xl border border-white/10 bg-white/[0.04]" />
            <div className="h-24 rounded-2xl border border-white/10 bg-white/[0.04]" />
            <div className="h-24 rounded-2xl border border-white/10 bg-white/[0.04]" />
            <div className="h-24 rounded-2xl border border-white/10 bg-white/[0.04]" />
          </div>
          <div className="h-56 rounded-2xl border border-white/10 bg-white/[0.04]" />
          <div className="h-48 rounded-2xl border border-white/10 bg-white/[0.04]" />
        </div>
      </div>
    </div>
  );
}