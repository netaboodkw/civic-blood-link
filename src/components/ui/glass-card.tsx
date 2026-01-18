import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";

interface GlassCardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: React.ReactNode;
  variant?: "default" | "strong" | "subtle";
  interactive?: boolean;
  glow?: boolean;
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, children, variant = "default", interactive = false, glow = false, ...props }, ref) => {
    const variants = {
      default: "glass-card",
      strong: "glass-strong",
      subtle: "glass",
    };

    return (
      <motion.div
        ref={ref}
        className={cn(
          variants[variant],
          "rounded-2xl p-4",
          interactive && "cursor-pointer active:scale-[0.98] transition-transform",
          glow && "glow-primary",
          className
        )}
        whileTap={interactive ? { scale: 0.98 } : undefined}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
GlassCard.displayName = "GlassCard";

export { GlassCard };
