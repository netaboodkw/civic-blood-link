import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MoreHorizontal, Shield, ShieldOff, Loader2, User, MapPin, Droplet, Filter, X } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const CITIES = ["مدينة الكويت", "حولي", "الفروانية", "الأحمدي", "الجهراء", "مبارك الكبير"];
const ROLES = [
  { value: "donor", label: "متبرع" },
  { value: "requester", label: "طالب" },
  { value: "both", label: "كلاهما" },
];

export default function AdminUsers() {
  const { users, userRoles, isLoading, addRole, removeRole, isAddingRole, isRemovingRole } = useAdminUsers();

  // Filters
  const [bloodTypeFilter, setBloodTypeFilter] = useState<string>("all");
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [adminFilter, setAdminFilter] = useState<string>("all");

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      if (bloodTypeFilter !== "all" && user.blood_type !== bloodTypeFilter) return false;
      if (cityFilter !== "all" && user.city !== cityFilter) return false;
      if (roleFilter !== "all" && user.role !== roleFilter) return false;
      if (adminFilter !== "all") {
        const roles = userRoles.filter((r) => r.user_id === user.id).map((r) => r.role);
        if (adminFilter === "admin" && !roles.includes("admin")) return false;
        if (adminFilter === "moderator" && !roles.includes("moderator")) return false;
        if (adminFilter === "user" && (roles.includes("admin") || roles.includes("moderator"))) return false;
      }
      return true;
    });
  }, [users, userRoles, bloodTypeFilter, cityFilter, roleFilter, adminFilter]);

  const hasActiveFilters = bloodTypeFilter !== "all" || cityFilter !== "all" || roleFilter !== "all" || adminFilter !== "all";

  const clearFilters = () => {
    setBloodTypeFilter("all");
    setCityFilter("all");
    setRoleFilter("all");
    setAdminFilter("all");
  };

  const getUserRoles = (userId: string) => {
    return userRoles.filter((r) => r.user_id === userId).map((r) => r.role);
  };

  const roleLabels: Record<string, string> = {
    admin: "أدمن",
    moderator: "مشرف",
    user: "مستخدم",
  };

  return (
    <AdminLayout title="إدارة المستخدمين">
      {/* Filters */}
      <div className="glass-card rounded-2xl p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-primary" />
          <span className="font-medium text-sm">فلترة المستخدمين</span>
          {hasActiveFilters && (
            <Badge className="bg-primary/10 text-primary text-xs">
              {[bloodTypeFilter, cityFilter, roleFilter, adminFilter].filter(f => f !== "all").length} فلتر
            </Badge>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Select value={bloodTypeFilter} onValueChange={setBloodTypeFilter}>
            <SelectTrigger className="glass text-sm h-9">
              <SelectValue placeholder="فصيلة الدم" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الفصائل</SelectItem>
              {BLOOD_TYPES.map((type) => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={cityFilter} onValueChange={setCityFilter}>
            <SelectTrigger className="glass text-sm h-9">
              <SelectValue placeholder="المدينة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع المدن</SelectItem>
              {CITIES.map((city) => (
                <SelectItem key={city} value={city}>{city}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="glass text-sm h-9">
              <SelectValue placeholder="نوع الحساب" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الأنواع</SelectItem>
              {ROLES.map((r) => (
                <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={adminFilter} onValueChange={setAdminFilter}>
            <SelectTrigger className="glass text-sm h-9">
              <SelectValue placeholder="الصلاحيات" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الصلاحيات</SelectItem>
              <SelectItem value="admin">أدمن</SelectItem>
              <SelectItem value="moderator">مشرف</SelectItem>
              <SelectItem value="user">مستخدم عادي</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 w-full gap-2 text-muted-foreground"
            onClick={clearFilters}
          >
            <X className="w-3 h-3" />
            مسح الفلاتر
          </Button>
        )}
      </div>

      {/* Results count */}
      {!isLoading && (
        <p className="text-sm text-muted-foreground mb-3">
          {filteredUsers.length} مستخدم {hasActiveFilters ? "(مفلتر)" : ""}
        </p>
      )}

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
        ) : filteredUsers.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center">
            <User className="w-12 h-12 text-muted-foreground mx-auto mb-3" strokeWidth={1.5} />
            <p className="text-muted-foreground">{hasActiveFilters ? "لا يوجد مستخدمين مطابقين للفلتر" : "لا يوجد مستخدمين"}</p>
          </div>
        ) : (
          filteredUsers.map((user, index) => {
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
