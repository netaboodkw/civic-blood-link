import { AdminLayout } from "@/components/admin/AdminLayout";
import { Settings, Shield, Bell, Database, Calendar, Clock, Save, Loader2, Archive } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useAppSettings, useUpdateAppSetting } from "@/hooks/useAppSettings";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function AdminSettings() {
  const { data: settings, isLoading } = useAppSettings();
  const updateSetting = useUpdateAppSetting();
  
  const [eligibilityDays, setEligibilityDays] = useState("60");
  const [archiveDays, setArchiveDays] = useState("7");
  const [duplicateDays, setDuplicateDays] = useState("3");
  const [isArchiving, setIsArchiving] = useState(false);

  useEffect(() => {
    if (settings) {
      setEligibilityDays(settings.donation_eligibility_days.toString());
      setArchiveDays(settings.auto_archive_days.toString());
      setDuplicateDays(settings.duplicate_check_days.toString());
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
        {/* Donation Eligibility Days */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
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
          transition={{ delay: 0.1 }}
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

        {/* Other Settings */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-2xl p-5"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 glass rounded-xl flex items-center justify-center bg-purple-500/10 shrink-0">
              <Settings className="h-6 w-6 text-purple-500" strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-foreground mb-1">إعدادات إضافية</h3>
              <p className="text-sm text-muted-foreground">
                قريباً: المزيد من الإعدادات
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
}
