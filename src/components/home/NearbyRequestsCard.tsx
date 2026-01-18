import { MapPin, ChevronLeft, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
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
    <motion.div 
      className="bg-card rounded-2xl overflow-hidden"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.4, ease: "easeOut" }}
    >
      {/* Card content */}
      <div className="p-5">
        {isLoading ? (
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-muted animate-pulse-soft" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-20 bg-muted rounded-lg animate-pulse-soft" />
              <div className="h-4 w-32 bg-muted rounded-lg animate-pulse-soft" />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            {/* Count display */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.3, ease: "easeOut" }}
              className={cn(
                "flex items-center justify-center w-14 h-14 rounded-2xl",
                displayCount > 0 
                  ? "bg-gradient-to-br from-accent/15 to-accent/5" 
                  : "bg-muted"
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
            </motion.div>

            {/* Info */}
            <motion.div 
              className="flex-1"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25, duration: 0.3 }}
            >
              <h3 className="text-base font-semibold text-foreground mb-0.5">
                طلبات قريبة
              </h3>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="w-3.5 h-3.5" />
                <span className="text-[13px]">طلب مطابق في مدينتك</span>
              </div>
              
              {!isEligible && (
                <p className="mt-1.5 text-xs text-warning font-medium">
                  لن تظهر طلبات حتى تصبح مؤهل
                </p>
              )}
            </motion.div>
          </div>
        )}

        {/* CTA Button */}
        <motion.button
          onClick={onViewRequests}
          disabled={isLoading || (!isEligible && displayCount === 0)}
          whileTap={{ scale: 0.98 }}
          className={cn(
            "mt-4 w-full flex items-center justify-between",
            "bg-muted hover:bg-muted/80 rounded-xl px-4 py-3",
            "text-foreground font-medium text-[15px]",
            "transition-colors duration-200",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          <span>عرض الطلبات</span>
          <ChevronLeft className="w-5 h-5 text-muted-foreground" />
        </motion.button>
      </div>
    </motion.div>
  );
}
