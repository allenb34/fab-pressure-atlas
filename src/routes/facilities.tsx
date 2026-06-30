import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { NavBar } from "@/components/NavBar";
import { FilterPanel } from "@/components/FilterPanel";
import { FiltersProvider, useFilters } from "@/components/FiltersContext";
import { useFacilities } from "@/hooks/useFacilities";
import { PressureBar } from "@/components/PressureBar";
import { StatusBadge, ConfidenceBadge } from "@/components/StatusBadge";
import { countryFlag, formatCapex } from "@/lib/facility-types";
import type { Facility } from "@/lib/facility-types";

const search = z.object({ focus: z.string().optional() });

export const Route = createFileRoute("/facilities")({
  validateSearch: search,
  head: () => ({
    meta: [
      { title: "Facility Profiles — FabPressure" },
      { name: "description", content: "Per-facility detail cards: pressure sub-scores, capex, status, delay, and data confidence flags for tracked semiconductor fabs." },
      { property: "og:title", content: "Facility Profiles — FabPressure" },
      { property: "og:description", content: "Per-facility detail cards for tracked semiconductor fabs." },
    ],
  }),
  component: () => (
    <FiltersProvider>
      <Body />
    </FiltersProvider>
  ),
});

type SortKey = "pressure" | "company" | "country" | "capex";

function Body() {
  const { data: rows = [], isLoading } = useFacilities();
  const { apply } = useFilters();
  const { focus } = Route.useSearch();
  const [sort, setSort] = useState<SortKey>("pressure");

  const filtered = useMemo(() => {
    let r = apply(rows);
    if (focus) r = r.filter((x) => x.facility_id === focus);
    const sorted = [...r];
    sorted.sort((a, b) => {
      switch (sort) {
        case "company": return a.company.localeCompare(b.company);
        case "country": return a.country.localeCompare(b.country);
        case "capex": return (b.capex_usd ?? 0) - (a.capex_usd ?? 0);
        default: return (b.pressure_score ?? 0) - (a.pressure_score ?? 0);
      }
    });
    return sorted;
  }, [apply, rows, focus, sort]);

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <div className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 grid md:grid-cols-[280px_1fr] gap-6">
        <aside className="md:sticky md:top-16 md:self-start space-y-4">
          <h1 className="text-base font-bold tracking-tight">Facility Profiles</h1>
          {focus && (
            <a
              href="/facilities"
              className="inline-block text-[11px] rounded bg-secondary px-2 py-1 text-muted-foreground hover:text-foreground"
            >
              ← Clear focus filter
            </a>
          )}
          <FilterPanel rows={rows} />
        </aside>
        <main className="min-w-0">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="text-xs text-muted-foreground">
              {filtered.length} facilit{filtered.length === 1 ? "y" : "ies"}
            </div>
            <label className="text-xs flex items-center gap-2">
              <span className="text-muted-foreground">Sort by</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="rounded-md border border-border bg-input px-2 py-1 text-xs"
              >
                <option value="pressure">Pressure Score</option>
                <option value="company">Company</option>
                <option value="country">Country</option>
                <option value="capex">Capex</option>
              </select>
            </label>
          </div>
          {isLoading ? (
            <div className="text-xs text-muted-foreground">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="text-xs text-muted-foreground rounded border border-border p-6 text-center">
              No facilities match the current filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filtered.map((f) => <FacilityCard key={f.facility_id} f={f} />)}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function FacilityCard({ f }: { f: Facility }) {
  // Sub-score normalization for display bars (0..1)
  const water = f.water_stress_score != null ? Math.min(1, f.water_stress_score / 5) : null;
  const gridMax = 800; // approx ceiling for normalization display
  const grid = f.grid_carbon_intensity != null ? Math.min(1, f.grid_carbon_intensity / gridMax) : null;
  const discMap: Record<string, number> = { High: 0, Medium: 0.5, Low: 1 };
  const disc = f.disclosure_confidence && f.disclosure_confidence in discMap ? discMap[f.disclosure_confidence] : null;

  return (
    <article className="rounded-lg border border-border bg-card p-4 space-y-3">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-bold truncate">{f.facility_name}</h3>
          <p className="text-[11px] text-muted-foreground truncate">
            {f.company} · {countryFlag(f.country)} {f.country}
            {f.region_state ? ` · ${f.region_state}` : ""}
          </p>
        </div>
        <StatusBadge status={f.status} />
      </header>

      <div className="flex flex-wrap gap-2 text-[10px]">
        <span className="rounded border border-border px-1.5 py-0.5 text-muted-foreground">
          {f.facility_type}
        </span>
        {f.delay_status && (
          <span
            className="rounded px-1.5 py-0.5"
            style={
              f.delay_status === "On Schedule"
                ? { background: "rgba(34,197,94,0.15)", color: "#22c55e" }
                : f.delay_status === "Cancelled"
                ? { background: "rgba(239,68,68,0.15)", color: "#ef4444" }
                : { background: "rgba(245,158,11,0.15)", color: "#f59e0b" }
            }
          >
            {f.delay_status}
          </span>
        )}
        <span className="rounded border border-border px-1.5 py-0.5 text-muted-foreground">
          {formatCapex(f.capex_usd)}
        </span>
        {f.node_technology && (
          <span className="rounded border border-border px-1.5 py-0.5 text-muted-foreground">
            {f.node_technology}
          </span>
        )}
      </div>

      <PressureBar score={f.pressure_score} />

      <div className="space-y-2 pt-2 border-t border-border">
        <SubScore label="Water Stress (WRI Aqueduct 4.0)" value={water} confidence={f.water_stress_confidence} />
        <SubScore label="Grid Carbon Intensity (Ember)" value={grid} confidence={f.grid_strain_confidence} />
        <SubScore label="Disclosure Confidence (inverted)" value={disc} confidence={f.disclosure_confidence} />
      </div>

      {f.delay_source && (
        <footer className="text-[10px] text-muted-foreground pt-1 border-t border-border">
          Source:{" "}
          {/^https?:\/\//.test(f.delay_source) ? (
            <a href={f.delay_source} target="_blank" rel="noreferrer" className="text-teal hover:underline">
              {f.delay_source}
            </a>
          ) : (
            f.delay_source
          )}
        </footer>
      )}
    </article>
  );
}

function SubScore({ label, value, confidence }: { label: string; value: number | null; confidence: string | null }) {
  const v = value ?? 0.5;
  return (
    <div>
      <div className="flex items-center justify-between text-[10px] mb-1">
        <span className="text-muted-foreground">{label}</span>
        <ConfidenceBadge value={confidence} />
      </div>
      <div className="h-1 w-full rounded-full bg-secondary overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${v * 100}%`,
            background: value == null ? "var(--neutral)" : "var(--teal)",
            opacity: value == null ? 0.4 : 1,
          }}
        />
      </div>
    </div>
  );
}
