import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { CreateRequestButton } from "@/components/home/CreateRequestButton";
import { useProfile } from "@/hooks/useProfile";
import { useMatchingRequestsCount } from "@/hooks/useMatchingRequestsCount";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, Lock, MapPin, ChevronLeft, AlertTriangle, Droplets, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import type { TabType } from "@/components/layout/BottomTabBar";
import { Badge } from "@/components/ui/badge";
import { RequestDetailsDialog } from "@/components/requests/RequestDetailsDialog";
import { incrementClickCount } from "@/lib/clickTracking";
import { GlassCard } from "@/components/ui/glass-card";
import { IOSButton } from "@/components/ui/ios-button";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";

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
  const [viewingRequest, setViewingRequest] = useState<any>(null);

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
        {/* Donation Status Card */}
        <GlassCard
          variant="strong"
          interactive
          className="overflow-hidden"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div 
                className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center relative",
                  profile?.isEligible 
                    ? "bg-gradient-to-br from-green-400/20 to-green-600/20" 
                    : "bg-gradient-to-br from-amber-400/20 to-amber-600/20"
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {profile?.isEligible ? (
                  <CheckCircle2 className="w-6 h-6 text-green-500" strokeWidth={2} />
                ) : (
                  <Lock className="w-6 h-6 text-amber-500" strokeWidth={2} />
                )}
                {/* Glow effect */}
                <div className={cn(
                  "absolute inset-0 rounded-2xl blur-xl opacity-50",
                  profile?.isEligible ? "bg-green-500/30" : "bg-amber-500/30"
                )} />
              </motion.div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">حالة التبرع</span>
                  <Badge className={cn(
                    "text-xs font-medium rounded-full px-2",
                    profile?.isEligible 
                      ? "bg-green-500/15 text-green-600 border-green-500/30 dark:text-green-400" 
                      : "bg-amber-500/15 text-amber-600 border-amber-500/30 dark:text-amber-400"
                  )}>
                    {profile?.isEligible ? "مؤهل للتبرع" : `متبقي ${profile?.daysRemaining} يوم`}
                  </Badge>
                </div>
                {profile?.blood_type && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <Droplets className="w-3.5 h-3.5 text-primary" />
                    <p className="text-sm text-muted-foreground">
                      فصيلة الدم: <span className="font-bold text-primary">{profile.blood_type}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={handleUpdateStatus}
              className="w-10 h-10 rounded-xl glass flex items-center justify-center hover:bg-foreground/5 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-muted-foreground rotate-180" />
            </button>
          </div>
        </GlassCard>

        {/* Nearby Requests Card */}
        <GlassCard
          variant="default"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-primary" strokeWidth={2} />
              </div>
              <h2 className="font-bold text-foreground">طلبات قريبة</h2>
            </div>
            <Badge variant="outline" className="text-primary border-primary/30 rounded-full px-3">
              {matchingCount ?? 0} طلب
            </Badge>
          </div>

          {requestsLoading ? (
            <LoadingState variant="list" count={2} />
          ) : nearbyRequests.length === 0 ? (
            <EmptyState
              icon={Heart}
              title="لا توجد طلبات قريبة"
              description="لا توجد طلبات تبرع في منطقتك حالياً"
              className="py-6"
            />
          ) : (
            <div className="space-y-2">
              {nearbyRequests.slice(0, 3).map((request, index) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  onClick={() => {
                    incrementClickCount(request.id);
                    setViewingRequest(request);
                  }}
                  className={cn(
                    "glass rounded-2xl p-3 flex items-center gap-3 cursor-pointer",
                    "active:scale-[0.98] transition-all duration-200",
                    "hover:bg-foreground/[0.02]",
                    request.urgency_level === "urgent" && "ring-1 ring-red-500/30 bg-red-500/5"
                  )}
                >
                  <div className={cn(
                    "w-11 h-11 rounded-xl flex items-center justify-center shrink-0",
                    "bg-gradient-to-br from-red-400/20 to-red-600/20"
                  )}>
                    <span className="font-bold text-red-500 text-sm">{request.blood_type}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground text-sm truncate">
                        {request.hospital_name}
                      </span>
                      {request.urgency_level === "urgent" && (
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                        >
                          <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                        </motion.div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {request.city} • {format(new Date(request.created_at), "dd MMM", { locale: ar })}
                    </p>
                  </div>
                  <ChevronLeft className="w-4 h-4 text-muted-foreground/50 shrink-0" />
                </motion.div>
              ))}
            </div>
          )}

          <IOSButton
            variant="secondary"
            onClick={handleViewRequests}
            className="mt-4 w-full"
          >
            عرض جميع الطلبات
          </IOSButton>
        </GlassCard>

        {/* Create Request Button */}
        <GlassCard
          variant="subtle"
          interactive
          glow
          onClick={handleCreateRequest}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center">
              <Droplets className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-foreground">إنشاء طلب تبرع</h3>
              <p className="text-sm text-muted-foreground">
                أطلب تبرع بالدم من المتبرعين القريبين
              </p>
            </div>
            <ChevronLeft className="w-5 h-5 text-primary rotate-180" />
          </div>
        </GlassCard>
      </div>

      {/* Request Details Dialog */}
      <RequestDetailsDialog
        request={viewingRequest}
        open={!!viewingRequest}
        onOpenChange={(open) => !open && setViewingRequest(null)}
        showActions={false}
      />
    </MobileLayout>
  );
}
