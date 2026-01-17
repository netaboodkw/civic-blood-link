import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { Plus } from "lucide-react";
import type { TabType } from "@/components/layout/BottomTabBar";
import { useProfile } from "@/hooks/useProfile";
import { useDonationLogs } from "@/hooks/useDonationLogs";
import { EligibilityCard } from "@/components/home/EligibilityCard";
import { DonationHistoryCard } from "@/components/donate/DonationHistoryCard";
import { NewDonationDialog } from "@/components/donate/NewDonationDialog";
import { Button } from "@/components/ui/button";

export default function Donate() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("donate");
  const [showNewDonation, setShowNewDonation] = useState(false);

  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: donations = [], isLoading: donationsLoading } = useDonationLogs();

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    switch (tab) {
      case "home":
        navigate("/home");
        break;
      case "requests":
        navigate("/my-requests");
        break;
      case "donate":
        break;
      case "profile":
        navigate("/profile");
        break;
    }
  };

  const handleUpdateStatus = () => {
    setShowNewDonation(true);
  };

  return (
    <MobileLayout
      title="تبرع"
      activeTab={activeTab}
      onTabChange={handleTabChange}
    >
      <div className="space-y-4 pb-4">
        {/* Eligibility Status */}
        <EligibilityCard
          isEligible={profile?.isEligible ?? true}
          daysRemaining={profile?.daysRemaining ?? null}
          onUpdateStatus={handleUpdateStatus}
          isLoading={profileLoading}
        />

        {/* New Donation Button */}
        <Button
          onClick={() => setShowNewDonation(true)}
          className="w-full gap-2"
          size="lg"
        >
          <Plus className="w-5 h-5" />
          تسجيل تبرع جديد
        </Button>

        {/* Donation History */}
        <DonationHistoryCard
          donations={donations}
          isLoading={donationsLoading}
        />
      </div>

      {/* New Donation Dialog */}
      <NewDonationDialog
        open={showNewDonation}
        onOpenChange={setShowNewDonation}
      />
    </MobileLayout>
  );
}
