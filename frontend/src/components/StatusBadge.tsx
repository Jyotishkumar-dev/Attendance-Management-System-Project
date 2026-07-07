import type { AttendanceStatus } from "../lib/types";

const styles: Record<AttendanceStatus, string> = {
  PRESENT: "bg-[var(--color-brand-light)] text-[var(--color-signal)]",
  ABSENT: "bg-red-50 text-[var(--color-danger)]",
  LATE: "bg-amber-50 text-[var(--color-warn)]",
  MEDICAL_LEAVE: "bg-sky-50 text-sky-700",
  ON_DUTY: "bg-violet-50 text-violet-700",
  HOLIDAY: "bg-gray-100 text-gray-600",
};

const labels: Record<AttendanceStatus, string> = {
  PRESENT: "Present",
  ABSENT: "Absent",
  LATE: "Late",
  MEDICAL_LEAVE: "Medical Leave",
  ON_DUTY: "On Duty",
  HOLIDAY: "Holiday",
};

export function StatusBadge({ status }: { status: AttendanceStatus }) {
  return <span className={`badge ${styles[status]}`}>{labels[status]}</span>;
}
