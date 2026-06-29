import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { NavBar } from "@/components/NavBar";
import { uploadFacilities } from "@/lib/facilities-upload.functions";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin · Upload Facilities — FabPressure" }] }),
  component: AdminPage,
});

function AdminPage() {
  const upload = useServerFn(uploadFacilities);
  const router = useRouter();
  const [text, setText] = useState("");
  const [replace, setReplace] = useState(true);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onFile = async (f: File) => {
    setText(await f.text());
  };

  const onSubmit = async () => {
    setBusy(true); setError(null); setResult(null);
    try {
      const rows = parseCsv(text);
      const enriched = rows.map(computePressure);
      const res = await upload({ data: { rows: enriched, replace } });
      setResult(`Uploaded ${res.inserted} facilities.`);
      router.invalidate();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="mx-auto max-w-3xl w-full px-5 py-10 space-y-6">
        <header>
          <h1 className="text-xl font-bold">Upload Facilities CSV</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            CSV must have a header row matching the <code>facilities</code> table columns.
            Empty cells become null. <code>pressure_score</code> is recomputed on upload if missing.
          </p>
        </header>

        <div className="space-y-3">
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
            className="block text-xs file:mr-3 file:rounded file:border-0 file:bg-teal/15 file:px-3 file:py-1.5 file:text-teal file:font-semibold hover:file:bg-teal/25"
          />
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="…or paste CSV here"
            className="w-full h-64 rounded-md border border-border bg-input p-3 text-xs font-mono"
          />
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" className="accent-teal" checked={replace} onChange={(e) => setReplace(e.target.checked)} />
            Replace existing rows (delete all, then insert)
          </label>
          <button
            onClick={onSubmit}
            disabled={busy || !text.trim()}
            className="rounded-md bg-teal text-primary-foreground px-4 py-2 text-xs font-semibold disabled:opacity-50"
          >
            {busy ? "Uploading…" : "Upload"}
          </button>
          {result && <div className="rounded border border-teal/40 bg-teal/10 p-2 text-xs text-teal">{result}</div>}
          {error && <div className="rounded border border-destructive/40 bg-destructive/10 p-2 text-xs text-destructive whitespace-pre-wrap">{error}</div>}
        </div>

        <section className="space-y-2 text-xs text-muted-foreground border-t border-border pt-4">
          <p className="font-semibold text-foreground">CSV header (copy/paste):</p>
          <code className="block break-words rounded bg-secondary p-2 text-[10px]">
            facility_id,company,facility_name,facility_type,country,region_state,latitude,longitude,status,announced_year,target_production_year,actual_or_revised_year,delay_status,delay_source,capex_usd,capex_notes,node_technology,water_stress_score,water_stress_confidence,grid_carbon_intensity,grid_strain_confidence,disclosure_confidence,pressure_score,notes
          </code>
        </section>
      </main>
    </div>
  );
}

// --- CSV parser (RFC4180-ish, handles quoted fields & commas) ---
function parseCsv(text: string): Record<string, unknown>[] {
  const rows: string[][] = [];
  let cur: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += ch;
    } else {
      if (ch === '"') inQuotes = true;
      else if (ch === ",") { cur.push(field); field = ""; }
      else if (ch === "\n") { cur.push(field); rows.push(cur); cur = []; field = ""; }
      else if (ch === "\r") { /* skip */ }
      else field += ch;
    }
  }
  if (field.length || cur.length) { cur.push(field); rows.push(cur); }
  const cleaned = rows.filter((r) => r.some((c) => c.trim() !== ""));
  if (cleaned.length < 2) throw new Error("CSV must have a header and at least one row.");
  const header = cleaned[0].map((h) => h.trim());
  const intCols = new Set(["announced_year", "target_production_year", "actual_or_revised_year"]);
  const floatCols = new Set(["latitude", "longitude", "capex_usd", "water_stress_score", "grid_carbon_intensity", "pressure_score"]);
  return cleaned.slice(1).map((r) => {
    const obj: Record<string, unknown> = {};
    header.forEach((key, i) => {
      const raw = (r[i] ?? "").trim();
      if (raw === "" || raw.toLowerCase() === "null") {
        obj[key] = null;
      } else if (intCols.has(key)) {
        const n = parseInt(raw, 10);
        obj[key] = Number.isFinite(n) ? n : null;
      } else if (floatCols.has(key)) {
        const n = parseFloat(raw.replace(/[$,]/g, ""));
        obj[key] = Number.isFinite(n) ? n : null;
      } else {
        obj[key] = raw;
      }
    });
    return obj;
  });
}

// --- Pressure score computation ---
// Reference grid max (Ember-typical heavy coal regions are ~800 gCO2/kWh)
const GRID_MAX = 800;
function computePressure(r: Record<string, unknown>): Record<string, unknown> {
  if (typeof r.pressure_score === "number" && Number.isFinite(r.pressure_score)) return r;
  const water = typeof r.water_stress_score === "number" ? Math.min(1, r.water_stress_score / 5) : null;
  const grid = typeof r.grid_carbon_intensity === "number" ? Math.min(1, r.grid_carbon_intensity / GRID_MAX) : null;
  const discMap: Record<string, number> = { High: 0, Medium: 0.5, Low: 1 };
  const disc =
    typeof r.disclosure_confidence === "string" && r.disclosure_confidence in discMap
      ? discMap[r.disclosure_confidence as string]
      : null;
  const parts = [water, grid, disc].map((p) => (p == null ? 0.5 : p));
  const avg = parts.reduce((a, b) => a + b, 0) / parts.length;
  return { ...r, pressure_score: Number(avg.toFixed(4)) };
}
