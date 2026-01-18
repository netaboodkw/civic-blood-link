import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, Shield, FileText, Users, Lock, AlertTriangle, Calendar } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const sections = [
  {
    icon: FileText,
    title: "مقدمة",
    content: `مرحباً بك في تطبيق نبضة دم. باستخدامك لهذا التطبيق، فإنك توافق على الالتزام بهذه الشروط والأحكام. يرجى قراءتها بعناية قبل استخدام خدماتنا.`
  },
  {
    icon: Users,
    title: "الأهلية للتبرع",
    content: `• يجب أن يكون عمرك 18 عاماً أو أكثر
• يجب أن تكون بصحة جيدة وقت التبرع
• يجب أن يكون وزنك 50 كجم على الأقل
• يجب أن تمر 90 يوماً على الأقل بين كل تبرع
• لا يجوز التبرع إذا كنت تعاني من أي مرض معدٍ`
  },
  {
    icon: Shield,
    title: "المعلومات الشخصية",
    content: `• تتعهد بتقديم معلومات صحيحة ودقيقة
• أنت مسؤول عن تحديث بياناتك بشكل منتظم
• نحتفظ بحق حذف الحسابات التي تحتوي على معلومات مضللة
• يجب عليك الحفاظ على سرية بيانات حسابك`
  },
  {
    icon: Lock,
    title: "الخصوصية وحماية البيانات",
    content: `• نحترم خصوصيتك ونحمي بياناتك الشخصية
• لن نشارك معلوماتك مع أطراف ثالثة دون موافقتك
• نستخدم بياناتك فقط لأغراض التطبيق
• يتم تشفير جميع البيانات الحساسة
• لا نقوم بمشاركة أرقام الهواتف بين المستخدمين`
  },
  {
    icon: AlertTriangle,
    title: "استخدام التطبيق",
    content: `• يُمنع استخدام التطبيق لأغراض غير مشروعة
• يُمنع إنشاء طلبات وهمية أو احتيالية
• يُمنع التحرش أو الإزعاج للمستخدمين الآخرين
• يحق لنا إيقاف أي حساب يخالف هذه الشروط
• التطبيق للأغراض الإنسانية فقط ولا يجوز التجارة بالدم`
  },
  {
    icon: Calendar,
    title: "التحديثات والتعديلات",
    content: `• نحتفظ بحق تعديل هذه الشروط في أي وقت
• سيتم إخطارك بأي تغييرات جوهرية
• استمرارك في استخدام التطبيق يعني موافقتك على التعديلات

آخر تحديث: يناير 2026`
  }
];

export default function Terms() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-glass-border safe-area-top">
        <div className="flex items-center h-14 px-4 max-w-lg mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-primary ios-spring ios-press"
          >
            <ChevronLeft className="w-5 h-5 rotate-180" />
            <span className="text-sm font-medium">رجوع</span>
          </button>
          <h1 className="flex-1 text-center text-lg font-semibold text-foreground pr-12">
            الشروط والأحكام
          </h1>
        </div>
      </header>

      <ScrollArea className="flex-1">
        <main className="max-w-lg mx-auto px-4 py-6 pb-8">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="w-20 h-20 glass-card rounded-[24px] mx-auto mb-4 flex items-center justify-center glow-primary">
              <Shield className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold gradient-text mb-2">الشروط والأحكام</h2>
            <p className="text-muted-foreground text-sm">
              يرجى قراءة الشروط والأحكام بعناية قبل استخدام التطبيق
            </p>
          </motion.div>

          {/* Sections */}
          <div className="space-y-4">
            {sections.map((section, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card rounded-2xl p-5"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <section.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-bold text-foreground">{section.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {section.content}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Footer note */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center text-xs text-muted-foreground mt-8"
          >
            بتسجيلك في التطبيق، فإنك توافق على جميع الشروط والأحكام المذكورة أعلاه
          </motion.p>
        </main>
      </ScrollArea>
    </div>
  );
}
