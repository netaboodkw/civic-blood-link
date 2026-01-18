import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { Droplet, Mail, Lock, User, MapPin, ChevronLeft, Phone, Heart, Users, Bell, Check, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type AuthMode = "login" | "signup";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;
const CITIES = ["مدينة الكويت", "حولي", "الفروانية", "الجهراء", "الأحمدي", "مبارك الكبير"] as const;

const features = [
  { icon: Heart, title: "أنقذ حياة", desc: "تبرعك ينقذ أرواح" },
  { icon: Users, title: "مجتمع متعاون", desc: "آلاف المتبرعين" },
  { icon: Bell, title: "إشعارات فورية", desc: "عند الحاجة الملحة" },
];

export default function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signIn, signUp } = useAuth();
  
  // Get mode from URL params, default to signup
  const initialMode = searchParams.get("mode") === "login" ? "login" : "signup";
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(0);

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [bloodType, setBloodType] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Update mode when URL changes
  useEffect(() => {
    const urlMode = searchParams.get("mode");
    if (urlMode === "login" || urlMode === "signup") {
      setMode(urlMode);
      setStep(0);
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await signIn(email, password);
      toast.success("تم تسجيل الدخول بنجاح");
      const redirect = searchParams.get("redirect");
      navigate(redirect ? `/${redirect}` : "/home");
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ في تسجيل الدخول");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async () => {
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

    setIsLoading(true);

    try {
      await signUp(email, password, {
        full_name: fullName,
        blood_type: bloodType,
        city: city,
        role: "both", // All users can both donate and request
        phone: phone,
      });
      toast.success("تم التسجيل بنجاح!");
      const redirect = searchParams.get("redirect");
      navigate(redirect ? `/${redirect}` : "/home");
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء التسجيل");
    } finally {
      setIsLoading(false);
    }
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

  // Login View
  if (mode === "login") {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/30" dir="rtl">
        {/* Back button */}
        <button
          onClick={() => navigate("/")}
          className="absolute top-4 left-4 p-2.5 glass rounded-xl text-muted-foreground hover:text-foreground transition-colors z-10"
        >
          <ChevronLeft className="w-5 h-5 rotate-180" strokeWidth={2.5} />
        </button>

        <div className="flex-1 flex flex-col items-center justify-center p-6">
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, type: "spring" }}
            className="flex items-center justify-center w-24 h-24 glass-card rounded-[28px] mb-6 glow-primary"
          >
            <Droplet className="w-12 h-12 text-primary" fill="currentColor" strokeWidth={1.5} />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl font-bold gradient-text mb-2"
          >
            نبضة دم
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-muted-foreground text-center mb-8"
          >
            سجّل دخولك للمتابعة
          </motion.p>

          {/* Login Form */}
          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onSubmit={handleLogin}
            className="w-full max-w-sm space-y-4"
          >
            {/* Email */}
            <div className="relative">
              <div className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 glass rounded-xl flex items-center justify-center">
                <Mail className="w-4 h-4 text-primary" strokeWidth={2} />
              </div>
              <input
                type="email"
                placeholder="البريد الإلكتروني"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full glass-card border-0 rounded-2xl py-4 pr-16 pl-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                dir="ltr"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <div className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 glass rounded-xl flex items-center justify-center">
                <Lock className="w-4 h-4 text-primary" strokeWidth={2} />
              </div>
              <input
                type="password"
                placeholder="كلمة المرور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full glass-card border-0 rounded-2xl py-4 pr-16 pl-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            {/* Submit button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileTap={{ scale: 0.97 }}
              className="w-full bg-gradient-to-r from-primary to-primary/85 text-primary-foreground rounded-2xl py-4 font-semibold text-[17px] mt-2 shadow-lg glow-primary disabled:opacity-50 ios-spring"
            >
              {isLoading ? "جارٍ التحميل..." : "تسجيل الدخول"}
            </motion.button>
          </motion.form>

          {/* Switch to signup */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 space-y-3 text-center"
          >
            <button
              onClick={() => {
                setMode("signup");
                setStep(0);
              }}
              className="text-primary font-semibold"
            >
              ليس لديك حساب؟ سجّل الآن
            </button>
            <button
              onClick={() => navigate("/requests")}
              className="block w-full text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              تصفح الطلبات بدون تسجيل
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Signup View - Multi-step
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/30" dir="rtl">
      {/* Progress bar */}
      {step > 0 && (
        <div className="px-6 pt-4 safe-area-top">
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className={cn(
                  "h-1 flex-1 rounded-full transition-all duration-300",
                  step >= i ? "bg-gradient-to-r from-primary to-primary/70 glow-primary" : "glass"
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
      <button
        onClick={() => step > 0 ? setStep(step - 1) : navigate("/")}
        className="absolute top-4 left-4 p-2.5 glass rounded-xl text-muted-foreground hover:text-foreground transition-colors z-10"
      >
        <ChevronLeft className="w-5 h-5 rotate-180" strokeWidth={2.5} />
      </button>

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
              transition={{ delay: 0.1, duration: 0.5, type: "spring" }}
              className="flex items-center justify-center w-28 h-28 glass-card rounded-[32px] mx-auto mb-6 glow-primary"
            >
              <Droplet className="w-14 h-14 text-primary" fill="currentColor" strokeWidth={1.5} />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl font-extrabold text-center gradient-text mb-2"
            >
              نبضة دم
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="text-muted-foreground text-center mb-10"
            >
              انضم لمجتمع المتبرعين
            </motion.p>

            {/* Features */}
            <div className="space-y-3 mb-auto">
              {features.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-4 glass-card rounded-2xl p-4"
                >
                  <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-2xl">
                    <feature.icon className="w-6 h-6 text-primary" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">{feature.title}</h3>
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
                whileTap={{ scale: 0.97 }}
                onClick={nextStep}
                className="w-full bg-gradient-to-r from-primary to-primary/85 text-primary-foreground rounded-2xl py-4 font-bold text-[17px] shadow-lg glow-primary ios-spring"
              >
                سجّل حساب جديد
              </motion.button>

              <button
                onClick={() => setMode("login")}
                className="w-full text-primary font-semibold py-3"
              >
                لديك حساب؟ تسجيل الدخول
              </button>

              <button
                onClick={() => navigate("/requests")}
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
            <h2 className="text-2xl font-bold gradient-text mb-2">البيانات الشخصية</h2>
            <p className="text-muted-foreground mb-8">أدخل بياناتك للتسجيل</p>

            <div className="space-y-4 mb-auto">
              {/* Full Name */}
              <div className="relative">
                <div className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 glass rounded-xl flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" strokeWidth={2} />
                </div>
                <input
                  type="text"
                  placeholder="الاسم الكامل"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full glass-card border-0 rounded-2xl py-4 pr-16 pl-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              {/* Phone */}
              <div className="relative">
                <div className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 glass rounded-xl flex items-center justify-center">
                  <Phone className="w-4 h-4 text-primary" strokeWidth={2} />
                </div>
                <input
                  type="tel"
                  placeholder="رقم الهاتف"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 8))}
                  className="w-full glass-card border-0 rounded-2xl py-4 pr-16 pl-20 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  dir="ltr"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
                  965+
                </span>
              </div>

              {/* Email */}
              <div className="relative">
                <div className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 glass rounded-xl flex items-center justify-center">
                  <Mail className="w-4 h-4 text-primary" strokeWidth={2} />
                </div>
                <input
                  type="email"
                  placeholder="البريد الإلكتروني"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full glass-card border-0 rounded-2xl py-4 pr-16 pl-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  dir="ltr"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <div className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 glass rounded-xl flex items-center justify-center">
                  <Lock className="w-4 h-4 text-primary" strokeWidth={2} />
                </div>
                <input
                  type="password"
                  placeholder="كلمة المرور (6 أحرف على الأقل)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full glass-card border-0 rounded-2xl py-4 pr-16 pl-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={nextStep}
              className="w-full bg-gradient-to-r from-primary to-primary/85 text-primary-foreground rounded-2xl py-4 font-bold text-[17px] mt-6 shadow-lg glow-primary ios-spring"
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
            <h2 className="text-2xl font-bold gradient-text mb-2">فصيلة الدم والموقع</h2>
            <p className="text-muted-foreground mb-8">اختر فصيلة دمك ومدينتك</p>

            {/* Blood Type */}
            <div className="mb-6">
              <label className="text-sm font-semibold text-foreground mb-3 block">فصيلة الدم</label>
              <div className="grid grid-cols-4 gap-2">
                {BLOOD_TYPES.map((type) => (
                  <motion.button
                    key={type}
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setBloodType(type)}
                    className={cn(
                      "py-3.5 rounded-2xl font-bold text-base transition-all ios-spring",
                      bloodType === type
                        ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg glow-primary"
                        : "glass-card text-foreground hover:bg-primary/5"
                    )}
                  >
                    {type}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* City */}
            <div className="mb-auto">
              <label className="text-sm font-semibold text-foreground mb-3 block">المحافظة</label>
              <div className="grid grid-cols-2 gap-2">
                {CITIES.map((c) => (
                  <motion.button
                    key={c}
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCity(c)}
                    className={cn(
                      "py-3.5 px-4 rounded-2xl font-medium text-sm transition-all flex items-center gap-2 justify-center ios-spring",
                      city === c
                        ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg glow-primary"
                        : "glass-card text-foreground hover:bg-primary/5"
                    )}
                  >
                    <MapPin className="w-4 h-4" strokeWidth={2} />
                    {c}
                  </motion.button>
                ))}
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={nextStep}
              className="w-full bg-gradient-to-r from-primary to-primary/85 text-primary-foreground rounded-2xl py-4 font-bold text-[17px] mt-6 shadow-lg glow-primary ios-spring"
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
            <h2 className="text-2xl font-bold gradient-text mb-2">تأكيد التسجيل</h2>
            <p className="text-muted-foreground mb-8">راجع بياناتك ووافق على الشروط</p>

            {/* Summary */}
            <div className="glass-card rounded-2xl p-5 space-y-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">الاسم</span>
                <span className="font-semibold text-foreground">{fullName}</span>
              </div>
              <div className="h-px bg-border/50" />
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">فصيلة الدم</span>
                <span className="font-bold text-primary text-xl">{bloodType}</span>
              </div>
              <div className="h-px bg-border/50" />
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">المدينة</span>
                <span className="font-semibold text-foreground">{city}</span>
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="space-y-3 mb-auto">
              <motion.button
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={() => setAcceptTerms(!acceptTerms)}
                className={cn(
                  "w-full flex items-center gap-4 glass-card rounded-2xl p-4 text-right transition-all ios-spring",
                  acceptTerms && "ring-2 ring-primary/50"
                )}
              >
                <div className={cn(
                  "w-7 h-7 rounded-xl flex items-center justify-center transition-all shrink-0",
                  acceptTerms ? "bg-gradient-to-br from-primary to-primary/80 glow-primary" : "glass"
                )}>
                  {acceptTerms && <Check className="w-4 h-4 text-primary-foreground" strokeWidth={3} />}
                </div>
                <div className="flex-1">
                  <span className="font-medium text-foreground">أوافق على </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate("/terms");
                    }}
                    className="text-primary font-semibold inline-flex items-center gap-1"
                  >
                    الشروط والأحكام
                    <ExternalLink className="w-3.5 h-3.5" strokeWidth={2.5} />
                  </button>
                </div>
              </motion.button>
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleSignup}
              disabled={isLoading || !acceptTerms}
              className="w-full bg-gradient-to-r from-primary to-primary/85 text-primary-foreground rounded-2xl py-4 font-bold text-[17px] mt-6 shadow-lg glow-primary disabled:opacity-50 ios-spring"
            >
              {isLoading ? "جارٍ التسجيل..." : "إنشاء الحساب"}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
