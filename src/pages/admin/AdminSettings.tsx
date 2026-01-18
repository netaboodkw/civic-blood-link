import { AdminLayout } from "@/components/admin/AdminLayout";
import { Settings, Shield, Bell, Database } from "lucide-react";
import { motion } from "framer-motion";

const settingsCards = [
  {
    icon: Shield,
    title: "إعدادات الأمان",
    description: "إدارة إعدادات الأمان والصلاحيات",
    content: "يمكنك إدارة صلاحيات المستخدمين من صفحة المستخدمين",
    color: "bg-blue-500/10",
  },
  {
    icon: Bell,
    title: "إعدادات الإشعارات",
    description: "إدارة إعدادات الإشعارات للتطبيق",
    content: "قريباً: إعدادات الإشعارات",
    color: "bg-amber-500/10",
  },
  {
    icon: Database,
    title: "إعدادات قاعدة البيانات",
    description: "عرض معلومات قاعدة البيانات",
    content: "قاعدة البيانات متصلة وتعمل بشكل سليم",
    color: "bg-green-500/10",
  },
  {
    icon: Settings,
    title: "إعدادات عامة",
    description: "إعدادات التطبيق العامة",
    content: "قريباً: المزيد من الإعدادات",
    color: "bg-purple-500/10",
  },
];

export default function AdminSettings() {
  return (
    <AdminLayout title="الإعدادات">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {settingsCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card rounded-2xl p-5 hover:bg-primary/5 transition-colors cursor-pointer"
          >
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 glass rounded-xl flex items-center justify-center ${card.color} shrink-0`}>
                <card.icon className="h-6 w-6 text-primary" strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-foreground mb-1">{card.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{card.description}</p>
                <p className="text-sm text-muted-foreground/80">{card.content}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </AdminLayout>
  );
}
