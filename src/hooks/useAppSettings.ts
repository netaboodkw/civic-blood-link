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
  // Notification settings
  notification_eligibility_end_enabled: boolean;
  notification_eligibility_end_text: string;
  notification_emergency_enabled: boolean;
  notification_emergency_text: string;
  notification_periodic_enabled: boolean;
  notification_periodic_text: string;
  notification_periodic_hours: number;
  notification_channels: "in_app" | "whatsapp" | "both";
}

const DEFAULT_SETTINGS: AppSettings = {
  donation_eligibility_days: 60,
  auto_archive_days: 7,
  duplicate_check_days: 3,
  whatsapp_notifications_enabled: false,
  whatsapp_urgency_filter: "all",
  whatsapp_blood_type_filter: "all",
  app_logo_url: "",
  notification_eligibility_end_enabled: true,
  notification_eligibility_end_text: "أهلاً {name}! لقد انتهت فترة الانتظار ويمكنك التبرع بالدم الآن. تبرعك ينقذ حياة! 💉❤️",
  notification_emergency_enabled: true,
  notification_emergency_text: "حالة طارئة! يوجد طلب عاجل لفصيلة {blood_type} في {city}. ساعد في إنقاذ حياة! 🚨",
  notification_periodic_enabled: false,
  notification_periodic_text: "هناك {count} طلبات تبرع بالدم تنتظر مساعدتك في {city}. كن بطلاً اليوم! 💪",
  notification_periodic_hours: 24,
  notification_channels: "in_app",
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
          case "notification_eligibility_end_enabled":
            settings.notification_eligibility_end_enabled = item.value === "true";
            break;
          case "notification_eligibility_end_text":
            settings.notification_eligibility_end_text = item.value || DEFAULT_SETTINGS.notification_eligibility_end_text;
            break;
          case "notification_emergency_enabled":
            settings.notification_emergency_enabled = item.value === "true";
            break;
          case "notification_emergency_text":
            settings.notification_emergency_text = item.value || DEFAULT_SETTINGS.notification_emergency_text;
            break;
          case "notification_periodic_enabled":
            settings.notification_periodic_enabled = item.value === "true";
            break;
          case "notification_periodic_text":
            settings.notification_periodic_text = item.value || DEFAULT_SETTINGS.notification_periodic_text;
            break;
          case "notification_periodic_hours":
            settings.notification_periodic_hours = parseInt(item.value) || 24;
            break;
          case "notification_channels":
            settings.notification_channels = item.value as "in_app" | "whatsapp" | "both";
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
      // Try update first, if no rows affected then insert
      const { error: updateError, data: updateData } = await supabase
        .from("app_settings")
        .update({ value, updated_at: new Date().toISOString() })
        .eq("key", key)
        .select();

      if (updateError) throw updateError;
      
      // If no rows updated, insert
      if (!updateData || updateData.length === 0) {
        const { error: insertError } = await supabase
          .from("app_settings")
          .insert({ key, value });
        
        if (insertError) throw insertError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["app-settings"] });
    },
  });
}
