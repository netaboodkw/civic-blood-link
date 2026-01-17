import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
}

function calculateEligibility(lastDonationDate: string | null): { isEligible: boolean; daysRemaining: number | null } {
  if (!lastDonationDate) {
    return { isEligible: true, daysRemaining: null };
  }

  const lastDonation = new Date(lastDonationDate);
  const now = new Date();
  const daysSinceDonation = Math.floor((now.getTime() - lastDonation.getTime()) / (1000 * 60 * 60 * 24));
  
  const isEligible = daysSinceDonation >= 90;
  const daysRemaining = isEligible ? null : Math.max(0, 90 - daysSinceDonation);

  return { isEligible, daysRemaining };
}

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
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

      const { isEligible, daysRemaining } = calculateEligibility(data.last_donation_date);

      return {
        ...data,
        isEligible,
        daysRemaining,
      } as ProfileWithEligibility;
    },
  });
}
