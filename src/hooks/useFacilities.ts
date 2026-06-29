import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Facility } from "@/lib/facility-types";

export function useFacilities() {
  return useQuery({
    queryKey: ["facilities"],
    queryFn: async (): Promise<Facility[]> => {
      const { data, error } = await supabase
        .from("facilities")
        .select("*")
        .order("pressure_score", { ascending: false, nullsFirst: false });
      if (error) throw error;
      return (data ?? []) as Facility[];
    },
  });
}
