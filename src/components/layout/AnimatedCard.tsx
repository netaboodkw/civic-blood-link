import { motion } from "framer-motion";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AnimatedCardProps {
  children: ReactNode;
  index?: number;
  className?: string;
  onClick?: () => void;
}

export function AnimatedCard({ children, index = 0, className, onClick }: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.08,
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      className={cn("bg-card rounded-2xl overflow-hidden", className)}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}
