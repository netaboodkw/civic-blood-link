import { ReactNode } from "react";
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
    <div className="min-h-screen bg-background">
      <TopNavBar title={title} />
      
      <main className="pb-20 pt-2">
        <div className="max-w-lg mx-auto px-4">
          {children}
        </div>
      </main>
      
      <BottomTabBar activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  );
}
