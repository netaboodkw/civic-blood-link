import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DonationLog {
  id: string;
  donor_id: string;
  request_id: string | null;
  donation_date: string;
  notes: string | null;
  created_at: string;
}

export function useDonationLogs() {
  return useQuery({
    queryKey: ["donation-logs"],
    queryFn: async (): Promise<DonationLog[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return [];
      }

      const { data, error } = await supabase
        .from("donation_logs")
        .select("*")
        .eq("donor_id", user.id)
        .order("donation_date", { ascending: false });

      if (error) {
        console.error("Error fetching donation logs:", error);
        throw error;
      }

      return data || [];
    },
  });
}

export function useCreateDonationLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { donation_date: string; notes?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }

      const { data, error } = await supabase
        .from("donation_logs")
        .insert({
          donor_id: user.id,
          donation_date: params.donation_date,
          notes: params.notes || null,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating donation log:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["donation-logs"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}
