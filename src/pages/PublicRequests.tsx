import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChevronRight, MapPin, Droplets, Clock, AlertCircle, Heart, Filter, X, Plus, Users } from "lucide-react";
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

interface BloodRequest {
  id: string;
  blood_type: string;
  city: string;
  hospital_name: string;
  units_needed: number;
  urgency_level: string;
  patient_name: string | null;
  file_number: string | null;
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

// Blood type compatibility chart - who can receive from whom
const COMPATIBLE_DONORS: Record<BloodType, BloodType[]> = {
  "A+": ["A+", "A-", "O+", "O-"],
  "A-": ["A-", "O-"],
  "B+": ["B+", "B-", "O+", "O-"],
  "B-": ["B-", "O-"],
  "AB+": ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
  "AB-": ["A-", "B-", "AB-", "O-"],
  "O+": ["O+", "O-"],
  "O-": ["O-"],
};

export default function PublicRequests() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { data: profile } = useProfile();
  
  const [showCompatibleOnly, setShowCompatibleOnly] = useState(true);
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [urgencyFilter, setUrgencyFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  const userBloodType = profile?.blood_type;

  const { data: requests, isLoading, error } = useQuery({
    queryKey: ["public-requests", showCompatibleOnly, userBloodType, cityFilter, urgencyFilter],
    queryFn: async (): Promise<BloodRequest[]> => {
      let query = supabase
        .from("blood_requests")
        .select("id, blood_type, city, hospital_name, units_needed, urgency_level, patient_name, file_number, created_at")
        .eq("status", "open")
        .order("created_at", { ascending: false })
        .limit(50);

      // Filter by compatible blood types if user is logged in and has blood type
      if (showCompatibleOnly && userBloodType) {
        const compatibleTypes = COMPATIBLE_DONORS[userBloodType] || [];
        if (compatibleTypes.length > 0) {
          query = query.in("blood_type", compatibleTypes);
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
      navigate("/auth?redirect=create-request");
    }
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

  const hasActiveFilters = cityFilter !== "all" || urgencyFilter !== "all";
  
  const clearFilters = () => {
    setCityFilter("all");
    setUrgencyFilter("all");
  };

  const activeFiltersCount = [cityFilter, urgencyFilter].filter(f => f !== "all").length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-navBar/80 backdrop-blur-xl border-b border-border safe-area-top">
        <div className="flex items-center h-14 px-4 max-w-lg mx-auto">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1 text-primary ios-spring ios-press"
          >
            <ChevronRight className="w-5 h-5" />
            <span className="text-sm font-medium">رجوع</span>
          </button>
          <h1 className="flex-1 text-center text-lg font-semibold text-navBar-title pr-12">
            طلبات الدم
          </h1>
        </div>
      </header>

      <main className="pb-8 pt-4">
        <div className="max-w-lg mx-auto px-4">
          
          {/* Compatible/All Toggle */}
          {isAuthenticated && userBloodType && (
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setShowCompatibleOnly(true)}
                className={cn(
                  "flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all",
                  showCompatibleOnly
                    ? "bg-primary text-primary-foreground shadow-card"
                    : "bg-card text-muted-foreground border border-border"
                )}
              >
                <div className="flex items-center justify-center gap-2">
                  <Heart className="w-4 h-4" />
                  <span>متوافقة مع {userBloodType}</span>
                </div>
              </button>
              <button
                onClick={() => setShowCompatibleOnly(false)}
                className={cn(
                  "flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all",
                  !showCompatibleOnly
                    ? "bg-primary text-primary-foreground shadow-card"
                    : "bg-card text-muted-foreground border border-border"
                )}
              >
                <div className="flex items-center justify-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>جميع الطلبات</span>
                </div>
              </button>
            </div>
          )}

          {/* Create Request CTA - Prominent Center Button */}
          <button
            onClick={handleCreateRequest}
            className={cn(
              "w-full flex items-center justify-center gap-3",
              "bg-gradient-to-r from-red-600 to-red-500",
              "text-white rounded-2xl p-5 mb-6",
              "shadow-lg hover:shadow-xl",
              "transition-all duration-300 transform hover:scale-[1.02]",
              "ios-spring ios-press"
            )}
          >
            <div className="bg-white/20 rounded-full p-2">
              <Plus className="w-6 h-6" />
            </div>
            <div className="text-right">
              <span className="text-lg font-bold block">نشر إعلان طلب تبرع</span>
              <span className="text-sm text-white/80">أنشئ طلب دم جديد</span>
            </div>
          </button>

          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "w-full flex items-center justify-between",
              "bg-card rounded-xl p-4 shadow-card mb-4",
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
          {showFilters && (
            <div className="bg-card rounded-xl p-4 shadow-card mb-4 space-y-4 animate-slide-up">
              {/* City Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">المحافظة</label>
                <Select value={cityFilter} onValueChange={setCityFilter}>
                  <SelectTrigger>
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
                  <SelectTrigger>
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
                  className="w-full gap-2"
                  onClick={clearFilters}
                >
                  <X className="w-4 h-4" />
                  مسح الفلاتر
                </Button>
              )}
            </div>
          )}

          {/* Active Filters Tags */}
          {hasActiveFilters && !showFilters && (
            <div className="flex flex-wrap gap-2 mb-4">
              {cityFilter !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  {cityFilter}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setCityFilter("all")} />
                </Badge>
              )}
              {urgencyFilter !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  {URGENCY_LEVELS.find(l => l.value === urgencyFilter)?.label}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setUrgencyFilter("all")} />
                </Badge>
              )}
            </div>
          )}

          {/* Results count */}
          {!isLoading && requests && (
            <p className="text-sm text-muted-foreground mb-4">
              {requests.length} طلب {showCompatibleOnly && userBloodType ? "متوافق" : "متاح"}
            </p>
          )}

          {/* Requests list */}
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card rounded-xl p-4 shadow-card animate-pulse-soft">
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
                <div
                  key={request.id}
                  className="bg-card rounded-xl p-4 shadow-card animate-slide-up card-interactive"
                  style={{ animationDelay: `${index * 50}ms` }}
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
                        <span className="flex items-center gap-1">
                          <Droplets className="w-3 h-3" />
                          {request.units_needed} وحدة
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
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Droplets className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {showCompatibleOnly && userBloodType 
                  ? "لا توجد طلبات متوافقة مع فصيلتك حالياً" 
                  : hasActiveFilters 
                    ? "لا توجد طلبات مطابقة للفلاتر" 
                    : "لا توجد طلبات حاليًا"
                }
              </p>
              {(hasActiveFilters || (showCompatibleOnly && userBloodType)) && (
                <Button
                  variant="link"
                  className="mt-2"
                  onClick={() => {
                    clearFilters();
                    setShowCompatibleOnly(false);
                  }}
                >
                  عرض جميع الطلبات
                </Button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
