import { useNavigate } from "react-router-dom";
import { Heart, MapPin, Bell, Users, Shield, Clock, ChevronLeft, Droplets, Plus, Activity, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import localLogo from "@/assets/logo.png";
import { GlassCard } from "@/components/ui/glass-card";
import { IOSButton } from "@/components/ui/ios-button";

const features = [
  {
    icon: MapPin,
    title: "طلبات قريبة",
    description: "اعثر على طلبات الدم في مدينتك فورًا",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Bell,
    title: "تنبيهات فورية",
    description: "احصل على إشعار عند وجود طلب مطابق لفصيلتك",
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: Clock,
    title: "توفير الوقت",
    description: "إشعارات فورية عند وجود طلب مطابق",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: Shield,
    title: "آمن وموثوق",
    description: "بياناتك محمية ومشفرة بالكامل",
    color: "from-purple-500 to-pink-500",
  },
];

const stats = [
  { value: "٥٠٠+", label: "متبرع", icon: Users },
  { value: "٢٠٠+", label: "طلب مكتمل", icon: Heart },
  { value: "٦", label: "محافظات", icon: MapPin },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

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

  const handleCreateRequest = () => {
    if (isAuthenticated) {
      navigate("/create-request");
    } else {
      navigate("/auth?redirect=create-request");
    }
  };

  return (
    <div 
      className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 overflow-x-hidden overflow-y-auto" 
      dir="rtl"
      style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.12, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute top-[-20%] right-[-20%] w-[600px] h-[600px] bg-gradient-to-br from-primary/40 to-accent/30 rounded-full blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.08, scale: 1 }}
          transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
          className="absolute bottom-[-10%] left-[-20%] w-[500px] h-[500px] bg-gradient-to-tr from-accent/30 to-primary/40 rounded-full blur-3xl"
        />
      </div>

      {/* Hero Section */}
      <section className="relative px-4 pt-12 pb-8">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-lg mx-auto text-center"
        >
          {/* Logo with Pulse Effect */}
          <motion.div 
            variants={itemVariants}
            className="flex items-center justify-center mb-6"
          >
            <div className="relative">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="rounded-[2rem] overflow-visible"
              >
                <motion.img 
                  src={localLogo} 
                  alt="نبضة دم" 
                  className="w-auto h-32 object-contain drop-shadow-2xl"
                  animate={{ scale: [1, 1.03, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
              </motion.div>
              {/* Sparkle Effect */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute -top-2 -right-2"
              >
                <Sparkles className="w-6 h-6 text-accent" />
              </motion.div>
            </div>
          </motion.div>

          <motion.p 
            variants={itemVariants}
            className="text-lg text-muted-foreground mb-2 leading-relaxed"
          >
            منصتك للتبرع بالدم وإنقاذ الأرواح
          </motion.p>

          <motion.div 
            variants={itemVariants}
            className="flex items-center justify-center gap-2 mb-8"
          >
            <Activity className="w-5 h-5 text-primary animate-pulse" />
            <span className="text-primary font-bold text-lg">كل نقطة دم تصنع الفرق</span>
          </motion.div>

          {/* Stats Cards - Glass Style */}
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-3 gap-3 mb-8"
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <GlassCard
                  key={index}
                  variant="default"
                  interactive
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.4 + index * 0.1, type: "spring" }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="p-4 text-center"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-1">
                    {stat.value}
                  </div>
                  <div className="text-xs text-muted-foreground font-medium">
                    {stat.label}
                  </div>
                </GlassCard>
              );
            })}
          </motion.div>

          {/* CTA Buttons - iOS Style */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col gap-3"
          >
            <IOSButton
              onClick={handleGetStarted}
              variant="primary"
              size="lg"
              fullWidth
              className="shadow-xl shadow-primary/30"
            >
              <span>{isAuthenticated ? "الذهاب للرئيسية" : "ابدأ الآن"}</span>
              <ChevronLeft className="w-5 h-5" />
            </IOSButton>

            <IOSButton
              onClick={handleCreateRequest}
              variant="destructive"
              size="lg"
              fullWidth
              className="shadow-xl shadow-destructive/30"
            >
              <Plus className="w-5 h-5" />
              <span>أحتاج متبرع دم</span>
            </IOSButton>

            <IOSButton
              onClick={handleViewRequests}
              variant="secondary"
              size="lg"
              fullWidth
            >
              <Droplets className="w-5 h-5 text-primary" />
              <span>عرض طلبات الدم</span>
            </IOSButton>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section - Cards Grid */}
      <section className="px-4 py-10">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-lg mx-auto"
        >
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl font-bold text-foreground text-center mb-8"
          >
            لماذا <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">نبضة دم</span>؟
          </motion.h2>

          <div className="grid grid-cols-2 gap-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <GlassCard
                  key={index}
                  variant="default"
                  interactive
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, type: "spring" }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="p-5"
                >
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
                    "bg-gradient-to-br", feature.color,
                    "shadow-lg transition-transform duration-300"
                  )}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-foreground text-base mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </GlassCard>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* How it works - Timeline Style */}
      <section className="px-4 py-10 bg-gradient-to-b from-card/30 to-transparent">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-lg mx-auto"
        >
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl font-bold text-foreground text-center mb-8"
          >
            كيف <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">يعمل</span>؟
          </motion.h2>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute right-6 top-6 bottom-6 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-transparent" />

            <div className="space-y-6">
              {[
                { step: "١", title: "سجّل حسابك", desc: "أدخل فصيلة دمك ومدينتك", icon: Users },
                { step: "٢", title: "استقبل التنبيهات", desc: "عند وجود طلب مطابق", icon: Bell },
                { step: "٣", title: "تبرع وأنقذ حياة", desc: "توجه لأقرب مركز تبرع", icon: Heart },
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.2 }}
                    className="flex items-start gap-4 relative"
                  >
                    <motion.div 
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="w-12 h-12 bg-gradient-to-br from-primary to-accent text-primary-foreground rounded-2xl flex items-center justify-center font-bold text-lg shrink-0 shadow-lg shadow-primary/30 z-10"
                    >
                      {item.step}
                    </motion.div>
                    <GlassCard variant="default" className="flex-1 p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="w-4 h-4 text-primary" />
                        <h3 className="font-bold text-foreground">{item.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </GlassCard>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Bottom CTA - Floating Card */}
      <section className="px-4 py-10 pb-20">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-lg mx-auto"
        >
          <GlassCard 
            variant="strong" 
            glow
            className="rounded-3xl p-8 text-center relative overflow-hidden"
          >
            {/* Background Decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
            
            <div className="relative z-10">
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="flex items-center justify-center gap-3 mb-4"
              >
                <Heart className="w-8 h-8 text-primary" fill="currentColor" />
                <span className="text-xl font-bold text-foreground">انضم لمجتمع المتبرعين</span>
              </motion.div>

              <p className="text-muted-foreground mb-6">
                كن جزءاً من فريق إنقاذ الأرواح
              </p>

              <IOSButton
                onClick={handleGetStarted}
                variant="primary"
                size="lg"
                fullWidth
                className="bg-gradient-to-l from-primary to-accent shadow-xl shadow-primary/40"
              >
                <Heart className="w-5 h-5" fill="currentColor" />
                <span>{isAuthenticated ? "الذهاب للرئيسية" : "سجّل الآن مجانًا"}</span>
              </IOSButton>

              <p className="text-xs text-muted-foreground mt-4">
                ✓ التسجيل مجاني • ✓ بياناتك آمنة • ✓ دعم فني 24/7
              </p>
            </div>
          </GlassCard>
        </motion.div>
      </section>
    </div>
  );
}
