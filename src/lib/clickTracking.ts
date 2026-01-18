import { supabase } from "@/integrations/supabase/client";

export async function incrementClickCount(requestId: string): Promise<void> {
  try {
    // Get current count
    const { data: request, error: fetchError } = await supabase
      .from("blood_requests")
      .select("click_count")
      .eq("id", requestId)
      .single();

    if (fetchError) {
      console.error("Error fetching request:", fetchError);
      return;
    }

    // Increment count
    const newCount = (request?.click_count || 0) + 1;
    
    const { error: updateError } = await supabase
      .from("blood_requests")
      .update({ click_count: newCount })
      .eq("id", requestId);

    if (updateError) {
      console.error("Error updating click count:", updateError);
    }
  } catch (error) {
    console.error("Error in incrementClickCount:", error);
  }
}
