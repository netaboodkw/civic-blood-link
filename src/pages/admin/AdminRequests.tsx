import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminRequests } from "@/hooks/useAdminRequests";
import { Badge } from "@/components/ui/badge";
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
import { MoreHorizontal, CheckCircle, XCircle, Clock, Trash2, Loader2, FileText, MapPin, Droplet, Building2, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

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

  const statusColors: Record<string, string> = {
    open: "bg-amber-500/10 text-amber-600 border-amber-500/30",
    fulfilled: "bg-green-500/10 text-green-600 border-green-500/30",
    cancelled: "bg-red-500/10 text-red-600 border-red-500/30",
    expired: "bg-gray-500/10 text-gray-600 border-gray-500/30",
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
        ) : requests.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" strokeWidth={1.5} />
            <p className="text-muted-foreground">لا يوجد طلبات</p>
          </div>
        ) : (
          requests.map((request, index) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "glass-card rounded-2xl p-4",
                request.urgency_level === "urgent" && "ring-2 ring-red-500/30"
              )}
            >
              <div className="flex items-start gap-4">
                {/* Blood Type Badge */}
                <div className="w-14 h-14 glass rounded-xl flex flex-col items-center justify-center bg-red-500/10 shrink-0">
                  <Droplet className="w-5 h-5 text-red-500 mb-0.5" fill="currentColor" strokeWidth={1.5} />
                  <span className="text-sm font-bold text-red-500">{request.blood_type}</span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-bold text-foreground">{request.patient_name || "مريض"}</h3>
                    {request.urgency_level === "urgent" && (
                      <Badge className="bg-red-500 text-white text-xs gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        عاجل
                      </Badge>
                    )}
                    <Badge className={cn("text-xs border", statusColors[request.status])}>
                      {statusLabels[request.status]}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                    <div className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" strokeWidth={2} />
                      <span>{request.hospital_name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" strokeWidth={2} />
                      <span>{request.city}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(request.created_at), "dd MMM yyyy", { locale: ar })}
                    </span>
                    {request.file_number && (
                      <>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">
                          ملف: {request.file_number}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button 
                      className="glass rounded-xl p-2.5 hover:bg-primary/5 transition-colors disabled:opacity-50"
                      disabled={isUpdating || isDeleting}
                    >
                      {isUpdating || isDeleting ? (
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      ) : (
                        <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="glass-card border-border/50">
                    <DropdownMenuItem 
                      onClick={() => updateStatus({ requestId: request.id, status: "open" })}
                      disabled={request.status === "open"}
                      className="gap-2"
                    >
                      <Clock className="h-4 w-4 text-amber-500" strokeWidth={2} />
                      تعيين كمفتوح
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => updateStatus({ requestId: request.id, status: "fulfilled" })}
                      disabled={request.status === "fulfilled"}
                      className="gap-2"
                    >
                      <CheckCircle className="h-4 w-4 text-green-500" strokeWidth={2} />
                      تعيين كمكتمل
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => updateStatus({ requestId: request.id, status: "cancelled" })}
                      disabled={request.status === "cancelled"}
                      className="gap-2"
                    >
                      <XCircle className="h-4 w-4 text-red-500" strokeWidth={2} />
                      تعيين كملغي
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => handleDeleteClick(request.id)}
                      className="gap-2 text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" strokeWidth={2} />
                      حذف الطلب
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="glass-card border-border/50">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right">هل أنت متأكد؟</AlertDialogTitle>
            <AlertDialogDescription className="text-right">
              سيتم حذف هذا الطلب نهائياً ولا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel className="glass">إلغاء</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
