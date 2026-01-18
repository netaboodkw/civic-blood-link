import { supabase } from "@/integrations/supabase/client";

export async function incrementClickCount(requestId: string): Promise<void> {
  try {
    // Use the security definer function to increment click count
    const { error } = await supabase.rpc('increment_click_count', {
      request_id: requestId
    });

    if (error) {
      console.error("Error incrementing click count:", error);
    }
  } catch (error) {
    console.error("Error in incrementClickCount:", error);
  }
}
