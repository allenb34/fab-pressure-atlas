import type { Facility } from "@/lib/facility-types";

export function KpiCards({ rows }: { rows: Facility[] }) {
  // KPI 1: pressure vs. delay
  const delayed = rows.filter((r) => r.delay_status === "Delayed >1yr" || r.delay_status === "Stalled");
  const onSched = rows.filter((r) => !(r.delay_status === "Delayed >1yr" || r.delay_status === "Stalled"));
  const avg = (arr: Facility[]) => {
    const v = arr.map((r) => r.pressure_score).filter((x): x is number => x != null);
    return v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0;
  };
  const dAvg = avg(delayed);
  const oAvg = avg(onSched);

  // KPI 2: data coverage across 3 confidence layers
  const flags = rows.flatMap((r) => [r.water_stress_confidence, r.grid_strain_confidence, r.disclosure_confidence]);
  const total = flags.length || 1;
  const verified = flags.filter((f) => f === "Verified").length;
  const modeled = flags.filter((f) => f === "Modeled").length;
  const unavail = total - verified - modeled;
  const pct = (n: number) => (n / total) * 100;

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-border bg-card p-3">
        <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Pressure vs. Delay
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <div>
            <div className="text-2xl font-bold text-amber font-mono">{dAvg.toFixed(2)}</div>
            <div className="text-[10px] text-muted-foreground">Delayed avg · n={delayed.length}</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-teal font-mono">{oAvg.toFixed(2)}</div>
            <div className="text-[10px] text-muted-foreground">On-schedule avg · n={onSched.length}</div>
          </div>
        </div>
        <div className="mt-2 text-[11px] italic text-[#9ca3af]">
          On-schedule and delayed facilities show similar pressure scores — geography may matter more than environmental risk.
        </div>
        <div className="mt-2 text-[10px] text-muted-foreground italic">Exploratory, small-n</div>
      </div>

      <div className="rounded-lg border border-border bg-card p-3">
        <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Data Coverage
        </div>
        <div className="mt-2 h-2 w-full flex overflow-hidden rounded-full bg-secondary">
          <div style={{ width: `${pct(verified)}%`, background: "var(--teal)" }} />
          <div style={{ width: `${pct(modeled)}%`, background: "var(--amber)" }} />
          <div style={{ width: `${pct(unavail)}%`, background: "var(--neutral)" }} />
        </div>
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px]">
          <Legend color="var(--teal)" label={`Verified ${pct(verified).toFixed(0)}%`} />
          <Legend color="var(--amber)" label={`Modeled ${pct(modeled).toFixed(0)}%`} />
          <Legend color="var(--neutral)" label={`Unavailable ${pct(unavail).toFixed(0)}%`} />
        </div>
        <div className="mt-2 text-[10px] text-muted-foreground italic">
          Across water stress, grid intensity, and disclosure confidence layers
        </div>
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-muted-foreground">
      <span className="h-2 w-2 rounded-sm" style={{ background: color }} />
      {label}
    </span>
  );
}
