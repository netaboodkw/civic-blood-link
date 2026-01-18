import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { Droplet, Mail, Lock, User, MapPin, Droplets, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type AuthMode = "login" | "signup";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;
const CITIES = ["مدينة الكويت", "حولي", "الفروانية", "الجهراء", "الأحمدي", "مبارك الكبير"] as const;

export default function Auth() {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [bloodType, setBloodType] = useState<string>("O+");
  const [city, setCity] = useState<string>("مدينة الكويت");
  const [role, setRole] = useState<"donor" | "requester" | "both">("donor");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === "login") {
        await signIn(email, password);
        toast.success("تم تسجيل الدخول بنجاح");
      } else {
        await signUp(email, password, {
          full_name: fullName,
          blood_type: bloodType,
          city,
          role,
        });
        toast.success("تم إنشاء الحساب بنجاح");
      }
      navigate("/home");
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col" dir="rtl">
      {/* Back button */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-4 left-4 p-2 text-muted-foreground hover:text-foreground transition-colors z-10"
      >
        <ChevronLeft className="w-6 h-6 rotate-180" />
      </button>

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-center w-20 h-20 bg-primary rounded-[24px] mb-6 shadow-lg"
        >
          <Droplet className="w-10 h-10 text-primary-foreground" fill="currentColor" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-2xl font-bold text-foreground mb-2"
        >
          نبضة دم
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-muted-foreground text-center mb-8"
        >
          {mode === "login" ? "سجّل دخولك للمتابعة" : "أنشئ حسابك الجديد"}
        </motion.p>

        {/* Mode Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex bg-muted p-1 rounded-xl mb-6 w-full max-w-sm"
        >
          {[
            { id: "login" as const, label: "تسجيل الدخول" },
            { id: "signup" as const, label: "حساب جديد" },
          ].map((option) => (
            <button
              key={option.id}
              onClick={() => setMode(option.id)}
              className={cn(
                "flex-1 py-2.5 rounded-lg text-sm font-medium transition-all",
                mode === option.id
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground"
              )}
            >
              {option.label}
            </button>
          ))}
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          onSubmit={handleSubmit}
          className="w-full max-w-sm space-y-3"
        >
          <AnimatePresence mode="wait">
            {mode === "signup" && (
              <motion.div
                key="signup-fields"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-3 overflow-hidden"
              >
                {/* Full name */}
                <div className="relative">
                  <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="الاسم الكامل"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full bg-card border-0 rounded-xl py-3.5 pr-12 pl-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                {/* Blood type and city row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <Droplets className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                    <select
                      value={bloodType}
                      onChange={(e) => setBloodType(e.target.value)}
                      className="w-full bg-card border-0 rounded-xl py-3.5 pr-10 pl-3 text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      {BLOOD_TYPES.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div className="relative">
                    <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-card border-0 rounded-xl py-3.5 pr-10 pl-3 text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      {CITIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Role selection */}
                <div className="flex gap-2">
                  {[
                    { value: "donor", label: "متبرع" },
                    { value: "requester", label: "طالب" },
                    { value: "both", label: "كلاهما" },
                  ].map((option) => (
                    <motion.button
                      key={option.value}
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setRole(option.value as typeof role)}
                      className={cn(
                        "flex-1 py-2.5 rounded-xl text-sm font-medium transition-all",
                        role === option.value
                          ? "bg-primary text-primary-foreground"
                          : "bg-card text-foreground"
                      )}
                    >
                      {option.label}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Email */}
          <div className="relative">
            <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="email"
              placeholder="البريد الإلكتروني"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-card border-0 rounded-xl py-3.5 pr-12 pl-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              dir="ltr"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="password"
              placeholder="كلمة المرور"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-card border-0 rounded-xl py-3.5 pr-12 pl-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Submit button */}
          <motion.button
            type="submit"
            disabled={isLoading}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "w-full bg-primary text-primary-foreground rounded-xl py-3.5",
              "font-semibold text-[17px]",
              "transition-all duration-200",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "mt-4"
            )}
          >
            {isLoading ? "جارٍ التحميل..." : mode === "login" ? "تسجيل الدخول" : "إنشاء حساب"}
          </motion.button>
        </motion.form>

        {/* Skip link */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          onClick={() => navigate("/requests")}
          className="mt-6 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          تصفح الطلبات بدون تسجيل
        </motion.button>
      </div>
    </div>
  );
}
