import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { ClipboardList, Filter, Droplet, MapPin, Building2, AlertTriangle, X } from "lucide-react";
import type { TabType } from "@/components/layout/BottomTabBar";
import { useProfile } from "@/hooks/useProfile";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RequestDetailsDialog } from "@/components/requests/RequestDetailsDialog";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { incrementClickCount } from "@/lib/clickTracking";
import { CreateRequestButton } from "@/components/home/CreateRequestButton";

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

const BLOOD_TYPES: BloodType[] = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const CITIES = ["مدينة الكويت", "حولي", "الفروانية", "الجهراء", "الأحمدي", "مبارك الكبير"];

type RequestStatus = "open" | "fulfilled" | "cancelled" | "expired";

type BloodRequest = {
  id: string;
  requester_id: string;
  blood_type: BloodType;
  city: string;
  hospital_name: string;
  patient_name: string | null;
  units_needed: number;
  urgency_level: string | null;
  status: RequestStatus;
  notes: string | null;
  file_number: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
};

export default function Requests() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("requests");
  const [viewingRequest, setViewingRequest] = useState<BloodRequest | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedBloodType, setSelectedBloodType] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [urgentOnly, setUrgentOnly] = useState(false);

  const { data: profile } = useProfile();

  // Fetch all matching requests
  const { data: allRequests = [], isLoading } = useQuery({
    queryKey: ["all-matching-requests", profile?.blood_type],
    queryFn: async () => {
      if (!profile) return [];
      
      const compatibleTypes = CAN_DONATE_TO[profile.blood_type] || [profile.blood_type];
      
      const { data, error } = await supabase
        .from("blood_requests")
        .select("*")
        .eq("status", "open")
        .in("blood_type", compatibleTypes)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as BloodRequest[];
    },
    enabled: !!profile,
  });

  // Filter requests
  const filteredRequests = useMemo(() => {
    return allRequests.filter((request) => {
      if (selectedBloodType && request.blood_type !== selectedBloodType) return false;
      if (selectedCity && request.city !== selectedCity) return false;
      if (urgentOnly && request.urgency_level !== "urgent") return false;
      return true;
    });
  }, [allRequests, selectedBloodType, selectedCity, urgentOnly]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    switch (tab) {
      case "home":
        navigate("/home");
        break;
      case "requests":
        break;
      case "donate":
        navigate("/donate");
        break;
      case "profile":
        navigate("/profile");
        break;
    }
  };

  const clearFilters = () => {
    setSelectedBloodType(null);
    setSelectedCity(null);
    setUrgentOnly(false);
  };

  const hasActiveFilters = selectedBloodType || selectedCity || urgentOnly;

  return (
    <MobileLayout
      title="الطلبات المتاحة"
      activeTab={activeTab}
      onTabChange={handleTabChange}
    >
      <div className="flex flex-col h-full">
        {/* Filters Section */}
        <div className="space-y-3 mb-4">
          {/* Filter Toggle */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "flex items-center gap-2 glass rounded-xl px-4 py-2.5 transition-colors",
                showFilters && "bg-primary/10 text-primary"
              )}
            >
              <Filter className="w-4 h-4" strokeWidth={2} />
              <span className="text-sm font-medium">فلترة</span>
              {hasActiveFilters && (
                <Badge className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5">
                  {[selectedBloodType, selectedCity, urgentOnly].filter(Boolean).length}
                </Badge>
              )}
            </button>
            
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                مسح الفلاتر
              </button>
            )}
          </div>

          {/* Filter Options */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3 overflow-hidden"
              >
                {/* Blood Type Filter */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">فصيلة الدم</label>
                  <div className="flex flex-wrap gap-2">
                    {BLOOD_TYPES.map((type) => {
                      const donorType = (profile?.blood_type || "O+") as BloodType;
                      const compatibleTypes = CAN_DONATE_TO[donorType] || [];
                      const isCompatible = compatibleTypes.includes(type);
                      return (
                        <button
                          key={type}
                          onClick={() => setSelectedBloodType(selectedBloodType === type ? null : type)}
                          disabled={!isCompatible}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                            selectedBloodType === type
                              ? "bg-primary text-primary-foreground"
                              : isCompatible
                                ? "glass hover:bg-primary/10"
                                : "glass opacity-40 cursor-not-allowed"
                          )}
                        >
                          {type}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* City Filter */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">المدينة</label>
                  <div className="flex flex-wrap gap-2">
                    {CITIES.map((city) => (
                      <button
                        key={city}
                        onClick={() => setSelectedCity(selectedCity === city ? null : city)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                          selectedCity === city
                            ? "bg-primary text-primary-foreground"
                            : "glass hover:bg-primary/10"
                        )}
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Urgent Only */}
                <button
                  onClick={() => setUrgentOnly(!urgentOnly)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                    urgentOnly
                      ? "bg-red-500/10 text-red-500 ring-1 ring-red-500/30"
                      : "glass hover:bg-red-500/5"
                  )}
                >
                  <AlertTriangle className="w-4 h-4" />
                  الحالات العاجلة فقط
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results count */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{filteredRequests.length} طلب متاح</span>
            {profile?.blood_type && (
              <span className="flex items-center gap-1">
                <Droplet className="w-3.5 h-3.5 text-primary" fill="currentColor" />
                يمكنك التبرع لـ {profile.blood_type}
              </span>
            )}
          </div>
        </div>

        {/* Requests List */}
        <div className="flex-1 overflow-auto pb-20">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="glass-card rounded-2xl p-4 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-muted rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-24 bg-muted rounded" />
                      <div className="h-3 w-32 bg-muted rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center mb-4">
                <ClipboardList className="w-8 h-8 text-muted-foreground" strokeWidth={1.5} />
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-2">
                لا توجد طلبات
              </h2>
              <p className="text-sm text-muted-foreground">
                {hasActiveFilters ? "جرب تغيير الفلاتر" : "لا توجد طلبات متاحة حالياً"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRequests.map((request, index) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => {
                    incrementClickCount(request.id);
                    setViewingRequest(request);
                  }}
                  className={cn(
                    "glass-card rounded-2xl p-4 cursor-pointer active:scale-[0.98] transition-transform",
                    request.urgency_level === "urgent" && "ring-2 ring-red-500/30"
                  )}
                >
                  <div className="flex items-center gap-4">
                    {/* Blood Type */}
                    <div className="w-14 h-14 glass rounded-xl flex flex-col items-center justify-center bg-red-500/10 shrink-0">
                      <Droplet className="w-4 h-4 text-red-500 mb-0.5" fill="currentColor" strokeWidth={1.5} />
                      <span className="text-sm font-bold text-red-500">{request.blood_type}</span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-foreground truncate">{request.patient_name || "مريض"}</h3>
                        {request.urgency_level === "urgent" && (
                          <Badge className="bg-red-500 text-white text-xs gap-1 shrink-0">
                            <AlertTriangle className="w-3 h-3" />
                            عاجل
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Building2 className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
                        <span className="truncate">{request.hospital_name}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" strokeWidth={2} />
                          {request.city}
                        </div>
                        <span>•</span>
                        <span>{format(new Date(request.created_at), "dd MMM", { locale: ar })}</span>
                        <span>{format(new Date(request.created_at), "dd MMM", { locale: ar })}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Floating Create Request Button */}
        <div className="fixed bottom-24 left-4 right-4 z-10">
          <CreateRequestButton onClick={() => navigate("/create-request")} />
        </div>
      </div>

      {/* Details Dialog */}
      <RequestDetailsDialog
        request={viewingRequest}
        open={!!viewingRequest}
        onOpenChange={(open) => !open && setViewingRequest(null)}
        showActions={false}
      />
    </MobileLayout>
  );
}
