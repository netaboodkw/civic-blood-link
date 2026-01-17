import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface BloodRequest {
  id: string;
  requester_id: string;
  blood_type: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
  units_needed: number;
  status: "open" | "fulfilled" | "cancelled" | "expired";
  city: string;
  hospital_name: string;
  urgency_level: string;
  patient_name: string | null;
  file_number: string | null;
  notes: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useMyRequests() {
  return useQuery({
    queryKey: ["my-requests"],
    queryFn: async (): Promise<BloodRequest[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return [];
      }

      const { data, error } = await supabase
        .from("blood_requests")
        .select("*")
        .eq("requester_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching my requests:", error);
        throw error;
      }

      return data || [];
    },
  });
}
