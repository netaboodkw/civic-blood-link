import { Droplet, MapPin, Building2, Clock, User, FileText, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import type { BloodRequest } from "@/hooks/useMyRequests";

interface RequestDetailsDialogProps {
  request: BloodRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  showActions?: boolean;
  onEdit?: (request: BloodRequest) => void;
  onCancel?: (requestId: string) => void;
}

const urgencyColors: Record<string, string> = {
  normal: "bg-muted text-muted-foreground",
  high: "bg-warning-soft text-warning",
  urgent: "bg-destructive/10 text-destructive",
};

const urgencyLabels: Record<string, string> = {
  normal: "عادي",
  high: "مستعجل",
  urgent: "طارئ",
};

const statusColors: Record<string, string> = {
  open: "bg-success-soft text-success",
  fulfilled: "bg-primary-soft text-primary",
  cancelled: "bg-muted text-muted-foreground",
  expired: "bg-muted text-muted-foreground",
};

const statusLabels: Record<string, string> = {
  open: "مفتوح",
  fulfilled: "مكتمل",
  cancelled: "ملغي",
  expired: "منتهي",
};

export function RequestDetailsDialog({
  request,
  open,
  onOpenChange,
  showActions = false,
  onEdit,
  onCancel,
}: RequestDetailsDialogProps) {
  if (!request) return null;

  const canModify = request.status === "open" && showActions;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-center">تفاصيل الطلب</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Blood Type Header */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary-soft">
              <Droplet className="w-10 h-10 text-primary" />
            </div>
            <div className="text-center">
              <span className="text-3xl font-bold text-foreground">
                {request.blood_type}
              </span>
              <p className="text-lg text-muted-foreground">
                {request.units_needed} وحدة مطلوبة
              </p>
            </div>
            <div className="flex gap-2">
              <Badge className={cn("text-sm px-3 py-1", statusColors[request.status])}>
                {statusLabels[request.status]}
              </Badge>
              <Badge className={cn("text-sm px-3 py-1", urgencyColors[request.urgency_level || "normal"])}>
                {urgencyLabels[request.urgency_level || "normal"]}
              </Badge>
            </div>
          </div>

          {/* Details Grid */}
          <div className="space-y-3 bg-muted/30 rounded-xl p-4">
            {request.patient_name && (
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-background">
                  <User className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">اسم المريض</p>
                  <p className="font-medium text-foreground">{request.patient_name}</p>
                </div>
              </div>
            )}

            {request.file_number && (
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-background">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">رقم الملف</p>
                  <p className="font-medium text-foreground">{request.file_number}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-background">
                <Building2 className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">المستشفى</p>
                <p className="font-medium text-foreground">{request.hospital_name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-background">
                <MapPin className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">المدينة</p>
                <p className="font-medium text-foreground">{request.city}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-background">
                <Clock className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">تاريخ الإنشاء</p>
                <p className="font-medium text-foreground">
                  {format(new Date(request.created_at), "d MMMM yyyy - h:mm a", { locale: ar })}
                </p>
              </div>
            </div>
          </div>

          {/* Notes */}
          {request.notes && (
            <div className="space-y-2">
              <h4 className="font-medium text-foreground">ملاحظات</h4>
              <p className="text-sm text-muted-foreground bg-muted/30 rounded-lg p-3">
                {request.notes}
              </p>
            </div>
          )}

          {/* Actions */}
          {canModify && (onEdit || onCancel) && (
            <div className="flex gap-2 pt-2">
              {onEdit && (
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    onEdit(request);
                    onOpenChange(false);
                  }}
                >
                  تعديل
                </Button>
              )}
              {onCancel && (
                <Button
                  variant="outline"
                  className="flex-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    onCancel(request.id);
                    onOpenChange(false);
                  }}
                >
                  إلغاء الطلب
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
