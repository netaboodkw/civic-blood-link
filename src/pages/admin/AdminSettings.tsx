import { AdminLayout } from "@/components/admin/AdminLayout";
import { Settings, Calendar, Clock, Save, Loader2, Archive, MessageCircle, Image, Upload, Trash2, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useAppSettings, useUpdateAppSetting } from "@/hooks/useAppSettings";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function AdminSettings() {
  const { data: settings, isLoading } = useAppSettings();
  const updateSetting = useUpdateAppSetting();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [eligibilityDays, setEligibilityDays] = useState("60");
  const [archiveDays, setArchiveDays] = useState("7");
  const [duplicateDays, setDuplicateDays] = useState("3");
  const [isArchiving, setIsArchiving] = useState(false);
  
  // WhatsApp settings
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [urgencyFilter, setUrgencyFilter] = useState<"all" | "high" | "urgent">("all");
  const [bloodTypeFilter, setBloodTypeFilter] = useState<"all" | "rare">("all");
  
  // Logo
  const [logoUrl, setLogoUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (settings) {
      setEligibilityDays(settings.donation_eligibility_days.toString());
      setArchiveDays(settings.auto_archive_days.toString());
      setDuplicateDays(settings.duplicate_check_days.toString());
      setWhatsappEnabled(settings.whatsapp_notifications_enabled);
      setUrgencyFilter(settings.whatsapp_urgency_filter);
      setBloodTypeFilter(settings.whatsapp_blood_type_filter);
      setLogoUrl(settings.app_logo_url || "");
    }
  }, [settings]);

  const handleSaveEligibility = async () => {
    const value = parseInt(eligibilityDays);
    if (isNaN(value) || value < 30 || value > 180) {
      toast.error("يجب أن تكون الأيام بين 30 و 180");
      return;
    }
    try {
      await updateSetting.mutateAsync({ key: "donation_eligibility_days", value: eligibilityDays });
      toast.success("تم حفظ إعدادات فترة التبرع");
    } catch {
      toast.error("حدث خطأ أثناء الحفظ");
    }
  };

  const handleSaveArchive = async () => {
    const value = parseInt(archiveDays);
    if (isNaN(value) || value < 1 || value > 30) {
      toast.error("يجب أن تكون الأيام بين 1 و 30");
      return;
    }
    try {
      await updateSetting.mutateAsync({ key: "auto_archive_days", value: archiveDays });
      toast.success("تم حفظ إعدادات الأرشفة");
    } catch {
      toast.error("حدث خطأ أثناء الحفظ");
    }
  };

  const handleSaveDuplicate = async () => {
    const value = parseInt(duplicateDays);
    if (isNaN(value) || value < 1 || value > 14) {
      toast.error("يجب أن تكون الأيام بين 1 و 14");
      return;
    }
    try {
      await updateSetting.mutateAsync({ key: "duplicate_check_days", value: duplicateDays });
      toast.success("تم حفظ إعدادات فحص التكرار");
    } catch {
      toast.error("حدث خطأ أثناء الحفظ");
    }
  };

  const handleArchiveNow = async () => {
    setIsArchiving(true);
    try {
      const archiveDate = new Date();
      archiveDate.setDate(archiveDate.getDate() - parseInt(archiveDays));
      
      const { data, error } = await supabase
        .from("blood_requests")
        .update({ status: "expired" })
        .eq("status", "open")
        .lt("created_at", archiveDate.toISOString())
        .select();

      if (error) throw error;
      
      const count = data?.length || 0;
      toast.success(`تم أرشفة ${count} طلب`);
    } catch (error) {
      console.error("Error archiving:", error);
      toast.error("حدث خطأ أثناء الأرشفة");
    } finally {
      setIsArchiving(false);
    }
  };

  const handleSaveWhatsApp = async () => {
    try {
      await updateSetting.mutateAsync({ key: "whatsapp_notifications_enabled", value: whatsappEnabled.toString() });
      await updateSetting.mutateAsync({ key: "whatsapp_urgency_filter", value: urgencyFilter });
      await updateSetting.mutateAsync({ key: "whatsapp_blood_type_filter", value: bloodTypeFilter });
      toast.success("تم حفظ إعدادات واتساب");
    } catch {
      toast.error("حدث خطأ أثناء الحفظ");
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("يرجى اختيار ملف صورة");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("حجم الصورة يجب أن يكون أقل من 2 ميجابايت");
      return;
    }

    setIsUploading(true);
    try {
      // Convert to base64 data URL for simple storage
      const reader = new FileReader();
      reader.onload = async (event) => {
        const dataUrl = event.target?.result as string;
        await updateSetting.mutateAsync({ key: "app_logo_url", value: dataUrl });
        setLogoUrl(dataUrl);
        toast.success("تم رفع الشعار بنجاح");
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast.error("حدث خطأ أثناء رفع الشعار");
      setIsUploading(false);
    }
  };

  const handleRemoveLogo = async () => {
    try {
      await updateSetting.mutateAsync({ key: "app_logo_url", value: "" });
      setLogoUrl("");
      toast.success("تم حذف الشعار");
    } catch {
      toast.error("حدث خطأ أثناء حذف الشعار");
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="الإعدادات">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="الإعدادات">
      <div className="space-y-4">
        {/* App Logo */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-5"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 glass rounded-xl flex items-center justify-center bg-purple-500/10 shrink-0">
              <Image className="h-6 w-6 text-purple-500" strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-foreground mb-1">شعار التطبيق</h3>
              <p className="text-sm text-muted-foreground mb-4">
                رفع شعار التطبيق ليظهر في جميع الصفحات
              </p>
              
              <div className="flex items-center gap-4">
                {logoUrl ? (
                  <div className="relative group">
                    <img
                      src={logoUrl}
                      alt="شعار التطبيق"
                      className="w-20 h-20 object-contain rounded-xl border border-border"
                    />
                    <button
                      onClick={handleRemoveLogo}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-20 h-20 glass rounded-xl flex items-center justify-center border-2 border-dashed border-border">
                    <Image className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary/20 transition-colors disabled:opacity-50"
                >
                  {isUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  {logoUrl ? "تغيير الشعار" : "رفع شعار"}
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Donation Eligibility Days */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-5"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 glass rounded-xl flex items-center justify-center bg-blue-500/10 shrink-0">
              <Calendar className="h-6 w-6 text-blue-500" strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-foreground mb-1">فترة الأهلية للتبرع</h3>
              <p className="text-sm text-muted-foreground mb-4">
                عدد الأيام المطلوبة بين كل تبرع للمتبرع
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={eligibilityDays}
                  onChange={(e) => setEligibilityDays(e.target.value)}
                  min={30}
                  max={180}
                  className="w-24 bg-background border border-input rounded-xl py-2 px-3 text-center font-bold text-lg"
                />
                <span className="text-muted-foreground">يوم</span>
                <button
                  onClick={handleSaveEligibility}
                  disabled={updateSetting.isPending}
                  className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-50"
                >
                  {updateSetting.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  حفظ
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Auto Archive Days */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card rounded-2xl p-5"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 glass rounded-xl flex items-center justify-center bg-amber-500/10 shrink-0">
              <Archive className="h-6 w-6 text-amber-500" strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-foreground mb-1">أرشفة الطلبات تلقائياً</h3>
              <p className="text-sm text-muted-foreground mb-4">
                أرشفة الطلبات المفتوحة بعد عدد معين من الأيام
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                <input
                  type="number"
                  value={archiveDays}
                  onChange={(e) => setArchiveDays(e.target.value)}
                  min={1}
                  max={30}
                  className="w-24 bg-background border border-input rounded-xl py-2 px-3 text-center font-bold text-lg"
                />
                <span className="text-muted-foreground">يوم</span>
                <button
                  onClick={handleSaveArchive}
                  disabled={updateSetting.isPending}
                  className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-50"
                >
                  {updateSetting.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  حفظ
                </button>
              </div>
              <div className="mt-4 pt-4 border-t border-border/50">
                <button
                  onClick={handleArchiveNow}
                  disabled={isArchiving}
                  className="flex items-center gap-2 bg-amber-500/10 text-amber-600 px-4 py-2 rounded-xl text-sm font-medium hover:bg-amber-500/20 transition-colors disabled:opacity-50"
                >
                  {isArchiving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Archive className="w-4 h-4" />
                  )}
                  أرشفة الطلبات القديمة الآن
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Duplicate Check Days */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl p-5"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 glass rounded-xl flex items-center justify-center bg-green-500/10 shrink-0">
              <Clock className="h-6 w-6 text-green-500" strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-foreground mb-1">فحص الطلبات المكررة</h3>
              <p className="text-sm text-muted-foreground mb-4">
                فحص الطلبات المتشابهة خلال عدد معين من الأيام
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={duplicateDays}
                  onChange={(e) => setDuplicateDays(e.target.value)}
                  min={1}
                  max={14}
                  className="w-24 bg-background border border-input rounded-xl py-2 px-3 text-center font-bold text-lg"
                />
                <span className="text-muted-foreground">يوم</span>
                <button
                  onClick={handleSaveDuplicate}
                  disabled={updateSetting.isPending}
                  className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-50"
                >
                  {updateSetting.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  حفظ
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* WhatsApp Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-card rounded-2xl p-5"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 glass rounded-xl flex items-center justify-center bg-green-600/10 shrink-0">
              <MessageCircle className="h-6 w-6 text-green-600" strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-foreground">إشعارات واتساب</h3>
                <button
                  onClick={() => setWhatsappEnabled(!whatsappEnabled)}
                  className={cn(
                    "relative w-12 h-6 rounded-full transition-colors",
                    whatsappEnabled ? "bg-green-500" : "bg-muted"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform",
                      whatsappEnabled ? "right-0.5" : "left-0.5"
                    )}
                  />
                </button>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                إرسال إشعارات واتساب للمتبرعين المؤهلين عند نشر طلب جديد
              </p>
              
              {whatsappEnabled && (
                <div className="space-y-4 pt-4 border-t border-border/50">
                  {/* Urgency Filter */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      نوع الطلبات
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { value: "all", label: "جميع الطلبات" },
                        { value: "high", label: "مستعجل وعاجل جداً" },
                        { value: "urgent", label: "عاجل جداً فقط" },
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setUrgencyFilter(option.value as typeof urgencyFilter)}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                            urgencyFilter === option.value
                              ? "bg-primary text-primary-foreground"
                              : "glass hover:bg-primary/10"
                          )}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Blood Type Filter */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      فصائل الدم
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { value: "all", label: "جميع الفصائل" },
                        { value: "rare", label: "الفصائل النادرة فقط (AB-, B-, A-, O-)" },
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setBloodTypeFilter(option.value as typeof bloodTypeFilter)}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                            bloodTypeFilter === option.value
                              ? "bg-primary text-primary-foreground"
                              : "glass hover:bg-primary/10"
                          )}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleSaveWhatsApp}
                    disabled={updateSetting.isPending}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-50"
                  >
                    {updateSetting.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    حفظ إعدادات واتساب
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Statistics Info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-2xl p-5"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 glass rounded-xl flex items-center justify-center bg-indigo-500/10 shrink-0">
              <BarChart3 className="h-6 w-6 text-indigo-500" strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-foreground mb-1">إحصائيات النقرات</h3>
              <p className="text-sm text-muted-foreground">
                يتم تتبع عدد النقرات على كل إعلان تلقائياً. يمكنك رؤية الإحصائيات في صفحة الإعلانات.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
}
