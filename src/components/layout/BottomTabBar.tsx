import { Home, ClipboardList, Heart, User } from "lucide-react";
import { cn } from "@/lib/utils";

export type TabType = "home" | "requests" | "donate" | "profile";

interface TabItem {
  id: TabType;
  label: string;
  icon: typeof Home;
}

const tabs: TabItem[] = [
  { id: "home", label: "الرئيسية", icon: Home },
  { id: "requests", label: "الطلبات", icon: ClipboardList },
  { id: "donate", label: "تبرع", icon: Heart },
  { id: "profile", label: "حسابي", icon: User },
];

interface BottomTabBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function BottomTabBar({ activeTab, onTabChange }: BottomTabBarProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-strong border-t border-border/50 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-[56px] max-w-lg mx-auto px-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 flex-1 h-full relative",
                "ios-spring transition-all duration-300",
                "focus:outline-none active:opacity-70"
              )}
              aria-label={tab.label}
              aria-current={isActive ? "page" : undefined}
            >
              <div className={cn(
                "relative p-1.5 rounded-xl transition-all duration-300",
                isActive && "bg-primary/15 glow-primary"
              )}>
                <Icon
                  className={cn(
                    "w-[22px] h-[22px] transition-all duration-300",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  fill={isActive && tab.id === "donate" ? "currentColor" : "none"}
                />
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium transition-all duration-300",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
