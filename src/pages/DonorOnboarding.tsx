import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Users, Droplet, ChevronLeft, Mail, Lock, User, MapPin, Droplets, Phone, Bell, FileText, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";

const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const cities = [
  "مدينة الكويت",
  "حولي",
  "الفروانية",
  "الأحمدي",
  "الجهراء",
  "مبارك الكبير",
];

const termsAndConditions = `
الشروط والأحكام - تطبيق نبضة دم

1. مقدمة
مرحباً بك في تطبيق نبضة دم. باستخدامك لهذا التطبيق، فإنك توافق على الالتزام بهذه الشروط والأحكام.

2. الأهلية للتبرع
- يجب أن يكون عمرك 18 عاماً أو أكثر
- يجب أن تكون بصحة جيدة وقت التبرع
- يجب أن يكون وزنك 50 كجم على الأقل
- يجب أن تمر 90 يوم على الأقل بين كل تبرع

3. المعلومات الشخصية
- تتعهد بتقديم معلومات صحيحة ودقيقة
- أنت مسؤول عن تحديث بياناتك بشكل منتظم
- نحتفظ بحق حذف الحسابات التي تحتوي على معلومات مضللة

4. الخصوصية
- نحترم خصوصيتك ونحمي بياناتك الشخصية
- لن نشارك معلوماتك مع أطراف ثالثة دون موافقتك
- نستخدم بياناتك فقط لأغراض التطبيق

5. استخدام التطبيق
- يُمنع استخدام التطبيق لأغراض غير مشروعة
- يُمنع إنشاء طلبات وهمية أو احتيالية
- يُمنع التحرش أو الإزعاج للمستخدمين الآخرين

آخر تحديث: يناير 2026
`;

const features = [
  { icon: Heart, title: "أنقذ حياة", desc: "تبرعك ينقذ أرواح" },
  { icon: Users, title: "مجتمع متعاون", desc: "آلاف المتبرعين" },
  { icon: Bell, title: "إشعارات فورية", desc: "عند الحاجة الملحة" },
];

export default function DonorOnboarding() {
  const navigate = useNavigate();
  const { signUp, isLoading } = useAuth();
  const [step, setStep] = useState(0);
  const [termsOpen, setTermsOpen] = useState(false);
  
  // Form state
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [city, setCity] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptNotifications, setAcceptNotifications] = useState(true);

  const handleSubmit = async () => {
    if (!fullName || !phone || !email || !password || !bloodType || !city) {
      toast.error("يرجى ملء جميع الحقول");
      return;
    }

    if (!/^[0-9]{8}$/.test(phone)) {
      toast.error("يرجى إدخال رقم هاتف صحيح (8 أرقام)");
      return;
    }

    if (password.length < 6) {
      toast.error("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }

    if (!acceptTerms) {
      toast.error("يجب الموافقة على الشروط والأحكام");
      return;
    }

    try {
      await signUp(email, password, {
        full_name: fullName,
        blood_type: bloodType,
        city: city,
        role: "donor",
        phone: phone,
      });
      toast.success("تم التسجيل بنجاح!");
      navigate("/home");
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء التسجيل");
    }
  };

  const handleSkip = () => {
    navigate("/requests");
  };

  const nextStep = () => {
    if (step === 0) {
      setStep(1);
    } else if (step === 1) {
      if (!fullName || !phone || !email || !password) {
        toast.error("يرجى ملء جميع الحقول");
        return;
      }
      if (!/^[0-9]{8}$/.test(phone)) {
        toast.error("يرجى إدخال رقم هاتف صحيح");
        return;
      }
      if (password.length < 6) {
        toast.error("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!bloodType || !city) {
        toast.error("يرجى اختيار فصيلة الدم والمدينة");
        return;
      }
      setStep(3);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col" dir="rtl">
      {/* Progress bar */}
      {step > 0 && (
        <div className="px-6 pt-4">
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className={cn(
                  "h-1 flex-1 rounded-full",
                  step >= i ? "bg-primary" : "bg-muted"
                )}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Back button */}
      {step > 0 && (
        <button
          onClick={() => setStep(step - 1)}
          className="absolute top-4 left-4 p-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-6 h-6 rotate-180" />
        </button>
      )}

      <AnimatePresence mode="wait">
        {/* Welcome Step */}
        {step === 0 && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col px-6 pt-16 pb-8"
          >
            {/* Logo */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="flex items-center justify-center w-24 h-24 bg-primary rounded-[28px] mx-auto mb-6 shadow-lg"
            >
              <Droplet className="w-12 h-12 text-primary-foreground" fill="currentColor" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold text-center text-foreground mb-2"
            >
              نبضة دم
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="text-muted-foreground text-center mb-10"
            >
              كن بطلاً وأنقذ حياة
            </motion.p>

            {/* Features */}
            <div className="space-y-3 mb-auto">
              {features.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-4 bg-card rounded-2xl p-4"
                >
                  <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-xl">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-3 mt-8"
            >
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={nextStep}
                className="w-full bg-primary text-primary-foreground rounded-2xl py-4 font-semibold text-[17px] shadow-sm"
              >
                سجّل كمتبرع
              </motion.button>

              <button
                onClick={() => navigate("/auth")}
                className="w-full text-primary font-medium py-3"
              >
                لديك حساب؟ تسجيل الدخول
              </button>

              <button
                onClick={handleSkip}
                className="w-full text-muted-foreground text-sm py-2"
              >
                تصفح بدون تسجيل
              </button>
            </motion.div>
          </motion.div>
        )}

        {/* Personal Info Step */}
        {step === 1 && (
          <motion.div
            key="personal"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col px-6 pt-8 pb-8"
          >
            <h2 className="text-2xl font-bold text-foreground mb-2">البيانات الشخصية</h2>
            <p className="text-muted-foreground mb-8">أدخل بياناتك للتسجيل</p>

            <div className="space-y-4 mb-auto">
              {/* Full Name */}
              <div className="relative">
                <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="الاسم الكامل"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-card border-0 rounded-2xl py-4 pr-12 pl-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              {/* Phone */}
              <div className="relative">
                <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="tel"
                  placeholder="رقم الهاتف"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 8))}
                  className="w-full bg-card border-0 rounded-2xl py-4 pr-12 pl-20 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  dir="ltr"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  965+
                </span>
              </div>

              {/* Email */}
              <div className="relative">
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="البريد الإلكتروني"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-card border-0 rounded-2xl py-4 pr-12 pl-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  dir="ltr"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="password"
                  placeholder="كلمة المرور (6 أحرف على الأقل)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-card border-0 rounded-2xl py-4 pr-12 pl-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={nextStep}
              className="w-full bg-primary text-primary-foreground rounded-2xl py-4 font-semibold text-[17px] mt-6"
            >
              التالي
            </motion.button>
          </motion.div>
        )}

        {/* Blood Type & City Step */}
        {step === 2 && (
          <motion.div
            key="blood"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col px-6 pt-8 pb-8"
          >
            <h2 className="text-2xl font-bold text-foreground mb-2">فصيلة الدم والموقع</h2>
            <p className="text-muted-foreground mb-8">اختر فصيلة دمك ومدينتك</p>

            {/* Blood Type */}
            <div className="mb-6">
              <label className="text-sm font-medium text-foreground mb-3 block">فصيلة الدم</label>
              <div className="grid grid-cols-4 gap-2">
                {bloodTypes.map((type) => (
                  <motion.button
                    key={type}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setBloodType(type)}
                    className={cn(
                      "py-3 rounded-xl font-semibold text-base transition-all",
                      bloodType === type
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-card text-foreground"
                    )}
                  >
                    {type}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* City */}
            <div className="mb-auto">
              <label className="text-sm font-medium text-foreground mb-3 block">المحافظة</label>
              <div className="grid grid-cols-2 gap-2">
                {cities.map((c) => (
                  <motion.button
                    key={c}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCity(c)}
                    className={cn(
                      "py-3 px-4 rounded-xl font-medium text-sm transition-all flex items-center gap-2",
                      city === c
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-card text-foreground"
                    )}
                  >
                    <MapPin className="w-4 h-4" />
                    {c}
                  </motion.button>
                ))}
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={nextStep}
              className="w-full bg-primary text-primary-foreground rounded-2xl py-4 font-semibold text-[17px] mt-6"
            >
              التالي
            </motion.button>
          </motion.div>
        )}

        {/* Terms & Confirm Step */}
        {step === 3 && (
          <motion.div
            key="terms"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col px-6 pt-8 pb-8"
          >
            <h2 className="text-2xl font-bold text-foreground mb-2">تأكيد التسجيل</h2>
            <p className="text-muted-foreground mb-8">راجع بياناتك ووافق على الشروط</p>

            {/* Summary */}
            <div className="bg-card rounded-2xl p-4 space-y-3 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">الاسم</span>
                <span className="font-medium text-foreground">{fullName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">فصيلة الدم</span>
                <span className="font-bold text-primary text-lg">{bloodType}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">المدينة</span>
                <span className="font-medium text-foreground">{city}</span>
              </div>
            </div>

            {/* Terms */}
            <div className="space-y-3 mb-auto">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setAcceptTerms(!acceptTerms)}
                className={cn(
                  "w-full flex items-center gap-3 bg-card rounded-2xl p-4 text-right transition-all",
                  acceptTerms && "ring-2 ring-primary"
                )}
              >
                <div className={cn(
                  "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                  acceptTerms ? "bg-primary border-primary" : "border-muted-foreground"
                )}>
                  {acceptTerms && <Check className="w-4 h-4 text-primary-foreground" />}
                </div>
                <div className="flex-1">
                  <span className="text-foreground">أوافق على </span>
                  <Drawer open={termsOpen} onOpenChange={setTermsOpen}>
                    <DrawerTrigger asChild>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setTermsOpen(true);
                        }}
                        className="text-primary font-medium underline"
                      >
                        الشروط والأحكام
                      </button>
                    </DrawerTrigger>
                    <DrawerContent className="max-h-[85vh]">
                      <DrawerHeader>
                        <DrawerTitle className="flex items-center gap-2">
                          <FileText className="w-5 h-5" />
                          الشروط والأحكام
                        </DrawerTitle>
                      </DrawerHeader>
                      <ScrollArea className="h-[50vh] px-4">
                        <div className="whitespace-pre-wrap text-sm text-muted-foreground leading-relaxed pb-4">
                          {termsAndConditions}
                        </div>
                      </ScrollArea>
                      <div className="p-4">
                        <motion.button
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setAcceptTerms(true);
                            setTermsOpen(false);
                          }}
                          className="w-full bg-primary text-primary-foreground rounded-2xl py-4 font-semibold"
                        >
                          أوافق على الشروط
                        </motion.button>
                      </div>
                    </DrawerContent>
                  </Drawer>
                </div>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setAcceptNotifications(!acceptNotifications)}
                className={cn(
                  "w-full flex items-center gap-3 bg-card rounded-2xl p-4 text-right transition-all",
                  acceptNotifications && "ring-2 ring-primary"
                )}
              >
                <div className={cn(
                  "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                  acceptNotifications ? "bg-primary border-primary" : "border-muted-foreground"
                )}>
                  {acceptNotifications && <Check className="w-4 h-4 text-primary-foreground" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-muted-foreground" />
                    <span className="text-foreground">تفعيل الإشعارات</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    سنرسل لك إشعارات عند وجود حالات طارئة
                  </p>
                </div>
              </motion.button>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={isLoading || !acceptTerms}
              className={cn(
                "w-full bg-primary text-primary-foreground rounded-2xl py-4 font-semibold text-[17px] mt-6",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {isLoading ? "جاري التسجيل..." : "إنشاء الحساب"}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
