import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Droplet, Heart, Users, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const cities = [
  "مدينة الكويت",
  "حولي",
  "الفروانية",
  "الأحمدي",
  "الجهراء",
  "مبارك الكبير",
];

export default function DonorOnboarding() {
  const navigate = useNavigate();
  const { signUp, isLoading } = useAuth();
  
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [city, setCity] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullName || !email || !password || !bloodType || !city) {
      toast.error("يرجى ملء جميع الحقول");
      return;
    }

    try {
      await signUp(email, password, {
        full_name: fullName,
        blood_type: bloodType,
        city: city,
        role: "donor",
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex flex-col" dir="rtl">
      {/* Header */}
      <div className="p-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Droplet className="h-10 w-10 text-red-600 fill-red-600" />
          <h1 className="text-2xl font-bold text-red-600">بنك الدم</h1>
        </div>
        <h2 className="text-xl font-semibold text-gray-800">سجّل كمتبرع</h2>
        <p className="text-muted-foreground mt-2">انضم إلينا وساهم في إنقاذ الأرواح</p>
      </div>

      {/* Benefits */}
      <div className="px-6 mb-6">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl p-3 text-center shadow-sm border">
            <Heart className="h-6 w-6 text-red-500 mx-auto mb-1" />
            <span className="text-xs text-muted-foreground">أنقذ حياة</span>
          </div>
          <div className="bg-white rounded-xl p-3 text-center shadow-sm border">
            <Users className="h-6 w-6 text-red-500 mx-auto mb-1" />
            <span className="text-xs text-muted-foreground">مجتمع متعاون</span>
          </div>
          <div className="bg-white rounded-xl p-3 text-center shadow-sm border">
            <Droplet className="h-6 w-6 text-red-500 mx-auto mb-1" />
            <span className="text-xs text-muted-foreground">تبرع سهل</span>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 px-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">الاسم الكامل</Label>
            <Input
              id="fullName"
              placeholder="أدخل اسمك الكامل"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="bg-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input
              id="email"
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white"
              dir="ltr"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">كلمة المرور</Label>
            <Input
              id="password"
              type="password"
              placeholder="أدخل كلمة المرور"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>فصيلة الدم</Label>
              <Select value={bloodType} onValueChange={setBloodType}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="اختر" />
                </SelectTrigger>
                <SelectContent>
                  {bloodTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>المحافظة</Label>
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="اختر" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white h-12 text-lg"
            disabled={isLoading}
          >
            {isLoading ? "جاري التسجيل..." : "سجّل كمتبرع"}
          </Button>
        </form>

        <div className="text-center mt-4">
          <button
            type="button"
            onClick={() => navigate("/auth")}
            className="text-sm text-muted-foreground hover:text-primary"
          >
            لديك حساب؟ <span className="text-primary font-medium">تسجيل الدخول</span>
          </button>
        </div>
      </div>

      {/* Skip Button */}
      <div className="p-6 pt-4">
        <Button
          variant="ghost"
          onClick={handleSkip}
          className="w-full text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 ml-2" />
          تخطي
        </Button>
      </div>
    </div>
  );
}
