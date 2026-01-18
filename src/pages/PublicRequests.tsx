import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChevronRight, MapPin, Droplets, Clock, AlertCircle, Heart, Filter, X, Plus, Users, ChevronLeft } from "lucide-react";
import { incrementClickCount } from "@/lib/clickTracking";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";

interface BloodRequest {
  id: string;
  blood_type: string;
  city: string;
  hospital_name: string;
  units_needed: number;
  urgency_level: string;
  patient_name: string | null;
  file_number: string | null;
  notes: string | null;
  created_at: string;
}

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const CITIES = ["مدينة الكويت", "حولي", "الفروانية", "الأحمدي", "الجهراء", "مبارك الكبير"];
const URGENCY_LEVELS = [
  { value: "normal", label: "عادي" },
  { value: "high", label: "مستعجل" },
  { value: "urgent", label: "طارئ" },
];

type BloodType = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";

// Blood type compatibility - who can a donor with blood type X donate TO
const CAN_DONATE_TO: Record<BloodType, BloodType[]> = {
  "O-": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"], // Universal donor
  "O+": ["O+", "A+", "B+", "AB+"],
  "A-": ["A-", "A+", "AB-", "AB+"],
  "A+": ["A+", "AB+"],
  "B-": ["B-", "B+", "AB-", "AB+"],
  "B+": ["B+", "AB+"],
  "AB-": ["AB-", "AB+"],
  "AB+": ["AB+"], // Can only donate to AB+
};

const urgencyColors: Record<string, string> = {
  normal: "bg-muted text-muted-foreground",
  high: "bg-warning/10 text-warning border-warning/20",
  urgent: "bg-destructive/10 text-destructive border-destructive/20",
};

const urgencyLabels: Record<string, string> = {
  normal: "عادي",
  high: "مستعجل",
  urgent: "طارئ",
};

export default function PublicRequests() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { data: profile } = useProfile();
  
  const [showCompatibleOnly, setShowCompatibleOnly] = useState(false);
  const [donorBloodType, setDonorBloodType] = useState<string>("all");
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [urgencyFilter, setUrgencyFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<BloodRequest | null>(null);
  const [showAuthAlert, setShowAuthAlert] = useState(false);

  const userBloodType = profile?.blood_type;

  // Determine which blood type to use for filtering
  const effectiveDonorType = showCompatibleOnly && userBloodType 
    ? userBloodType 
    : donorBloodType !== "all" 
      ? donorBloodType as BloodType 
      : null;

  const { data: requests, isLoading, error } = useQuery({
    queryKey: ["public-requests", effectiveDonorType, cityFilter, urgencyFilter],
    queryFn: async (): Promise<BloodRequest[]> => {
      let query = supabase
        .from("blood_requests")
        .select("id, blood_type, city, hospital_name, units_needed, urgency_level, patient_name, file_number, notes, created_at")
        .eq("status", "open")
        .order("created_at", { ascending: false })
        .limit(50);

      // Filter by blood types that the donor can donate to
      if (effectiveDonorType) {
        const canDonateTo = CAN_DONATE_TO[effectiveDonorType as BloodType] || [];
        if (canDonateTo.length > 0) {
          query = query.in("blood_type", canDonateTo);
        }
      }

      if (cityFilter !== "all") {
        query = query.eq("city", cityFilter);
      }
      if (urgencyFilter !== "all") {
        query = query.eq("urgency_level", urgencyFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  const handleCreateRequest = () => {
    if (isAuthenticated) {
      navigate("/create-request");
    } else {
      setShowAuthAlert(true);
    }
  };

  const handleGoToAuth = () => {
    setShowAuthAlert(false);
    navigate("/auth?redirect=create-request&mode=signup");
  };

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case "urgent":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "high":
        return "bg-warning/10 text-warning border-warning/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getUrgencyLabel = (level: string) => {
    switch (level) {
      case "urgent":
        return "عاجل جدًا";
      case "high":
        return "مستعجل";
      default:
        return "عادي";
    }
  };

  const hasActiveFilters = cityFilter !== "all" || urgencyFilter !== "all" || donorBloodType !== "all";
  
  const clearFilters = () => {
    setCityFilter("all");
    setUrgencyFilter("all");
    setDonorBloodType("all");
    setShowCompatibleOnly(false);
  };

  const activeFiltersCount = [cityFilter, urgencyFilter, donorBloodType].filter(f => f !== "all").length + (showCompatibleOnly ? 1 : 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-glass-border safe-area-top">
        <div className="flex items-center h-14 px-4 max-w-lg mx-auto">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1 text-primary ios-spring ios-press"
          >
            <ChevronRight className="w-5 h-5" />
            <span className="text-sm font-medium">رجوع</span>
          </button>
          <h1 className="flex-1 text-center text-lg font-semibold text-foreground pr-12">
            طلبات الدم
          </h1>
        </div>
      </header>

      <main className="pb-24 pt-4">
        <div className="max-w-lg mx-auto px-4">
          
          {/* Compatible Toggle for logged in users */}
          {isAuthenticated && userBloodType && (
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => {
                  setShowCompatibleOnly(true);
                  setDonorBloodType("all");
                }}
                className={cn(
                  "flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all",
                  showCompatibleOnly
                    ? "glass-strong text-primary shadow-glass"
                    : "glass text-muted-foreground"
                )}
              >
                <div className="flex items-center justify-center gap-2">
                  <Heart className="w-4 h-4" />
                  <span>يمكنني التبرع ({userBloodType})</span>
                </div>
              </button>
              <button
                onClick={() => setShowCompatibleOnly(false)}
                className={cn(
                  "flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all",
                  !showCompatibleOnly
                    ? "glass-strong text-primary shadow-glass"
                    : "glass text-muted-foreground"
                )}
              >
                <div className="flex items-center justify-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>جميع الطلبات</span>
                </div>
              </button>
            </div>
          )}

          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "w-full flex items-center justify-between",
              "glass-card rounded-xl p-4 mb-4",
              "transition-all duration-200 ios-spring ios-press"
            )}
          >
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-primary" />
              <span className="font-medium text-foreground">فلترة الطلبات</span>
              {activeFiltersCount > 0 && (
                <Badge className="bg-primary text-primary-foreground text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </div>
            <ChevronRight className={cn(
              "w-5 h-5 text-muted-foreground transition-transform",
              showFilters && "-rotate-90"
            )} />
          </button>

          {/* Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="glass-card rounded-xl p-4 mb-4 space-y-4">
                  {/* Donor Blood Type Filter */}
                  {!isAuthenticated && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">فصيلة دم المتبرع</label>
                      <Select value={donorBloodType} onValueChange={(value) => {
                        setDonorBloodType(value);
                        setShowCompatibleOnly(false);
                      }}>
                        <SelectTrigger className="glass">
                          <SelectValue placeholder="اختر فصيلتك لعرض الطلبات المتاحة" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">جميع الفصائل</SelectItem>
                          {BLOOD_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {donorBloodType !== "all" && (
                        <p className="text-xs text-muted-foreground">
                          يعرض الطلبات التي يمكنك التبرع لها بفصيلة {donorBloodType}
                        </p>
                      )}
                    </div>
                  )}

                  {/* City Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">المحافظة</label>
                    <Select value={cityFilter} onValueChange={setCityFilter}>
                      <SelectTrigger className="glass">
                        <SelectValue placeholder="جميع المحافظات" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">جميع المحافظات</SelectItem>
                        {CITIES.map((city) => (
                          <SelectItem key={city} value={city}>{city}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Urgency Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">مستوى الاستعجال</label>
                    <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
                      <SelectTrigger className="glass">
                        <SelectValue placeholder="جميع المستويات" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">جميع المستويات</SelectItem>
                        {URGENCY_LEVELS.map((level) => (
                          <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Clear Filters */}
                  {hasActiveFilters && (
                    <Button
                      variant="outline"
                      className="w-full gap-2 glass"
                      onClick={clearFilters}
                    >
                      <X className="w-4 h-4" />
                      مسح الفلاتر
                    </Button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active Filters Tags */}
          {hasActiveFilters && !showFilters && (
            <div className="flex flex-wrap gap-2 mb-4">
              {showCompatibleOnly && userBloodType && (
                <Badge variant="secondary" className="gap-1 glass">
                  متبرع: {userBloodType}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setShowCompatibleOnly(false)} />
                </Badge>
              )}
              {donorBloodType !== "all" && !showCompatibleOnly && (
                <Badge variant="secondary" className="gap-1 glass">
                  متبرع: {donorBloodType}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setDonorBloodType("all")} />
                </Badge>
              )}
              {cityFilter !== "all" && (
                <Badge variant="secondary" className="gap-1 glass">
                  {cityFilter}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setCityFilter("all")} />
                </Badge>
              )}
              {urgencyFilter !== "all" && (
                <Badge variant="secondary" className="gap-1 glass">
                  {URGENCY_LEVELS.find(l => l.value === urgencyFilter)?.label}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setUrgencyFilter("all")} />
                </Badge>
              )}
            </div>
          )}

          {/* Results count */}
          {!isLoading && requests && (
            <p className="text-sm text-muted-foreground mb-4">
              {requests.length} طلب {effectiveDonorType ? `يمكنك التبرع له` : "متاح"}
            </p>
          )}

          {/* Requests list */}
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass-card rounded-xl p-4 animate-pulse-soft">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-muted rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-24 bg-muted rounded" />
                      <div className="h-3 w-32 bg-muted rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">حدث خطأ في تحميل الطلبات</p>
            </div>
          ) : requests && requests.length > 0 ? (
            <div className="space-y-3">
              {requests.map((request, index) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => {
                    incrementClickCount(request.id);
                    setSelectedRequest(request);
                  }}
                  className="glass-card rounded-xl p-4 cursor-pointer active:scale-[0.98] transition-transform"
                >
                  <div className="flex items-start gap-3">
                    {/* Blood type badge */}
                    <div className="w-12 h-12 bg-destructive/10 rounded-xl flex items-center justify-center shrink-0">
                      <span className="text-destructive font-bold text-lg">
                        {request.blood_type}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground truncate">
                          {request.hospital_name}
                        </h3>
                        <span
                          className={cn(
                            "text-[10px] px-2 py-0.5 rounded-full border shrink-0",
                            getUrgencyColor(request.urgency_level)
                          )}
                        >
                          {getUrgencyLabel(request.urgency_level)}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {request.city}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>
                          {formatDistanceToNow(new Date(request.created_at), {
                            addSuffix: true,
                            locale: ar,
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Arrow indicator */}
                    <ChevronLeft className="w-5 h-5 text-muted-foreground self-center" />
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Droplets className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {effectiveDonorType 
                  ? `لا توجد طلبات يمكنك التبرع لها بفصيلة ${effectiveDonorType}` 
                  : hasActiveFilters 
                    ? "لا توجد طلبات مطابقة للفلاتر" 
                    : "لا توجد طلبات حاليًا"
                }
              </p>
              {(hasActiveFilters || showCompatibleOnly) && (
                <Button
                  variant="link"
                  className="mt-2"
                  onClick={clearFilters}
                >
                  عرض جميع الطلبات
                </Button>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Floating Create Request Button with Text */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleCreateRequest}
        className={cn(
          "fixed bottom-6 left-1/2 -translate-x-1/2 z-50",
          "flex items-center gap-2 px-5 py-3 rounded-2xl",
          "bg-gradient-to-br from-destructive to-destructive/80",
          "text-white text-sm font-medium shadow-lg",
          "glow-primary"
        )}
      >
        <Plus className="w-5 h-5" strokeWidth={2.5} />
        <span>أضف إعلان طلب تبرع</span>
      </motion.button>

      {/* Auth Required Alert */}
      <AlertDialog open={showAuthAlert} onOpenChange={setShowAuthAlert}>
        <AlertDialogContent dir="rtl" className="glass-strong">
          <AlertDialogHeader>
            <AlertDialogTitle>يجب التسجيل أولاً</AlertDialogTitle>
            <AlertDialogDescription>
              لإضافة إعلان طلب تبرع، يجب عليك التسجيل أو تسجيل الدخول أولاً
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogAction onClick={handleGoToAuth} className="flex-1">
              تسجيل جديد
            </AlertDialogAction>
            <Button variant="outline" onClick={() => setShowAuthAlert(false)} className="flex-1">
              إلغاء
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Request Details Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
        <DialogContent className="max-w-md glass-strong" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-center">تفاصيل الطلب</DialogTitle>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-6 py-4">
              {/* Blood Type Header */}
              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center justify-center w-20 h-20 rounded-full bg-destructive/10">
                  <Droplets className="w-10 h-10 text-destructive" />
                </div>
                <div className="text-center">
                  <span className="text-3xl font-bold text-foreground">
                    {selectedRequest.blood_type}
                  </span>
                  <p className="text-lg text-muted-foreground">
                    {selectedRequest.units_needed} وحدة مطلوبة
                  </p>
                </div>
                <Badge className={cn("text-sm px-3 py-1", urgencyColors[selectedRequest.urgency_level || "normal"])}>
                  {urgencyLabels[selectedRequest.urgency_level || "normal"]}
                </Badge>
              </div>

              {/* Details Grid */}
              <div className="space-y-3 glass rounded-xl p-4">
                {selectedRequest.patient_name && (
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-muted-foreground">اسم المريض:</span>
                    <span className="font-medium text-foreground">{selectedRequest.patient_name}</span>
                  </div>
                )}

                {selectedRequest.file_number && (
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-muted-foreground">رقم الملف:</span>
                    <span className="font-medium text-foreground">{selectedRequest.file_number}</span>
                  </div>
                )}

                <div className="flex items-center gap-3 text-sm">
                  <span className="text-muted-foreground">المستشفى:</span>
                  <span className="font-medium text-foreground">{selectedRequest.hospital_name}</span>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <span className="text-muted-foreground">المدينة:</span>
                  <span className="font-medium text-foreground">{selectedRequest.city}</span>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <span className="text-muted-foreground">تاريخ الإنشاء:</span>
                  <span className="font-medium text-foreground">
                    {format(new Date(selectedRequest.created_at), "d MMMM yyyy - h:mm a", { locale: ar })}
                  </span>
                </div>
              </div>

              {/* Notes */}
              {selectedRequest.notes && (
                <div className="space-y-2">
                  <h4 className="font-medium text-foreground">ملاحظات</h4>
                  <p className="text-sm text-muted-foreground glass rounded-lg p-3">
                    {selectedRequest.notes}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
