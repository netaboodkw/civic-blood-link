import { AdminLayout } from "@/components/admin/AdminLayout";
import { Bell, MessageCircle, Clock, AlertTriangle, Save, Loader2, CheckCircle, Smartphone, Send } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useAppSettings, useUpdateAppSetting } from "@/hooks/useAppSettings";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

export default function AdminNotifications() {
  const { data: settings, isLoading } = useAppSettings();
  const updateSetting = useUpdateAppSetting();
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testTitle, setTestTitle] = useState("اختبار الإشعارات");
  const [testBody, setTestBody] = useState("هذا إشعار تجريبي من نبضة دم!");
  
  // Eligibility End Notification
  const [eligibilityEndEnabled, setEligibilityEndEnabled] = useState(true);
  const [eligibilityEndText, setEligibilityEndText] = useState("");
  
  // Emergency Notification
  const [emergencyEnabled, setEmergencyEnabled] = useState(true);
  const [emergencyText, setEmergencyText] = useState("");
  
  // Periodic Notification
  const [periodicEnabled, setPeriodicEnabled] = useState(false);
  const [periodicText, setPeriodicText] = useState("");
  const [periodicHours, setPeriodicHours] = useState("24");
  
  // WhatsApp Settings
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [urgencyFilter, setUrgencyFilter] = useState<"all" | "high" | "urgent">("all");
  const [bloodTypeFilter, setBloodTypeFilter] = useState<"all" | "rare">("all");
  
  // Notification Channels
  const [channels, setChannels] = useState<"in_app" | "whatsapp" | "both">("in_app");

  useEffect(() => {
    if (settings) {
      setEligibilityEndEnabled(settings.notification_eligibility_end_enabled);
      setEligibilityEndText(settings.notification_eligibility_end_text);
      setEmergencyEnabled(settings.notification_emergency_enabled);
      setEmergencyText(settings.notification_emergency_text);
      setPeriodicEnabled(settings.notification_periodic_enabled);
      setPeriodicText(settings.notification_periodic_text);
      setPeriodicHours(settings.notification_periodic_hours.toString());
      setWhatsappEnabled(settings.whatsapp_notifications_enabled);
      setUrgencyFilter(settings.whatsapp_urgency_filter);
      setBloodTypeFilter(settings.whatsapp_blood_type_filter);
      setChannels(settings.notification_channels);
    }
  }, [settings]);

  const handleSaveAll = async () => {
    try {
      await Promise.all([
        updateSetting.mutateAsync({ key: "notification_eligibility_end_enabled", value: eligibilityEndEnabled.toString() }),
        updateSetting.mutateAsync({ key: "notification_eligibility_end_text", value: eligibilityEndText }),
        updateSetting.mutateAsync({ key: "notification_emergency_enabled", value: emergencyEnabled.toString() }),
        updateSetting.mutateAsync({ key: "notification_emergency_text", value: emergencyText }),
        updateSetting.mutateAsync({ key: "notification_periodic_enabled", value: periodicEnabled.toString() }),
        updateSetting.mutateAsync({ key: "notification_periodic_text", value: periodicText }),
        updateSetting.mutateAsync({ key: "notification_periodic_hours", value: periodicHours }),
        updateSetting.mutateAsync({ key: "whatsapp_notifications_enabled", value: whatsappEnabled.toString() }),
        updateSetting.mutateAsync({ key: "whatsapp_urgency_filter", value: urgencyFilter }),
        updateSetting.mutateAsync({ key: "whatsapp_blood_type_filter", value: bloodTypeFilter }),
        updateSetting.mutateAsync({ key: "notification_channels", value: channels }),
      ]);
      toast.success("تم حفظ جميع الإعدادات بنجاح");
    } catch {
      toast.error("حدث خطأ أثناء الحفظ");
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="إدارة الإشعارات">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  const handleSendTestNotification = async () => {
    setIsSendingTest(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-ios-push', {
        body: {
          title: testTitle,
          body: testBody,
        }
      });
      
      if (error) throw error;
      
      console.log('Test notification result:', data);
      toast.success(`تم إرسال الإشعار! (${data.sent} ناجح، ${data.failed} فاشل)`);
    } catch (error: any) {
      console.error('Error sending test notification:', error);
      toast.error('فشل إرسال الإشعار: ' + error.message);
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <AdminLayout title="إدارة الإشعارات">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-muted-foreground">
            إدارة جميع إشعارات المنصة والتحكم في محتواها
          </p>
          <motion.button
            onClick={handleSaveAll}
            whileTap={{ scale: 0.95 }}
            disabled={updateSetting.isPending}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold shadow-lg disabled:opacity-50"
          >
            {updateSetting.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            حفظ جميع الإعدادات
          </motion.button>
        </div>

        {/* Test Notification */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-5 border-2 border-primary/20"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 glass rounded-xl flex items-center justify-center bg-primary/10 shrink-0">
              <Send className="h-6 w-6 text-primary" strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-foreground mb-1">إرسال إشعار تجريبي</h3>
              <p className="text-sm text-muted-foreground mb-4">
                أرسل إشعار لجميع المستخدمين الذين لديهم توكن إشعارات
              </p>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">العنوان</label>
                  <input
                    type="text"
                    value={testTitle}
                    onChange={(e) => setTestTitle(e.target.value)}
                    className="w-full bg-background border border-input rounded-xl py-2 px-4 text-sm"
                    placeholder="عنوان الإشعار"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">المحتوى</label>
                  <textarea
                    value={testBody}
                    onChange={(e) => setTestBody(e.target.value)}
                    rows={2}
                    className="w-full bg-background border border-input rounded-xl py-2 px-4 text-sm resize-none"
                    placeholder="محتوى الإشعار"
                  />
                </div>
                <motion.button
                  onClick={handleSendTestNotification}
                  whileTap={{ scale: 0.95 }}
                  disabled={isSendingTest || !testTitle || !testBody}
                  className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold shadow-lg disabled:opacity-50 w-full justify-center"
                >
                  {isSendingTest ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                  إرسال إشعار تجريبي
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Notification Channels */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-5"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 glass rounded-xl flex items-center justify-center bg-indigo-500/10 shrink-0">
              <Smartphone className="h-6 w-6 text-indigo-500" strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-foreground mb-1">قنوات الإشعارات</h3>
              <p className="text-sm text-muted-foreground mb-4">
                اختر طريقة إرسال الإشعارات للمتبرعين
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: "in_app", label: "داخل التطبيق فقط", icon: Bell },
                  { value: "whatsapp", label: "واتساب فقط", icon: MessageCircle },
                  { value: "both", label: "كلاهما", icon: CheckCircle },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setChannels(option.value as any)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                      channels === option.value
                        ? "bg-indigo-500 text-white"
                        : "bg-muted hover:bg-muted/80 text-foreground"
                    )}
                  >
                    <option.icon className="w-4 h-4" />
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Eligibility End Notification */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-5"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 glass rounded-xl flex items-center justify-center bg-green-500/10 shrink-0">
              <CheckCircle className="h-6 w-6 text-green-500" strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-foreground">إشعار انتهاء فترة الانتظار</h3>
                <button
                  onClick={() => setEligibilityEndEnabled(!eligibilityEndEnabled)}
                  className={cn(
                    "relative w-12 h-6 rounded-full transition-colors",
                    eligibilityEndEnabled ? "bg-green-500" : "bg-muted"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform",
                      eligibilityEndEnabled ? "right-0.5" : "left-0.5"
                    )}
                  />
                </button>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                إرسال إشعار للمتبرع عند انتهاء فترة عدم التبرع وأصبح مؤهلاً
              </p>
              
              {eligibilityEndEnabled && (
                <div className="space-y-3 pt-4 border-t border-border/50">
                  <label className="text-sm font-medium text-foreground block">
                    نص الإشعار
                    <span className="text-xs text-muted-foreground mr-2">
                      (استخدم {"{name}"} لاسم المتبرع)
                    </span>
                  </label>
                  <textarea
                    value={eligibilityEndText}
                    onChange={(e) => setEligibilityEndText(e.target.value)}
                    rows={3}
                    className="w-full bg-background border border-input rounded-xl py-3 px-4 text-sm resize-none"
                    placeholder="أهلاً {name}! يمكنك التبرع الآن..."
                  />
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Emergency Notification */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card rounded-2xl p-5"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 glass rounded-xl flex items-center justify-center bg-red-500/10 shrink-0">
              <AlertTriangle className="h-6 w-6 text-red-500" strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-foreground">إشعار الحالات الطارئة</h3>
                <button
                  onClick={() => setEmergencyEnabled(!emergencyEnabled)}
                  className={cn(
                    "relative w-12 h-6 rounded-full transition-colors",
                    emergencyEnabled ? "bg-red-500" : "bg-muted"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform",
                      emergencyEnabled ? "right-0.5" : "left-0.5"
                    )}
                  />
                </button>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                إرسال إشعار فوري للمتبرعين المؤهلين عند وجود حالة عاجلة
              </p>
              
              {emergencyEnabled && (
                <div className="space-y-3 pt-4 border-t border-border/50">
                  <label className="text-sm font-medium text-foreground block">
                    نص الإشعار
                    <span className="text-xs text-muted-foreground mr-2">
                      (استخدم {"{blood_type}"} و {"{city}"})
                    </span>
                  </label>
                  <textarea
                    value={emergencyText}
                    onChange={(e) => setEmergencyText(e.target.value)}
                    rows={3}
                    className="w-full bg-background border border-input rounded-xl py-3 px-4 text-sm resize-none"
                    placeholder="حالة طارئة! يوجد طلب عاجل..."
                  />
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Periodic Notification */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl p-5"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 glass rounded-xl flex items-center justify-center bg-blue-500/10 shrink-0">
              <Clock className="h-6 w-6 text-blue-500" strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-foreground">إشعارات دورية</h3>
                <button
                  onClick={() => setPeriodicEnabled(!periodicEnabled)}
                  className={cn(
                    "relative w-12 h-6 rounded-full transition-colors",
                    periodicEnabled ? "bg-blue-500" : "bg-muted"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform",
                      periodicEnabled ? "right-0.5" : "left-0.5"
                    )}
                  />
                </button>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                إرسال إشعارات تذكيرية دورية للمتبرعين المؤهلين
              </p>
              
              {periodicEnabled && (
                <div className="space-y-4 pt-4 border-t border-border/50">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      الفترة بين الإشعارات
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        value={periodicHours}
                        onChange={(e) => setPeriodicHours(e.target.value)}
                        min={1}
                        max={168}
                        className="w-24 bg-background border border-input rounded-xl py-2 px-3 text-center font-bold"
                      />
                      <span className="text-muted-foreground">ساعة</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-2">
                      نص الإشعار
                      <span className="text-xs text-muted-foreground mr-2">
                        (استخدم {"{count}"} و {"{city}"})
                      </span>
                    </label>
                    <textarea
                      value={periodicText}
                      onChange={(e) => setPeriodicText(e.target.value)}
                      rows={3}
                      className="w-full bg-background border border-input rounded-xl py-3 px-4 text-sm resize-none"
                      placeholder="هناك {count} طلبات تنتظر..."
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* WhatsApp Filter Settings */}
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
                <h3 className="font-bold text-foreground">فلاتر إشعارات واتساب</h3>
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
                تحديد متى يتم إرسال إشعارات الواتساب للمتبرعين
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
                          onClick={() => setUrgencyFilter(option.value as any)}
                          className={cn(
                            "px-4 py-2 rounded-xl text-sm font-medium transition-all",
                            urgencyFilter === option.value
                              ? "bg-green-500 text-white"
                              : "bg-muted hover:bg-muted/80 text-foreground"
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
                        { value: "rare", label: "الفصائل النادرة فقط (AB-, B-, O-, A-)" },
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setBloodTypeFilter(option.value as any)}
                          className={cn(
                            "px-4 py-2 rounded-xl text-sm font-medium transition-all",
                            bloodTypeFilter === option.value
                              ? "bg-green-500 text-white"
                              : "bg-muted hover:bg-muted/80 text-foreground"
                          )}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Variables Reference */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-2xl p-5 bg-muted/50"
        >
          <h4 className="font-bold text-foreground mb-3 flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            المتغيرات المتاحة في النصوص
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <code className="bg-primary/10 text-primary px-2 py-1 rounded">{"{name}"}</code>
              <span className="text-muted-foreground">اسم المتبرع</span>
            </div>
            <div className="flex items-center gap-2">
              <code className="bg-primary/10 text-primary px-2 py-1 rounded">{"{blood_type}"}</code>
              <span className="text-muted-foreground">فصيلة الدم</span>
            </div>
            <div className="flex items-center gap-2">
              <code className="bg-primary/10 text-primary px-2 py-1 rounded">{"{city}"}</code>
              <span className="text-muted-foreground">المدينة</span>
            </div>
            <div className="flex items-center gap-2">
              <code className="bg-primary/10 text-primary px-2 py-1 rounded">{"{count}"}</code>
              <span className="text-muted-foreground">عدد الطلبات</span>
            </div>
            <div className="flex items-center gap-2">
              <code className="bg-primary/10 text-primary px-2 py-1 rounded">{"{hospital}"}</code>
              <span className="text-muted-foreground">اسم المستشفى</span>
            </div>
            <div className="flex items-center gap-2">
              <code className="bg-primary/10 text-primary px-2 py-1 rounded">{"{days}"}</code>
              <span className="text-muted-foreground">عدد الأيام</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
}
