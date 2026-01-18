import { ReactNode } from "react";
import { motion } from "framer-motion";
import { BottomTabs, TabItem } from "./BottomTabs";
import { TopNavBar } from "./TopNavBar";
import { Home, ClipboardList, Heart, User } from "lucide-react";

export type TabType = "home" | "requests" | "donate" | "profile";

const DEFAULT_TABS: TabItem[] = [
  { id: "home", label: "الرئيسية", icon: Home },
  { id: "requests", label: "الطلبات", icon: ClipboardList },
  { id: "donate", label: "تبرع", icon: Heart },
  { id: "profile", label: "حسابي", icon: User },
];

interface MobileLayoutProps {
  title: string;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  children: ReactNode;
  /** Custom tabs configuration */
  tabs?: TabItem[];
  /** Right side element in header */
  rightAction?: ReactNode;
}

/**
 * MobileLayout - Main app layout with fixed header and bottom tabs
 * 
 * QA Checklist:
 * - ✅ Header fixed at top with safe-area padding
 * - ✅ Bottom tabs fixed at bottom with safe-area padding
 * - ✅ Content scrolls independently
 * - ✅ No horizontal overflow
 * - ✅ Works on all tested breakpoints (320px-1024px)
 * - ✅ RTL layout maintained
 * - ✅ Dark mode compatible
 * - ✅ Touch targets >= 44px
 */
export function MobileLayout({
  title,
  activeTab,
  onTabChange,
  children,
  tabs = DEFAULT_TABS,
  rightAction,
}: MobileLayoutProps) {
  return (
    <div className="fixed inset-0 flex flex-col bg-gradient-to-b from-background to-muted/30">
      {/* Fixed Header */}
      <TopNavBar title={title} rightElement={rightAction} />

      {/* Scrollable Content Area */}
      <motion.main
        className="flex-1 overflow-y-auto overflow-x-hidden overscroll-none"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        key={activeTab}
      >
        <div className="max-w-lg mx-auto px-4 py-4 pb-4">
          {children}
        </div>
      </motion.main>

      {/* Fixed Bottom Tab Bar */}
      <div
        className="flex-shrink-0 z-50 bg-background border-t border-border/50"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <BottomTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={(tabId) => onTabChange(tabId as TabType)}
        />
      </div>
    </div>
  );
}
