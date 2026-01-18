import { AdminLayout } from "@/components/admin/AdminLayout";
import { StatsCard } from "@/components/admin/StatsCard";
import { useAdminStats } from "@/hooks/useAdminStats";
import { Users, FileText, Droplet, CheckCircle, Clock, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminDashboard() {
  const { data: stats, isLoading } = useAdminStats();

  return (
    <AdminLayout title="لوحة التحكم">
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
          {isLoading ? (
            Array(5).fill(0).map((_, i) => (
              <div key={i} className="glass-card rounded-2xl p-5 animate-pulse">
                <div className="flex items-start justify-between mb-3">
                  <div className="h-4 w-20 bg-muted rounded" />
                  <div className="w-10 h-10 bg-muted rounded-xl" />
                </div>
                <div className="h-8 w-12 bg-muted rounded" />
              </div>
            ))
          ) : (
            <>
              <StatsCard
                title="إجمالي المستخدمين"
                value={stats?.totalUsers || 0}
                icon={Users}
                iconClassName="bg-blue-500/10"
              />
              <StatsCard
                title="إجمالي الطلبات"
                value={stats?.totalRequests || 0}
                icon={FileText}
                iconClassName="bg-purple-500/10"
              />
              <StatsCard
                title="طلبات مفتوحة"
                value={stats?.openRequests || 0}
                icon={Clock}
                iconClassName="bg-amber-500/10"
              />
              <StatsCard
                title="طلبات مكتملة"
                value={stats?.fulfilledRequests || 0}
                icon={CheckCircle}
                iconClassName="bg-green-500/10"
              />
              <StatsCard
                title="إجمالي التبرعات"
                value={stats?.totalDonations || 0}
                icon={Droplet}
                iconClassName="bg-red-500/10"
              />
            </>
          )}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 glass rounded-xl flex items-center justify-center bg-primary/10">
              <TrendingUp className="w-5 h-5 text-primary" strokeWidth={1.5} />
            </div>
            <h2 className="text-lg font-bold text-foreground">نظرة عامة</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            مرحباً بك في لوحة تحكم الأدمن. يمكنك إدارة المستخدمين وطلبات الدم وسجلات التبرع من القائمة الجانبية.
            استخدم الإحصائيات أعلاه لمتابعة أداء المنصة.
          </p>
        </motion.div>

        {/* Activity Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card rounded-2xl p-6"
          >
            <h3 className="font-bold text-foreground mb-3">إحصائيات سريعة</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <span className="text-muted-foreground">نسبة الاستجابة</span>
                <span className="font-semibold text-primary">
                  {stats?.totalRequests && stats?.fulfilledRequests 
                    ? `${Math.round((stats.fulfilledRequests / stats.totalRequests) * 100)}%`
                    : '0%'
                  }
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <span className="text-muted-foreground">متوسط التبرعات / مستخدم</span>
                <span className="font-semibold text-foreground">
                  {stats?.totalUsers && stats?.totalDonations 
                    ? (stats.totalDonations / stats.totalUsers).toFixed(1)
                    : '0'
                  }
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-muted-foreground">طلبات قيد الانتظار</span>
                <span className="font-semibold text-amber-500">{stats?.openRequests || 0}</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card rounded-2xl p-6"
          >
            <h3 className="font-bold text-foreground mb-3">روابط سريعة</h3>
            <div className="space-y-2">
              <a href="/admin/users" className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/5 transition-colors">
                <Users className="w-5 h-5 text-primary" strokeWidth={1.5} />
                <span className="text-foreground">إدارة المستخدمين</span>
              </a>
              <a href="/admin/requests" className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/5 transition-colors">
                <FileText className="w-5 h-5 text-primary" strokeWidth={1.5} />
                <span className="text-foreground">طلبات الدم</span>
              </a>
              <a href="/admin/donations" className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/5 transition-colors">
                <Droplet className="w-5 h-5 text-primary" strokeWidth={1.5} />
                <span className="text-foreground">سجل التبرعات</span>
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </AdminLayout>
  );
}
