import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Droplet, 
  Settings,
  LogOut,
  Home
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const menuItems = [
  { title: "لوحة التحكم", url: "/admin", icon: LayoutDashboard },
  { title: "المستخدمين", url: "/admin/users", icon: Users },
  { title: "طلبات الدم", url: "/admin/requests", icon: FileText },
  { title: "سجل التبرعات", url: "/admin/donations", icon: Droplet },
  { title: "الإعدادات", url: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("حدث خطأ أثناء تسجيل الخروج");
    } else {
      navigate("/");
    }
  };

  return (
    <Sidebar className="border-l border-border" side="right">
      <SidebarHeader className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Droplet className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">لوحة الأدمن</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>القائمة الرئيسية</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end={item.url === "/admin"}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors"
                      activeClassName="bg-primary/10 text-primary font-medium"
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border space-y-2">
        <Button 
          variant="outline" 
          className="w-full justify-start gap-2"
          onClick={() => navigate("/home")}
        >
          <Home className="h-4 w-4" />
          العودة للتطبيق
        </Button>
        <Button 
          variant="destructive" 
          className="w-full justify-start gap-2"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          تسجيل الخروج
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
