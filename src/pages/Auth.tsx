import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Heart, Mail, Lock, User, MapPin, Droplets } from "lucide-react";
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
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {/* Logo */}
        <div className="flex items-center justify-center w-20 h-20 bg-primary rounded-3xl mb-6 animate-fade-in">
          <Heart className="w-10 h-10 text-primary-foreground" fill="currentColor" />
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-2 animate-slide-up">
          نبضة دم
        </h1>
        <p className="text-muted-foreground text-center mb-8 animate-slide-up" style={{ animationDelay: "50ms" }}>
          {mode === "login" ? "سجّل دخولك للمتابعة" : "أنشئ حسابك الجديد"}
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 animate-slide-up" style={{ animationDelay: "100ms" }}>
          {mode === "signup" && (
            <>
              {/* Full name */}
              <div className="relative">
                <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="الاسم الكامل"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full bg-card border border-input rounded-xl py-3.5 pr-12 pl-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              {/* Blood type and city row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <Droplets className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                  <select
                    value={bloodType}
                    onChange={(e) => setBloodType(e.target.value)}
                    className="w-full bg-card border border-input rounded-xl py-3.5 pr-10 pl-3 text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50"
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
                    className="w-full bg-card border border-input rounded-xl py-3.5 pr-10 pl-3 text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50"
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
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setRole(option.value as typeof role)}
                    className={cn(
                      "flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                      role === option.value
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Email */}
          <div className="relative">
            <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="email"
              placeholder="البريد الإلكتروني"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-card border border-input rounded-xl py-3.5 pr-12 pl-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
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
              className="w-full bg-card border border-input rounded-xl py-3.5 pr-12 pl-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className={cn(
              "w-full bg-primary text-primary-foreground rounded-xl py-3.5",
              "font-semibold text-base",
              "transition-all duration-200 ios-spring ios-press",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {isLoading ? "جارٍ التحميل..." : mode === "login" ? "تسجيل الدخول" : "إنشاء حساب"}
          </button>
        </form>

        {/* Toggle mode */}
        <button
          type="button"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
          className="mt-6 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          {mode === "login" ? "ليس لديك حساب؟ أنشئ حسابًا جديدًا" : "لديك حساب؟ سجّل دخولك"}
        </button>
      </div>
    </div>
  );
}
