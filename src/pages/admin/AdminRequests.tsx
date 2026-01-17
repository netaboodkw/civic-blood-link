import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminRequests } from "@/hooks/useAdminRequests";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreHorizontal, CheckCircle, XCircle, Clock, Trash2, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useState } from "react";

export default function AdminRequests() {
  const { requests, isLoading, updateStatus, deleteRequest, isUpdating, isDeleting } = useAdminRequests();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  const statusLabels: Record<string, string> = {
    open: "مفتوح",
    fulfilled: "مكتمل",
    cancelled: "ملغي",
    expired: "منتهي",
  };

  const statusVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    open: "default",
    fulfilled: "secondary",
    cancelled: "destructive",
    expired: "outline",
  };

  const urgencyLabels: Record<string, string> = {
    urgent: "عاجل",
    normal: "عادي",
  };

  const handleDeleteClick = (requestId: string) => {
    setSelectedRequestId(requestId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedRequestId) {
      deleteRequest(selectedRequestId);
    }
    setDeleteDialogOpen(false);
    setSelectedRequestId(null);
  };

  return (
    <AdminLayout title="إدارة طلبات الدم">
      <div className="bg-background rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">المريض</TableHead>
              <TableHead className="text-right">فصيلة الدم</TableHead>
              <TableHead className="text-right">المستشفى</TableHead>
              <TableHead className="text-right">المدينة</TableHead>
              <TableHead className="text-right">الوحدات</TableHead>
              <TableHead className="text-right">الاستعجال</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
              <TableHead className="text-right">التاريخ</TableHead>
              <TableHead className="text-right">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <TableRow key={i}>
                  {Array(9).fill(0).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  لا يوجد طلبات
                </TableCell>
              </TableRow>
            ) : (
              requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">
                    {request.patient_name || "غير محدد"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-red-600 border-red-200">
                      {request.blood_type}
                    </Badge>
                  </TableCell>
                  <TableCell>{request.hospital_name}</TableCell>
                  <TableCell>{request.city}</TableCell>
                  <TableCell>{request.units_needed}</TableCell>
                  <TableCell>
                    <Badge variant={request.urgency_level === "urgent" ? "destructive" : "secondary"}>
                      {urgencyLabels[request.urgency_level || "normal"]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariants[request.status]}>
                      {statusLabels[request.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(request.created_at), "dd MMM yyyy", { locale: ar })}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" disabled={isUpdating || isDeleting}>
                          {isUpdating || isDeleting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <MoreHorizontal className="h-4 w-4" />
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={() => updateStatus({ requestId: request.id, status: "open" })}
                          disabled={request.status === "open"}
                        >
                          <Clock className="h-4 w-4 ml-2" />
                          تعيين كمفتوح
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => updateStatus({ requestId: request.id, status: "fulfilled" })}
                          disabled={request.status === "fulfilled"}
                        >
                          <CheckCircle className="h-4 w-4 ml-2" />
                          تعيين كمكتمل
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => updateStatus({ requestId: request.id, status: "cancelled" })}
                          disabled={request.status === "cancelled"}
                        >
                          <XCircle className="h-4 w-4 ml-2" />
                          تعيين كملغي
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDeleteClick(request.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 ml-2" />
                          حذف الطلب
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف هذا الطلب نهائياً ولا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
