import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { User, MapPin, Droplets, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { TabType } from "@/components/layout/BottomTabBar";

export default function Profile() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const { data: profile, isLoading } = useProfile();
  const { signOut } = useAuth();

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
        navigate("/donate");
        break;
      case "profile":
        break;
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("تم تسجيل الخروج");
      navigate("/auth");
    } catch (error) {
      toast.error("حدث خطأ أثناء تسجيل الخروج");
    }
  };

  return (
    <MobileLayout
      title="حسابي"
      activeTab={activeTab}
      onTabChange={handleTabChange}
    >
      <div className="space-y-4 py-2">
        {/* Profile Card */}
        <div className="bg-card rounded-xl shadow-card overflow-hidden animate-slide-up">
          <div className="p-6">
            {isLoading ? (
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-muted animate-pulse-soft" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-32 bg-muted rounded animate-pulse-soft" />
                  <div className="h-4 w-24 bg-muted rounded animate-pulse-soft" />
                </div>
              </div>
            ) : profile ? (
              <>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-primary-soft rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-card-foreground">
                      {profile.full_name}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {profile.role === "donor" ? "متبرع" : profile.role === "requester" ? "طالب" : "متبرع وطالب"}
                    </p>
                  </div>
                </div>

                {/* Info items */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Droplets className="w-5 h-5" />
                    <span className="text-sm">فصيلة الدم:</span>
                    <span className="text-foreground font-medium">{profile.blood_type}</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <MapPin className="w-5 h-5" />
                    <span className="text-sm">المدينة:</span>
                    <span className="text-foreground font-medium">{profile.city}</span>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground text-center">لا توجد بيانات</p>
            )}
          </div>
        </div>

        {/* Sign Out Button */}
        <button
          onClick={handleSignOut}
          className={cn(
            "w-full flex items-center justify-center gap-3",
            "bg-destructive/10 text-destructive",
            "rounded-xl px-6 py-4",
            "font-medium text-base",
            "transition-all duration-200 ios-spring ios-press",
            "animate-slide-up"
          )}
          style={{ animationDelay: "100ms" }}
        >
          <LogOut className="w-5 h-5" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </MobileLayout>
  );
}
