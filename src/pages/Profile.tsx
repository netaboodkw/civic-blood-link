import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { User, MapPin, Droplets, LogOut, Phone, Edit3, Check, X, Bell, BellOff, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { TabType } from "@/components/layout/BottomTabBar";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;
const CITIES = ["مدينة الكويت", "حولي", "الفروانية", "الجهراء", "الأحمدي", "مبارك الكبير"] as const;
const ROLES = [
  { value: "donor", label: "متبرع" },
  { value: "requester", label: "طالب" },
  { value: "both", label: "متبرع وطالب" },
] as const;

export default function Profile() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const { data: profile, isLoading } = useProfile();
  const { signOut } = useAuth();
  const { token: pushToken, isSupported: pushSupported, savePushToken, requestPushPermission, isRegistering } = usePushNotifications();
  const [isRefreshingToken, setIsRefreshingToken] = useState(false);

  // Edit mode
  const [isEditing, setIsEditing] = useState(false);
  
  // Form state
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [city, setCity] = useState("");
  const [role, setRole] = useState<"donor" | "requester" | "both">("donor");

  // Initialize form with profile data
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name);
      setPhone(profile.phone || "");
      setBloodType(profile.blood_type);
      setCity(profile.city);
      setRole(profile.role);
    }
  }, [profile]);

  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      if (!profile) throw new Error("No profile");

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName.trim(),
          phone: phone.trim() || null,
          blood_type: bloodType as typeof BLOOD_TYPES[number],
          city: city,
          role: role,
        })
        .eq("id", profile.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("تم حفظ التغييرات");
      setIsEditing(false);
    },
    onError: (error: Error) => {
      console.error("Error updating profile:", error);
      toast.error("حدث خطأ أثناء الحفظ");
    },
  });

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
      navigate("/");
    } catch (error) {
      toast.error("حدث خطأ أثناء تسجيل الخروج");
    }
  };

  const handleCancelEdit = () => {
    if (profile) {
      setFullName(profile.full_name);
      setPhone(profile.phone || "");
      setBloodType(profile.blood_type);
      setCity(profile.city);
      setRole(profile.role);
    }
    setIsEditing(false);
  };

  const handleSave = () => {
    if (!fullName.trim()) {
      toast.error("الاسم مطلوب");
      return;
    }
    updateProfileMutation.mutate();
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
          {/* Header with edit button */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-base font-semibold text-card-foreground">
              بياناتي الشخصية
            </h2>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 text-primary text-sm font-medium ios-spring ios-press"
              >
                <Edit3 className="w-4 h-4" />
                <span>تعديل</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCancelEdit}
                  className="flex items-center gap-1 text-muted-foreground text-sm font-medium ios-spring ios-press"
                >
                  <X className="w-4 h-4" />
                  <span>إلغاء</span>
                </button>
                <button
                  onClick={handleSave}
                  disabled={updateProfileMutation.isPending}
                  className="flex items-center gap-1 text-primary text-sm font-medium ios-spring ios-press disabled:opacity-50"
                >
                  {updateProfileMutation.isPending ? (
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>حفظ</span>
                </button>
              </div>
            )}
          </div>

          <div className="p-5">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-12 bg-muted rounded-xl animate-pulse-soft" />
                ))}
              </div>
            ) : profile ? (
              <div className="space-y-4">
                {/* Avatar and name */}
                <div className="flex items-center gap-4 pb-4 border-b border-border">
                  <div className="w-16 h-16 bg-primary-soft rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-primary" />
                  </div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="الاسم الكامل"
                      className="flex-1 bg-secondary border border-input rounded-xl py-2.5 px-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  ) : (
                    <div>
                      <h3 className="text-lg font-semibold text-card-foreground">
                        {profile.full_name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {ROLES.find(r => r.value === profile.role)?.label}
                      </p>
                    </div>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    رقم الهاتف
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="أدخل رقم الهاتف"
                      className="w-full bg-secondary border border-input rounded-xl py-2.5 px-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  ) : (
                    <p className="text-foreground">
                      {profile.phone || "غير محدد"}
                    </p>
                  )}
                </div>

                {/* Blood Type */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Droplets className="w-4 h-4" />
                    فصيلة الدم
                  </label>
                  {isEditing ? (
                    <div className="grid grid-cols-4 gap-2">
                      {BLOOD_TYPES.map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setBloodType(type)}
                          className={cn(
                            "py-2.5 rounded-xl text-sm font-bold transition-all duration-200",
                            "border-2 ios-spring ios-press",
                            bloodType === type
                              ? "bg-destructive/10 border-destructive text-destructive"
                              : "bg-secondary border-input text-foreground hover:border-primary/50"
                          )}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 bg-destructive/10 text-destructive rounded-lg font-bold">
                      {profile.blood_type}
                    </span>
                  )}
                </div>

                {/* City */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    المحافظة
                  </label>
                  {isEditing ? (
                    <div className="grid grid-cols-3 gap-2">
                      {CITIES.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setCity(c)}
                          className={cn(
                            "py-2 rounded-xl text-xs font-medium transition-all duration-200",
                            "border ios-spring ios-press",
                            city === c
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-secondary border-input text-foreground hover:border-primary/50"
                          )}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-foreground">{profile.city}</p>
                  )}
                </div>

                {/* Role */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <User className="w-4 h-4" />
                    نوع الحساب
                  </label>
                  {isEditing ? (
                    <div className="flex gap-2">
                      {ROLES.map((r) => (
                        <button
                          key={r.value}
                          type="button"
                          onClick={() => setRole(r.value)}
                          className={cn(
                            "flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                            "border ios-spring ios-press",
                            role === r.value
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-secondary border-input text-foreground hover:border-primary/50"
                          )}
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-foreground">
                      {ROLES.find(r => r.value === profile.role)?.label}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">لا توجد بيانات</p>
            )}
          </div>
        </div>

        {/* Notifications Button - iOS only */}
        {pushSupported && (
          <div className="glass-card rounded-xl p-4 animate-slide-up" style={{ animationDelay: "50ms" }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  pushToken ? "bg-green-500/10" : "bg-muted"
                )}>
                  {pushToken ? (
                    <Bell className="w-5 h-5 text-green-500" strokeWidth={2} />
                  ) : (
                    <BellOff className="w-5 h-5 text-muted-foreground" strokeWidth={2} />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">الإشعارات</h3>
                  <p className="text-sm text-muted-foreground">
                    {pushToken ? "الإشعارات مفعلة" : "الإشعارات غير مفعلة"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {pushToken && (
                  <button
                    onClick={async () => {
                      setIsRefreshingToken(true);
                      try {
                        const saved = await savePushToken(pushToken);
                        if (saved) {
                          toast.success("تم تحديث التوكن بنجاح");
                        } else {
                          toast.error("فشل تحديث التوكن");
                        }
                      } catch (error) {
                        toast.error("حدث خطأ أثناء التحديث");
                      } finally {
                        setIsRefreshingToken(false);
                      }
                    }}
                    disabled={isRefreshingToken}
                    className="bg-primary text-primary-foreground rounded-xl px-4 py-2 text-sm font-medium ios-spring ios-press disabled:opacity-50 flex items-center gap-2"
                  >
                    <RefreshCw className={cn("w-4 h-4", isRefreshingToken && "animate-spin")} />
                    <span>تحديث</span>
                  </button>
                )}
                {!pushToken && (
                  <button
                    onClick={requestPushPermission}
                    disabled={isRegistering}
                    className="bg-primary text-primary-foreground rounded-xl px-4 py-2 text-sm font-medium ios-spring ios-press disabled:opacity-50 flex items-center gap-2"
                  >
                    {isRegistering ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Bell className="w-4 h-4" />
                    )}
                    <span>{isRegistering ? 'جاري التفعيل...' : 'تفعيل'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

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
