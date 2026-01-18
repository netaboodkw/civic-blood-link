import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export interface TabItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface BottomTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

/**
 * BottomTabs - iOS-style bottom tab navigation
 * 
 * Features:
 * - Minimum touch target 44px
 * - Active state with glow effect
 * - Spring animation on tap
 * - Icon + label layout
 * 
 * QA Checklist:
 * - ✅ Touch targets >= 44px
 * - ✅ Active state clearly visible
 * - ✅ Labels readable in Arabic
 * - ✅ Icons properly sized
 * - ✅ Works in dark mode
 */
export function BottomTabs({ tabs, activeTab, onTabChange }: BottomTabsProps) {
  return (
    <nav className="flex items-center justify-around h-[56px] max-w-lg mx-auto px-2">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 flex-1 h-full min-h-[44px] relative",
              "transition-all duration-300 ease-out",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset",
              "active:opacity-70"
            )}
            aria-label={tab.label}
            aria-current={isActive ? "page" : undefined}
          >
            <motion.div
              className={cn(
                "relative p-1.5 rounded-xl transition-all duration-300",
                isActive && "bg-primary/15"
              )}
              animate={isActive ? { scale: 1.05 } : { scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              {isActive && (
                <motion.div
                  className="absolute inset-0 rounded-xl bg-primary/20 blur-md"
                  layoutId="tab-glow"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon
                className={cn(
                  "w-[22px] h-[22px] relative z-10 transition-colors duration-300",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
                strokeWidth={isActive ? 2.5 : 1.8}
              />
            </motion.div>
            <span
              className={cn(
                "text-[10px] font-medium transition-colors duration-300",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
