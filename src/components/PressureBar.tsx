import { pressureBucket } from "@/lib/facility-types";

export function PressureBar({ score, label = "Pressure Score" }: { score: number | null; label?: string }) {
  const s = score ?? 0.5;
  const b = pressureBucket(score);
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between text-[11px]">
        <span className="text-muted-foreground uppercase tracking-wide">{label}</span>
        <span className="font-mono text-foreground">
          {s.toFixed(2)} <span className="text-muted-foreground">· {b.label}</span>
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${Math.max(2, s * 100)}%`, background: b.hex }}
        />
      </div>
    </div>
  );
}
