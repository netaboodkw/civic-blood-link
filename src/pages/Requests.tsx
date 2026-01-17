import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { ClipboardList } from "lucide-react";
import type { TabType } from "@/components/layout/BottomTabBar";

export default function Requests() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("requests");

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    switch (tab) {
      case "home":
        navigate("/");
        break;
      case "requests":
        break;
      case "donate":
        navigate("/donate");
        break;
      case "profile":
        navigate("/profile");
        break;
    }
  };

  return (
    <MobileLayout
      title="الطلبات"
      activeTab={activeTab}
      onTabChange={handleTabChange}
    >
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-4">
          <ClipboardList className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="text-lg font-semibold text-foreground mb-2">
          قريبًا
        </h2>
        <p className="text-sm text-muted-foreground">
          سيتم إضافة قائمة الطلبات قريبًا
        </p>
      </div>
    </MobileLayout>
  );
}
