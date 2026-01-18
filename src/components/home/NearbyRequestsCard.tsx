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
      className="glass-card rounded-3xl overflow-hidden"
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }}
    >
      <div className="p-5">
        {isLoading ? (
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl shimmer" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-20 rounded-lg shimmer" />
              <div className="h-4 w-32 rounded-lg shimmer" />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            {/* Count display with glow */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.25, duration: 0.4, ease: "easeOut" }}
              className={cn(
                "flex items-center justify-center w-14 h-14 rounded-2xl",
                displayCount > 0 
                  ? "bg-gradient-to-br from-accent/20 to-accent/5 shadow-[0_0_20px_hsl(12_80%_62%/0.25)]" 
                  : "glass"
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
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
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

        {/* CTA Button - Glass style */}
        <motion.button
          onClick={onViewRequests}
          disabled={isLoading || (!isEligible && displayCount === 0)}
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
          <span>عرض الطلبات</span>
          <ChevronLeft className="w-5 h-5 text-muted-foreground" />
        </motion.button>
      </div>
    </motion.div>
  );
}
