import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Shield, ShieldOff, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

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

  const roleBadgeVariants: Record<string, "default" | "secondary" | "outline"> = {
    admin: "default",
    moderator: "secondary",
    user: "outline",
  };

  return (
    <AdminLayout title="إدارة المستخدمين">
      <div className="bg-background rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">الاسم</TableHead>
              <TableHead className="text-right">فصيلة الدم</TableHead>
              <TableHead className="text-right">المدينة</TableHead>
              <TableHead className="text-right">الدور</TableHead>
              <TableHead className="text-right">الصلاحيات</TableHead>
              <TableHead className="text-right">تاريخ التسجيل</TableHead>
              <TableHead className="text-right">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <TableRow key={i}>
                  {Array(7).fill(0).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  لا يوجد مستخدمين
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => {
                const roles = getUserRoles(user.id);
                return (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.full_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-red-600 border-red-200">
                        {user.blood_type}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.city}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {user.role === "donor" ? "متبرع" : user.role === "requester" ? "طالب" : "كلاهما"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {roles.length === 0 ? (
                          <span className="text-muted-foreground text-sm">لا صلاحيات</span>
                        ) : (
                          roles.map((role) => (
                            <Badge key={role} variant={roleBadgeVariants[role] || "outline"}>
                              {roleLabels[role] || role}
                            </Badge>
                          ))
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(user.created_at), "dd MMM yyyy", { locale: ar })}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" disabled={isAddingRole || isRemovingRole}>
                            {isAddingRole || isRemovingRole ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <MoreHorizontal className="h-4 w-4" />
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {!roles.includes("admin") && (
                            <DropdownMenuItem onClick={() => addRole({ userId: user.id, role: "admin" })}>
                              <Shield className="h-4 w-4 ml-2" />
                              تعيين كأدمن
                            </DropdownMenuItem>
                          )}
                          {roles.includes("admin") && (
                            <DropdownMenuItem 
                              onClick={() => removeRole({ userId: user.id, role: "admin" })}
                              className="text-destructive"
                            >
                              <ShieldOff className="h-4 w-4 ml-2" />
                              إزالة صلاحية الأدمن
                            </DropdownMenuItem>
                          )}
                          {!roles.includes("moderator") && (
                            <DropdownMenuItem onClick={() => addRole({ userId: user.id, role: "moderator" })}>
                              <Shield className="h-4 w-4 ml-2" />
                              تعيين كمشرف
                            </DropdownMenuItem>
                          )}
                          {roles.includes("moderator") && (
                            <DropdownMenuItem 
                              onClick={() => removeRole({ userId: user.id, role: "moderator" })}
                              className="text-destructive"
                            >
                              <ShieldOff className="h-4 w-4 ml-2" />
                              إزالة صلاحية المشرف
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </AdminLayout>
  );
}
