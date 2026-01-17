import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { useAdminRole } from "@/hooks/useAdminRole";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

export function AdminLayout({ children, title }: AdminLayoutProps) {
  const { data: roleData, isLoading } = useAdminRole();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!roleData?.isAdmin) {
    return <Navigate to="/home" replace />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-muted/30" dir="rtl">
        <AdminSidebar />
        <main className="flex-1 p-6">
          <div className="flex items-center gap-4 mb-6">
            <SidebarTrigger />
            <h1 className="text-2xl font-bold">{title}</h1>
          </div>
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
