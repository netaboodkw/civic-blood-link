import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Shield, ShieldOff, Loader2, User, MapPin, Droplet } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function AdminUsers() {
  const { users, userRoles, isLoading, addRole, removeRole, isAddingRole, isRemovingRole } = useAdminUsers();

  const getUserRoles = (userId: string) => {
    return userRoles.filter((r) => r.user_id === userId).map((r) => r.role);
  };

  const roleLabels: Record<string, string> = {
    admin: "أدمن",
    moderator: "مشرف",
    user: "مستخدم",
  };

  const userRoleLabels: Record<string, string> = {
    donor: "متبرع",
    requester: "طالب",
    both: "كلاهما",
  };

  return (
    <AdminLayout title="إدارة المستخدمين">
      <div className="space-y-3">
        {isLoading ? (
          Array(5).fill(0).map((_, i) => (
            <div key={i} className="glass-card rounded-2xl p-4 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-muted rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-muted rounded" />
                  <div className="h-3 w-24 bg-muted rounded" />
                </div>
              </div>
            </div>
          ))
        ) : users.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center">
            <User className="w-12 h-12 text-muted-foreground mx-auto mb-3" strokeWidth={1.5} />
            <p className="text-muted-foreground">لا يوجد مستخدمين</p>
          </div>
        ) : (
          users.map((user, index) => {
            const roles = getUserRoles(user.id);
            return (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass-card rounded-2xl p-4"
              >
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 glass rounded-xl flex items-center justify-center bg-primary/10 shrink-0">
                    <span className="text-lg font-bold text-primary">
                      {user.full_name.charAt(0)}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-foreground truncate">{user.full_name}</h3>
                      {roles.includes("admin") && (
                        <Badge className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-xs">
                          أدمن
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Droplet className="w-3.5 h-3.5 text-red-500" fill="currentColor" />
                        <span className="font-medium text-red-500">{user.blood_type}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" strokeWidth={2} />
                        <span>{user.city}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Badge variant="outline" className="text-xs">
                        {userRoleLabels[user.role] || user.role}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        انضم {format(new Date(user.created_at), "dd MMM yyyy", { locale: ar })}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button 
                        className="glass rounded-xl p-2.5 hover:bg-primary/5 transition-colors disabled:opacity-50"
                        disabled={isAddingRole || isRemovingRole}
                      >
                        {isAddingRole || isRemovingRole ? (
                          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        ) : (
                          <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
                        )}
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="glass-card border-border/50">
                      {!roles.includes("admin") && (
                        <DropdownMenuItem 
                          onClick={() => addRole({ userId: user.id, role: "admin" })}
                          className="gap-2"
                        >
                          <Shield className="h-4 w-4 text-primary" strokeWidth={2} />
                          تعيين كأدمن
                        </DropdownMenuItem>
                      )}
                      {roles.includes("admin") && (
                        <DropdownMenuItem 
                          onClick={() => removeRole({ userId: user.id, role: "admin" })}
                          className="gap-2 text-destructive focus:text-destructive"
                        >
                          <ShieldOff className="h-4 w-4" strokeWidth={2} />
                          إزالة صلاحية الأدمن
                        </DropdownMenuItem>
                      )}
                      {!roles.includes("moderator") && (
                        <DropdownMenuItem 
                          onClick={() => addRole({ userId: user.id, role: "moderator" })}
                          className="gap-2"
                        >
                          <Shield className="h-4 w-4 text-blue-500" strokeWidth={2} />
                          تعيين كمشرف
                        </DropdownMenuItem>
                      )}
                      {roles.includes("moderator") && (
                        <DropdownMenuItem 
                          onClick={() => removeRole({ userId: user.id, role: "moderator" })}
                          className="gap-2 text-destructive focus:text-destructive"
                        >
                          <ShieldOff className="h-4 w-4" strokeWidth={2} />
                          إزالة صلاحية المشرف
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </AdminLayout>
  );
}
