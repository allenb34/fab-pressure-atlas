import { ALL_COMPANIES, ALL_STATUSES, useFilters } from "./FiltersContext";
import type { Facility } from "@/lib/facility-types";

export function FilterPanel({ rows }: { rows: Facility[] }) {
  const { filters, setFilters } = useFilters();
  const countries = Array.from(new Set(rows.map((r) => r.country))).sort();

  const toggle = (key: "companies" | "statuses", value: string) => {
    setFilters((f) => {
      const arr = f[key];
      return {
        ...f,
        [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
      };
    });
  };

  return (
    <div className="space-y-4 text-xs">
      <Section title="Company">
        <div className="grid grid-cols-2 gap-1.5">
          {ALL_COMPANIES.map((c) => (
            <Checkbox
              key={c}
              label={c}
              checked={filters.companies.includes(c)}
              onChange={() => toggle("companies", c)}
            />
          ))}
        </div>
      </Section>

      <Section title="Facility Type">
        <div className="flex gap-1 rounded-md bg-secondary p-1">
          {(["all", "Front-End Fab", "Back-End Assembly-Test"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setFilters((f) => ({ ...f, facilityType: v }))}
              className={`flex-1 rounded px-2 py-1 text-[10px] font-medium transition ${
                filters.facilityType === v
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {v === "all" ? "All" : v === "Front-End Fab" ? "Front-End" : "Back-End"}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Status">
        <div className="grid grid-cols-2 gap-1.5">
          {ALL_STATUSES.map((s) => (
            <Checkbox
              key={s}
              label={s}
              checked={filters.statuses.includes(s)}
              onChange={() => toggle("statuses", s)}
            />
          ))}
        </div>
      </Section>

      <Section title="Delay">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            className="accent-teal"
            checked={filters.delayedOnly}
            onChange={(e) => setFilters((f) => ({ ...f, delayedOnly: e.target.checked }))}
          />
          <span>Show delayed only</span>
        </label>
      </Section>

      <Section title="Country">
        <select
          value={filters.country}
          onChange={(e) => setFilters((f) => ({ ...f, country: e.target.value }))}
          className="w-full rounded-md border border-border bg-input px-2 py-1.5 text-xs"
        >
          <option value="">All countries</option>
          {countries.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h4 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{title}</h4>
      {children}
    </div>
  );
}

function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex items-center gap-1.5 cursor-pointer text-foreground/90 hover:text-foreground">
      <input type="checkbox" className="accent-teal" checked={checked} onChange={onChange} />
      <span className="truncate">{label}</span>
    </label>
  );
}
