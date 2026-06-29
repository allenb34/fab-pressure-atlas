import { statusColor } from "@/lib/facility-types";

export function StatusBadge({ status }: { status: string }) {
  const c = statusColor(status);
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide"
      style={{ borderColor: `${c}55`, color: c, background: `${c}15` }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: c }} />
      {status}
    </span>
  );
}

export function ConfidenceBadge({ value }: { value: string | null | undefined }) {
  const v = value ?? "Unavailable";
  const color =
    v === "Verified" ? "#00d4aa" : v === "Modeled" ? "#f59e0b" : "#6b7280";
  return (
    <span
      className="inline-flex items-center rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase"
      style={{ background: `${color}20`, color }}
    >
      {v}
    </span>
  );
}
