import { ReactNode } from "react";
import { motion } from "framer-motion";
import { BottomTabBar, TabType } from "./BottomTabBar";
import { TopNavBar } from "./TopNavBar";

interface MobileLayoutProps {
  title: string;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  children: ReactNode;
}

export function MobileLayout({ title, activeTab, onTabChange, children }: MobileLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <TopNavBar title={title} />
      
      <motion.main 
        className="flex-1 pb-[calc(56px+env(safe-area-inset-bottom)+1rem)] pt-4"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        key={activeTab}
      >
        <div className="max-w-lg mx-auto px-4">
          {children}
        </div>
      </motion.main>
      
      <BottomTabBar activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  );
}
