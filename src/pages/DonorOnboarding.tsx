import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Droplet, Heart, Users, ArrowLeft, Bell, FileText, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
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

const termsAndConditions = `
الشروط والأحكام - تطبيق بنك الدم

1. مقدمة
مرحباً بك في تطبيق بنك الدم. باستخدامك لهذا التطبيق، فإنك توافق على الالتزام بهذه الشروط والأحكام.

2. الأهلية للتبرع
- يجب أن يكون عمرك 18 عاماً أو أكثر
- يجب أن تكون بصحة جيدة وقت التبرع
- يجب أن يكون وزنك 50 كجم على الأقل
- يجب أن تمر 3 أشهر على الأقل بين كل تبرع

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

6. الإشعارات
- قد نرسل لك إشعارات حول طلبات الدم في منطقتك
- يمكنك تعطيل الإشعارات من إعدادات التطبيق
- الإشعارات تهدف لإنقاذ الأرواح

7. المسؤولية
- التطبيق منصة وسيطة فقط
- لا نتحمل مسؤولية أي ضرر ناتج عن التبرع
- يجب استشارة الطبيب قبل التبرع

8. التعديلات
- نحتفظ بحق تعديل هذه الشروط في أي وقت
- سنخطرك بأي تغييرات جوهرية
- استمرارك في استخدام التطبيق يعني موافقتك على التعديلات

9. إنهاء الحساب
- يمكنك حذف حسابك في أي وقت
- نحتفظ بحق إيقاف حسابك في حالة مخالفة الشروط

10. التواصل
للاستفسارات أو الشكاوى، يرجى التواصل معنا عبر التطبيق.

آخر تحديث: يناير 2026
`;

export default function DonorOnboarding() {
  const navigate = useNavigate();
  const { signUp, isLoading } = useAuth();
  
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [city, setCity] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptNotifications, setAcceptNotifications] = useState(false);
  const [termsDialogOpen, setTermsDialogOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullName || !phone || !email || !password || !confirmPassword || !bloodType || !city) {
      toast.error("يرجى ملء جميع الحقول");
      return;
    }

    if (!/^[0-9]{8}$/.test(phone)) {
      toast.error("يرجى إدخال رقم هاتف صحيح (8 أرقام)");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("كلمتا المرور غير متطابقتين");
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
      <div className="flex-1 px-6 overflow-y-auto">
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
            <Label htmlFor="phone">رقم الهاتف</Label>
            <div className="relative">
              <Input
                id="phone"
                type="tel"
                placeholder="12345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 8))}
                className="bg-white pl-16"
                dir="ltr"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span className="text-sm">+965</span>
              </div>
            </div>
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
              placeholder="أدخل كلمة المرور (6 أحرف على الأقل)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="أعد إدخال كلمة المرور"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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

          {/* Terms and Conditions */}
          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3 bg-white p-3 rounded-lg border">
              <Checkbox
                id="terms"
                checked={acceptTerms}
                onCheckedChange={(checked) => setAcceptTerms(checked === true)}
                className="mt-0.5"
              />
              <div className="flex-1">
                <label htmlFor="terms" className="text-sm cursor-pointer">
                  أوافق على{" "}
                  <Dialog open={termsDialogOpen} onOpenChange={setTermsDialogOpen}>
                    <DialogTrigger asChild>
                      <button
                        type="button"
                        className="text-red-600 font-medium underline hover:text-red-700"
                      >
                        الشروط والأحكام
                      </button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg max-h-[80vh]" dir="rtl">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          الشروط والأحكام
                        </DialogTitle>
                      </DialogHeader>
                      <ScrollArea className="h-[60vh] pr-4">
                        <div className="whitespace-pre-wrap text-sm text-muted-foreground leading-relaxed">
                          {termsAndConditions}
                        </div>
                      </ScrollArea>
                      <Button
                        onClick={() => {
                          setAcceptTerms(true);
                          setTermsDialogOpen(false);
                        }}
                        className="w-full bg-red-600 hover:bg-red-700"
                      >
                        أوافق على الشروط والأحكام
                      </Button>
                    </DialogContent>
                  </Dialog>
                </label>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-white p-3 rounded-lg border">
              <Checkbox
                id="notifications"
                checked={acceptNotifications}
                onCheckedChange={(checked) => setAcceptNotifications(checked === true)}
                className="mt-0.5"
              />
              <div className="flex-1">
                <label htmlFor="notifications" className="text-sm cursor-pointer flex items-center gap-2">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  أوافق على استلام الإشعارات عند وجود طلبات دم في منطقتي
                </label>
                <p className="text-xs text-muted-foreground mt-1">
                  سنرسل لك إشعارات فقط عند الحاجة الملحة
                </p>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white h-12 text-lg"
            disabled={isLoading || !acceptTerms}
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
