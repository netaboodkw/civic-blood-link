import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Shield, Bell, Database } from "lucide-react";

export default function AdminSettings() {
  return (
    <AdminLayout title="الإعدادات">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>إعدادات الأمان</CardTitle>
            </div>
            <CardDescription>
              إدارة إعدادات الأمان والصلاحيات
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              يمكنك إدارة صلاحيات المستخدمين من صفحة المستخدمين
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <CardTitle>إعدادات الإشعارات</CardTitle>
            </div>
            <CardDescription>
              إدارة إعدادات الإشعارات للتطبيق
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              قريباً: إعدادات الإشعارات
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              <CardTitle>إعدادات قاعدة البيانات</CardTitle>
            </div>
            <CardDescription>
              عرض معلومات قاعدة البيانات
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              قاعدة البيانات متصلة وتعمل بشكل سليم
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              <CardTitle>إعدادات عامة</CardTitle>
            </div>
            <CardDescription>
              إعدادات التطبيق العامة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              قريباً: المزيد من الإعدادات
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
