import { CheckCircle2, Lock, ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";
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
    <motion.div 
      className="bg-card rounded-2xl overflow-hidden"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
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
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.3, ease: "easeOut" }}
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
            </motion.div>

            {/* Status text */}
            <motion.div 
              className="flex-1"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15, duration: 0.3 }}
            >
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
            </motion.div>
          </div>
        )}

        {/* CTA Button */}
        <motion.button
          onClick={onUpdateStatus}
          disabled={isLoading}
          whileTap={{ scale: 0.98 }}
          className={cn(
            "mt-4 w-full flex items-center justify-between",
            "bg-muted hover:bg-muted/80 rounded-xl px-4 py-3",
            "text-foreground font-medium text-[15px]",
            "transition-colors duration-200",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          <span>تحديث حالة التبرع</span>
          <ChevronLeft className="w-5 h-5 text-muted-foreground" />
        </motion.button>
      </div>
    </motion.div>
  );
}
