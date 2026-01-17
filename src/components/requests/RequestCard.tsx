import { Droplet, MapPin, Building2, Clock, User, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import type { BloodRequest } from "@/hooks/useMyRequests";

interface RequestCardProps {
  request: BloodRequest;
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

export function RequestCard({ request }: RequestCardProps) {
  return (
    <div className="bg-card rounded-xl shadow-card p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary-soft">
            <Droplet className="w-6 h-6 text-primary" />
          </div>
          <div>
            <span className="text-xl font-bold text-foreground">
              {request.blood_type}
            </span>
            <p className="text-sm text-muted-foreground">
              {request.units_needed} وحدة
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge className={cn("text-xs", statusColors[request.status])}>
            {statusLabels[request.status]}
          </Badge>
          <Badge className={cn("text-xs", urgencyColors[request.urgency_level || "normal"])}>
            {urgencyLabels[request.urgency_level || "normal"]}
          </Badge>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2">
        {request.patient_name && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="w-4 h-4" />
            <span>{request.patient_name}</span>
          </div>
        )}
        {request.file_number && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="w-4 h-4" />
            <span>ملف: {request.file_number}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Building2 className="w-4 h-4" />
          <span>{request.hospital_name}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4" />
          <span>{request.city}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>{format(new Date(request.created_at), "d MMMM yyyy", { locale: ar })}</span>
        </div>
      </div>

      {/* Notes */}
      {request.notes && (
        <p className="text-sm text-muted-foreground bg-muted/30 rounded-lg p-2">
          {request.notes}
        </p>
      )}
    </div>
  );
}
