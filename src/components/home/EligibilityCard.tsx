import { CheckCircle2, Lock, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface EligibilityCardProps {
  isEligible: boolean;
  daysRemaining: number | null;
  onUpdateStatus: () => void;
  isLoading?: boolean;
}

export function EligibilityCard({ 
  isEligible, 
  daysRemaining, 
  onUpdateStatus,
  isLoading 
}: EligibilityCardProps) {
  return (
    <div className="bg-card rounded-xl shadow-card overflow-hidden animate-slide-up">
      {/* Card header */}
      <div className="px-5 py-4 border-b border-border">
        <h2 className="text-base font-semibold text-card-foreground">
          حالة التبرع
        </h2>
      </div>

      {/* Card content */}
      <div className="p-5">
        {isLoading ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-muted animate-pulse-soft" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-24 bg-muted rounded animate-pulse-soft" />
              <div className="h-3 w-40 bg-muted rounded animate-pulse-soft" />
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-4">
            {/* Status icon */}
            <div
              className={cn(
                "flex items-center justify-center w-12 h-12 rounded-full",
                isEligible ? "bg-success-soft" : "bg-warning-soft"
              )}
            >
              {isEligible ? (
                <CheckCircle2 className="w-6 h-6 text-success" />
              ) : (
                <Lock className="w-6 h-6 text-warning" />
              )}
            </div>

            {/* Status text */}
            <div className="flex-1">
              {/* Badge */}
              <span
                className={cn(
                  "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
                  isEligible ? "badge-eligible" : "badge-locked"
                )}
              >
                {isEligible ? "مؤهل للتبرع" : "مقفول مؤقتًا"}
              </span>

              {/* Description */}
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {isEligible ? (
                  "تقدر تستقبل تنبيهات مطابقة لفصيلتك"
                ) : (
                  <>
                    متبقي{" "}
                    <span className="font-semibold text-warning">
                      {daysRemaining}
                    </span>{" "}
                    يوم حتى ترجع مؤهل
                  </>
                )}
              </p>
            </div>
          </div>
        )}

        {/* CTA Button */}
        <button
          onClick={onUpdateStatus}
          disabled={isLoading}
          className={cn(
            "mt-5 w-full flex items-center justify-between",
            "bg-primary-soft hover:bg-primary/10 rounded-xl px-4 py-3.5",
            "text-primary font-medium text-sm",
            "transition-all duration-200 ios-spring ios-press",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          <span>تحديث حالة التبرع</span>
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
