interface Props {
  percentage: number;
  size?: number;
  label?: string;
}

export function AttendanceRing({ percentage, size = 120, label }: Props) {
  const radius = (size - 14) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(percentage, 100) / 100) * circumference;

  const color =
    percentage >= 75 ? "var(--color-signal)" : percentage >= 60 ? "var(--color-warn)" : "var(--color-danger)";

  return (
    <div className="relative inline-flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--color-border)"
          strokeWidth={10}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={10}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-display text-2xl font-semibold">{percentage}%</span>
        {label && <span className="text-xs text-[var(--color-muted)]">{label}</span>}
      </div>
    </div>
  );
}
