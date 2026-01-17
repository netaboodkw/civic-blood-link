import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const useAdminRole = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["admin-role", user?.id],
    queryFn: async () => {
      if (!user?.id) return { isAdmin: false, roles: [] };

      const { data, error } = await supabase.rpc("get_user_roles", {
        _user_id: user.id,
      });

      if (error) {
        console.error("Error fetching user roles:", error);
        return { isAdmin: false, roles: [] };
      }

      const roles = data || [];
      const isAdmin = roles.includes("admin");

      return { isAdmin, roles };
    },
    enabled: !!user?.id,
  });
};
