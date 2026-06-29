
CREATE TABLE public.facilities (
  facility_id text PRIMARY KEY,
  company text NOT NULL,
  facility_name text NOT NULL,
  facility_type text NOT NULL,
  country text NOT NULL,
  region_state text,
  latitude float8 NOT NULL,
  longitude float8 NOT NULL,
  status text NOT NULL,
  announced_year int4,
  target_production_year int4,
  actual_or_revised_year int4,
  delay_status text,
  delay_source text,
  capex_usd float8,
  capex_notes text,
  node_technology text,
  water_stress_score float8,
  water_stress_confidence text,
  grid_carbon_intensity float8,
  grid_strain_confidence text,
  disclosure_confidence text,
  pressure_score float8,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.facilities TO anon;
GRANT SELECT ON public.facilities TO authenticated;
GRANT ALL ON public.facilities TO service_role;

ALTER TABLE public.facilities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access to facilities"
  ON public.facilities FOR SELECT
  TO anon, authenticated
  USING (true);
