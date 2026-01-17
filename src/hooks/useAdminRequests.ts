import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useAdminRequests = () => {
  const queryClient = useQueryClient();

  const requestsQuery = useQuery({
    queryKey: ["admin-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blood_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ requestId, status }: { requestId: string; status: "open" | "fulfilled" | "cancelled" | "expired" }) => {
      const { error } = await supabase
        .from("blood_requests")
        .update({ status })
        .eq("id", requestId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-requests"] });
      toast.success("تم تحديث حالة الطلب");
    },
    onError: (error: Error) => {
      toast.error("حدث خطأ: " + error.message);
    },
  });

  const deleteRequestMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const { error } = await supabase
        .from("blood_requests")
        .delete()
        .eq("id", requestId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-requests"] });
      toast.success("تم حذف الطلب");
    },
    onError: (error: Error) => {
      toast.error("حدث خطأ: " + error.message);
    },
  });

  return {
    requests: requestsQuery.data || [],
    isLoading: requestsQuery.isLoading,
    updateStatus: updateStatusMutation.mutate,
    deleteRequest: deleteRequestMutation.mutate,
    isUpdating: updateStatusMutation.isPending,
    isDeleting: deleteRequestMutation.isPending,
  };
};
