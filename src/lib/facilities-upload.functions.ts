import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const rowSchema = z.object({
  facility_id: z.string(),
  company: z.string(),
  facility_name: z.string(),
  facility_type: z.string(),
  country: z.string(),
  region_state: z.string().nullable().optional(),
  latitude: z.number(),
  longitude: z.number(),
  status: z.string(),
  announced_year: z.number().nullable().optional(),
  target_production_year: z.number().nullable().optional(),
  actual_or_revised_year: z.number().nullable().optional(),
  delay_status: z.string().nullable().optional(),
  delay_source: z.string().nullable().optional(),
  capex_usd: z.number().nullable().optional(),
  capex_notes: z.string().nullable().optional(),
  node_technology: z.string().nullable().optional(),
  water_stress_score: z.number().nullable().optional(),
  water_stress_confidence: z.string().nullable().optional(),
  grid_carbon_intensity: z.number().nullable().optional(),
  grid_strain_confidence: z.string().nullable().optional(),
  disclosure_confidence: z.string().nullable().optional(),
  pressure_score: z.number().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export const uploadFacilities = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ rows: z.array(rowSchema), replace: z.boolean().optional() }).parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (data.replace) {
      const { error } = await supabaseAdmin.from("facilities").delete().neq("facility_id", "__never__");
      if (error) throw new Error(`Delete failed: ${error.message}`);
    }
    const { error, count } = await supabaseAdmin
      .from("facilities")
      .upsert(data.rows as never, { onConflict: "facility_id", count: "exact" });
    if (error) throw new Error(`Upsert failed: ${error.message}`);
    return { ok: true, inserted: count ?? data.rows.length };
  });
