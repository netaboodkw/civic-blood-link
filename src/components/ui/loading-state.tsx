import { cn } from "@/lib/utils";

interface LoadingStateProps {
  /** Number of skeleton cards to show */
  count?: number;
  /** Variant of skeleton */
  variant?: "card" | "list" | "compact";
  className?: string;
}

/**
 * LoadingState - Skeleton loading placeholder
 * 
 * QA Checklist:
 * - ✅ Shimmer animation
 * - ✅ Multiple variants
 * - ✅ Matches card dimensions
 * - ✅ Works in dark mode
 */
export function LoadingState({ count = 3, variant = "card", className }: LoadingStateProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "glass rounded-2xl animate-pulse",
            variant === "card" && "p-4",
            variant === "list" && "p-3",
            variant === "compact" && "p-2"
          )}
        >
          {variant === "card" && (
            <>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-muted rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-24 bg-muted rounded" />
                  <div className="h-3 w-32 bg-muted rounded" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 w-full bg-muted rounded" />
                <div className="h-3 w-3/4 bg-muted rounded" />
              </div>
            </>
          )}
          {variant === "list" && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-muted rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-20 bg-muted rounded" />
                <div className="h-3 w-32 bg-muted rounded" />
              </div>
            </div>
          )}
          {variant === "compact" && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-muted rounded-lg" />
              <div className="h-4 w-24 bg-muted rounded" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
