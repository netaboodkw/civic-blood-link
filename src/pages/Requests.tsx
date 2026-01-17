import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { ClipboardList, Plus } from "lucide-react";
import type { TabType } from "@/components/layout/BottomTabBar";
import { useMyRequests } from "@/hooks/useMyRequests";
import { RequestCard } from "@/components/requests/RequestCard";
import { Button } from "@/components/ui/button";

export default function Requests() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("requests");
  const { data: requests = [], isLoading } = useMyRequests();

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    switch (tab) {
      case "home":
        navigate("/home");
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
      title="طلباتي"
      activeTab={activeTab}
      onTabChange={handleTabChange}
    >
      <div className="space-y-4 pb-4">
        {/* New Request Button */}
        <Button
          onClick={() => navigate("/create-request")}
          className="w-full gap-2"
          size="lg"
        >
          <Plus className="w-5 h-5" />
          إنشاء طلب جديد
        </Button>

        {/* Requests List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card rounded-xl p-4 animate-pulse-soft">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-16 bg-muted rounded" />
                    <div className="h-4 w-24 bg-muted rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-4">
              <ClipboardList className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-2">
              لا توجد طلبات
            </h2>
            <p className="text-sm text-muted-foreground">
              لم تقم بإنشاء أي طلبات دم بعد
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((request) => (
              <RequestCard key={request.id} request={request} />
            ))}
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
