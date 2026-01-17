import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "./useProfile";

export function useMatchingRequestsCount(profile: Profile | null, isEligible: boolean) {
  return useQuery({
    queryKey: ["matching-requests-count", profile?.blood_type, profile?.city, isEligible],
    queryFn: async (): Promise<number> => {
      // Return 0 if user is not eligible
      if (!isEligible || !profile) {
        return 0;
      }

      const { count, error } = await supabase
        .from("blood_requests")
        .select("*", { count: "exact", head: true })
        .eq("status", "open")
        .eq("city", profile.city)
        .eq("blood_type", profile.blood_type);

      if (error) {
        console.error("Error fetching matching requests count:", error);
        throw error;
      }

      return count ?? 0;
    },
    enabled: !!profile,
    retry: 2,
  });
}
