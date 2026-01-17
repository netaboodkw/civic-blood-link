import { useNavigate } from "react-router-dom";
import { Heart, MapPin, Bell, Users, Shield, Clock, ChevronLeft, Droplets } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

const features = [
  {
    icon: MapPin,
    title: "طلبات قريبة",
    description: "اعثر على طلبات الدم في مدينتك فورًا",
  },
  {
    icon: Bell,
    title: "تنبيهات فورية",
    description: "احصل على إشعار عند وجود طلب مطابق لفصيلتك",
  },
  {
    icon: Clock,
    title: "توفير الوقت",
    description: "تواصل مباشر بين المتبرع والمحتاج",
  },
  {
    icon: Shield,
    title: "آمن وموثوق",
    description: "بياناتك محمية ومشفرة بالكامل",
  },
];

const stats = [
  { value: "١٠٠٠+", label: "متبرع مسجل" },
  { value: "٥٠٠+", label: "طلب تم تلبيته" },
  { value: "٨", label: "مدن مغطاة" },
];

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate("/home");
    } else {
      navigate("/auth");
    }
  };

  const handleViewRequests = () => {
    navigate("/requests");
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Hero Section */}
      <section className="relative px-4 pt-12 pb-8">
        {/* Background decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl -z-10" />
        
        <div className="max-w-lg mx-auto text-center">
          {/* Logo */}
          <div className="flex items-center justify-center mb-6 animate-fade-in">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary/80 rounded-[2rem] flex items-center justify-center shadow-elevated">
                <Heart className="w-12 h-12 text-primary-foreground" fill="currentColor" />
              </div>
              {/* Pulse effect */}
              <div className="absolute inset-0 bg-primary/20 rounded-[2rem] animate-ping" style={{ animationDuration: "2s" }} />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-foreground mb-3 animate-slide-up">
            نبضة دم
          </h1>
          <p className="text-lg text-muted-foreground mb-8 animate-slide-up leading-relaxed" style={{ animationDelay: "50ms" }}>
            منصتك للتبرع بالدم وإنقاذ الأرواح
            <br />
            <span className="text-primary font-medium">كل نقطة دم تصنع الفرق</span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-3 mb-10 animate-slide-up" style={{ animationDelay: "100ms" }}>
            <button
              onClick={handleGetStarted}
              className={cn(
                "w-full flex items-center justify-center gap-2",
                "bg-primary text-primary-foreground",
                "rounded-xl px-6 py-4",
                "font-semibold text-base",
                "shadow-card hover:shadow-elevated",
                "transition-all duration-200 ios-spring ios-press"
              )}
            >
              <span>{isAuthenticated ? "الذهاب للرئيسية" : "ابدأ الآن"}</span>
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={handleViewRequests}
              className={cn(
                "w-full flex items-center justify-center gap-2",
                "bg-secondary text-secondary-foreground",
                "rounded-xl px-6 py-4",
                "font-medium text-base",
                "transition-all duration-200 ios-spring ios-press"
              )}
            >
              <Droplets className="w-5 h-5" />
              <span>عرض طلبات الدم</span>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 animate-slide-up" style={{ animationDelay: "150ms" }}>
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl font-bold text-primary mb-1">
                  {stat.value}
                </div>
                <div className="text-xs text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-10">
        <div className="max-w-lg mx-auto">
          <h2 className="text-xl font-bold text-foreground text-center mb-6 animate-slide-up">
            لماذا نبضة دم؟
          </h2>

          <div className="grid grid-cols-2 gap-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-card rounded-xl p-4 shadow-card animate-slide-up card-interactive"
                  style={{ animationDelay: `${200 + index * 50}ms` }}
                >
                  <div className="w-10 h-10 bg-primary-soft rounded-xl flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground text-sm mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 py-10 bg-card/50">
        <div className="max-w-lg mx-auto">
          <h2 className="text-xl font-bold text-foreground text-center mb-6">
            كيف يعمل؟
          </h2>

          <div className="space-y-4">
            {[
              { step: "١", title: "سجّل حسابك", desc: "أدخل فصيلة دمك ومدينتك" },
              { step: "٢", title: "استقبل التنبيهات", desc: "عند وجود طلب مطابق" },
              { step: "٣", title: "تبرع وأنقذ حياة", desc: "تواصل مع المحتاج مباشرة" },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-4 animate-slide-up"
                style={{ animationDelay: `${400 + index * 100}ms` }}
              >
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg shrink-0">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-4 py-10">
        <div className="max-w-lg mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Users className="w-6 h-6 text-primary" />
            <span className="text-muted-foreground">انضم لمجتمع المتبرعين</span>
          </div>

          <button
            onClick={handleGetStarted}
            className={cn(
              "w-full flex items-center justify-center gap-2",
              "bg-primary text-primary-foreground",
              "rounded-xl px-6 py-4",
              "font-semibold text-base",
              "shadow-card hover:shadow-elevated",
              "transition-all duration-200 ios-spring ios-press"
            )}
          >
            <Heart className="w-5 h-5" fill="currentColor" />
            <span>{isAuthenticated ? "الذهاب للرئيسية" : "سجّل الآن مجانًا"}</span>
          </button>

          <p className="text-xs text-muted-foreground mt-4">
            التسجيل مجاني • بياناتك آمنة
          </p>
        </div>
      </section>

      {/* Footer spacing */}
      <div className="h-8" />
    </div>
  );
}
