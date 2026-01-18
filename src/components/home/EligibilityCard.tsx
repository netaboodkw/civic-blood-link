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
      className="glass-card rounded-3xl overflow-hidden"
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="p-5">
        {isLoading ? (
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full shimmer" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-24 rounded-lg shimmer" />
              <div className="h-4 w-40 rounded-lg shimmer" />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            {/* Status icon with glow */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.4, ease: "easeOut" }}
              className={cn(
                "flex items-center justify-center w-14 h-14 rounded-full",
                isEligible 
                  ? "bg-gradient-to-br from-success/25 to-success/10 shadow-[0_0_20px_hsl(158_60%_45%/0.3)]" 
                  : "bg-gradient-to-br from-warning/25 to-warning/10 shadow-[0_0_20px_hsl(38_90%_50%/0.3)]"
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
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <h3 className="text-base font-semibold text-foreground mb-1">
                حالة التبرع
              </h3>
              <span
                className={cn(
                  "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold",
                  isEligible 
                    ? "badge-eligible" 
                    : "badge-locked"
                )}
              >
                {isEligible ? "مؤهل للتبرع" : "مقفول مؤقتًا"}
              </span>

              <p className="mt-2 text-[13px] text-muted-foreground leading-relaxed">
                {isEligible ? (
                  "تقدر تستقبل تنبيهات مطابقة لفصيلتك"
                ) : (
                  <>
                    متبقي{" "}
                    <span className="font-bold text-warning">
                      {daysRemaining}
                    </span>{" "}
                    يوم حتى ترجع مؤهل
                  </>
                )}
              </p>
            </motion.div>
          </div>
        )}

        {/* CTA Button - Glass style */}
        <motion.button
          onClick={onUpdateStatus}
          disabled={isLoading}
          whileTap={{ scale: 0.97 }}
          className={cn(
            "mt-5 w-full flex items-center justify-between",
            "glass rounded-2xl px-4 py-3.5",
            "text-foreground font-medium text-[15px]",
            "transition-all duration-300",
            "hover:bg-primary/5",
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
