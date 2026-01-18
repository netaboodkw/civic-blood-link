import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { useAdminRole } from "@/hooks/useAdminRole";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

export function AdminLayout({ children, title }: AdminLayoutProps) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { data: roleData, isLoading: roleLoading } = useAdminRole();

  const isLoading = authLoading || roleLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 glass-card rounded-2xl flex items-center justify-center glow-primary">
            <Loader2 className="h-8 w-8 animate-spin text-primary" strokeWidth={1.5} />
          </div>
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // Redirect to admin login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  // Redirect to admin login if not admin (will show error there)
  if (!roleData?.isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-b from-background to-muted/30" dir="rtl">
        <AdminSidebar />
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <div className="flex items-center gap-4 mb-6">
            <SidebarTrigger className="glass rounded-xl p-2 hover:bg-primary/5 transition-colors" />
            <h1 className="text-2xl font-bold gradient-text">{title}</h1>
          </div>
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
