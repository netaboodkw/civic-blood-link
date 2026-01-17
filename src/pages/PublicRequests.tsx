import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChevronRight, MapPin, Droplets, Clock, AlertCircle, Heart, Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
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

export default function PublicRequests() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [bloodTypeFilter, setBloodTypeFilter] = useState<string>("all");
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [urgencyFilter, setUrgencyFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  const { data: requests, isLoading, error } = useQuery({
    queryKey: ["public-requests", bloodTypeFilter, cityFilter, urgencyFilter],
    queryFn: async (): Promise<BloodRequest[]> => {
      let query = supabase
        .from("blood_requests")
        .select("id, blood_type, city, hospital_name, units_needed, urgency_level, patient_name, file_number, created_at")
        .eq("status", "open")
        .order("created_at", { ascending: false })
        .limit(50);

      if (bloodTypeFilter !== "all") {
        query = query.eq("blood_type", bloodTypeFilter as "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-");
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

  const handleRespond = () => {
    if (isAuthenticated) {
      navigate("/home");
    } else {
      navigate("/auth?redirect=donate");
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

  const hasActiveFilters = bloodTypeFilter !== "all" || cityFilter !== "all" || urgencyFilter !== "all";
  
  const clearFilters = () => {
    setBloodTypeFilter("all");
    setCityFilter("all");
    setUrgencyFilter("all");
  };

  const activeFiltersCount = [bloodTypeFilter, cityFilter, urgencyFilter].filter(f => f !== "all").length;

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
              {/* Blood Type Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">فصيلة الدم</label>
                <Select value={bloodTypeFilter} onValueChange={setBloodTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="جميع الفصائل" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الفصائل</SelectItem>
                    {BLOOD_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

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
              {bloodTypeFilter !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  {bloodTypeFilter}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setBloodTypeFilter("all")} />
                </Badge>
              )}
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

          {/* Info banner */}
          <div className="bg-primary-soft rounded-xl p-4 mb-6 animate-slide-up">
            <div className="flex items-start gap-3">
              <Heart className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm text-foreground font-medium mb-1">
                  هل تريد المساعدة؟
                </p>
                <p className="text-xs text-muted-foreground">
                  سجّل حسابك للتواصل مع أصحاب الطلبات والتبرع بالدم
                </p>
              </div>
            </div>
          </div>

          {/* Results count */}
          {!isLoading && requests && (
            <p className="text-sm text-muted-foreground mb-4">
              {requests.length} طلب {hasActiveFilters ? "مطابق" : "متاح"}
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
                {hasActiveFilters ? "لا توجد طلبات مطابقة للفلاتر" : "لا توجد طلبات حاليًا"}
              </p>
              {hasActiveFilters && (
                <Button
                  variant="link"
                  className="mt-2"
                  onClick={clearFilters}
                >
                  مسح الفلاتر
                </Button>
              )}
            </div>
          )}

          {/* CTA Button */}
          <div className="mt-8 animate-slide-up" style={{ animationDelay: "300ms" }}>
            <button
              onClick={handleRespond}
              className={cn(
                "w-full flex items-center justify-center gap-2",
                "bg-primary text-primary-foreground",
                "rounded-xl px-6 py-4",
                "font-semibold text-base",
                "shadow-card hover:shadow-elevated",
                "transition-all duration-200 ios-spring ios-press"
              )}
            >
              <Heart className="w-5 h-5" fill="currentColor" />
              <span>{isAuthenticated ? "الذهاب للتبرع" : "سجّل للتبرع"}</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
