import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface UpdateRequestParams {
  id: string;
  patient_name?: string;
  file_number?: string;
  hospital_name?: string;
  city?: string;
  units_needed?: number;
  urgency_level?: string;
  notes?: string;
}

export function useUpdateRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: UpdateRequestParams) => {
      const { id, ...updates } = params;
      
      const { data, error } = await supabase
        .from("blood_requests")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating request:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-requests"] });
    },
  });
}

export function useCancelRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: string) => {
      const { data, error } = await supabase
        .from("blood_requests")
        .update({ status: "cancelled" })
        .eq("id", requestId)
        .select()
        .single();

      if (error) {
        console.error("Error cancelling request:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-requests"] });
    },
  });
}
