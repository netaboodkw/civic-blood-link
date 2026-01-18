import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAppSettings } from "./useAppSettings";

export interface Profile {
  id: string;
  full_name: string;
  phone: string | null;
  blood_type: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
  city: string;
  role: "donor" | "requester" | "both";
  last_donation_date: string | null;
  created_at: string;
  updated_at: string;
}

interface ProfileWithEligibility extends Profile {
  isEligible: boolean;
  daysRemaining: number | null;
  eligibilityDays: number;
}

function calculateEligibility(lastDonationDate: string | null, eligibilityDays: number): { isEligible: boolean; daysRemaining: number | null } {
  if (!lastDonationDate) {
    return { isEligible: true, daysRemaining: null };
  }

  const lastDonation = new Date(lastDonationDate);
  const now = new Date();
  const daysSinceDonation = Math.floor((now.getTime() - lastDonation.getTime()) / (1000 * 60 * 60 * 24));
  
  const isEligible = daysSinceDonation >= eligibilityDays;
  const daysRemaining = isEligible ? null : Math.max(0, eligibilityDays - daysSinceDonation);

  return { isEligible, daysRemaining };
}

export function useProfile() {
  const { data: settings } = useAppSettings();
  const eligibilityDays = settings?.donation_eligibility_days || 60;

  return useQuery({
    queryKey: ["profile", eligibilityDays],
    queryFn: async (): Promise<ProfileWithEligibility | null> => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return null;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error);
        throw error;
      }

      if (!data) {
        return null;
      }

      const { isEligible, daysRemaining } = calculateEligibility(data.last_donation_date, eligibilityDays);

      return {
        ...data,
        isEligible,
        daysRemaining,
        eligibilityDays,
      } as ProfileWithEligibility;
    },
  });
}
