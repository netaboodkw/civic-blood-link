import { supabase } from "@/integrations/supabase/client";
import { useAppSettings } from "./useAppSettings";

interface DuplicateCheckParams {
  patientName: string;
  hospitalName: string;
  fileNumber?: string;
}

interface DuplicateResult {
  isDuplicate: boolean;
  existingRequest?: {
    id: string;
    patient_name: string;
    hospital_name: string;
    blood_type: string;
    created_at: string;
  };
}

export function useDuplicateCheck() {
  const { data: settings } = useAppSettings();
  const duplicateCheckDays = settings?.duplicate_check_days || 3;

  const checkForDuplicate = async (params: DuplicateCheckParams): Promise<DuplicateResult> => {
    const { patientName, hospitalName, fileNumber } = params;

    // Calculate date threshold
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - duplicateCheckDays);

    // First check by file number if provided (exact match)
    if (fileNumber && fileNumber.trim()) {
      const { data: fileMatch } = await supabase
        .from("blood_requests")
        .select("id, patient_name, hospital_name, blood_type, created_at")
        .eq("file_number", fileNumber.trim())
        .eq("status", "open")
        .gte("created_at", thresholdDate.toISOString())
        .limit(1)
        .maybeSingle();

      if (fileMatch) {
        return {
          isDuplicate: true,
          existingRequest: fileMatch,
        };
      }
    }

    // Check by patient name and hospital (similarity check)
    const { data: similarRequests } = await supabase
      .from("blood_requests")
      .select("id, patient_name, hospital_name, blood_type, created_at")
      .eq("hospital_name", hospitalName)
      .eq("status", "open")
      .gte("created_at", thresholdDate.toISOString());

    if (similarRequests && similarRequests.length > 0) {
      // Simple similarity check - normalize and compare names
      const normalizedName = patientName.trim().toLowerCase().replace(/\s+/g, " ");
      
      for (const request of similarRequests) {
        const existingName = (request.patient_name || "").trim().toLowerCase().replace(/\s+/g, " ");
        
        // Check for exact match or high similarity
        if (existingName === normalizedName) {
          return {
            isDuplicate: true,
            existingRequest: request,
          };
        }
        
        // Check if names are very similar (contains each other)
        if (existingName.includes(normalizedName) || normalizedName.includes(existingName)) {
          if (existingName.length > 3 && normalizedName.length > 3) {
            return {
              isDuplicate: true,
              existingRequest: request,
            };
          }
        }
      }
    }

    return { isDuplicate: false };
  };

  return { checkForDuplicate, duplicateCheckDays };
}
