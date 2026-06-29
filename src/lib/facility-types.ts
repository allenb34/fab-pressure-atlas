export type Facility = {
  facility_id: string;
  company: string;
  facility_name: string;
  facility_type: string;
  country: string;
  region_state: string | null;
  latitude: number;
  longitude: number;
  status: string;
  announced_year: number | null;
  target_production_year: number | null;
  actual_or_revised_year: number | null;
  delay_status: string | null;
  delay_source: string | null;
  capex_usd: number | null;
  capex_notes: string | null;
  node_technology: string | null;
  water_stress_score: number | null;
  water_stress_confidence: string | null;
  grid_carbon_intensity: number | null;
  grid_strain_confidence: string | null;
  disclosure_confidence: string | null;
  pressure_score: number | null;
  notes: string | null;
};

export function pressureBucket(score: number | null): {
  label: string;
  cssVar: string;
  hex: string;
} {
  const s = score ?? 0.5;
  if (s < 0.2) return { label: "Low", cssVar: "var(--pressure-1)", hex: "#2f8a5b" };
  if (s < 0.4) return { label: "Low-Medium", cssVar: "var(--pressure-2)", hex: "#a3c44a" };
  if (s < 0.6) return { label: "Medium-High", cssVar: "var(--pressure-3)", hex: "#f59e0b" };
  if (s < 0.8) return { label: "High", cssVar: "var(--pressure-4)", hex: "#f97316" };
  return { label: "Extremely High", cssVar: "var(--pressure-5)", hex: "#ef4444" };
}

export function statusColor(status: string): string {
  switch (status) {
    case "Operational": return "#22c55e";
    case "Under Construction": return "#3b82f6";
    case "Delayed": return "#f59e0b";
    case "Stalled":
    case "Cancelled": return "#ef4444";
    default: return "#6b7280";
  }
}

export function confidenceColor(c: string | null | undefined): string {
  if (c === "Verified") return "var(--teal)";
  if (c === "Modeled") return "var(--amber)";
  return "var(--neutral)";
}

export function formatCapex(c: number | null): string {
  if (c == null) return "Undisclosed";
  if (c >= 1e9) return `$${(c / 1e9).toFixed(1)}B`;
  if (c >= 1e6) return `$${(c / 1e6).toFixed(0)}M`;
  return `$${c.toLocaleString()}`;
}

export function countryFlag(country: string): string {
  const map: Record<string, string> = {
    "United States": "🇺🇸",
    USA: "🇺🇸",
    Taiwan: "🇹🇼",
    "South Korea": "🇰🇷",
    Korea: "🇰🇷",
    Japan: "🇯🇵",
    Germany: "🇩🇪",
    China: "🇨🇳",
    Vietnam: "🇻🇳",
    Malaysia: "🇲🇾",
    Singapore: "🇸🇬",
    Ireland: "🇮🇪",
    Israel: "🇮🇱",
    India: "🇮🇳",
  };
  return map[country] ?? "🏳️";
}
