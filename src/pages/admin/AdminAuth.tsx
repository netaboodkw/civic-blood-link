import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Shield, Lock, Mail, Loader2, Eye, EyeOff } from "lucide-react";

export default function AdminAuth() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("يرجى إدخال البريد الإلكتروني وكلمة المرور");
      return;
    }

    setIsLoading(true);

    try {
      // Sign in
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        if (authError.message.includes("Invalid login credentials")) {
          toast.error("بيانات الدخول غير صحيحة");
        } else {
          toast.error("حدث خطأ أثناء تسجيل الدخول");
        }
        setIsLoading(false);
        return;
      }

      if (!authData.user) {
        toast.error("حدث خطأ أثناء تسجيل الدخول");
        setIsLoading(false);
        return;
      }

      // Check if user has admin role
      const { data: roles, error: rolesError } = await supabase.rpc("get_user_roles", {
        _user_id: authData.user.id,
      });

      if (rolesError) {
        console.error("Error checking roles:", rolesError);
        await supabase.auth.signOut();
        toast.error("حدث خطأ أثناء التحقق من الصلاحيات");
        setIsLoading(false);
        return;
      }

      const isAdmin = roles?.includes("admin");

      if (!isAdmin) {
        await supabase.auth.signOut();
        toast.error("ليس لديك صلاحية الدخول للوحة التحكم");
        setIsLoading(false);
        return;
      }

      toast.success("تم تسجيل الدخول بنجاح");
      navigate("/admin");
    } catch (error) {
      console.error("Login error:", error);
      toast.error("حدث خطأ غير متوقع");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30 flex items-center justify-center p-4" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 mx-auto mb-4 glass-card rounded-3xl flex items-center justify-center glow-primary"
          >
            <Shield className="w-10 h-10 text-primary" />
          </motion.div>
          <h1 className="text-2xl font-bold gradient-text mb-2">لوحة التحكم</h1>
          <p className="text-muted-foreground text-sm">تسجيل دخول المشرفين</p>
        </div>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-3xl p-6 space-y-6"
        >
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="glass-card border-0 rounded-2xl py-6 pr-12 text-left"
                  dir="ltr"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80">
                كلمة المرور
              </label>
              <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="glass-card border-0 rounded-2xl py-6 pr-12 pl-12 text-left"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full py-6 rounded-2xl text-lg font-medium bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Shield className="w-5 h-5 ml-2" />
                  تسجيل الدخول
                </>
              )}
            </Button>
          </form>

          {/* Security Note */}
          <div className="pt-4 border-t border-border/50">
            <p className="text-xs text-muted-foreground text-center">
              🔒 هذه الصفحة مخصصة للمشرفين فقط
            </p>
          </div>
        </motion.div>

        {/* Back Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center"
        >
          <button
            onClick={() => navigate("/")}
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            العودة للصفحة الرئيسية
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}