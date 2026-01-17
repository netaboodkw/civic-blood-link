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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-tabBar border-t border-tabBar-border safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 h-full",
                "ios-spring ios-press transition-colors",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-lg"
              )}
              aria-label={tab.label}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon
                className={cn(
                  "w-6 h-6 transition-colors duration-200",
                  isActive ? "text-tabBar-active" : "text-tabBar-inactive"
                )}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span
                className={cn(
                  "text-[10px] font-medium transition-colors duration-200",
                  isActive ? "text-tabBar-active" : "text-tabBar-inactive"
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
