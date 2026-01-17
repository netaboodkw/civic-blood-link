import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { EligibilityCard } from "@/components/home/EligibilityCard";
import { NearbyRequestsCard } from "@/components/home/NearbyRequestsCard";
import { CreateRequestButton } from "@/components/home/CreateRequestButton";
import { useProfile } from "@/hooks/useProfile";
import { useMatchingRequestsCount } from "@/hooks/useMatchingRequestsCount";
import type { TabType } from "@/components/layout/BottomTabBar";

export default function Home() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("home");

  const { data: profile, isLoading: profileLoading } = useProfile();
  const { 
    data: matchingCount, 
    isLoading: countLoading,
    isError: countError,
  } = useMatchingRequestsCount(
    profile ?? null, 
    profile?.isEligible ?? false
  );

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    
    // Navigate to appropriate routes
    switch (tab) {
      case "home":
        navigate("/");
        break;
      case "requests":
        navigate("/requests");
        break;
      case "donate":
        navigate("/donate");
        break;
      case "profile":
        navigate("/profile");
        break;
    }
  };

  const handleUpdateStatus = () => {
    handleTabChange("donate");
  };

  const handleViewRequests = () => {
    handleTabChange("requests");
  };

  const handleCreateRequest = () => {
    navigate("/create-request");
  };

  const isRequester = profile?.role === "requester" || profile?.role === "both";

  return (
    <MobileLayout
      title="الرئيسية"
      activeTab={activeTab}
      onTabChange={handleTabChange}
    >
      <div className="space-y-4 py-2">
        {/* Eligibility Status Card */}
        <EligibilityCard
          isEligible={profile?.isEligible ?? true}
          daysRemaining={profile?.daysRemaining ?? null}
          onUpdateStatus={handleUpdateStatus}
          isLoading={profileLoading}
        />

        {/* Nearby Requests Card */}
        <NearbyRequestsCard
          count={matchingCount ?? 0}
          isEligible={profile?.isEligible ?? true}
          onViewRequests={handleViewRequests}
          isLoading={countLoading}
          error={countError}
        />

        {/* Create Request Button (for requesters only) */}
        {isRequester && (
          <CreateRequestButton onClick={handleCreateRequest} />
        )}
      </div>
    </MobileLayout>
  );
}
