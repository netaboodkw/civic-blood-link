import { MapPin, ChevronLeft, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface NearbyRequestsCardProps {
  count: number | null;
  isEligible: boolean;
  onViewRequests: () => void;
  isLoading?: boolean;
  error?: boolean;
}

export function NearbyRequestsCard({
  count,
  isEligible,
  onViewRequests,
  isLoading,
  error,
}: NearbyRequestsCardProps) {
  const displayCount = !isEligible ? 0 : (count ?? 0);

  return (
    <div className="bg-card rounded-xl shadow-card overflow-hidden animate-slide-up" style={{ animationDelay: "100ms" }}>
      {/* Card header */}
      <div className="px-5 py-4 border-b border-border">
        <h2 className="text-base font-semibold text-card-foreground">
          طلبات قريبة
        </h2>
      </div>

      {/* Card content */}
      <div className="p-5">
        {isLoading ? (
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-muted animate-pulse-soft" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-20 bg-muted rounded animate-pulse-soft" />
              <div className="h-3 w-32 bg-muted rounded animate-pulse-soft" />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            {/* Count display */}
            <div
              className={cn(
                "flex items-center justify-center w-14 h-14 rounded-2xl",
                displayCount > 0 ? "bg-accent/10" : "bg-muted"
              )}
            >
              {error ? (
                <AlertCircle className="w-6 h-6 text-muted-foreground" />
              ) : (
                <span
                  className={cn(
                    "text-2xl font-bold",
                    displayCount > 0 ? "text-accent" : "text-muted-foreground"
                  )}
                >
                  {error ? "—" : displayCount}
                </span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">طلب مطابق في مدينتك</span>
              </div>
              
              {!isEligible && (
                <p className="mt-1 text-xs text-warning">
                  لن تظهر طلبات حتى تصبح مؤهل
                </p>
              )}
            </div>
          </div>
        )}

        {/* CTA Button */}
        <button
          onClick={onViewRequests}
          disabled={isLoading || (!isEligible && displayCount === 0)}
          className={cn(
            "mt-5 w-full flex items-center justify-between",
            "bg-secondary hover:bg-secondary/80 rounded-xl px-4 py-3.5",
            "text-secondary-foreground font-medium text-sm",
            "transition-all duration-200 ios-spring ios-press",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          <span>عرض الطلبات</span>
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
