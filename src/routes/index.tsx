import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { NavBar } from "@/components/NavBar";
import { FabMap } from "@/components/FabMap";
import { FilterPanel } from "@/components/FilterPanel";
import { KpiCards } from "@/components/KpiCards";
import { FiltersProvider, useFilters } from "@/components/FiltersContext";
import { useFacilities } from "@/hooks/useFacilities";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FabPressure — Semiconductor Expansion Risk Atlas" },
      { name: "description", content: "Where does global semiconductor fab expansion face the greatest operational and environmental pressure? An interactive intelligence atlas." },
      { property: "og:title", content: "FabPressure — Semiconductor Expansion Risk Atlas" },
      { property: "og:description", content: "Where does semiconductor expansion face the greatest operational and environmental pressure?" },
    ],
  }),
  component: AtlasPage,
});

function AtlasPage() {
  return (
    <FiltersProvider>
      <div className="flex flex-col h-screen">
        <NavBar />
        <AtlasBody />
      </div>
    </FiltersProvider>
  );
}

function AtlasBody() {
  const { data: rows = [], isLoading, error } = useFacilities();
  const { apply } = useFilters();
  const filtered = useMemo(() => apply(rows), [apply, rows]);
  const [open, setOpen] = useState(false);

  return (
    <div className="flex-1 flex relative overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`absolute md:relative z-[900] h-full w-[320px] max-w-[85vw] border-r border-border bg-background flex flex-col transition-transform ${
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-4 border-b border-border">
          <h1 className="text-base font-bold tracking-tight">
            Expansion Risk Atlas
          </h1>
          <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
            Where does semiconductor expansion face the greatest operational and environmental pressure?
          </p>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {rows.length === 0 && !isLoading ? (
            <EmptyState />
          ) : (
            <>
              <FilterPanel rows={rows} />
              <div className="pt-2 border-t border-border">
                <KpiCards rows={filtered} />
              </div>
              <div className="pt-2 border-t border-border">
                <Legend />
              </div>
            </>
          )}
        </div>
      </aside>

      {/* Map */}
      <main className="flex-1 relative">
        {isLoading && <Loading />}
        {error && <ErrorBox msg={(error as Error).message} />}
        <FabMap facilities={filtered} />
        <button
          onClick={() => setOpen((v) => !v)}
          className="md:hidden absolute top-3 left-3 z-[800] rounded-md bg-card border border-border p-2 shadow-lg"
          aria-label="Toggle filters"
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </main>
    </div>
  );
}

function Legend() {
  const steps = [
    { c: "#2f8a5b", l: "Low" },
    { c: "#a3c44a", l: "Low-Med" },
    { c: "#f59e0b", l: "Med-High" },
    { c: "#f97316", l: "High" },
    { c: "#ef4444", l: "Extreme" },
  ];
  return (
    <div>
      <h4 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">Pressure Legend</h4>
      <div className="flex h-2 w-full overflow-hidden rounded">
        {steps.map((s) => (
          <div key={s.c} className="flex-1" style={{ background: s.c }} />
        ))}
      </div>
      <div className="mt-1 flex justify-between text-[9px] text-muted-foreground">
        {steps.map((s) => <span key={s.c}>{s.l}</span>)}
      </div>
      <div className="mt-3 text-[10px] text-muted-foreground space-y-1">
        <div>● Circle size = capex (log scale)</div>
        <div>○ White ring = delayed / stalled</div>
        <div>✕ Gray = cancelled</div>
      </div>
    </div>
  );
}

function Loading() {
  return (
    <div className="absolute inset-0 z-[700] grid place-items-center pointer-events-none">
      <div className="rounded bg-card/90 border border-border px-3 py-2 text-xs text-muted-foreground">
        Loading facilities…
      </div>
    </div>
  );
}

function ErrorBox({ msg }: { msg: string }) {
  return (
    <div className="absolute top-4 right-4 z-[800] max-w-sm rounded-md border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
      {msg}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-xs text-muted-foreground space-y-3">
      <div className="rounded border border-amber/40 bg-amber/10 p-3 text-amber">
        No facilities loaded yet. Upload your CSV to populate the atlas.
      </div>
      <Link
        to="/admin"
        className="block text-center rounded bg-teal/15 text-teal py-2 font-semibold hover:bg-teal/25 transition"
      >
        Open CSV uploader →
      </Link>
    </div>
  );
}
