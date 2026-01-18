import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Droplet, 
  Settings,
  LogOut,
  Home,
  Bell
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const menuItems = [
  { title: "لوحة التحكم", url: "/admin", icon: LayoutDashboard },
  { title: "المستخدمين", url: "/admin/users", icon: Users },
  { title: "طلبات الدم", url: "/admin/requests", icon: FileText },
  { title: "سجل التبرعات", url: "/admin/donations", icon: Droplet },
  { title: "الإشعارات", url: "/admin/notifications", icon: Bell },
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
    <Sidebar className="border-l border-border/50 bg-background/80 backdrop-blur-xl" side="right">
      <SidebarHeader className="p-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 glass-card rounded-xl flex items-center justify-center glow-primary">
            <Droplet className="h-5 w-5 text-primary" fill="currentColor" strokeWidth={1.5} />
          </div>
          <div>
            <span className="font-bold text-foreground">لوحة الأدمن</span>
            <p className="text-xs text-muted-foreground">نبضة دم</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground text-xs px-3 py-2">القائمة الرئيسية</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item, index) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end={item.url === "/admin"}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ios-spring hover:bg-primary/5"
                      activeClassName="glass-card bg-primary/10 text-primary font-medium glow-primary"
                    >
                      <div className="w-8 h-8 glass rounded-lg flex items-center justify-center">
                        <item.icon className="h-4 w-4" strokeWidth={2} />
                      </div>
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border/50 space-y-2">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/home")}
          className="w-full flex items-center justify-start gap-3 glass-card rounded-xl px-4 py-3 text-foreground font-medium ios-spring hover:bg-primary/5"
        >
          <Home className="h-4 w-4" strokeWidth={2} />
          العودة للتطبيق
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleLogout}
          className="w-full flex items-center justify-start gap-3 bg-destructive/10 rounded-xl px-4 py-3 text-destructive font-medium ios-spring hover:bg-destructive/20"
        >
          <LogOut className="h-4 w-4" strokeWidth={2} />
          تسجيل الخروج
        </motion.button>
      </SidebarFooter>
    </Sidebar>
  );
}
