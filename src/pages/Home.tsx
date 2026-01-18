import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { NearbyRequestsCard } from "@/components/home/NearbyRequestsCard";
import { CreateRequestButton } from "@/components/home/CreateRequestButton";
import { useProfile } from "@/hooks/useProfile";
import { useMatchingRequestsCount } from "@/hooks/useMatchingRequestsCount";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, Lock, Droplet, MapPin, Building2, ChevronLeft, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import type { TabType } from "@/components/layout/BottomTabBar";
import { Badge } from "@/components/ui/badge";

type BloodType = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";

// Blood type compatibility - who can this donor donate to
const CAN_DONATE_TO: Record<BloodType, BloodType[]> = {
  "O-": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
  "O+": ["O+", "A+", "B+", "AB+"],
  "A-": ["A-", "A+", "AB-", "AB+"],
  "A+": ["A+", "AB+"],
  "B-": ["B-", "B+", "AB-", "AB+"],
  "B+": ["B+", "AB+"],
  "AB-": ["AB-", "AB+"],
  "AB+": ["AB+"],
};

export default function Home() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("home");

  const { data: profile, isLoading: profileLoading } = useProfile();
  const { 
    data: matchingCount, 
    isLoading: countLoading,
    isError: countError,
  } = useMatchingRequestsCount(
    profile ?? null, 
    profile?.isEligible ?? false
  );

  // Fetch nearby matching requests
  const { data: nearbyRequests = [], isLoading: requestsLoading } = useQuery({
    queryKey: ["nearby-requests", profile?.blood_type, profile?.city],
    queryFn: async () => {
      if (!profile) return [];
      
      const compatibleTypes = CAN_DONATE_TO[profile.blood_type] || [profile.blood_type];
      
      const { data, error } = await supabase
        .from("blood_requests")
        .select("*")
        .eq("status", "open")
        .eq("city", profile.city)
        .in("blood_type", compatibleTypes)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
    enabled: !!profile,
  });

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    
    switch (tab) {
      case "home":
        navigate("/home");
        break;
      case "requests":
        navigate("/my-requests");
        break;
      case "donate":
        navigate("/donate");
        break;
      case "profile":
        navigate("/profile");
        break;
    }
  };

  const handleUpdateStatus = () => {
    handleTabChange("donate");
  };

  const handleViewRequests = () => {
    navigate("/requests");
  };

  const handleCreateRequest = () => {
    navigate("/create-request");
  };

  return (
    <MobileLayout
      title="الرئيسية"
      activeTab={activeTab}
      onTabChange={handleTabChange}
    >
      <div className="space-y-4 py-2">
        {/* Compact Donation Status Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between glass-card rounded-2xl p-4"
        >
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              profile?.isEligible 
                ? "bg-green-500/10" 
                : "bg-amber-500/10"
            )}>
              {profile?.isEligible ? (
                <CheckCircle2 className="w-5 h-5 text-green-500" strokeWidth={2} />
              ) : (
                <Lock className="w-5 h-5 text-amber-500" strokeWidth={2} />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">حالة التبرع</span>
                <Badge className={cn(
                  "text-xs",
                  profile?.isEligible 
                    ? "bg-green-500/10 text-green-600 border-green-500/30" 
                    : "bg-amber-500/10 text-amber-600 border-amber-500/30"
                )}>
                  {profile?.isEligible ? "مؤهل" : `متبقي ${profile?.daysRemaining} يوم`}
                </Badge>
              </div>
              {profile?.blood_type && (
                <p className="text-sm text-muted-foreground">
                  فصيلة الدم: <span className="font-bold text-primary">{profile.blood_type}</span>
                </p>
              )}
            </div>
          </div>
          <button
            onClick={handleUpdateStatus}
            className="glass rounded-xl p-2.5 hover:bg-primary/5 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-muted-foreground rotate-180" />
          </button>
        </motion.div>

        {/* Nearby Requests Summary */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-4"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" strokeWidth={2} />
              <h2 className="font-bold text-foreground">طلبات قريبة</h2>
            </div>
            <Badge variant="outline" className="text-primary border-primary/30">
              {matchingCount ?? 0} طلب
            </Badge>
          </div>

          {requestsLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="glass rounded-xl p-3 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-muted rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-20 bg-muted rounded" />
                      <div className="h-3 w-32 bg-muted rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : nearbyRequests.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-muted-foreground text-sm">لا توجد طلبات قريبة حالياً</p>
            </div>
          ) : (
            <div className="space-y-2">
              {nearbyRequests.slice(0, 3).map((request, index) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  className={cn(
                    "glass rounded-xl p-3 flex items-center gap-3",
                    request.urgency_level === "urgent" && "ring-1 ring-red-500/30"
                  )}
                >
                  <div className="w-10 h-10 glass rounded-xl flex items-center justify-center bg-red-500/10">
                    <span className="font-bold text-red-500 text-sm">{request.blood_type}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground text-sm truncate">
                        {request.hospital_name}
                      </span>
                      {request.urgency_level === "urgent" && (
                        <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {request.units_needed} وحدات • {format(new Date(request.created_at), "dd MMM", { locale: ar })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <button
            onClick={handleViewRequests}
            className="mt-4 w-full glass rounded-xl py-3 text-center text-primary font-medium hover:bg-primary/5 transition-colors"
          >
            عرض جميع الطلبات
          </button>
        </motion.div>

        {/* Create Request Button */}
        <CreateRequestButton onClick={handleCreateRequest} />
      </div>
    </MobileLayout>
  );
}
