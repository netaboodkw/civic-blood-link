import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { Plus, Droplet, Calendar, Info, CheckCircle2, Lock, Clock } from "lucide-react";
import type { TabType } from "@/components/layout/BottomTabBar";
import { useProfile } from "@/hooks/useProfile";
import { useDonationLogs } from "@/hooks/useDonationLogs";
import { NewDonationDialog } from "@/components/donate/NewDonationDialog";
import { DonationLocationsCard } from "@/components/donate/DonationLocationsCard";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

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

  return (
    <MobileLayout
      title="سجل التبرعات"
      activeTab={activeTab}
      onTabChange={handleTabChange}
    >
      <div className="space-y-4 pb-4">
        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-4 bg-blue-500/5 border border-blue-500/20"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 glass rounded-xl flex items-center justify-center bg-blue-500/10 shrink-0">
              <Info className="w-5 h-5 text-blue-500" strokeWidth={2} />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">ما هو سجل التبرعات؟</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                سجّل هنا إذا تبرعت بالدم خلال هذه الفترة. النظام سيحسب تلقائياً موعد أهليتك القادمة (بعد {profile?.eligibilityDays || 60} يوم من آخر تبرع).
              </p>
            </div>
          </div>
        </motion.div>

        {/* Eligibility Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-5"
        >
          {profileLoading ? (
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-muted animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-5 w-24 bg-muted rounded animate-pulse" />
                <div className="h-4 w-40 bg-muted rounded animate-pulse" />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-14 h-14 rounded-xl flex items-center justify-center",
                profile?.isEligible 
                  ? "bg-green-500/10" 
                  : "bg-amber-500/10"
              )}>
                {profile?.isEligible ? (
                  <CheckCircle2 className="w-7 h-7 text-green-500" strokeWidth={2} />
                ) : (
                  <Lock className="w-6 h-6 text-amber-500" strokeWidth={2} />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground">حالة الأهلية</h3>
                  <Badge className={cn(
                    "text-xs",
                    profile?.isEligible 
                      ? "bg-green-500/10 text-green-600 border-green-500/30" 
                      : "bg-amber-500/10 text-amber-600 border-amber-500/30"
                  )}>
                    {profile?.isEligible ? "مؤهل للتبرع" : "مقفول مؤقتاً"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {profile?.isEligible ? (
                    "يمكنك التبرع بالدم والاستجابة للطلبات"
                  ) : (
                    <>
                      متبقي{" "}
                      <span className="font-bold text-amber-500">{profile?.daysRemaining}</span>{" "}
                      يوم حتى تصبح مؤهلاً
                    </>
                  )}
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Donation Locations */}
        <DonationLocationsCard />

        {/* New Donation Button */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowNewDonation(true)}
          className="w-full bg-gradient-to-r from-primary to-primary/85 text-primary-foreground rounded-2xl py-4 font-bold text-[17px] shadow-lg glow-primary flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" strokeWidth={2.5} />
          تسجيل تبرع جديد
        </motion.button>

        {/* Donation History */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" strokeWidth={2} />
              <h2 className="font-bold text-foreground">سجل تبرعاتك</h2>
            </div>
            <Badge variant="outline" className="text-xs">
              {donations.length} تبرع
            </Badge>
          </div>

          <div className="p-4">
            {donationsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-3 glass rounded-xl animate-pulse">
                    <div className="w-10 h-10 rounded-full bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-24 bg-muted rounded" />
                      <div className="h-3 w-32 bg-muted rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : donations.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Droplet className="w-8 h-8 text-muted-foreground" strokeWidth={1.5} />
                </div>
                <p className="text-muted-foreground text-sm mb-1">لا يوجد سجل تبرعات سابقة</p>
                <p className="text-xs text-muted-foreground/70">سجّل تبرعك الأول للبدء</p>
              </div>
            ) : (
              <div className="space-y-3">
                {donations.map((donation, index) => (
                  <motion.div
                    key={donation.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-3 p-3 glass rounded-xl"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-500/10">
                      <Droplet className="w-5 h-5 text-red-500" fill="currentColor" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <Calendar className="w-4 h-4 text-muted-foreground" strokeWidth={2} />
                        {format(new Date(donation.donation_date), "d MMMM yyyy", { locale: ar })}
                      </div>
                      {donation.notes && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {donation.notes}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* 90 Days Rule Info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass rounded-xl p-4 text-center"
        >
          <p className="text-xs text-muted-foreground">
            ⏰ فترة الأمان الطبية بين كل تبرع هي <span className="font-bold text-foreground">{profile?.eligibilityDays || 60} يوم</span> للحفاظ على صحتك
          </p>
        </motion.div>
      </div>

      {/* New Donation Dialog */}
      <NewDonationDialog
        open={showNewDonation}
        onOpenChange={setShowNewDonation}
      />
    </MobileLayout>
  );
}
