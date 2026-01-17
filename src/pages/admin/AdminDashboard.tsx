import { AdminLayout } from "@/components/admin/AdminLayout";
import { StatsCard } from "@/components/admin/StatsCard";
import { useAdminStats } from "@/hooks/useAdminStats";
import { Users, FileText, Droplet, CheckCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboard() {
  const { data: stats, isLoading } = useAdminStats();

  return (
    <AdminLayout title="لوحة التحكم">
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {isLoading ? (
            Array(5).fill(0).map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              <StatsCard
                title="إجمالي المستخدمين"
                value={stats?.totalUsers || 0}
                icon={Users}
              />
              <StatsCard
                title="إجمالي الطلبات"
                value={stats?.totalRequests || 0}
                icon={FileText}
              />
              <StatsCard
                title="طلبات مفتوحة"
                value={stats?.openRequests || 0}
                icon={Clock}
                className="border-amber-200 bg-amber-50"
              />
              <StatsCard
                title="طلبات مكتملة"
                value={stats?.fulfilledRequests || 0}
                icon={CheckCircle}
                className="border-green-200 bg-green-50"
              />
              <StatsCard
                title="إجمالي التبرعات"
                value={stats?.totalDonations || 0}
                icon={Droplet}
                className="border-red-200 bg-red-50"
              />
            </>
          )}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>الإجراءات السريعة</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              مرحباً بك في لوحة تحكم الأدمن. يمكنك إدارة المستخدمين وطلبات الدم وسجلات التبرع من القائمة الجانبية.
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
