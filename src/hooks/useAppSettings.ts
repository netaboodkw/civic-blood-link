import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AppSettings {
  donation_eligibility_days: number;
  auto_archive_days: number;
  duplicate_check_days: number;
  whatsapp_notifications_enabled: boolean;
  whatsapp_urgency_filter: "all" | "high" | "urgent";
  whatsapp_blood_type_filter: "all" | "rare";
  app_logo_url: string;
}

const DEFAULT_SETTINGS: AppSettings = {
  donation_eligibility_days: 60,
  auto_archive_days: 7,
  duplicate_check_days: 3,
  whatsapp_notifications_enabled: false,
  whatsapp_urgency_filter: "all",
  whatsapp_blood_type_filter: "all",
  app_logo_url: "",
};

export function useAppSettings() {
  return useQuery({
    queryKey: ["app-settings"],
    queryFn: async (): Promise<AppSettings> => {
      const { data, error } = await supabase
        .from("app_settings")
        .select("key, value");

      if (error) {
        console.error("Error fetching settings:", error);
        return DEFAULT_SETTINGS;
      }

      const settings: AppSettings = { ...DEFAULT_SETTINGS };
      
      data?.forEach((item: { key: string; value: string }) => {
        switch (item.key) {
          case "donation_eligibility_days":
            settings.donation_eligibility_days = parseInt(item.value) || 60;
            break;
          case "auto_archive_days":
            settings.auto_archive_days = parseInt(item.value) || 7;
            break;
          case "duplicate_check_days":
            settings.duplicate_check_days = parseInt(item.value) || 3;
            break;
          case "whatsapp_notifications_enabled":
            settings.whatsapp_notifications_enabled = item.value === "true";
            break;
          case "whatsapp_urgency_filter":
            settings.whatsapp_urgency_filter = item.value as "all" | "high" | "urgent";
            break;
          case "whatsapp_blood_type_filter":
            settings.whatsapp_blood_type_filter = item.value as "all" | "rare";
            break;
          case "app_logo_url":
            settings.app_logo_url = item.value || "";
            break;
        }
      });

      return settings;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useUpdateAppSetting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const { error } = await supabase
        .from("app_settings")
        .update({ value })
        .eq("key", key);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["app-settings"] });
    },
  });
}
