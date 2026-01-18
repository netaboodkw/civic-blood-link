import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  description?: string;
  trend?: "up" | "down" | "neutral";
  className?: string;
  iconClassName?: string;
}

export function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  description,
  className,
  iconClassName
}: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className={cn(
        "glass-card rounded-2xl p-5 ios-spring",
        className
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className={cn(
          "w-10 h-10 glass rounded-xl flex items-center justify-center",
          iconClassName
        )}>
          <Icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
        </div>
      </div>
      <div className="text-3xl font-bold text-foreground">{value}</div>
      {description && (
        <p className="text-xs text-muted-foreground mt-2">{description}</p>
      )}
    </motion.div>
  );
}
