import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useAdminStats = () => {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [usersResult, requestsResult, donationsResult] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("blood_requests").select("*", { count: "exact", head: true }),
        supabase.from("donation_logs").select("*", { count: "exact", head: true }),
      ]);

      const [openRequestsResult, fulfilledRequestsResult] = await Promise.all([
        supabase
          .from("blood_requests")
          .select("*", { count: "exact", head: true })
          .eq("status", "open"),
        supabase
          .from("blood_requests")
          .select("*", { count: "exact", head: true })
          .eq("status", "fulfilled"),
      ]);

      return {
        totalUsers: usersResult.count || 0,
        totalRequests: requestsResult.count || 0,
        totalDonations: donationsResult.count || 0,
        openRequests: openRequestsResult.count || 0,
        fulfilledRequests: fulfilledRequestsResult.count || 0,
      };
    },
  });
};
