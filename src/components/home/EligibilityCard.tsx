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
    <div className="bg-card rounded-2xl overflow-hidden animate-slide-up">
      {/* Card content */}
      <div className="p-5">
        {isLoading ? (
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-muted animate-pulse-soft" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-24 bg-muted rounded-lg animate-pulse-soft" />
              <div className="h-4 w-40 bg-muted rounded-lg animate-pulse-soft" />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            {/* Status icon */}
            <div
              className={cn(
                "flex items-center justify-center w-14 h-14 rounded-full",
                isEligible 
                  ? "bg-gradient-to-br from-success/20 to-success/5" 
                  : "bg-gradient-to-br from-warning/20 to-warning/5"
              )}
            >
              {isEligible ? (
                <CheckCircle2 className="w-7 h-7 text-success" strokeWidth={2} />
              ) : (
                <Lock className="w-6 h-6 text-warning" strokeWidth={2} />
              )}
            </div>

            {/* Status text */}
            <div className="flex-1">
              <h3 className="text-base font-semibold text-foreground mb-0.5">
                حالة التبرع
              </h3>
              {/* Badge */}
              <span
                className={cn(
                  "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                  isEligible 
                    ? "bg-success/10 text-success" 
                    : "bg-warning/10 text-warning"
                )}
              >
                {isEligible ? "مؤهل للتبرع" : "مقفول مؤقتًا"}
              </span>

              {/* Description */}
              <p className="mt-1.5 text-[13px] text-muted-foreground leading-relaxed">
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
            "mt-4 w-full flex items-center justify-between",
            "bg-muted hover:bg-muted/80 rounded-xl px-4 py-3",
            "text-foreground font-medium text-[15px]",
            "transition-all duration-200 ios-spring active:scale-[0.98]",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          <span>تحديث حالة التبرع</span>
          <ChevronLeft className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}
