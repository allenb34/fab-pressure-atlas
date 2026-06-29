import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { Facility } from "@/lib/facility-types";

export type FilterState = {
  companies: string[];           // selected; empty = all
  facilityType: "all" | "Front-End Fab" | "Back-End Assembly-Test";
  statuses: string[];
  delayedOnly: boolean;
  country: string;               // "" = all
};

type Ctx = {
  filters: FilterState;
  setFilters: (f: FilterState | ((p: FilterState) => FilterState)) => void;
  apply: (rows: Facility[]) => Facility[];
};

const FiltersContext = createContext<Ctx | null>(null);

const initial: FilterState = {
  companies: [],
  facilityType: "all",
  statuses: [],
  delayedOnly: false,
  country: "",
};

export function FiltersProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<FilterState>(initial);

  const value = useMemo<Ctx>(
    () => ({
      filters,
      setFilters,
      apply: (rows) =>
        rows.filter((r) => {
          if (filters.companies.length && !filters.companies.includes(r.company)) return false;
          if (filters.facilityType !== "all" && r.facility_type !== filters.facilityType) return false;
          if (filters.statuses.length && !filters.statuses.includes(r.status)) return false;
          if (filters.delayedOnly && !(r.delay_status === "Delayed >1yr" || r.delay_status === "Stalled")) return false;
          if (filters.country && r.country !== filters.country) return false;
          return true;
        }),
    }),
    [filters],
  );

  return <FiltersContext.Provider value={value}>{children}</FiltersContext.Provider>;
}

export function useFilters() {
  const ctx = useContext(FiltersContext);
  if (!ctx) throw new Error("useFilters must be used within FiltersProvider");
  return ctx;
}

export const ALL_COMPANIES = ["Intel", "TSMC", "Samsung", "Micron", "TI", "GlobalFoundries"];
export const ALL_STATUSES = ["Operational", "Under Construction", "Delayed", "Stalled", "Cancelled", "Announced"];
